declare global {
  interface Window {
    electronAPI: {
      nbBookmarks: () => Promise<any>;
      nbTags: () => Promise<any>;
      nbFilterByTag: (tagName: string) => Promise<any>;
      nbShow: (bookmarkId: string) => Promise<any>;
      openExternal: (url: string) => Promise<any>;
    };
  }
}

export {};