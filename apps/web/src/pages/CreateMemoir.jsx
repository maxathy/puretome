// apps/web/src/pages/CreateMemoir.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateTitle,
  updateContent,
  createMemoir,
  resetMemoir,
} from '../store/memoirSlice';

/**
 * CreateMemoir Component
 * Provides an interface for creating new memoirs with just title and description.
 * Uses Redux for state management and API interactions
 *
 * @component
 * @returns {JSX.Element} Form interface for memoir creation
 */
const CreateMemoir = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Select relevant memoir state from Redux store
  const { title, content, loading, error, currentId } = useSelector(
    (state) => state.memoir,
  );

  // Reset relevant memoir form fields when component unmounts
  useEffect(() => {
    return () => {
      // Reset only title and content if needed, or keep full reset
      dispatch(resetMemoir());
    };
  }, [dispatch]);

  // Navigate to editor after successful creation
  useEffect(() => {
    if (currentId) {
      navigate(`/editor/${currentId}`);
    }
  }, [currentId, navigate]);

  const handleTitleChange = (e) => {
    dispatch(updateTitle(e.target.value));
  };

  const handleContentChange = (e) => {
    dispatch(updateContent(e.target.value));
  };

  const handleSaveMemoir = () => {
    if (!title.trim()) {
      // Basic validation
      return;
    }

    // Only send title and content
    // The backend/API should handle creating a default chapter structure if necessary
    const memoirData = {
      title,
      content,
      status: 'draft',
      // chapters field removed
    };

    dispatch(createMemoir(memoirData));
  };

  return (
    <div className='p-6 max-w-4xl mx-auto'>
      <h1 className='text-2xl font-bold mb-6'>Create New Memoir</h1>

      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4'>
          {error}
        </div>
      )}

      <div className='mb-6'>
        <label
          htmlFor='memoirTitle'
          className='block text-gray-700 font-semibold mb-2'
        >
          Memoir Title
        </label>
        <input
          id='memoirTitle'
          type='text'
          value={title}
          onChange={handleTitleChange}
          className='w-full border rounded px-3 py-2'
          placeholder='Enter a compelling title for your memoir'
        />
      </div>

      <div className='mb-6'>
        <label
          htmlFor='memoirDescription'
          className='block text-gray-700 font-semibold mb-2'
        >
          Memoir Description
        </label>
        <textarea
          id='memoirDescription'
          value={content}
          onChange={handleContentChange}
          className='w-full border rounded px-3 py-2 h-32'
          placeholder='Write a brief description of your memoir (optional)'
        />
      </div>

      <div className='flex justify-end mt-6'>
        <button
          type='button'
          onClick={() => navigate('/editor')}
          className='border border-gray-300 text-gray-700 px-4 py-2 rounded mr-2'
        >
          Cancel
        </button>
        <button
          type='button'
          onClick={handleSaveMemoir}
          disabled={loading || !title.trim()}
          className={`bg-blue-600 text-white px-6 py-2 rounded ${
            loading || !title.trim() ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {loading ? 'Saving...' : 'Create Memoir'}
        </button>
      </div>
    </div>
  );
};

export default CreateMemoir;
