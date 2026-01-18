import React, { useState, useEffect } from 'react';
import { Tag, nbService } from '../services/nbService';
import './TagList.css';

interface TagListProps {
  onTagSelect: (tag: string) => void;
  selectedTag?: string;
}

const TagList = ({ onTagSelect, selectedTag }: TagListProps) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    try {
      setLoading(true);
      const data = await nbService.getTags();
      setTags(data.sort((a, b) => b.count - a.count)); // Sort by count descending
      setError(null);
    } catch (err) {
      setError('Failed to load tags');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTagClick = (tagName: string) => {
    if (selectedTag === tagName) {
      onTagSelect(''); // Clear filter if clicking the same tag
    } else {
      onTagSelect(tagName);
    }
  };

  if (loading) {
    return <div className="loading-tags">Loading tags...</div>;
  }

  if (error) {
    return (
      <div className="error-tags">
        <p>{error}</p>
        <button onClick={loadTags}>Retry</button>
      </div>
    );
  }

  return (
    <div className="tag-list">
      <h3>Tags ({tags.length})</h3>
      {tags.length === 0 ? (
        <p>No tags found.</p>
      ) : (
        <div className="tags-container">
          {tags.map((tag) => (
            <button
              key={tag.name}
              className={`tag-button ${selectedTag === tag.name ? 'active' : ''}`}
              onClick={() => handleTagClick(tag.name)}
              title={`${tag.count} bookmarks`}
            >
              <span className="tag-name">#{tag.name}</span>
              <span className="tag-count">({tag.count})</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagList;