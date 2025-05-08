import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { saveMemoir } from '../store/memoirSlice';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

// --- Custom Blot for Event Delimiter with title ---
const BlockEmbed = Quill.import('blots/block/embed');
class EventDelimiterBlot extends BlockEmbed {
  static create(value) {
    let node = super.create();
    node.setAttribute('contenteditable', 'false');
    node.className = 'event-delimiter';
    const safeTitle =
      value && typeof value.title === 'string' ? value.title : 'Event';
    node.innerHTML = `<div style="display:flex;align-items:center;gap:8px;"><hr style="flex:1;border:0;border-top:2px dashed #cbd5e1;"/><span style="color:#64748b;font-size:0.8em;">${safeTitle}</span><hr style="flex:1;border:0;border-top:2px dashed #cbd5e1;"/></div>`;
    return node;
  }
  static value(node) {
    const span = node.querySelector('span');
    return { title: span ? span.textContent : 'Event' };
  }
}
EventDelimiterBlot.blotName = 'eventDelimiter';
EventDelimiterBlot.tagName = 'div';
Quill.register(EventDelimiterBlot);

const DraftorQuill = ({ memoirId, chapterId }) => {
  const dispatch = useDispatch();
  const currentMemoir = useSelector((state) => state.memoir.currentMemoir);
  const [saving, setSaving] = useState(false);
  const quillRef = useRef(null);
  const editorRef = useRef(null);

  // Get the current chapter
  const chapter = currentMemoir?.chapters?.find((ch) => ch._id === chapterId);
  const events = chapter?.events || [];

  useEffect(() => {
    if (!editorRef.current) return;
    if (!quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: 'Write your chapter events here...',
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'blockquote', 'code-block'],
            ['clean'],
          ],
          keyboard: {
            bindings: {
              delDelimiter: {
                key: 'Backspace',
                format: ['eventDelimiter'],
                collapsed: true,
                handler: function (range, context) {
                  if (context.format.eventDelimiter) return false;
                  return true;
                },
              },
              delDelimiter2: {
                key: 'Delete',
                format: ['eventDelimiter'],
                collapsed: true,
                handler: function (range, context) {
                  if (context.format.eventDelimiter) return false;
                  return true;
                },
              },
            },
          },
        },
        readOnly: !(events.length > 0),
      });
    } else {
      // Set readOnly state dynamically if editor already exists
      quillRef.current.enable(events.length > 0);
    }

    // Clear the editor
    quillRef.current.setContents({ ops: [] });

    // Insert each event's delimiter and content in sequence
    if (events.length && quillRef.current) {
      let insertPos = 0;
      events.forEach((ev, idx) => {
        // Insert delimiter blot
        quillRef.current.insertEmbed(insertPos, 'eventDelimiter', {
          title: ev.title || `Event ${idx + 1}`,
        });
        insertPos += 1;
        quillRef.current.insertText(insertPos, '\n');
        insertPos += 1;
        // Insert event HTML content, if any
        if (ev.content) {
          quillRef.current.setSelection(insertPos, 0);
          quillRef.current.clipboard.dangerouslyPasteHTML(
            insertPos,
            ev.content,
          );
          // Move insertPos to the end after pasting HTML
          insertPos = quillRef.current.getLength();
        }
      });
    }
    // eslint-disable-next-line
  }, [chapterId, currentMemoir?._id]);

  // --- AUTOSAVE LOGIC ---
  // Debounce timer for autosave
  const autosaveTimeout = useRef(null);
  const lastContent = useRef(null);

  // Helper to trigger autosave
  const triggerAutosave = () => {
    if (autosaveTimeout.current) {
      clearTimeout(autosaveTimeout.current);
    }
    autosaveTimeout.current = setTimeout(() => {
      handleSave();
    }, 1500); // 1.5s debounce
  };

  // Attach change handler for autosave
  useEffect(() => {
    if (!quillRef.current) return;
    const quill = quillRef.current;
    const onChange = () => {
      // Only autosave if content actually changed
      const curr = quill.getContents();
      if (
        !lastContent.current ||
        JSON.stringify(curr) !== JSON.stringify(lastContent.current)
      ) {
        triggerAutosave();
        lastContent.current = curr;
      }
    };
    quill.on('text-change', onChange);
    return () => {
      quill.off('text-change', onChange);
      if (autosaveTimeout.current) {
        clearTimeout(autosaveTimeout.current);
      }
    };
  }, [chapterId, currentMemoir?._id]);

  const handleSave = async () => {
    if (!quillRef.current || !chapter) return;
    setSaving(true);

    // Get the Quill editor's content
    const quill = quillRef.current;
    const contents = quill.getContents();

    // Find all event delimiter positions and their indices in the document
    const delimiterIndices = [];
    let currentIndex = 0;

    contents.ops.forEach((op) => {
      if (op.insert && op.insert.eventDelimiter) {
        delimiterIndices.push(currentIndex);
      }
      // Increment the index based on the length of the insert
      currentIndex += op.insert
        ? typeof op.insert === 'string'
          ? op.insert.length
          : 1
        : 0;
    });

    // Add the end of document as the final position
    delimiterIndices.push(quill.getLength());

    // Extract HTML content between delimiters
    const updatedEvents = [];
    for (let i = 0; i < delimiterIndices.length - 1; i++) {
      // Get the range for this event's content (start after delimiter, end before next delimiter)
      const startPos = delimiterIndices[i] + 1; // +1 to skip the delimiter itself
      const endPos = delimiterIndices[i + 1];
      const length = endPos - startPos;

      if (length > 0) {
        // Get HTML content for this range using Quill's clipboard
        const eventDelta = quill.getContents(startPos, length);
        const tempQuill = new Quill(document.createElement('div'));
        tempQuill.setContents(eventDelta);
        const eventContent = tempQuill.root.innerHTML;

        // Create event object with preserved HTML content
        updatedEvents.push({
          ...(events[i]?._id ? { _id: events[i]._id } : {}),
          title: events[i]?.title || `Event ${i + 1}`,
          content: eventContent,
        });
      } else {
        // Handle empty content
        updatedEvents.push({
          ...(events[i]?._id ? { _id: events[i]._id } : {}),
          title: events[i]?.title || `Event ${i + 1}`,
          content: '',
        });
      }
    }

    // Prepare updated chapters array
    const updatedChapters = currentMemoir.chapters.map((ch) =>
      ch._id === chapterId ? { ...ch, events: updatedEvents } : ch,
    );

    // Dispatch saveMemoir
    await dispatch(saveMemoir({ ...currentMemoir, chapters: updatedChapters }));
    setSaving(false);
  };

  return (
    <div className='flex flex-col flex-1 min-h-0 h-full'>
      {/* Responsive Quill editor stretches to fill parent */}
      <div
        className='h-[90%] min-h-0'
        style={{
          background: 'white',
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
        }}
      >
        <div
          ref={editorRef}
          style={{
            height: '100%',
            overflowY: 'auto',
            padding: 0,
          }}
        />
      </div>
      <style>{`
        /* Make the Quill content area scrollable */
        .ql-container {
          height: 100% !important;
          max-height: 100% !important;
          overflow-y: auto !important;
          border: none !important;
        }
        .ql-editor {
          min-height: 100%;
          max-height: 100%;
          overflow-y: auto;
        }
        .event-delimiter { user-select: none; pointer-events: none; margin: 1.5em 0 !important; }
      `}</style>
      {/* AUTOSAVE: Removed Save Events button */}
      <div className='text-xs text-gray-400 mt-2'>
        <span className='text-blue-400'>All changes are autosaved.</span>
        <br />
        {events.length === 0 && (
          <span className='text-red-400'>
            Add an event to start editing this chapter.
          </span>
        )}
      </div>
    </div>
  );
};

DraftorQuill.propTypes = {
  memoirId: PropTypes.string.isRequired,
  chapterId: PropTypes.string.isRequired,
};

export default DraftorQuill;
