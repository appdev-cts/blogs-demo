// TagsInput.js
import React, { useState, useCallback } from 'react';
import { ImCross } from 'react-icons/im';

const TagsInput = ({ tags, setTags }) => {
  const [inputValue, setInputValue] = useState('');
  const [tagHistory, setTagHistory] = useState([]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
};

const handleKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
        e.preventDefault();
        setTags([...tags, inputValue.trim()]);
        setInputValue('');
    }else if (e.key === 'Backspace' && !inputValue) {
      e.preventDefault();
      handleRemoveTag(tags.length - 1);
  }else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
    e.preventDefault();
    handleUndoRemoveTag();
}
};
const handleUndoRemoveTag = useCallback(() => {
  if (tagHistory.length > 0) {
      const lastRemovedTag = tagHistory[tagHistory.length - 1];
      setTags([...tags, lastRemovedTag]);
      setTagHistory(tagHistory.slice(0, -1));
  }
}, [tagHistory, tags, setTags]);

  const handleRemoveTag = (index) => {
    const newTags = tags.filter((_, i) => i !== index);
    const removedTag = tags[index];

    setTags(newTags);
    setTagHistory([...tagHistory, removedTag]);

  };

  return (
    <div className="flex flex-wrap items-center border rounded p-2">
      {tags.map((tag, index) => (
        <div key={index} className="flex items-center bg-gray-200 rounded-full px-3 py-1 m-1">
          {tag}
          <ImCross className="ml-2 cursor-pointer" onClick={() => handleRemoveTag(index)} />
        </div>
      ))}
      <input
        type="text"
        className="flex-1 border-none outline-none"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Enter tags"
      />
    </div>
  );
};

export default TagsInput;
