import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent } from './ui/card';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMemoir,
  saveMemoir,
  updateChaptersOrder,
  updateEvents,
} from '../store/memoirSlice';
import EventEditor from './EventEditor';
import ChapterEditor from './ChapterEditor';
import Modal from './ui/modal';
import MemoirForm from './MemoirForm';
import AddCard from './AddCard'; // Import the new component

export default function TimelineBoard({ memoirId }) {
  const dispatch = useDispatch();
  const { currentMemoir, loading, error } = useSelector(
    (state) => state.memoir,
  );

  // State for event creation
  const [newEventChapter, setNewEventChapter] = useState(null);
  const [newEventTitle, setNewEventTitle] = useState('');

  // State for chapter creation
  const [isAddingChapter, setIsAddingChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // State for event editing modal
  const [editingEvent, setEditingEvent] = useState(null);
  // State for chapter editing modal
  const [editingChapter, setEditingChapter] = useState(null);
  // State for memoir editing modal
  const [isEditingMemoir, setIsEditingMemoir] = useState(false);

  // Fetch memoir data on component mount
  useEffect(() => {
    dispatch(fetchMemoir(memoirId));
  }, [dispatch, memoirId]);

  // Handle drag and drop operations
  const onDragEnd = (result) => {
    const { source, destination, type } = result;

    // If there's no destination or item dropped to original position
    if (
      !destination ||
      (source.droppableId === destination.droppableId &&
        source.index === destination.index)
    ) {
      return;
    }

    // Handle chapter reordering (columns)
    if (type === 'COLUMN') {
      const reorderedChapters = Array.from(currentMemoir.chapters);
      const [removed] = reorderedChapters.splice(source.index, 1);
      reorderedChapters.splice(destination.index, 0, removed);

      dispatch(
        saveMemoir({
          ...currentMemoir,
          chapters: reorderedChapters,
        }),
      );

      // Dispatch the updateChaptersOrder action
      dispatch(updateChaptersOrder(reorderedChapters));
      return;
    }

    // Handle event reordering (cards)
    const sourceChapter = currentMemoir.chapters.find(
      (chapter) => chapter._id === source.droppableId,
    );
    const destChapter = currentMemoir.chapters.find(
      (chapter) => chapter._id === destination.droppableId,
    );

    // If source or destination chapter not found
    if (!sourceChapter || !destChapter) return;

    // Clone the chapters to work with
    const sourceItems = [...sourceChapter.events];
    const destItems =
      source.droppableId === destination.droppableId
        ? sourceItems
        : [...destChapter.events];

    // Remove the item from the source
    const [removed] = sourceItems.splice(source.index, 1);

    // Add the item to the destination
    destItems.splice(
      destination.index,
      0,
      source.droppableId === destination.droppableId ? removed : { ...removed },
    );

    // Create updated chapters array
    const updatedChapters = currentMemoir.chapters.map((chapter) => {
      if (chapter._id === source.droppableId) {
        return { ...chapter, events: sourceItems };
      }
      if (
        chapter._id === destination.droppableId &&
        source.droppableId !== destination.droppableId
      ) {
        return { ...chapter, events: destItems };
      }
      return chapter;
    });

    // Update the memoir with the new chapter/event structure
    dispatch(
      saveMemoir({
        ...currentMemoir,
        chapters: updatedChapters,
      }),
    );

    // Additionally, dispatch to update events (for potential optimistic UI updates)
    dispatch(
      updateEvents({
        sourceColId: source.droppableId,
        destColId: destination.droppableId,
        sourceItems,
        destItems,
      }),
    );
  };

  // Event handlers for new events
  const handleShowEventInput = (chapterId) => {
    setNewEventChapter(chapterId);
    setNewEventTitle('');
  };

  const handleCancelNewEvent = () => {
    setNewEventChapter(null);
    setNewEventTitle('');
  };

  const handleSaveNewEvent = (chapterId) => {
    if (!newEventTitle.trim() || !currentMemoir) return;

    const chapterIndex = currentMemoir.chapters.findIndex(
      (c) => c._id === chapterId,
    );
    if (chapterIndex === -1) return;

    // Create the updated chapters array with the new event
    const updatedChapters = currentMemoir.chapters.map((chapter, index) => {
      if (index === chapterIndex) {
        return {
          ...chapter,
          events: [
            ...chapter.events,
            {
              // Let backend generate the ID - don't specify one
              title: newEventTitle,
              content: '',
            },
          ],
        };
      }
      return chapter;
    });

    // Update memoir with new chapter structure
    dispatch(
      saveMemoir({
        ...currentMemoir,
        chapters: updatedChapters,
      }),
    );

    // Reset the input state
    setNewEventChapter(null);
    setNewEventTitle('');
  };

  // Chapter creation handlers
  const handleShowChapterInput = () => {
    setIsAddingChapter(true);
    setNewChapterTitle('');
  };

  const handleCancelNewChapter = () => {
    setIsAddingChapter(false);
    setNewChapterTitle('');
  };

  const handleSaveNewChapter = () => {
    if (!newChapterTitle.trim() || !currentMemoir) return;

    // Create new chapter object with title and empty events array
    const newChapter = {
      title: newChapterTitle,
      events: [], // Start with an empty events array
    };

    // Add chapter to the memoir
    const updatedChapters = [...currentMemoir.chapters, newChapter];

    dispatch(
      saveMemoir({
        ...currentMemoir,
        chapters: updatedChapters,
      }),
    );

    // Reset the input state
    setIsAddingChapter(false);
    setNewChapterTitle('');
  };

  // Event Editor Modal Handlers
  const handleOpenEventEditor = (event) => {
    setEditingEvent(event);
  };

  const handleCloseEventEditor = () => {
    setEditingEvent(null);
  };

  const handleSaveEvent = (updatedEvent) => {
    if (!currentMemoir || !updatedEvent?._id) return;

    // Find the chapter containing the event and update it
    const updatedChapters = currentMemoir.chapters.map((chapter) => {
      const eventIndex = chapter.events.findIndex(
        (ev) => ev._id === updatedEvent._id,
      );
      if (eventIndex !== -1) {
        // Create a new events array with the updated event
        const newEvents = [...chapter.events];
        newEvents[eventIndex] = updatedEvent;
        return { ...chapter, events: newEvents };
      }
      return chapter;
    });

    // Check if chapters were actually updated
    if (
      JSON.stringify(updatedChapters) !== JSON.stringify(currentMemoir.chapters)
    ) {
      dispatch(
        saveMemoir({
          ...currentMemoir,
          chapters: updatedChapters,
        }),
      );
    }

    handleCloseEventEditor(); // Close modal after saving
  };

  // Event Deletion Handler
  const handleDeleteEvent = (eventId) => {
    if (!currentMemoir || !eventId) return;

    // Find the chapter and filter out the event
    let chapterIdContainingEvent = null;
    const updatedChapters = currentMemoir.chapters.map((chapter) => {
      const eventExists = chapter.events.some((ev) => ev._id === eventId);
      if (eventExists) {
        chapterIdContainingEvent = chapter._id;
        // Filter out the event to be deleted
        const updatedEvents = chapter.events.filter((ev) => ev._id !== eventId);
        return { ...chapter, events: updatedEvents };
      }
      return chapter;
    });

    // Only dispatch if an event was actually removed
    if (chapterIdContainingEvent) {
      dispatch(
        saveMemoir({
          ...currentMemoir,
          chapters: updatedChapters,
        }),
      );
    }
  };

  // Chapter Editor Modal Handlers
  const handleOpenChapterEditor = (chapter) => {
    setEditingChapter(chapter);
  };

  const handleCloseChapterEditor = () => {
    setEditingChapter(null);
  };

  const handleSaveChapter = (updatedChapter) => {
    if (!currentMemoir || !updatedChapter?._id) return;

    // Find the index of the chapter being updated
    const chapterIndex = currentMemoir.chapters.findIndex(
      (ch) => ch._id === updatedChapter._id,
    );
    if (chapterIndex === -1) return; // Chapter not found

    // Create a new chapters array with the updated chapter title and description
    const updatedChapters = currentMemoir.chapters.map((chapter, index) => {
      if (index === chapterIndex) {
        // Update both title and description from the saved chapter data
        return {
          ...chapter,
          title: updatedChapter.title,
          description: updatedChapter.description,
        };
      }
      return chapter;
    });

    // Check if chapters were actually updated (title or description changed)
    if (
      JSON.stringify(updatedChapters) !== JSON.stringify(currentMemoir.chapters)
    ) {
      dispatch(
        saveMemoir({
          ...currentMemoir,
          chapters: updatedChapters,
        }),
      );
    }

    handleCloseChapterEditor(); // Close modal after saving
  };

  // Chapter Deletion Handler
  const handleDeleteChapter = (chapterId) => {
    if (!currentMemoir || !chapterId) return;

    // Filter out the chapter to be deleted
    const updatedChapters = currentMemoir.chapters.filter(
      (ch) => ch._id !== chapterId,
    );

    // Only dispatch if a chapter was actually removed
    if (updatedChapters.length < currentMemoir.chapters.length) {
      dispatch(
        saveMemoir({
          ...currentMemoir,
          chapters: updatedChapters,
        }),
      );
    }
    // No need to close the editor here, as it's already closed by the ChapterEditor itself
  };

  // Memoir Editor Modal Handlers
  const handleOpenMemoirEditor = () => {
    setIsEditingMemoir(true);
  };

  const handleCloseMemoirEditor = () => {
    setIsEditingMemoir(false);
  };

  if (loading) return <p>Loading memoir...</p>;
  if (error) return <p>Error loading memoir: {error}</p>;
  if (!currentMemoir) return <p>No memoir found</p>;

  // Custom icon for Add Chapter
  const addChapterIcon = (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      className='h-8 w-8 text-gray-400 mx-auto' // Specific size for chapter card
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth={2}
        d='M12 4v16m8-8H4' // Larger plus sign
      />
    </svg>
  );

  return (
    <div>
      <h1
        className='text-2xl font-bold mb-4 cursor-pointer hover:text-blue-600'
        onClick={handleOpenMemoirEditor}
        title='Edit Memoir Title/Description'
      >
        {currentMemoir.title}
      </h1>
      <DragDropContext onDragEnd={onDragEnd} data-testid='drag-drop-context'>
        <Droppable droppableId='chapters' direction='horizontal' type='COLUMN'>
          {(provided) => (
            <div
              className='flex flex-wrap gap-6 pb-4'
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {currentMemoir.chapters.map((chapter, index) => (
                <Draggable
                  key={chapter._id}
                  draggableId={chapter._id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      className='w-full sm:w-64 flex-shrink-0 mb-6'
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      data-testid={`chapter-${chapter._id}`}
                    >
                      <div className='flex justify-between items-center mb-2'>
                        <h2
                          className='text-lg font-semibold cursor-pointer hover:text-blue-600'
                          {...provided.dragHandleProps}
                          data-testid={`chapter-title-${chapter._id}`}
                          onClick={() => handleOpenChapterEditor(chapter)}
                        >
                          {chapter.title}
                        </h2>
                      </div>

                      <Droppable droppableId={chapter._id} type='CARD'>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className='space-y-3'
                          >
                            {chapter.events.map((event, idx) => (
                              <Draggable
                                key={event._id}
                                draggableId={event._id}
                                index={idx}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    data-testid={`event-${event._id}`}
                                    onClick={() => handleOpenEventEditor(event)}
                                    className='cursor-pointer'
                                  >
                                    <Card variant='muted'>
                                      <CardContent>{event.title}</CardContent>
                                    </Card>
                                  </div>
                                )}
                              </Draggable>
                            ))}

                            {/* New Event Input Form */}
                            {newEventChapter === chapter._id && (
                              <Card variant='muted'>
                                <CardContent className='p-3'>
                                  <input
                                    type='text'
                                    value={newEventTitle}
                                    onChange={(e) =>
                                      setNewEventTitle(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter')
                                        handleSaveNewEvent(chapter._id);
                                    }}
                                    placeholder='Enter event title'
                                    className='w-full border rounded px-2 py-1 text-sm mb-2'
                                    data-testid={`new-event-input-${chapter._id}`}
                                    autoFocus
                                  />
                                  <div className='flex justify-end space-x-2'>
                                    <button
                                      onClick={handleCancelNewEvent}
                                      className='px-2 py-1 text-xs text-gray-600 border rounded hover:bg-gray-100'
                                      data-testid={`cancel-event-button-${chapter._id}`}
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleSaveNewEvent(chapter._id)
                                      }
                                      className='px-2 py-1 text-xs text-white bg-blue-600 rounded hover:bg-blue-700'
                                      data-testid={`save-event-button-${chapter._id}`}
                                    >
                                      Save
                                    </button>
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                            {/* Add Event Card using the reusable component */}
                            <AddCard
                              title='Add Event'
                              onClick={() => handleShowEventInput(chapter._id)}
                              testid={`add-event-card-${chapter._id}`}
                              className='h-20 mt-2' // Specific height for event card
                            />
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {/* Add Chapter Section */}
              <div className='w-full sm:w-64 flex-shrink-0 mb-6'>
                {isAddingChapter ? (
                  <Card variant='muted' data-testid='add-chapter-form'>
                    <CardContent className='p-4'>
                      <input
                        type='text'
                        value={newChapterTitle}
                        onChange={(e) => setNewChapterTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveNewChapter();
                        }}
                        placeholder='Enter chapter title'
                        className='w-full border rounded px-3 py-2 text-sm mb-3'
                        autoFocus
                        data-testid='chapter-title-input'
                      />
                      <div className='flex justify-end space-x-2'>
                        <button
                          onClick={handleCancelNewChapter}
                          className='px-3 py-1 text-sm text-gray-600 border rounded hover:bg-gray-100'
                          data-testid='cancel-chapter-button'
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveNewChapter}
                          className='px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700'
                          data-testid='save-chapter-button'
                        >
                          Save
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  /* Add Chapter Card using the reusable component */
                  <AddCard
                    title='Add Chapter'
                    onClick={handleShowChapterInput}
                    testid='add-chapter-button'
                    className='h-32 w-full sm:w-64 mb-6' // Specific height/width for chapter card
                    icon={addChapterIcon} // Pass the custom larger icon
                  />
                )}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Event Editor Modal */}
      <EventEditor
        event={editingEvent}
        isOpen={!!editingEvent}
        onClose={handleCloseEventEditor}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />

      {/* Chapter Editor Modal */}
      <ChapterEditor
        chapter={editingChapter}
        isOpen={!!editingChapter}
        onClose={handleCloseChapterEditor}
        onSave={handleSaveChapter}
        onDelete={handleDeleteChapter}
      />

      {/* Memoir Editor Modal */}
      {isEditingMemoir && currentMemoir && (
        <Modal isOpen={isEditingMemoir} onClose={handleCloseMemoirEditor}>
          <MemoirForm
            memoirToEdit={currentMemoir}
            onSaveComplete={handleCloseMemoirEditor}
            onCancel={handleCloseMemoirEditor}
          />
        </Modal>
      )}
    </div>
  );
}
