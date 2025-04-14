import React from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent } from './ui/card';

const persistToBackend = (updated) => {
  console.log(updated);
};
export default function TimelineBoard({ chapters }) {
  const [chapterState, setChapterState] = React.useState(chapters);

  const onDragEnd = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === 'COLUMN') {
      const items = Array.from(chapterState);
      const [removed] = items.splice(source.index, 1);
      items.splice(destination.index, 0, removed);
      setChapterState(items);
    } else {
      const sourceCol = chapterState.find((c) => c.id === source.droppableId);
      const destCol = chapterState.find(
        (c) => c.id === destination.droppableId,
      );
      const sourceItems = Array.from(sourceCol.events);
      const [moved] = sourceItems.splice(source.index, 1);

      if (sourceCol === destCol) {
        sourceItems.splice(destination.index, 0, moved);
        const updated = chapterState.map((col) =>
          col.id === sourceCol.id ? { ...col, events: sourceItems } : col,
        );
        setChapterState(updated);
        persistToBackend(updated);
      } else {
        const destItems = Array.from(destCol.events);
        destItems.splice(destination.index, 0, moved);
        const updated = chapterState.map((col) => {
          if (col.id === sourceCol.id) return { ...col, events: sourceItems };
          if (col.id === destCol.id) return { ...col, events: destItems };
          return col;
        });
        setChapterState(updated);
        persistToBackend(updated);
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId='chapters' direction='horizontal' type='COLUMN'>
        {(provided) => (
          <div
            className='flex gap-6 overflow-auto'
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {chapterState.map((chapter, index) => (
              <Draggable
                key={chapter.id}
                draggableId={chapter.id}
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
                    <Droppable droppableId={chapter.id} type='CARD'>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className='space-y-3'
                        >
                          {chapter.events.map((event, idx) => (
                            <Draggable
                              key={event.id}
                              draggableId={event.id}
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
