import React, { useState, useEffect } from 'react';
import Modal from './ui/modal'; // Import the reusable modal

/**
 * ChapterEditor Component
 * Modal dialog for editing a chapter's title.
 *
 * @component
 * @param {object} chapter - The chapter object being edited (needs id, title)
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Function to call when closing the modal
 * @param {function} onSave - Function to call when saving changes (passes updated chapter)
 * @returns {JSX.Element|null} Modal editor component
 */
const ChapterEditor = ({ chapter, isOpen, onClose, onSave }) => {
  // State for the title input
  const [currentTitle, setCurrentTitle] = useState('');
  // State for the description textarea
  const [currentDescription, setCurrentDescription] = useState('');

  // Initialize state when the chapter data is available
  useEffect(() => {
    if (isOpen && chapter) {
      setCurrentTitle(chapter.title || '');
      setCurrentDescription(chapter.description || ''); // Initialize description
    } 
    // Reset state when modal closes or chapter changes
    return () => {
        if (!isOpen) {
            setCurrentTitle('');
            setCurrentDescription('');
        }
    }
  }, [chapter, isOpen]); // Rerun when chapter or isOpen changes

  const handleSave = () => {
    if (!chapter) return;
    // Pass the updated chapter object back with the new title and description
    onSave({ ...chapter, title: currentTitle, description: currentDescription });
    onClose(); // Close the modal after saving
  };

  // Prevent rendering if not open or no chapter provided
  if (!isOpen || !chapter) return null;

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title="Edit Chapter" 
        className="min-w-[400px] max-w-[60%]" // Adjust width via className
    >
      {/* Title Input */}
      <div className="mb-4">
        
          <input
            id="chapterTitle"
            type="text"
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            className="w-full border rounded p-2"
            autoFocus // Auto-focus the title input
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }} // Save on Enter key
          />
      </div>

      {/* Description Textarea */}
      <div className="mb-4">
          <label htmlFor="chapterDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Add notes about this chapter
          </label>
          <textarea
            id="chapterDescription"
            value={currentDescription}
            onChange={(e) => setCurrentDescription(e.target.value)}
            placeholder="Enter chapter description (optional)..."
            className="w-full h-32 border rounded p-2" // Basic styling for textarea
            rows={4} // Suggest number of lines
          />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end mt-6 space-x-2"> {/* Increased margin top */}
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-700 border rounded hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
          disabled={!currentTitle.trim()} // Disable save if title is empty
        >
          Save Changes
        </button>
      </div>
    </Modal>
  );
};

export default ChapterEditor; 