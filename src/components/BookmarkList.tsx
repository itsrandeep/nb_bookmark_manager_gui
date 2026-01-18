import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Bookmark, nbService } from '../services/nbService';
import './BookmarkList.css';

interface BookmarkListProps {
  searchQuery?: string;
  filterTag?: string;
}

const BookmarkList = ({ searchQuery = '', filterTag = '' }: BookmarkListProps) => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [filteredBookmarks, setFilteredBookmarks] = useState<Bookmark[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nbAvailable, setNbAvailable] = useState(false);

  useEffect(() => {
    loadBookmarks();
  }, [filterTag]); // Reload when filterTag changes

  useEffect(() => {
    let filtered = bookmarks;
    
    // Only filter by tag if we have all bookmarks (not when filtered by nb --tags)
    if (filterTag && bookmarks.length > 0 && bookmarks[0].tags.length > 0) {
      filtered = filtered.filter(bookmark => 
        bookmark.tags.includes(filterTag)
      );
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bookmark =>
        bookmark.title.toLowerCase().includes(query) ||
        bookmark.url.toLowerCase().includes(query) ||
        bookmark.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredBookmarks(filtered);
  }, [bookmarks, searchQuery, filterTag]);



  const loadBookmarks = async () => {
    try {
      setLoading(true);
      setError(null);
      setNbAvailable(false);
      
      let data;
      
      if (filterTag) {
        // Use nb filter when a specific tag is selected
        data = await nbService.filterByTag(filterTag);
      } else {
        // Get all bookmarks
        data = await nbService.getBookmarks();
      }
      
      setBookmarks(data);
      setNbAvailable(true);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load bookmarks';
      console.error('Error loading bookmarks:', err);
      setError(errorMessage);
      setNbAvailable(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkClick = async (url: string) => {
    // Open URL in system browser via Electron
    if (!url || typeof url !== 'string') {
      console.error('Invalid URL provided:', url);
      return;
    }
    
    try {
      
      const result = await (window as any).electronAPI.openExternal(url);
      if (result && !result.success) {
        throw new Error(result.error || 'Failed to open URL');
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
      // Fallback to window.open with validation
      const sanitizedUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(sanitizedUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return <div className="loading-container">
      <div className="spinner"></div>
      <p>Loading bookmarks...</p>
    </div>;
  }

if (error) {
    return (
      <div className="error-container">
        <h3>Error Loading Bookmarks</h3>
        <p>{error}</p>
        <button onClick={loadBookmarks} className="retry-button">
          Try Again
        </button>
        <details className="error-details">
          <summary>Technical Details</summary>
          <p><strong>nb command available:</strong> {nbAvailable ? 'Yes' : 'No'}</p>
          <p><strong>Filter tag:</strong> {filterTag || 'None'}</p>
          <p><strong>Bookmarks loaded:</strong> {bookmarks.length}</p>
        </details>
      </div>
    );
  }

  return (
    <div className="bookmark-list">
      <h2>
        Bookmarks ({filteredBookmarks.length})
        {filterTag && <span className="filter-indicator"> - Tag: #{filterTag}</span>}
        {searchQuery && <span className="filter-indicator"> - Search: "{searchQuery}"</span>}
      </h2>
      {filteredBookmarks.length === 0 ? (
        <div className="no-results">
          <div className="no-results-icon">📚</div>
          <h3>No bookmarks found</h3>
          <p>
            {filterTag 
              ? `No bookmarks found with tag "${filterTag}"`
              : searchQuery
                ? `No bookmarks found matching "${searchQuery}"`
                : 'No bookmarks found. Make sure the nb command is installed and configured.'
            }
          </p>
          {nbAvailable && (
            <button onClick={loadBookmarks} className="retry-button">
              Reload Bookmarks
            </button>
          )}
        </div>
      ) : (
        <div className="bookmarks">
          {filteredBookmarks.map((bookmark) => (
            <div key={bookmark.id} className="bookmark-item">
              <div className="bookmark-header">
                <h3 
                  className="bookmark-title"
                  onClick={() => handleBookmarkClick(bookmark.url)}
                  title="Click to open"
                >
                  {bookmark.title}
                </h3>
                
                {bookmark.tags && bookmark.tags.length > 0 && (
                  <div className="bookmark-title-tags">
                    {bookmark.tags.map((tag, index) => (
                      <span key={index} className="title-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <a 
                href={bookmark.url} 
                className="bookmark-url"
                onClick={(e) => {
                  e.preventDefault();
                  handleBookmarkClick(bookmark.url);
                }}
                title={bookmark.url}
              >
                {bookmark.url.length > 50 
                  ? `${bookmark.url.substring(0, 50)}...` 
                  : bookmark.url
                }
              </a>
              <div className="bookmark-date">
                Added: {new Date(bookmark.dateAdded).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookmarkList;