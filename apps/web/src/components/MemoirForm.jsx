import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { resetMemoir, saveMemoir } from '../store/memoirSlice';
import CollaboratorsList from './CollaboratorsList';

/**
 * MemoirForm Component
 * Provides a form interface for creating OR editing memoirs (title and description).
 * Uses local state for editing, Redux state for creation.
 * Navigates on creation, calls onSaveComplete on successful edit.
 *
 * @component
 * @param {object} [memoirToEdit] - If provided, the component operates in edit mode.
 * @param {function} [onSaveComplete] - Callback function triggered after successful save in edit mode.
 * @param {function} [onCancel] - Callback function triggered when cancelling edit mode.
 * @returns {JSX.Element} Form interface for memoir creation/editing
 */
const MemoirForm = ({ memoirToEdit, onSaveComplete, onCancel }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Determine mode
  const isEditing = !!memoirToEdit;

  // Redux state (used primarily for creation mode and potentially shared loading/error)
  const {
    loading: reduxLoading,
    error: reduxError,
    currentId: creationCurrentId, // ID after creation
  } = useSelector((state) => state.memoir);

  // Local state for form fields (used in both modes, initialized differently)
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Local state for edit mode saving status
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  // Initialize form fields based on mode
  useEffect(() => {
    if (isEditing) {
      setTitle(memoirToEdit.title || '');
      setContent(memoirToEdit.content || '');
      // Reset Redux creation form state if switching to edit mode
      // dispatch(resetMemoir()); // Optional: depends if you want create state cleared
    } else {
      // For creation mode, we could potentially sync local state from redux
      // setTitle(reduxTitle);
      // setContent(reduxContent);
      // Or just rely on the user typing into initially empty fields
      setTitle('');
      setContent('');
    }
  }, [isEditing, memoirToEdit]); // Rerun when mode changes

  // Handle navigation after creation
  useEffect(() => {
    if (!isEditing && creationCurrentId) {
      navigate(`/editor/${creationCurrentId}`);
    }
  }, [isEditing, creationCurrentId, navigate]);

  // Cleanup Redux form state on unmount *only* if in creation mode
  useEffect(() => {
    return () => {
      if (!isEditing) {
        dispatch(resetMemoir());
      }
    };
  }, [dispatch, isEditing]);

  const handleSaveMemoir = async () => {
    if (!title.trim()) {
      // Basic validation
      return;
    }

    const memoirData = {
      title,
      content,
      // Include _id only if editing
      ...(isEditing && { _id: memoirToEdit._id }),
    };

    setIsSaving(true);
    setSaveError(null);

    try {
      await dispatch(saveMemoir(memoirData)).unwrap(); // Use the consolidated save action
      if (isEditing && onSaveComplete) {
        onSaveComplete(); // Call edit-specific callback
      }
      // Navigation for creation is handled by useEffect watching creationCurrentId
    } catch (err) {
      setSaveError(err || 'Failed to save memoir');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (isEditing && onCancel) {
      onCancel(); // Use the callback if provided for editing
    } else if (!isEditing) {
      window.location.reload();
    }
  };

  // Determine loading and error states based on mode
  const isLoading = isEditing ? isSaving : reduxLoading;
  const currentError = isEditing ? saveError : reduxError;

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      {/* Adjust title based on mode */}
      {isEditing ? (
        <h1 className='text-2xl font-bold mb-6'>Edit Memoir</h1>
      ) : (
        <h1 className='text-2xl font-bold mb-6'>Create New Memoir</h1>
      )}

      {currentError && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {typeof currentError === 'string'
            ? currentError
            : 'An unexpected error occurred.'}
        </div>
      )}

      <div className='mb-6'>
        <label
          htmlFor='memoirTitle'
          className='block text-gray-700 font-semibold mb-2'
        >
          Title
        </label>
        <input
          id='memoirTitle'
          type='text'
          value={title} // Use local state
          onChange={(e) => setTitle(e.target.value)} // Update local state
          className='w-full border rounded px-3 py-2'
          placeholder='Enter a compelling title for your memoir'
        />
      </div>

      <div className='mb-6'>
        <label
          htmlFor='memoirDescription'
          className='block text-gray-700 font-semibold mb-2'
        >
          Description
        </label>
        <textarea
          id='memoirDescription'
          value={content} // Use local state
          onChange={(e) => setContent(e.target.value)} // Update local state
          className='w-full border rounded px-3 py-2 h-32'
          placeholder='Write a brief description of your memoir (optional)'
        />
      </div>

      {/* Conditionally render CollaboratorsList in edit mode */}
      {isEditing && memoirToEdit && (
        <div className='mb-6'>
          <CollaboratorsList memoir={memoirToEdit} />
        </div>
      )}

      <div className='flex justify-end mt-6'>
        <button
          type='button'
          onClick={handleCancel} // Use updated cancel handler
          className='border border-gray-300 text-gray-700 px-4 py-2 rounded mr-2'
        >
          Cancel
        </button>
        <button
          type='button'
          onClick={handleSaveMemoir}
          disabled={isLoading || !title.trim()}
          className={`bg-blue-600 text-white px-6 py-2 rounded ${
            isLoading || !title.trim()
              ? 'opacity-70 cursor-not-allowed'
              : 'hover:bg-blue-700'
          }`}
        >
          {/* Adjust button text based on mode */}
          {isLoading
            ? 'Saving...'
            : isEditing
              ? 'Save Changes'
              : 'Create Memoir'}
        </button>
      </div>
    </div>
  );
};

export default MemoirForm;
