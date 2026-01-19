#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Bookmark Manager Release Script${NC}"
echo "=================================="

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}❌ GitHub CLI (gh) is not installed. Please install it first:${NC}"
    echo "  https://cli.github.com/"
    exit 1
fi

# Check if user is logged in to gh
if ! gh auth status &> /dev/null; then
    echo -e "${RED}❌ Not logged in to GitHub CLI. Please run: gh auth login${NC}"
    exit 1
fi

# Get version from package.json
VERSION=$(node -p "require('../package.json').version")
echo -e "${YELLOW}📦 Current version: ${VERSION}${NC}"

# Check if tag already exists
if git rev-parse "v$VERSION" >/dev/null 2>&1; then
    echo -e "${RED}❌ Tag v$VERSION already exists. Update version in package.json first.${NC}"
    exit 1
fi

# Check if working directory is clean
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${YELLOW}⚠️  Working directory is not clean. Commit changes first? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo -e "${BLUE}📝 Committing changes...${NC}"
        git add .
        git commit -m "Bump version to $VERSION"
    else
        echo -e "${RED}❌ Please commit changes first.${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}🔨 Building application...${NC}"
cd ..

# Clean previous builds
echo "Cleaning previous builds..."
rm -rf build dist

# Build React app
echo "Building React app..."
npm run build

# Create distributables
echo "Creating distributables..."
npm run dist

echo -e "${GREEN}✅ Build completed successfully!${NC}"

# Create git tag
echo -e "${BLUE}🏷️  Creating git tag v$VERSION...${NC}"
git tag "v$VERSION"
git push origin main --tags

echo -e "${BLUE}📤 Creating GitHub release...${NC}"

# Generate release notes
RELEASE_NOTES="## Bookmark Manager v$VERSION

### Features
- Browse bookmarks from nb command-line tool
- Search and filter bookmarks by tags and text
- Open bookmarks in default browser
- Cross-platform desktop application

### Installation
Download the appropriate file for your platform:
- **Windows**: `bookmark-manager-${VERSION}-win.exe` (installer) or `bookmark-manager-${VERSION}-win.exe` (portable)
- **macOS**: `bookmark-manager-${VERSION}-mac.dmg` or `bookmark-manager-${VERSION}-mac.zip`
- **Linux**: `bookmark-manager-${VERSION}-linux.AppImage` (recommended) or `.deb` package

### Requirements
- Node.js 16+ and nb command-line tool installed
- See README.md for detailed installation instructions

---
[View all releases](https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/releases)"

# Create GitHub release
gh release create "v$VERSION" dist/* \
    --title "Bookmark Manager v$VERSION" \
    --notes "$RELEASE_NOTES"

echo -e "${GREEN}🎉 Release v$VERSION created successfully!${NC}"
echo -e "${BLUE}📂 Release files uploaded to:${NC}"
echo "https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^.]*\).*/\1/')/releases/tag/v$VERSION"