// apps/web/src/components/TimelineBoard.jsx
import React, { useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent } from './ui/card';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMemoir,
  updateMemoirTimeline,
  updateChaptersOrder,
  updateEvents,
} from '../store/memoirSlice';

/**
 * TimelineBoard Component
 * Provides drag-and-drop interface for memoir events organization
 *
 * @component
 * @param {String} memoirId - ID of the memoir to display
 * @returns {JSX.Element} Timeline board interface
 */
export default function TimelineBoard({ memoirId }) {
  const dispatch = useDispatch();
  const { currentMemoir, loading, error } = useSelector(
    (state) => state.memoir,
  );

  // Fetch memoir data on component mount
  useEffect(() => {
    dispatch(fetchMemoir(memoirId));
  }, [dispatch, memoirId]);

  const onDragEnd = (result) => {
    if (!currentMemoir) return;

    const { source, destination, type } = result;
    if (!destination) return;

    // Handle chapter reordering
    if (type === 'COLUMN') {
      const items = Array.from(currentMemoir.chapters);
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);

      // Update state
      dispatch(updateChaptersOrder(items));

      // Persist changes
      dispatch(
        updateMemoirTimeline({
          ...currentMemoir,
          chapters: items,
        }),
      );

      return;
    }

    // Handle event reordering/moving
    const sourceCol = currentMemoir.chapters.find(
      (c) => c._id === source.droppableId,
    );
    const destCol = currentMemoir.chapters.find(
      (c) => c._id === destination.droppableId,
    );

    if (!sourceCol || !destCol) return;

    const sourceItems = Array.from(sourceCol.events);
    const [moved] = sourceItems.splice(source.index, 1);

    // If moving within the same column
    if (sourceCol._id === destCol._id) {
      sourceItems.splice(destination.index, 0, moved);

      // Update state
      dispatch(
        updateEvents({
          sourceColId: sourceCol._id,
          destColId: destCol._id,
          sourceItems,
          destItems: sourceItems,
        }),
      );

      // Persist changes
      const updatedChapters = currentMemoir.chapters.map((col) =>
        col._id === sourceCol._id ? { ...col, events: sourceItems } : col,
      );

      dispatch(
        updateMemoirTimeline({
          ...currentMemoir,
          chapters: updatedChapters,
        }),
      );
    }
    // If moving between columns
    else {
      const destItems = Array.from(destCol.events);
      destItems.splice(destination.index, 0, moved);

      // Update state
      dispatch(
        updateEvents({
          sourceColId: sourceCol._id,
          destColId: destCol._id,
          sourceItems,
          destItems,
        }),
      );

      // Persist changes
      const updatedChapters = currentMemoir.chapters.map((col) => {
        if (col._id === sourceCol._id) return { ...col, events: sourceItems };
        if (col._id === destCol._id) return { ...col, events: destItems };
        return col;
      });

      dispatch(
        updateMemoirTimeline({
          ...currentMemoir,
          chapters: updatedChapters,
        }),
      );
    }
  };

  if (loading) return <p>Loading memoir...</p>;
  if (error) return <p>Error loading memoir: {error}</p>;
  if (!currentMemoir) return <p>No memoir found</p>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId='chapters' direction='horizontal' type='COLUMN'>
        {(provided) => (
          <div
            className='flex gap-6 overflow-auto'
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
                  >
                    <h2
                      className='text-lg font-semibold mb-2'
                      {...provided.dragHandleProps}
                    >
                      {chapter.title}
                    </h2>
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
                                >
                                  <Card variant='muted'>
                                    <CardContent>{event.title}</CardContent>
                                  </Card>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
