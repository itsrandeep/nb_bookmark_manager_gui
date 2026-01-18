#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🛠️  Bookmark Manager Development Setup${NC}"
echo "======================================"

# Check Node.js version
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 16+ from https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="16.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo -e "${RED}❌ Node.js version $NODE_VERSION is too old. Please upgrade to 16+${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js $NODE_VERSION detected${NC}"

# Check if nb is installed
if ! command -v nb &> /dev/null; then
    echo -e "${YELLOW}⚠️  nb (nobullet) is not installed. Installing instructions:${NC}"
    echo "  macOS: brew install nb"
    echo "  Linux: wget -qO - https://github.com/xwmx/nb/raw/master/install | bash"
    echo "  Windows: choco install nb"
    echo ""
    echo -e "${YELLOW}Continue anyway? (y/N)${NC}"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    NB_VERSION=$(nb --version)
    echo -e "${GREEN}✅ nb $NB_VERSION detected${NC}"
fi

# Install npm dependencies
echo -e "${BLUE}📦 Installing npm dependencies...${NC}"
npm install

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Check if Git is initialized
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}⚠️  Git repository not initialized. Initialize now? (y/N)${NC}"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        git init
        echo -e "${GREEN}✅ Git repository initialized${NC}"
    fi
fi

echo ""
echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
echo ""
echo -e "${BLUE}📝 Next steps:${NC}"
echo "1. Start development: npm run electron-dev"
echo "2. Build for production: npm run build"
echo "3. Create release: ./scripts/release.sh"
echo ""
echo -e "${BLUE}📚 More information:${NC}"
echo "- Read README.md for detailed documentation"
echo "- View src/services/nbService.ts to understand nb integration"
echo "- Check public/electron.js for Electron configuration"