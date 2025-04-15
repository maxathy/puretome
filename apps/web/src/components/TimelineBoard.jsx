// apps/web/components/TimelineBoard.jsx
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent } from './ui/card';
import axios from 'axios';

export default function TimelineBoard({ memoirId }) {
  const [memoir, setMemoir] = useState(null);

  useEffect(() => {
    const fetchMemoir = async () => {
      try {
        const response = await axios.get(`/api/memoir/${memoirId}`);
        setMemoir(response.data);
      } catch (error) {
        console.error('Error fetching memoir:', error);
      }
    };

    fetchMemoir();
  }, [memoirId]);

  const persistTimeline = async (updatedMemoir) => {
    try {
      await axios.post('/api/memoir', updatedMemoir);
    } catch (error) {
      console.error('Error saving memoir:', error);
    }
  };

  const onDragEnd = (result) => {
    if (!memoir) return;

    const { source, destination, type } = result;
    if (!destination) return;

    let updatedChapters = memoir.chapters;

    if (type === 'COLUMN') {
      const items = Array.from(updatedChapters);
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);
      updatedChapters = items;
    } else {
      const sourceCol = updatedChapters.find(
        (c) => c._id === source.droppableId,
      );
      const destCol = updatedChapters.find(
        (c) => c._id === destination.droppableId,
      );
      const sourceItems = Array.from(sourceCol.events);
      const [moved] = sourceItems.splice(source.index, 1);

      if (sourceCol === destCol) {
        sourceItems.splice(destination.index, 0, moved);
        updatedChapters = updatedChapters.map((col) =>
          col._id === sourceCol._id ? { ...col, events: sourceItems } : col,
        );
      } else {
        const destItems = Array.from(destCol.events);
        destItems.splice(destination.index, 0, moved);
        updatedChapters = updatedChapters.map((col) => {
          if (col._id === sourceCol._id) return { ...col, events: sourceItems };
          if (col._id === destCol._id) return { ...col, events: destItems };
          return col;
        });
      }
    }

    const updatedMemoir = { ...memoir, chapters: updatedChapters };
    setMemoir(updatedMemoir);
    persistTimeline(updatedMemoir);
  };

  if (!memoir) return <p>Loading memoir...</p>;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId='chapters' direction='horizontal' type='COLUMN'>
        {(provided) => (
          <div
            className='flex gap-6 overflow-auto'
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {memoir.chapters.map((chapter, index) => (
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
