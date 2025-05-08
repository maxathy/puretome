import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Menu as MenuIcon } from 'lucide-react'; // Import Menu icon
import DraftorNav from './DraftorNav';
import DraftorQuill from './DraftorQuill'; // Import the new component
import ActivityPane from './ActivityPane'; // Import ActivityPane

const Draftor = ({ memoirId, chapterId }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isActivityPaneOpen, setIsActivityPaneOpen] = useState(false); // State for ActivityPane
  const navigate = useNavigate();
  const currentMemoir = useSelector((state) => state.memoir.currentMemoir);

  // Get chapters safely
  const chapters = currentMemoir?.chapters || [];
  // Find current chapter index for dropdown
  const selectedChapterId = chapterId || (chapters[0]?._id ?? '');

  const handleChapterChange = (e) => {
    const newChapterId = e.target.value;
    // Update the URL to switch context (preserve memoirId)
    navigate(`/editor/${memoirId}/${newChapterId}`);
  };

  const toggleActivityPane = () => {
    setIsActivityPaneOpen(!isActivityPaneOpen);
  };

  // Find the current chapter based on selectedChapterId
  const currentChapter = chapters.find(ch => ch._id === selectedChapterId);
  // Get events for the current chapter, default to an empty array if not found
  const eventsForPane = currentChapter?.events || [];
  // Get collaborators for the current memoir
  const collaboratorsForPane = currentMemoir?.collaborators || [];

  return (
    <div className='flex  min-h-[400px]'>
      {/* <DraftorNav collapsed={collapsed} setCollapsed={setCollapsed} /> */}
      {/* Main Content */}
      <div className='flex-1 pl-1'>
        <div className='mb-4 flex items-center justify-between gap-3'>
          <div className='relative w-7/8'>
            <select
              className='appearance-none w-full bg-white border border-gray-300 rounded px-4 py-2 pr-8 text-2xl font-semibold shadow focus:outline-none focus:ring-2 focus:ring-blue-200'
              value={selectedChapterId}
              onChange={handleChapterChange}
            >
              {chapters.map((ch) => (
                <option key={ch._id} value={ch._id}>
                  {ch.title}
                </option>
              ))}
            </select>
            <span className='pointer-events-none absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400'>
              <svg
                xmlns='http://www.w3.org/2000/svg'
                className='h-5 w-5'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 9l-7 7-7-7'
                />
              </svg>
            </span>
          </div>
          {/* Hamburger Icon to open Activity Pane */}
          <button
            onClick={toggleActivityPane}
            className="p-2 text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
            aria-label="Open activity pane"
            aria-expanded={isActivityPaneOpen}
          >
            <MenuIcon size={28} />
          </button>
        </div>

        {/* Draftor content goes here */}
        <DraftorQuill memoirId={memoirId} chapterId={selectedChapterId} />
      </div>

      {/* Activity Pane */}
      <ActivityPane
        isOpen={isActivityPaneOpen}
        onClose={() => setIsActivityPaneOpen(false)}
        chapterEvents={eventsForPane} // Pass the events for the current chapter
        collaborators={collaboratorsForPane} // Pass the collaborators for the current memoir
      />
    </div>
  );
};

Draftor.propTypes = {
  memoirId: PropTypes.string.isRequired,
  chapterId: PropTypes.string,
};

export default Draftor;
