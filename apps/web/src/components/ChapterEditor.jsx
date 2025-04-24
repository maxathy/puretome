import React, { useState, useEffect } from 'react';
import Modal from './ui/modal'; // Import the reusable modal
import { Trash2 } from 'lucide-react'; // Import an icon

/**
 * ChapterEditor Component
 * Modal dialog for editing a chapter's title and description, or deleting it.
 *
 * @component
 * @param {object} chapter - The chapter object being edited (needs id, title, description)
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Function to call when closing the modal
 * @param {function} onSave - Function to call when saving changes (passes updated chapter)
 * @param {function} onDelete - Function to call when deleting the chapter (passes chapter id)
 * @returns {JSX.Element|null} Modal editor component
 */
const ChapterEditor = ({ chapter, isOpen, onClose, onSave, onDelete }) => {
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
    };
  }, [chapter, isOpen]); // Rerun when chapter or isOpen changes

  const handleSave = () => {
    if (!chapter) return;
    // Pass the updated chapter object back with the new title and description
    onSave({
      ...chapter,
      title: currentTitle,
      description: currentDescription,
    });
    onClose(); // Close the modal after saving
  };

  // Handle delete action
  const handleDelete = () => {
    if (!chapter || !onDelete) return;

    if (
      window.confirm(
        `Are you sure you want to delete the chapter "${chapter.title}"?`,
      )
    ) {
      onDelete(chapter._id); // Pass the chapter ID to the delete handler
      onClose(); // Close the modal after deletion
    }
  };

  // Prevent rendering if not open or no chapter provided
  if (!isOpen || !chapter) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Edit Chapter'
      className='min-w-[400px] max-w-[60%]' // Adjust width via className
    >
      {/* Title Input */}
      <div className='mb-4'>
        <input
          id='chapterTitle'
          type='text'
          value={currentTitle}
          onChange={(e) => setCurrentTitle(e.target.value)}
          className='w-full border rounded p-2'
          autoFocus // Auto-focus the title input
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSave();
          }} // Save on Enter key
        />
      </div>

      {/* Description Textarea */}
      <div className='mb-4'>
        <label
          htmlFor='chapterDescription'
          className='block text-sm font-medium text-gray-700 mb-1'
        >
          Add notes about this chapter
        </label>
        <textarea
          id='chapterDescription'
          value={currentDescription}
          onChange={(e) => setCurrentDescription(e.target.value)}
          placeholder='Enter chapter description (optional)...'
          className='w-full h-32 border rounded p-2' // Basic styling for textarea
          rows={4} // Suggest number of lines
        />
      </div>

      {/* Action Buttons */}
      <div className='flex justify-between items-center mt-6 space-x-2'>
        {' '}
        {/* Use justify-between */}
        {/* Delete Button on the left */}
        <button
          onClick={handleDelete}
          className='px-4 py-2 text-sm text-red-700 border border-red-300 rounded hover:bg-red-50'
          title='Delete Chapter' // Tooltip for accessibility
        >
          <Trash2 className='h-4 w-4' /> {/* Icon */}
        </button>
        {/* Cancel and Save Buttons on the right */}
        <div className='flex space-x-2'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm text-gray-700 border rounded hover:bg-gray-100'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className='px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700'
            disabled={!currentTitle.trim()} // Disable save if title is empty
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ChapterEditor;
