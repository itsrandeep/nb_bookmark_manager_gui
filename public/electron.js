const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

// Helper function to strip ANSI escape sequences
function stripAnsiCodes(text) {
  return text
    // Remove all ANSI escape sequences more comprehensively
    .replace(/\x1b\[[0-9;]*m/g, '')    // SGR (Select Graphic Rendition)
    .replace(/\x1b\[[0-9;]*[A-Za-z]/g, '') // Other escape sequences
    .replace(/\x1b\[K/g, '')            // Clear line
    .replace(/\x1b\[[0-9]*K/g, '')      // Clear variants
    .replace(/\x1b\[[0-9]*J/g, '')      // Clear screen
    .replace(/\x1b\[[?7l]/g, '')         // Save cursor
    .replace(/\x1b\[[?7h]/g, '')        // Restore cursor
    .replace(/\x1b\[[?25l]/g, '')        // Hide cursor
    .replace(/\x1b\[[?25h]/g, '')        // Show cursor
    .replace(/\x1b\(B/g, '')             // Special sequences
    .replace(/\x1b/g, '')               // Any remaining escape chars
    .replace(/\[B\]/g, '');             // Special [B] sequences
}

// URL validation function
function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  
  try {
    // Only validate URLs that start with http or https, or have protocols like file:
    if (url.startsWith('http') || url.startsWith('https') || url.startsWith('file:') || 
        url.startsWith('ftp://') || url.startsWith('mailto:')) {
      return true;
    }
    
    // For other cases, try to construct a URL but be more careful
    const testUrl = url.startsWith('http') ? url : `https://${url}`;
    try {
      new URL(testUrl);
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

// Open URL in external browser
const { shell } = require('electron');

ipcMain.handle('open-external', async (event, url) => {
  try {
    // Validate and sanitize URL
    if (!isValidUrl(url)) {
      throw new Error(`Invalid URL provided: ${url}`);
    }
    
    // Ensure URL has protocol
    let fullUrl = url;
    if (!url.match(/^https?:\/\//) && !url.startsWith('ftp://') && !url.startsWith('mailto:')) {
      fullUrl = `https://${url}`;
    }
    
    await shell.openExternal(fullUrl);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC handlers for nb commands
ipcMain.handle('nb-bookmarks', async () => {
  try {
    const { stdout } = await execPromise('nb bookmarks');
    const cleanOutput = stripAnsiCodes(stdout);
    return { success: true, data: cleanOutput };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('nb-tags', async () => {
  try {
    const { stdout } = await execPromise('nb --tags');
    const cleanOutput = stripAnsiCodes(stdout);
    return { success: true, data: cleanOutput };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('nb-filter-by-tag', async (event, tagName) => {
  try {
    const { stdout } = await execPromise(`nb --tags "${tagName}"`);
    const cleanOutput = stripAnsiCodes(stdout);
    return { success: true, data: cleanOutput };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('nb-show', async (event, bookmarkId) => {
  try {
    const { stdout } = await execPromise(`nb show ${bookmarkId}`);
    const cleanOutput = stripAnsiCodes(stdout);
    return { success: true, data: cleanOutput };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('nb-show-with-added', async (event, bookmarkId) => {
  try {
    const { stdout } = await execPromise(`nb show ${bookmarkId} --added`);
    const cleanOutput = stripAnsiCodes(stdout);
    return { success: true, data: cleanOutput };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

let mainWindow;

function createWindow() {
  // Determine the URL to load based on environment
  let startUrl;
  if (isDev) {
    startUrl = 'http://localhost:3000';
  } else {
    startUrl = url.format({
      pathname: path.join(__dirname, '../build/index.html'),
      protocol: 'file:',
      slashes: true
    });
  }

  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadURL(startUrl);

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});