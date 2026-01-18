import React, { useState, useEffect } from 'react';
import BookmarkList from './components/BookmarkList';
import TagList from './components/TagList';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

const App = () => {
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  

  const handleTagSelect = (tag: string) => {
    setSelectedTag(tag);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Basic input validation and sanitization
    const sanitizedValue = value
      .trim()
      .slice(0, 200) // Limit search length to prevent performance issues
      .replace(/[<>]/g, ''); // Remove potential HTML tags
    setSearchQuery(sanitizedValue);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Bookmark Manager</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search bookmarks..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </header>

      <main className="app-main">
        <div className="sidebar">
          <TagList onTagSelect={handleTagSelect} selectedTag={selectedTag} />
        </div>
        
        <div className="content">
          <BookmarkList searchQuery={searchQuery} filterTag={selectedTag} />
        </div>
      </main>
    </div>
  );
};

export default App;