# GitHub Upload Guide for Bookmark Manager

## 🚀 Quick Start

### 1. Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `bookmark-manager`
3. Description: `An Electron-based desktop application for managing bookmarks using nb (nobullet) command-line tool`
4. Choose **Public** or **Private**
5. **DON'T** initialize with README, .gitignore, or license (we already have them)
6. Click "Create repository"

### 2. Connect Local Repository to GitHub
```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/bookmark-manager.git
git branch -M main
git push -u origin main
```

### 3. Verify Upload
- Visit https://github.com/YOUR_USERNAME/bookmark-manager
- Check that all files are present
- README.md should be displayed on the repository page

## 📦 Creating Your First Release

### Method 1: Automated Script (Recommended)
```bash
# Install GitHub CLI if not already installed
# Ubuntu/Debian: sudo apt install gh
# macOS: brew install gh
# Windows: choco install gh

# Login to GitHub
gh auth login

# Run the release script
npm run release
```

### Method 2: Manual Release
1. **Build the application**:
   ```bash
   npm run dist
   ```

2. **Create a tag**:
   ```bash
   git tag v0.1.0
   git push origin v0.1.0
   ```

3. **Create GitHub Release**:
   - Go to https://github.com/YOUR_USERNAME/bookmark-manager/releases
   - Click "Create a new release"
   - Choose tag `v0.1.0`
   - Title: `Bookmark Manager v0.1.0`
   - Description: `Initial release of the bookmark manager application`
   - Upload all files from the `dist/` directory
   - Click "Publish release"

## 🎯 After First Release

### Updating Version
1. Edit `package.json` and increment version:
   ```json
   {
     "version": "0.1.1"
   }
   ```

2. Commit and release:
   ```bash
   git add package.json
   git commit -m "Bump version to 0.1.1"
   npm run release
   ```

### Making Changes
1. Make your code changes
2. Test locally: `npm run electron-dev`
3. Commit changes:
   ```bash
   git add .
   git commit -m "Your change description"
   git push origin main
   ```

## 🔧 Common Issues & Solutions

### "Permission denied" when pushing
```bash
# Check if you have SSH keys set up
ssh -T git@github.com

# If not, use HTTPS instead
git remote set-url origin https://github.com/YOUR_USERNAME/bookmark-manager.git
```

### "Authentication failed"
```bash
# Configure Git with your credentials
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Use GitHub CLI for authentication
gh auth login
```

### Release script fails
```bash
# Install GitHub CLI
# macOS: brew install gh
# Ubuntu: sudo apt install gh
# Windows: winget install GitHub.cli

# Login
gh auth login

# Try again
npm run release
```

## 📊 Repository Settings (Optional)

### Enable GitHub Pages (for documentation)
1. Go to Settings → Pages
2. Source: Deploy from a branch
3. Branch: `main` and `/ (root)`
4. Save

### Enable Issues and Discussions
1. Go to Settings → General
2. Features: Enable Issues and Discussions

### Add Topics/Tags
1. On the main repository page
2. Click "Add topic"
3. Suggested tags: `electron`, `react`, `typescript`, `bookmark-manager`, `desktop-app`, `nb`, `nobullet`

## 🎉 Celebrate!

You've successfully uploaded your vibecoded bookmark manager to GitHub! 

What you've accomplished:
- ✅ Created a complete Electron + React application
- ✅ Set up professional project structure
- ✅ Added comprehensive documentation
- ✅ Implemented automated release process
- ✅ Made it available to the world

Share your repository: https://github.com/YOUR_USERNAME/bookmark-manager