const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  nbBookmarks: () => ipcRenderer.invoke('nb-bookmarks'),
  nbTags: () => ipcRenderer.invoke('nb-tags'),
  nbFilterByTag: (tagName) => ipcRenderer.invoke('nb-filter-by-tag', tagName),
  nbShow: (bookmarkId) => ipcRenderer.invoke('nb-show', bookmarkId),
  nbShowWithAdded: (bookmarkId) => ipcRenderer.invoke('nb-show-with-added', bookmarkId),
  openExternal: (url) => ipcRenderer.invoke('open-external', url)
});