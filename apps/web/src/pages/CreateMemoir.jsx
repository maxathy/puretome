// apps/web/src/pages/CreateMemoir.jsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateTitle,
  updateContent,
  updateChapterTitle,
  updateEvent,
  addChapter,
  addEvent,
  createMemoir,
  resetMemoir
} from '../store/memoirSlice';

/**
 * CreateMemoir Component
 * Provides an interface for creating new memoirs with chapters and events
 * Uses Redux for state management and API interactions
 *
 * @component
 * @returns {JSX.Element} Form interface for memoir creation
 */
const CreateMemoir = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Select memoir state from Redux store
  const { title, content, chapters, loading, error, currentId } = useSelector(
    (state) => state.memoir
  );

  // Reset memoir form when component unmounts
  useEffect(() => {
    return () => {
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

  const handleChapterTitleChange = (index, e) => {
    dispatch(updateChapterTitle({ index, title: e.target.value }));
  };

  const handleEventChange = (chapterIndex, eventIndex, field, value) => {
    dispatch(
      updateEvent({ chapterIndex, eventIndex, field, value })
    );
  };

  const handleAddChapter = () => {
    dispatch(addChapter());
  };

  const handleAddEvent = (chapterIndex) => {
    dispatch(addEvent(chapterIndex));
  };

  const handleSaveMemoir = () => {
    if (!title.trim()) {
      // You could add form validation in Redux too
      return;
    }

    const memoirData = {
      title,
      content,
      chapters,
      status: 'draft'
    };

    dispatch(createMemoir(memoirData));
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Memoir</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">
          Memoir Title
        </label>
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="w-full border rounded px-3 py-2"
          placeholder="Enter a compelling title for your memoir"
        />
      </div>

      <div className="mb-6">
        <label className="block text-gray-700 font-semibold mb-2">
          Memoir Description
        </label>
        <textarea
          value={content}
          onChange={handleContentChange}
          className="w-full border rounded px-3 py-2 h-32"
          placeholder="Write a brief description of your memoir"
        />
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Chapters</h2>
          <button
            type="button"
            onClick={handleAddChapter}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            Add Chapter
          </button>
        </div>

        {chapters.map((chapter, chapterIndex) => (
          <div key={chapterIndex} className="border rounded p-4 mb-4">
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">
                Chapter Title
              </label>
              <input
                type="text"
                value={chapter.title}
                onChange={(e) => handleChapterTitleChange(chapterIndex, e)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="mb-3">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium">Events</h3>
                <button
                  type="button"
                  onClick={() => handleAddEvent(chapterIndex)}
                  className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
                >
                  Add Event
                </button>
              </div>

              {chapter.events.map((event, eventIndex) => (
                <div key={eventIndex} className="border rounded p-3 mb-3">
                  <div className="mb-2">
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Event Title
                    </label>
                    <input
                      type="text"
                      value={event.title}
                      onChange={(e) =>
                        handleEventChange(chapterIndex, eventIndex, 'title', e.target.value)
                      }
                      className="w-full border rounded px-3 py-1 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 text-sm font-medium mb-1">
                      Event Description
                    </label>
                    <textarea
                      value={event.content}
                      onChange={(e) =>
                        handleEventChange(chapterIndex, eventIndex, 'content', e.target.value)
                      }
                      className="w-full border rounded px-3 py-1 h-16 text-sm"
                      placeholder="Describe what happened in this event..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end mt-6">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="border border-gray-300 text-gray-700 px-4 py-2 rounded mr-2"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSaveMemoir}
          disabled={loading}
          className={`bg-blue-600 text-white px-6 py-2 rounded ${
            loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {loading ? 'Saving...' : 'Save Memoir'}
        </button>
      </div>
    </div>
  );
};

export default CreateMemoir;
