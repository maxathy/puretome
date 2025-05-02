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
    const safeTitle = value && typeof value.title === 'string' ? value.title : 'Event';
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

  // Compose initial Delta with delimiters as blots, passing event title (including first event)
  function getInitialDelta() {
    if (!events.length) return { ops: [] };
    const ops = [];
    events.forEach((ev, idx) => {
      // Always insert a delimiter before every event
      ops.push({ insert: { eventDelimiter: { title: ev.title || `Event ${idx + 1}` } } });
      ops.push({ insert: (ev.content || '') + '\n' });
    });
    return { ops };
  }

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
              // Prevent deleting event delimiter blot
              delDelimiter: {
                key: 'Backspace',
                format: ['eventDelimiter'],
                collapsed: true,
                handler: function(range, context) {
                  if (context.format.eventDelimiter) return false;
                  return true;
                },
              },
              delDelimiter2: {
                key: 'Delete',
                format: ['eventDelimiter'],
                collapsed: true,
                handler: function(range, context) {
                  if (context.format.eventDelimiter) return false;
                  return true;
                },
              },
            },
          },
        },
      });
    }
    // Set content only on mount or chapter change
    quillRef.current.setContents(getInitialDelta());
    // eslint-disable-next-line
  }, [chapterId, currentMemoir?._id]);

  const handleSave = async () => {
    if (!quillRef.current || !chapter) return;
    setSaving(true);
    // Get Delta and split by eventDelimiter blots
    const delta = quillRef.current.getContents();
    const eventsArr = [];
    let curr = '';
    for (let op of delta.ops) {
      if (op.insert && op.insert.eventDelimiter) {
        // If not the very first delimiter (curr is not empty), push the previous event
        if (curr !== '') eventsArr.push(curr.trim());
        curr = '';
      } else if (typeof op.insert === 'string') {
        curr += op.insert;
      }
    }
    // Push the last event (if any content after the last delimiter)
    if (curr.trim().length > 0) eventsArr.push(curr.trim());
    // Map back to event objects (preserve _id and use correct title)
    const updatedEvents = eventsArr.map((content, idx) => ({
      ...(events[idx]?._id ? { _id: events[idx]._id } : {}),
      title: events[idx]?.title || `Event ${idx + 1}`,
      content,
    }));
    // Prepare updated chapters array
    const updatedChapters = currentMemoir.chapters.map(ch =>
      ch._id === chapterId ? { ...ch, events: updatedEvents } : ch
    );
    // Dispatch saveMemoir
    await dispatch(saveMemoir({ ...currentMemoir, chapters: updatedChapters }));
    setSaving(false);
  };

  return (
    <div className="mt-8">
      <div ref={editorRef} style={{ minHeight: 300, background: 'white' }} />
      <button
        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
        onClick={handleSave}
        disabled={saving}
      >
        {saving ? 'Saving...' : 'Save Events'}
      </button>
      <div className="text-xs text-gray-400 mt-2">
        Each event is separated by a non-editable delimiter showing the event title (including the first event).
      </div>
      <style>{`.event-delimiter { user-select: none; pointer-events: none; margin: 1.5em 0 !important; }`}</style>
    </div>
  );
};

DraftorQuill.propTypes = {
  memoirId: PropTypes.string.isRequired,
  chapterId: PropTypes.string.isRequired,
};

export default DraftorQuill;
