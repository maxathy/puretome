// apps/web/src/pages/CreateMemoir.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const CreateMemoir = () => {
  const navigate = useNavigate();
  const [memoir, setMemoir] = useState({
    title: '',
    content: '',
    chapters: [
      {
        title: 'Chapter 1',
        events: [
          { title: 'First Event', content: '' }
        ]
      }
    ],
    status: 'draft'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTitleChange = (e) => {
    setMemoir({ ...memoir, title: e.target.value });
  };

  const handleContentChange = (e) => {
    setMemoir({ ...memoir, content: e.target.value });
  };

  const handleChapterTitleChange = (index, e) => {
    const updatedChapters = [...memoir.chapters];
    updatedChapters[index].title = e.target.value;
    setMemoir({ ...memoir, chapters: updatedChapters });
  };

  const handleEventChange = (chapterIndex, eventIndex, field, value) => {
    const updatedChapters = [...memoir.chapters];
    updatedChapters[chapterIndex].events[eventIndex][field] = value;
    setMemoir({ ...memoir, chapters: updatedChapters });
  };

  const addChapter = () => {
    setMemoir({
      ...memoir,
      chapters: [
        ...memoir.chapters,
        {
          title: `Chapter ${memoir.chapters.length + 1}`,
          events: [{ title: 'New Event', content: '' }]
        }
      ]
    });
  };

  const addEvent = (chapterIndex) => {
    const updatedChapters = [...memoir.chapters];
    updatedChapters[chapterIndex].events.push({
      title: 'New Event',
      content: ''
    });
    setMemoir({ ...memoir, chapters: updatedChapters });
  };

  const saveMemoir = async () => {
    if (!memoir.title.trim()) {
      setError('Memoir title is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {

      const response = await axios.post('/api/memoir', memoir);

      // Navigate to the memoir editor or dashboard
      navigate(`/editor/${response.data.memoir._id}`);
    } catch (err) {
      console.error('Error saving memoir:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to save memoir. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
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
          value={memoir.title}
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
          value={memoir.content}
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
            onClick={addChapter}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
          >
            Add Chapter
          </button>
        </div>

        {memoir.chapters.map((chapter, chapterIndex) => (
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
                  onClick={() => addEvent(chapterIndex)}
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
          onClick={saveMemoir}
          disabled={isLoading}
          className={`bg-blue-600 text-white px-6 py-2 rounded ${
            isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {isLoading ? 'Saving...' : 'Save Memoir'}
        </button>
      </div>
    </div>
  );
};

export default CreateMemoir;
