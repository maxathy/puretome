// apps/web/src/store/__tests__/memoirSlice.test.js
import memoirReducer, {
  // Create memoir actions
  updateTitle,
  updateContent,
  updateChapterTitle,
  updateEvent,
  addChapter,
  addEvent,
  resetMemoir,
  createMemoir,

  // Timeline board actions
  fetchMemoir,
  updateMemoirTimeline,
  updateChaptersOrder,
  updateEvents,
} from '../../store/memoirSlice';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';

// Mock axios
vi.mock('axios');

describe('memoirSlice', () => {
  // Setup initial states for different test scenarios
  const initialFormState = {
    title: '',
    content: '',
    chapters: [
      {
        title: 'New Chapter',
        events: [{ title: 'New Event', content: '' }],
      },
    ],
    currentMemoir: null,
    currentId: null,
    loading: false,
    error: null,
  };

  const mockMemoir = {
    _id: '67fd6433e5bbf10bbd28ffe4',
    title: 'My Memoir',
    content: 'Memoir description',
    chapters: [
      {
        _id: 'chapter1',
        title: 'Chapter 1',
        events: [
          { _id: 'event1', title: 'Event 1', content: 'Description 1' },
          { _id: 'event2', title: 'Event 2', content: 'Description 2' },
        ],
      },
      {
        _id: 'chapter2',
        title: 'Chapter 2',
        events: [{ _id: 'event3', title: 'Event 3', content: 'Description 3' }],
      },
    ],
  };

  const stateWithCurrentMemoir = {
    ...initialFormState,
    currentMemoir: mockMemoir,
  };

  // Reset mocks before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // PART 1: Test CreateMemoir Operations (Form Management)
  describe('CreateMemoir Operations', () => {
    it('should handle updateTitle', () => {
      const newTitle = 'My Amazing Memoir';
      const nextState = memoirReducer(initialFormState, updateTitle(newTitle));
      expect(nextState.title).toEqual(newTitle);
    });

    it('should handle updateContent', () => {
      const newContent = 'This is my memoir description';
      const nextState = memoirReducer(
        initialFormState,
        updateContent(newContent),
      );
      expect(nextState.content).toEqual(newContent);
    });

    it('should handle updateChapterTitle', () => {
      const payload = { index: 0, title: 'Updated Chapter Title' };
      const nextState = memoirReducer(
        initialFormState,
        updateChapterTitle(payload),
      );
      expect(nextState.chapters[0].title).toEqual(payload.title);
    });

    it('should handle updateEvent', () => {
      const payload = {
        chapterIndex: 0,
        eventIndex: 0,
        field: 'title',
        value: 'Updated Event Title',
      };
      const nextState = memoirReducer(initialFormState, updateEvent(payload));
      expect(nextState.chapters[0].events[0].title).toEqual(payload.value);
    });

    it('should handle addChapter', () => {
      const nextState = memoirReducer(initialFormState, addChapter());
      expect(nextState.chapters.length).toBe(2);
      expect(nextState.chapters[1].title).toBe('New Chapter');
    });

    it('should handle addEvent', () => {
      const nextState = memoirReducer(initialFormState, addEvent(0));
      expect(nextState.chapters[0].events.length).toBe(2);
      expect(nextState.chapters[0].events[1].title).toBe('New Event');
    });

    it('should handle resetMemoir', () => {
      const filledState = {
        ...initialFormState,
        title: 'Existing Title',
        content: 'Existing Content',
        chapters: [{ title: 'Existing Chapter', events: [] }],
        currentId: '123456',
        error: 'Some error',
      };

      const nextState = memoirReducer(filledState, resetMemoir());
      expect(nextState).toEqual(initialFormState);
    });
  });

  // PART 2: Test TimelineBoard Operations
  describe('TimelineBoard Operations', () => {
    it('should handle updateChaptersOrder', () => {
      // Reorder chapters (swap the two chapters)
      const reorderedChapters = [
        mockMemoir.chapters[1],
        mockMemoir.chapters[0],
      ];

      const nextState = memoirReducer(
        stateWithCurrentMemoir,
        updateChaptersOrder(reorderedChapters),
      );

      expect(nextState.currentMemoir.chapters[0]._id).toBe('chapter2');
      expect(nextState.currentMemoir.chapters[1]._id).toBe('chapter1');
    });

    it('should handle updateEvents within the same chapter', () => {
      const payload = {
        sourceColId: 'chapter1',
        destColId: 'chapter1',
        sourceItems: [
          { _id: 'event2', title: 'Event 2', content: 'Description 2' },
          { _id: 'event1', title: 'Event 1', content: 'Description 1' },
        ], // Swapped events
        destItems: [
          { _id: 'event2', title: 'Event 2', content: 'Description 2' },
          { _id: 'event1', title: 'Event 1', content: 'Description 1' },
        ],
      };

      const nextState = memoirReducer(
        stateWithCurrentMemoir,
        updateEvents(payload),
      );

      // Check that events in chapter1 are reordered
      expect(nextState.currentMemoir.chapters[0].events[0]._id).toBe('event2');
      expect(nextState.currentMemoir.chapters[0].events[1]._id).toBe('event1');
    });

    it('should handle updateEvents between different chapters', () => {
      const payload = {
        sourceColId: 'chapter1',
        destColId: 'chapter2',
        sourceItems: [
          // chapter1 with only event2 remaining
          { _id: 'event2', title: 'Event 2', content: 'Description 2' },
        ],
        destItems: [
          // chapter2 with event3 and the moved event1
          { _id: 'event3', title: 'Event 3', content: 'Description 3' },
          { _id: 'event1', title: 'Event 1', content: 'Description 1' },
        ],
      };

      const nextState = memoirReducer(
        stateWithCurrentMemoir,
        updateEvents(payload),
      );

      // Check that chapter1 only has event2
      expect(nextState.currentMemoir.chapters[0].events.length).toBe(1);
      expect(nextState.currentMemoir.chapters[0].events[0]._id).toBe('event2');

      // Check that chapter2 now has both event3 and event1
      expect(nextState.currentMemoir.chapters[1].events.length).toBe(2);
      expect(nextState.currentMemoir.chapters[1].events[0]._id).toBe('event3');
      expect(nextState.currentMemoir.chapters[1].events[1]._id).toBe('event1');
    });
  });

  // PART 3: Test Async Thunks
  describe('Async Thunks', () => {
    let store;

    beforeEach(() => {
      store = configureStore({
        reducer: {
          memoir: memoirReducer,
        },
      });
    });

    it('should handle fetchMemoir.fulfilled', async () => {
      // Mock successful API response
      axios.get.mockResolvedValueOnce({ data: mockMemoir });

      // Dispatch the thunk
      await store.dispatch(fetchMemoir('67fd6433e5bbf10bbd28ffe4'));

      // Check state after the action
      const state = store.getState().memoir;
      expect(state.loading).toBe(false);
      expect(state.currentMemoir).toEqual(mockMemoir);
      expect(state.error).toBeNull();
    });

    it('should handle fetchMemoir.rejected', async () => {
      // Mock failed API response
      const errorMessage = 'Failed to fetch memoir';
      axios.get.mockRejectedValueOnce({
        response: { data: { message: errorMessage } },
      });

      // Dispatch the thunk
      await store.dispatch(fetchMemoir('invalid-id'));

      // Check state after the action
      const state = store.getState().memoir;
      expect(state.loading).toBe(false);
      expect(state.currentMemoir).toBeNull();
      expect(state.error).toBe(errorMessage);
    });

    it('should handle updateMemoirTimeline.fulfilled', async () => {
      // Setup initial state with a memoir
      store = configureStore({
        reducer: {
          memoir: memoirReducer,
        },
        preloadedState: {
          memoir: stateWithCurrentMemoir,
        },
      });

      // Mock successful API response
      axios.post.mockResolvedValueOnce({
        data: { message: 'Memoir saved', memoir: mockMemoir },
      });

      // Dispatch the thunk
      await store.dispatch(updateMemoirTimeline(mockMemoir));

      // Check that API was called with correct data
      expect(axios.post).toHaveBeenCalledWith('/api/memoir', mockMemoir);

      // Check state after the action
      const state = store.getState().memoir;
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle createMemoir.fulfilled', async () => {
      // Setup initial state
      store = configureStore({
        reducer: {
          memoir: memoirReducer,
        },
      });

      // Mock data and response
      const newMemoir = {
        title: 'New Memoir',
        content: 'Description',
        chapters: [],
      };

      const apiResponse = {
        message: 'Memoir saved',
        memoir: { ...newMemoir, _id: 'new-memoir-id' },
      };

      // Mock successful API response
      axios.post.mockResolvedValueOnce({ data: apiResponse });

      // Dispatch the thunk
      await store.dispatch(createMemoir(newMemoir));

      // Check state after the action
      const state = store.getState().memoir;
      expect(state.loading).toBe(false);
      expect(state.currentId).toBe('new-memoir-id');
      expect(state.error).toBeNull();
    });
  });
});
