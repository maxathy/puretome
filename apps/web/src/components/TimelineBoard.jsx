import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent } from './ui/card';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMemoir,
  updateMemoirTimeline,
  updateChaptersOrder,
  updateEvents,
  addChapter,
} from '../store/memoirSlice';

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
        updateMemoirTimeline({
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
      updateMemoirTimeline({
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
      updateMemoirTimeline({
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
      updateMemoirTimeline({
        ...currentMemoir,
        chapters: updatedChapters,
      }),
    );

    // Reset the input state
    setIsAddingChapter(false);
    setNewChapterTitle('');
  };

  if (loading) return <p>Loading memoir...</p>;
  if (error) return <p>Error loading memoir: {error}</p>;
  if (!currentMemoir) return <p>No memoir found</p>;

  return (
    <div className='space-y-4'>
      <DragDropContext onDragEnd={onDragEnd} data-testid="drag-drop-context">
        <Droppable droppableId='chapters' direction='horizontal' type='COLUMN'>
          {(provided) => (
            <div
              className='flex gap-6 overflow-auto pb-4'
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
                      className='w-64 flex-shrink-0'
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      data-testid={`chapter-${chapter._id}`}
                    >
                      <div className='flex justify-between items-center mb-2'>
                        <h2
                          className='text-lg font-semibold'
                          {...provided.dragHandleProps}
                          data-testid={`chapter-title-${chapter._id}`}
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

                            {provided.placeholder}

                            {/* Add Event Button Card */}
                            {newEventChapter !== chapter._id && (
                              <Card
                                variant='muted'
                                className='cursor-pointer hover:bg-gray-100 transition-colors'
                                onClick={() =>
                                  handleShowEventInput(chapter._id)
                                }
                                data-testid={`add-event-button-${chapter._id}`}
                              >
                                <CardContent className='flex justify-center items-center p-3'>
                                  <svg
                                    xmlns='http://www.w3.org/2000/svg'
                                    className='h-6 w-6 text-gray-400'
                                    fill='none'
                                    viewBox='0 0 24 24'
                                    stroke='currentColor'
                                  >
                                    <path
                                      strokeLinecap='round'
                                      strokeLinejoin='round'
                                      strokeWidth={2}
                                      d='M12 4v16m8-8H4'
                                    />
                                  </svg>
                                </CardContent>
                              </Card>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {/* Add Chapter Section */}
              <div className='w-64 flex-shrink-0'>
                {isAddingChapter ? (
                  <Card variant='muted' data-testid="add-chapter-form">
                    <CardContent className='p-4'>
                      <input
                        type='text'
                        value={newChapterTitle}
                        onChange={(e) => setNewChapterTitle(e.target.value)}
                        placeholder='Enter chapter title'
                        className='w-full border rounded px-3 py-2 text-sm mb-3'
                        autoFocus
                        data-testid="chapter-title-input"
                      />
                      <div className='flex justify-end space-x-2'>
                        <button
                          onClick={handleCancelNewChapter}
                          className='px-3 py-1 text-sm text-gray-600 border rounded hover:bg-gray-100'
                          data-testid="cancel-chapter-button"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveNewChapter}
                          className='px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700'
                          data-testid="save-chapter-button"
                        >
                          Save
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card
                    variant='muted'
                    className='h-32 cursor-pointer hover:bg-gray-100 transition-colors'
                    onClick={handleShowChapterInput}
                    data-testid='add-chapter-button'
                  >
                    <CardContent className='flex justify-center items-center h-full'>
                      <div className='text-center'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          className='h-8 w-8 text-gray-400 mx-auto'
                          fill='none'
                          viewBox='0 0 24 24'
                          stroke='currentColor'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 4v16m8-8H4'
                          />
                        </svg>
                        <p className='text-gray-500 mt-2'>Add Chapter</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}
