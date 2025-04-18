// apps/web/src/__tests__/store/memoirSlice.test.js
import memoirReducer, {
  updateTitle,
  updateContent,
  updateChapterTitle,
  updateEvent,
  addChapter,
  addEvent,
  resetMemoir
} from '../../store/memoirSlice';

describe('memoirSlice', () => {
  const initialState = {
    title: '',
    content: '',
    chapters: [
      {
        title: 'Chapter 1',
        events: [
          { title: 'First Event', content: '' }
        ]
      }
    ],
    status: 'draft',
    loading: false,
    error: null,
    currentId: null
  };

  it('should return the initial state', () => {
    expect(memoirReducer(undefined, { type: undefined })).toEqual(initialState);
  });

  it('should handle updateTitle', () => {
    const newTitle = 'My Amazing Memoir';
    const nextState = memoirReducer(initialState, updateTitle(newTitle));

    expect(nextState.title).toEqual(newTitle);
  });

  it('should handle updateContent', () => {
    const newContent = 'This is my memoir description';
    const nextState = memoirReducer(initialState, updateContent(newContent));

    expect(nextState.content).toEqual(newContent);
  });

  it('should handle updateChapterTitle', () => {
    const payload = { index: 0, title: 'Updated Chapter Title' };
    const nextState = memoirReducer(initialState, updateChapterTitle(payload));

    expect(nextState.chapters[0].title).toEqual(payload.title);
  });

  it('should handle updateEvent', () => {
    const payload = {
      chapterIndex: 0,
      eventIndex: 0,
      field: 'title',
      value: 'Updated Event Title'
    };
    const nextState = memoirReducer(initialState, updateEvent(payload));

    expect(nextState.chapters[0].events[0].title).toEqual(payload.value);
  });

  it('should handle addChapter', () => {
    const nextState = memoirReducer(initialState, addChapter());

    expect(nextState.chapters.length).toEqual(2);
    expect(nextState.chapters[1].title).toEqual('Chapter 2');
  });

  it('should handle addEvent', () => {
    const chapterIndex = 0;
    const nextState = memoirReducer(initialState, addEvent(chapterIndex));

    expect(nextState.chapters[0].events.length).toEqual(2);
    expect(nextState.chapters[0].events[1].title).toEqual('New Event');
  });

  it('should handle resetMemoir', () => {
    const modifiedState = {
      ...initialState,
      title: 'Test Memoir',
      content: 'Test Content',
      error: 'Some error'
    };

    const nextState = memoirReducer(modifiedState, resetMemoir());

    expect(nextState).toEqual(initialState);
  });
});
