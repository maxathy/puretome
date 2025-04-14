import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const initialData = {
  chapters: {
    'chapter-1': { id: 'chapter-1', title: 'Childhood', eventIds: ['event-1', 'event-2'] },
    'chapter-2': { id: 'chapter-2', title: 'High School', eventIds: [] },
  },
  events: {
    'event-1': { id: 'event-1', content: 'Moved to a new city' },
    'event-2': { id: 'event-2', content: 'First day of school' },
  },
  chapterOrder: ['chapter-1', 'chapter-2'],
};

export default function TimelineBoard() {
  const [data, setData] = useState(initialData);

  const onDragEnd = result => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = data.chapters[source.droppableId];
    const finish = data.chapters[destination.droppableId];

    if (start === finish) {
      const newEventIds = Array.from(start.eventIds);
      newEventIds.splice(source.index, 1);
      newEventIds.splice(destination.index, 0, draggableId);

      const newChapter = {
        ...start,
        eventIds: newEventIds,
      };

      const newState = {
        ...data,
        chapters: {
          ...data.chapters,
          [newChapter.id]: newChapter,
        },
      };

      setData(newState);
      return;
    }

    const startEventIds = Array.from(start.eventIds);
    startEventIds.splice(source.index, 1);
    const newStart = {
      ...start,
      eventIds: startEventIds,
    };

    const finishEventIds = Array.from(finish.eventIds);
    finishEventIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      eventIds: finishEventIds,
    };

    const newState = {
      ...data,
      chapters: {
        ...data.chapters,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    };
    setData(newState);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-4 overflow-x-auto p-4">
        {data.chapterOrder.map(chapterId => {
          const chapter = data.chapters[chapterId];
          const events = chapter.eventIds.map(id => data.events[id]);
          return (
            <Droppable droppableId={chapter.id} key={chapter.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-w-[300px] bg-gray-100 p-3 rounded-xl shadow-md"
                >
                  <h2 className="font-bold mb-2 text-lg">{chapter.title}</h2>
                  {events.map((event, index) => (
                    <Draggable key={event.id} draggableId={event.id} index={index}>
                      {(provided) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-2 bg-white"
                        >
                          <CardContent className="p-3">{event.content}</CardContent>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          );
        })}
      </div>
    </DragDropContext>
  );
}