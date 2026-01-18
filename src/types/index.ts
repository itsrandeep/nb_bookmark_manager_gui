export interface Bookmark {
  id: string;
  title: string;
  url: string;
  tags: string[];
  dateAdded: string;
}

export interface NbResponse {
  success: boolean;
  data?: string;
  error?: string;
}

export interface ElectronAPI {
  nbBookmarks: () => Promise<NbResponse>;
  nbTags: () => Promise<NbResponse>;
  nbFilterByTag: (tagName: string) => Promise<NbResponse>;
  nbShow: (bookmarkId: string) => Promise<NbResponse>;
  openExternal: (url: string) => Promise<NbResponse>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}