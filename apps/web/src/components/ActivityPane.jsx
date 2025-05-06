import React, { useState } from 'react';
import { X } from 'lucide-react';

/**
 * ActivityPane Component
 * A sliding pane to display activity-related information like comments, validations, and requests,
 * with filtering options.
 *
 * @component
 * @param {boolean} isOpen - Controls pane visibility.
 * @param {function} onClose - Function to call when closing the pane.
 * @param {Array} [chapterEvents=[]] - Array of event objects for the current chapter.
 * @param {Array} [collaborators=[]] - Array of collaborator objects for the current memoir.
 * @returns {JSX.Element|null} The ActivityPane component.
 */
const ActivityPane = ({ isOpen, onClose, chapterEvents = [], collaborators = [] }) => {
  const [activeFilter, setActiveFilter] = useState(null); // 'event', 'collaborator'
  const [activeTab, setActiveTab] = useState('comments'); // 'comments', 'validations', 'requests'
  const [selectedEventId, setSelectedEventId] = useState(''); // To store the selected event ID
  const [selectedCollaboratorId, setSelectedCollaboratorId] = useState(''); // To store the selected collaborator ID

  const filters = ['event', 'collaborator'];
  const tabs = ['comments', 'validations', 'requests'];

  // Tailwind classes for pane transition
  const paneTransitionClasses = isOpen ? 'translate-x-0' : 'translate-x-full';

  return (
    <div
      className={`fixed top-0 right-0 h-full bg-white shadow-xl transition-transform duration-300 ease-in-out z-50
                  ${paneTransitionClasses} w-full sm:w-96 md:w-1/3 lg:w-1/4 max-w-md`} // Responsive width
      style={{ borderLeft: '1px solid #e5e7eb' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-pane-title"
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 border-b border-gray-200">
        <h2 id="activity-pane-title" className="text-lg font-semibold text-gray-800">
          Activity
        </h2>
        <button
          onClick={onClose}
          className="p-1 text-gray-500 rounded-full hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Close activity pane"
        >
          <X size={24} />
        </button>
      </div>

      {/* Content Area */}
      <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-57px)]"> {/* 57px is approx header height */}
        {/* Filter Pills */}
        <div className='center'>
    
          <div className="inline-flex rounded-md shadow-sm" role="group">
            
            {filters.map((filter, index) => (
              <button
                key={filter}
                type="button"
                onClick={() => {
                  const newFilter = activeFilter === filter ? null : filter;
                  setActiveFilter(newFilter);
                  if (newFilter !== 'event') {
                    setSelectedEventId(''); // Reset selected event if filter changes from 'event'
                  }
                  if (newFilter !== 'collaborator') {
                    setSelectedCollaboratorId(''); // Reset selected collaborator if filter changes from 'collaborator'
                  }
                }}
                className={`px-4 py-2 text-sm font-medium border border-gray-200
                            ${activeFilter === filter ? 'bg-blue-600 text-white border-blue-600 z-10 ring-2 ring-blue-300' : 'bg-white text-gray-700 hover:bg-gray-50'}
                            ${index === 0 ? 'rounded-l-md' : ''}
                            ${index === filters.length - 1 ? 'rounded-r-md' : ''}
                            focus:z-10 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Event Dropdown - Conditionally rendered */}
        {activeFilter === 'event' && (
          <div className="mt-1">

            <select
              id="event-select"
              name="event"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
            >
              <option value="">All Events</option>
              {chapterEvents && chapterEvents.length > 0 ? (
                chapterEvents.map((event) => (
                  <option key={event._id} value={event._id}>
                    {event.title || event.name || `Event ID: ${event._id}`} {/* Adjust based on your event object structure */}
                  </option>
                ))
              ) : (
                <option value="" disabled>No events available for this chapter</option>
              )}
            </select>
          </div>
        )}

        {/* Collaborator Dropdown - Conditionally rendered */}
        {activeFilter === 'collaborator' && (
          <div className="mt-1">
            <select
              id="collaborator-select"
              name="collaborator"
              value={selectedCollaboratorId}
              onChange={(e) => setSelectedCollaboratorId(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md shadow-sm"
            >
              <option value="">All Collaborators</option>
              {collaborators && collaborators.length > 0 ? (
                collaborators.map((collab) => (
                  <option key={collab._id} value={collab._id}>
                    {collab.user?.email || collab.inviteEmail || `Collaborator ID: ${collab._id}`}
                  </option>
                ))
              ) : (
                <option value="" disabled>No collaborators available</option>
              )}
            </select>
          </div>
        )}

        {/* Tabs */}
        <div>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-4 sm:space-x-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm
                              ${activeTab === tab
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                              }
                              focus:outline-none focus:ring-1 focus:ring-blue-400 focus:border-blue-400 rounded-t-sm`}
                  aria-current={activeTab === tab ? 'page' : undefined}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="mt-4 py-2">
            {activeTab === 'comments' && <div className="text-gray-700">Content for Comments will appear here.</div>}
            {activeTab === 'validations' && <div className="text-gray-700">Content for Validations will appear here.</div>}
            {activeTab === 'requests' && <div className="text-gray-700">Content for Requests will appear here.</div>}
            {/* You can replace these divs with actual components or content later */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityPane;