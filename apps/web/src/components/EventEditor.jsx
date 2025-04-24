import React, { useState, useEffect } from 'react';
import Modal from './ui/modal'; // Import the reusable modal
import { Trash2 } from 'lucide-react'; // Assuming lucide-react for icons

/**
 * EventEditor Component
 * Modal dialog for editing event details using a simple textarea.
 *
 * @component
 * @param {object} event - The event object being edited (needs id, title, content)
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Function to call when closing the modal
 * @param {function} onSave - Function to call when saving changes (passes updated event)
 * @param {function} onDelete - Function to call when deleting the event (passes event id)
 * @returns {JSX.Element|null} Modal editor component
 */
const EventEditor = ({ event, isOpen, onClose, onSave, onDelete }) => {
  // State for the textarea content
  const [currentContent, setCurrentContent] = useState('');
  // State for the title input
  const [currentTitle, setCurrentTitle] = useState('');

  // Initialize state when the event data is available
  useEffect(() => {
    if (event) {
      // Set Title
      setCurrentTitle(event.title || '');

      // Set Content (handling object/string)
      if (event.content) {
        if (typeof event.content === 'object') {
            try {
                setCurrentContent(JSON.stringify(event.content, null, 2));
            } catch {
                setCurrentContent('[object Object]');
            }
        } else {
            setCurrentContent(String(event.content));
        }
      } else {
          setCurrentContent('');
      }
    } else {
      // Reset if no event
      setCurrentTitle('');
      setCurrentContent('');
    }

    // Reset state when modal closes
    return () => {
      if (!isOpen) {
        setCurrentTitle('');
        setCurrentContent('');
      }
    }
  }, [event, isOpen]);

  const handleSave = () => {
    if (!event) return;
    // Pass the updated event object back with the new title and content
    onSave({ ...event, title: currentTitle, content: currentContent });
    onClose(); // Close the modal after saving
  };

  const handleDelete = () => {
    if (!event || !event._id) return;
    if (window.confirm(`Are you sure you want to delete the event "${event.title}"?`)) {
        onDelete(event._id); // Pass the event ID to the delete handler
        onClose(); // Close the modal after deletion
    }
  };

  if (!isOpen || !event) return null;

  return (
    <Modal 
        isOpen={isOpen} 
        onClose={onClose} 
        title="Edit Event" 
        className="min-w-[500px] max-w-[80%]" // Adjust width via className
    >
      {/* Title Input */}
      <div className="mb-4">
          <input
            id="eventTitle"
            type="text"
            value={currentTitle}
            onChange={(e) => setCurrentTitle(e.target.value)}
            className="w-full border rounded p-2"
            autoFocus // Auto-focus the title input first
          />
      </div>

      {/* Content Textarea */}
      <div className="mb-4">
          <textarea
            id="eventContent"
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
            placeholder="Enter event details..."
            className="w-full h-64 border rounded p-2" // Basic styling for textarea
          />
      </div>

      {/* Button container - justify-between to push delete left, others right */}
      <div className="flex justify-between items-center mt-4">
        {/* Delete Button (Left) */}
        <button
          onClick={handleDelete}
          className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 flex items-center"
          aria-label="Delete Event"
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Delete
        </button>

        {/* Cancel and Save Buttons (Right) */}
        <div className="space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EventEditor; 