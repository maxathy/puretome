import React, { useState, useEffect } from 'react';

// Basic Modal Component (replace with your actual UI library modal if available)
const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: 'white', padding: '20px', borderRadius: '8px',
        minWidth: '500px', maxWidth: '80%', maxHeight: '80%', overflowY: 'auto'
      }}>
        <button onClick={onClose} style={{ float: 'right', background: 'none', border: 'none', fontSize: '1.5rem' }}>&times;</button>
        {children}
      </div>
    </div>
  );
};
Modal.displayName = 'Modal';

/**
 * EventEditor Component
 * Modal dialog for editing event details using a simple textarea.
 *
 * @component
 * @param {object} event - The event object being edited (needs id, title, content)
 * @param {boolean} isOpen - Controls modal visibility
 * @param {function} onClose - Function to call when closing the modal
 * @param {function} onSave - Function to call when saving changes (passes updated event)
 * @returns {JSX.Element|null} Modal editor component
 */
const EventEditor = ({ event, isOpen, onClose, onSave }) => {
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

  if (!isOpen || !event) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
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

      <div className="flex justify-end mt-4 space-x-2">
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
    </Modal>
  );
};

export default EventEditor; 