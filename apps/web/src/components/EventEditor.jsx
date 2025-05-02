import React, { useState, useEffect, useRef } from 'react';
import Modal from './ui/modal';
import { Trash2 } from 'lucide-react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

/**
 * EventEditor Component
 * Modal dialog for editing event details using Quill editor.
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
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    if (event) {
      setCurrentTitle(event.title || '');
      setCurrentContent(typeof event.content === 'string' ? event.content : '');
    } else {
      setCurrentTitle('');
      setCurrentContent('');
    }
  }, [event, isOpen]);

  useEffect(() => {
    if (!isOpen || !editorRef.current) return;
    // Destroy any previous Quill instance
    if (quillRef.current) {
      quillRef.current.off('text-change');
      quillRef.current = null;
      editorRef.current.innerHTML = '';
    }
    quillRef.current = new Quill(editorRef.current, {
      theme: 'snow',
      placeholder: 'Enter event details...',
      modules: {
        toolbar: [
          [{ header: [1, 2, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['link', 'blockquote', 'code-block'],
          ['clean'],
        ],
      },
    });
    quillRef.current.root.innerHTML = currentContent || '';
    quillRef.current.on('text-change', () => {
      setCurrentContent(quillRef.current.root.innerHTML);
    });
    // Cleanup on close or event change
    return () => {
      if (quillRef.current) {
        quillRef.current.off('text-change');
        quillRef.current = null;
      }
    };
  }, [isOpen, event]);

  // Update Quill content if event changes while modal is open
  useEffect(() => {
    if (
      isOpen &&
      quillRef.current &&
      currentContent !== quillRef.current.root.innerHTML
    ) {
      quillRef.current.root.innerHTML = currentContent || '';
    }
    // eslint-disable-next-line
  }, [currentContent, isOpen]);

  const handleSave = () => {
    if (!event) return;
    onSave({
      ...event,
      title: currentTitle,
      content: quillRef.current
        ? quillRef.current.root.innerHTML
        : currentContent,
    });
    // Do not close the modal here; let the parent close it after updating state
    // onClose();
  };

  const handleDelete = () => {
    if (!event || !event._id) return;
    if (
      window.confirm(
        `Are you sure you want to delete the event "${event.title}"?`,
      )
    ) {
      onDelete(event._id);
      onClose();
    }
  };

  if (!isOpen || !event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title='Edit Event'
      className='min-w-[500px] max-w-[80%]'
    >
      {/* Title Input */}
      <div className='mb-4'>
        <input
          id='eventTitle'
          type='text'
          value={currentTitle}
          onChange={(e) => setCurrentTitle(e.target.value)}
          className='w-full border rounded p-2'
          autoFocus
        />
      </div>
      {/* Quill Editor */}
      <div className='mb-4'>
        <div ref={editorRef} style={{ minHeight: 200, background: 'white' }} />
      </div>
      <div className='flex justify-between items-center mt-4'>
        <button
          onClick={handleDelete}
          className='px-4 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50 flex items-center'
          aria-label='Delete Event'
        >
          <Trash2 className='h-4 w-4 mr-1' />
          Delete
        </button>
        <div className='space-x-2'>
          <button
            onClick={onClose}
            className='px-4 py-2 text-sm text-gray-700 border rounded hover:bg-gray-100'
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className='px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700'
          >
            Save Changes
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EventEditor;
