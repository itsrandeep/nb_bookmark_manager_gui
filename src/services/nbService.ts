// Import types
export interface Bookmark {
  id: string;
  title: string;
  url: string;
  tags: string[];
  dateAdded: string;
}

export interface Tag {
  name: string;
  count: number;
}

export interface NbResponse {
  success: boolean;
  data?: string;
  error?: string;
}



class NbService {
  private extractTagsFromShowOutput(showOutput: string): { tags: string[], dateAdded?: string, url?: string } {
    const tags: string[] = [];
    const lines = showOutput.split('\n');
    
    let inTagsSection = false;
    let dateAdded: string | undefined;
    let url: string | undefined;
    
    // Process each line to extract bookmark information
    for (const line of lines) {
      // Extract the added date if present (full date is first line when using --added flag)
      if (!dateAdded && line.match(/^\d{4}-\d{2}-\d{2}/)) {
        dateAdded = line.trim();
      }
      
      // Extract full URL - look for lines with <https://...>
      if (!url) {
        const urlMatch = line.match(/<(https?:\/\/[^>]+)>/);
        if (urlMatch) {
          url = urlMatch[1];
        }
      }
      
      if (line.includes('## Tags')) {
        inTagsSection = true;
        continue;
      }
      
      if (inTagsSection) {
        // Look for lines starting with #
        const tagMatch = line.match(/#([a-zA-Z0-9\-_\/]+)/g);
        if (tagMatch) {
          const newTags = tagMatch.map(tag => tag.slice(1)); // Remove # symbol
          tags.push(...newTags);
        }
        
        // If we reach another section, stop
        if (line.startsWith('##') && !line.includes('Tags')) {
          break;
        }
      }
    }
    
    return { 
      tags: [...new Set(tags)], // Remove duplicates
      dateAdded,
      url
    };
  }

  private parseBookmarkLines(lines: string[]): Bookmark[] {
    const bookmarks: Bookmark[] = [];
    
    lines.forEach((line, index) => {
      // Skip help text, separators, and lines without bookmark emoji
      if (line.includes('Add:') || line.includes('Help:') || line.includes('---') || !line.includes('🔖')) {
        return;
      }

      // Strip ANSI codes first, then extract the bookmark information
      const cleanLine = line.replace(/\x1b\[[0-9;]*m/g, '')
                           .replace(/\x1b\[[0-9;]*[A-Za-z]/g, '')
                           .replace(/\x1b\[K/g, '')
                           .replace(/\x1b\[[0-9]*K/g, '')
                           .replace(/\x1b\[[0-9]*J/g, '')
                           .replace(/\x1b\[[?7l]/g, '')
                           .replace(/\x1b\[[?7h]/g, '')
                           .replace(/\x1b\[[?25l]/g, '')
                           .replace(/\x1b\[[?25h]/g, '')
                           .replace(/\x1b\(B/g, '')
                           .replace(/\x1b/g, '')
                           .replace(/\[B\]/g, '');

      // Format: [id] 🔖 title (url)
      const bookmarkMatch = cleanLine.match(/\[(\d+)\]\s*🔖\s*(.+?)\s*\(([^)]+)\)/);
      
      if (bookmarkMatch) {
        const [, id, title, url] = bookmarkMatch;
        
        // Extract tags from title if they exist (assuming format: title #tag1 #tag2)
        const titleParts = title.split(' ');
        const tags: string[] = [];
        const cleanTitleParts: string[] = [];
        
        titleParts.forEach(part => {
          if (part.startsWith('#')) {
            tags.push(part.slice(1));
          } else {
            cleanTitleParts.push(part);
          }
        });
        
        const cleanTitle = cleanTitleParts.join(' ').trim();
        
        bookmarks.push({
          id: `bookmark-${id}`,
          title: cleanTitle || `Bookmark ${id}`,
          url: url.trim(),
          tags,
          dateAdded: new Date().toISOString() // Will be updated with real date from nb show
        });
      }
    });
    
    return bookmarks;
  }

  async getBookmarks(): Promise<Bookmark[]> {
    try {
      // Check if electronAPI is available
      if (!(window as any).electronAPI) {
        throw new Error('Electron API not available. Make sure you are running in Electron environment.');
      }
      
      // Get bookmarks list from nb
      const response = await (window as any).electronAPI.nbBookmarks() as NbResponse;
      if (!response.success) {
        throw new Error(response.error || 'Failed to get bookmarks');
      }
      
      if (!response.data) {
        console.warn('No bookmark data received from nb command');
        return [];
      }
      
      // Parse the output from nb bookmarks command
      const lines = response.data.split('\n').filter(line => line.trim());
      const bookmarks = this.parseBookmarkLines(lines);
      
      // Fetch individual bookmark details to get tags, dates, and full URLs
      const bookmarksWithTags = await Promise.all(
        bookmarks.map(async (bookmark) => {
          try {
            const id = bookmark.id.replace('bookmark-', '');
            const showResponse = await (window as any).electronAPI.nbShow(id) as NbResponse;
            if (showResponse.success && showResponse.data) {
              const { tags, dateAdded, url } = this.extractTagsFromShowOutput(showResponse.data);
              return { 
                ...bookmark, 
                tags, 
                dateAdded: dateAdded || bookmark.dateAdded,
                url: url || bookmark.url // Use full URL from show output, fallback to parsed URL
              };
            }
          } catch (error) {
            console.error(`Error fetching tags for bookmark ${bookmark.id}:`, error);
          }
          return bookmark;
        })
      );
      
      // Return enhanced bookmarks with tags and URLs
      return bookmarksWithTags;
    } catch (error) {
      console.error('Error in getBookmarks:', error);
      throw error;
    }
  }

  async getTags(): Promise<{ name: string; count: number }[]> {
    try {
      const response = await (window as any).electronAPI.nbTags() as NbResponse;
      if (!response.success) {
        throw new Error(response.error || 'Failed to get tags');
      }
      
      const tagLines = (response.data || '').split('\n').filter(line => line.trim());
      const tagNames = tagLines
        .filter(line => line.startsWith('#'))
        .map(line => line.trim().slice(1)); // Remove the # symbol
      
      // For each tag, we need to count how many bookmarks have that tag
      // We'll use nb --tags <tag> to get counts since bookmark list doesn't show tags
      const tagCounts: { [key: string]: number } = {};
      
      for (const tagName of tagNames) {
        try {
          const response = await (window as any).electronAPI.nbFilterByTag(tagName) as NbResponse;
          if (response.success && response.data) {
            const lines = (response.data || '').split('\n').filter(line => line.trim());
            const bookmarks = this.parseBookmarkLines(lines);
            tagCounts[tagName] = bookmarks.length;
          } else {
            tagCounts[tagName] = 0;
          }
        } catch (error) {
          tagCounts[tagName] = 0;
        }
      }
      
      return Object.entries(tagCounts)
        .filter(([_, count]) => count > 0)
        .map(([tag, count]) => ({ name: tag, count }))
        .sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error in getTags:', error);
      throw error;
    }
  }

  async filterByTag(tagName: string): Promise<Bookmark[]> {
    try {
      const response = await (window as any).electronAPI.nbFilterByTag(tagName) as NbResponse;
      if (!response.success) {
        throw new Error(response.error || 'Failed to filter by tag');
      }
      
      const lines = (response.data || '').split('\n').filter(line => line.trim());
      return this.parseBookmarkLines(lines);
    } catch (error) {
      console.error('Error in filterByTag:', error);
      throw error;
    }
  }

  async addBookmark(url: string, title: string, tags: string[]): Promise<void> {
    try {
      const tagString = tags.map(tag => `#${tag}`).join(' ');
      const nbCommand = `nb "${title}" ${tagString} ${url}`;
      
      const response = await (window as any).electronAPI.nbBookmarks() as NbResponse;
      if (!response.success) {
        throw new Error(response.error || 'Failed to add bookmark');
      }
      
      console.log('Bookmark added successfully');
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }
}

export const nbService = new NbService();