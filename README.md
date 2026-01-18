# nb Bookmark Manager

An Electron-based desktop application for managing bookmarks using the `nb`  command-line tool. This project was created 100% with AI assistance (vibecoded) and the developer doesn't have extensive knowledge of TypeScript, React, or Electron technologies used.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)
![Version](https://img.shields.io/badge/version-0.1.0-green.svg)

## 🚀 Features

- **Bookmark Management**: View, search, and filter bookmarks from your `nb` installation
- **Tag-based Organization**: Browse bookmarks by tags with count indicators
- **Search Functionality**: Real-time search across bookmark titles, URLs, and tags
- **Native Integration**: Opens URLs in your default system browser
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Modern UI**: Clean, responsive interface built with React and CSS
- **Electron Wrapper**: Desktop application with native OS integration

## 📋 Requirements

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** (comes with Node.js)
- **nb** command-line tool installed and configured on your system

### Installing nb 
```bash
# On macOS
brew install nb

# On Linux
wget -qO - https://github.com/xwmx/nb/raw/master/install | bash

# On Windows (using Chocolatey)
choco install nb

# Or using npm (less recommended)
npm install -g nb
```

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/bookmark-manager.git
cd bookmark-manager
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Verify nb Installation
```bash
# Check if nb is installed
nb --version

# List your bookmarks (optional, to verify it works)
nb bookmarks
```

### 4. Start the Application

#### Development Mode
```bash
# Start React development server + Electron
npm run electron-dev

# Or separately:
npm start          # Starts React dev server on http://localhost:3000
npm run electron   # Starts Electron (requires dev server running)
```

#### Production Mode
```bash
# Build the React app
npm run build

# Start Electron with production build
npm run electron
```

## 📦 Building & Distribution

### Build for Development
```bash
npm run build
```
This creates a `build/` directory with the optimized React application.

### Create Distribution Packages
```bash
# Create distributable packages (no publish)
npm run dist

# Create and publish to GitHub Releases
npm run build-electron
```

The `dist/` directory will contain:
- **Linux**: `.AppImage`, `.snap`, and `.deb` packages
- **macOS**: `.dmg` and `.zip` archives  
- **Windows**: `.exe` installer and portable version

## 🚀 Release Process

### Automated Versioning & Upload to GitHub

#### Step 1: Update Version
Update the version in `package.json`:
```json
{
  "version": "0.1.1"
}
```

#### Step 2: Create Git Tag
```bash
git add package.json
git commit -m "Bump version to 0.1.1"
git tag v0.1.1
git push origin main --tags
```

#### Step 3: Build and Upload
```bash
# Build distributables
npm run dist

# Upload to GitHub Releases
# Option 1: Use GitHub CLI
gh release create v0.1.1 dist/* --title "Release v0.1.1" --generate-notes

# Option 2: Manual upload via GitHub web interface
# 1. Go to https://github.com/yourusername/bookmark-manager/releases
# 2. Click "Create a new release"
# 3. Select the v0.1.1 tag
# 4. Upload all files from the dist/ directory
```

### Release Script (Optional)
Create a script in `scripts/release.sh`:
```bash
#!/bin/bash
set -e

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")

# Check if tag exists
if git rev-parse "v$VERSION" >/dev/null 2>&1; then
  echo "Tag v$VERSION already exists"
  exit 1
fi

# Build
npm run dist

# Create tag
git tag "v$VERSION"
git push origin "v$VERSION"

# Create GitHub release
gh release create "v$VERSION" dist/* \
  --title "Release v$VERSION" \
  --generate-notes

echo "✅ Release v$VERSION created successfully!"
```

## 🏗️ Project Structure

```
bookmark-manager/
├── public/
│   ├── electron.js      # Main Electron process
│   ├── preload.js       # Preload script for security
│   └── index.html       # HTML template
├── src/
│   ├── components/      # React components
│   │   ├── BookmarkList.tsx
│   │   ├── TagList.tsx
│   │   └── ErrorBoundary.tsx
│   ├── services/        # Business logic
│   │   └── nbService.ts # nb command integration
│   ├── types/          # TypeScript definitions
│   ├── App.tsx         # Main React component
│   └── index.tsx       # React entry point
├── dist/               # Built distributables
├── build/              # React build output
└── package.json        # Dependencies and scripts
```

## 🔧 Technology Stack

- **Frontend**: React 19 with TypeScript
- **Desktop**: Electron 40
- **Build Tools**: Create React App, electron-builder
- **Styling**: CSS3 with custom components
- **Backend Integration**: Node.js child processes for `nb` command

## 🐛 Troubleshooting

### Common Issues

#### "nb command not found"
- Ensure `nb` is installed and in your system's PATH
- Try running `nb --version` in your terminal first
- On Windows, you may need to restart your terminal after installation

#### "Electron API not available" error
- Make sure you're running the app through Electron (`npm run electron`)
- This error won't occur in the browser development mode

#### Empty bookmarks/tags
- Check if your `nb` installation has bookmarks: `nb bookmarks`
- Verify `nb` is properly configured with a notebook

#### Build failures
- Delete `node_modules` and run `npm install`
- Clear the build directory: `rm -rf build dist`
- Ensure you're using Node.js 16+

#### Permission issues on Linux/macOS
```bash
# Make scripts executable
chmod +x scripts/release.sh

# Fix npm permissions if needed
sudo chown -R $(whoami) ~/.npm
```

### Development Tips

Since this was vibecoded without extensive TypeScript knowledge:

- **TypeScript Errors**: Most can be fixed by adding proper type annotations or using `any` type
- **Component State**: Use `useState<Type>()` for typed state variables
- **Import/Export**: Default exports work well for components
- **Build Issues**: Clear `node_modules` and rebuild if errors persist

## 🗺️ Roadmap & Future Improvements

### Version 0.2.0 (Near Future)
- [ ] **Bookmark Creation**: Add new bookmarks directly from the UI
- [ ] **Bookmark Editing**: Modify existing bookmark titles, URLs, and tags
- [ ] **Bookmark Deletion**: Remove bookmarks with confirmation
- [ ] **Import/Export**: Backup and restore bookmarks
- [ ] **Settings Panel**: Configure nb notebook path and other preferences

### Version 0.3.0 (Mid Future)  
- [ ] **Tag Management**: Create, edit, and delete tags
- [ ] **Advanced Search**: Search by date, content, or advanced filters
- [ ] **Keyboard Shortcuts**: Quick navigation and actions
- [ ] **Dark/Light Theme**: Theme switching capability
- [ ] **Bookmark Preview**: Show webpage previews

### Version 1.0.0 (Long Term)
- [ ] **Multiple Notebook Support**: Switch between different nb notebooks
- [ ] **Plugin System**: Extensible architecture for custom features
- [ ] **Sync Integration**: Cloud sync for bookmarks across devices
- [ ] **Statistics Dashboard**: Usage analytics and insights
- [ ] **Mobile Companion**: Basic mobile app for viewing bookmarks

### Technical Debt & Improvements
- [ ] **Test Coverage**: Add unit and integration tests
- [ ] **Error Handling**: Better error messages and recovery
- [ ] **Performance**: Optimize for large bookmark collections
- [ ] **Accessibility**: Improve screen reader support
- [ ] **Documentation**: API docs for extension developers

## 🤝 Contributing

Since this was created with AI assistance, contributions are especially welcome! Here's how you can help:

1. **Bug Reports**: Open an issue with detailed reproduction steps
2. **Feature Requests**: Suggest improvements for the roadmap
3. **Code Contributions**: 
   - Fork the repository
   - Create a feature branch
   - Make your changes
   - Test thoroughly
   - Submit a pull request

### Development Setup for Contributors
```bash
# Fork and clone your fork
git clone https://github.com/yourusername/bookmark-manager.git
cd bookmark-manager

# Install dependencies
npm install

# Start development
npm run electron-dev

# Make your changes and test
npm run build  # Verify production build works
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **nb **: The excellent command-line notebook tool that powers this application
- **Electron**: For enabling cross-platform desktop applications with web technologies
- **React**: For the component-based UI framework
- **AI Assistance**: This project was created 100% with AI coding assistance as a learning experiment

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/bookmark-manager/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/bookmark-manager/discussions)
- **nb Documentation**: [https://xwmx.github.io/nb](https://xwmx.github.io/nb)

---

⚡ **Note**: This is a vibecoded project created as a learning exercise. The developer is learning TypeScript, React, and Electron alongside the AI, so the codebase may evolve as understanding improves.