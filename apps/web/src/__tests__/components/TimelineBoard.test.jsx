// apps/web/src/__tests__/components/TimelineBoard.test.jsx
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import TimelineBoard from '../../components/TimelineBoard';
import memoirReducer, {
  fetchMemoir,
  updateMemoirTimeline,
  addChapter,
} from '../../store/memoirSlice';
import '@testing-library/jest-dom';

// Create a mock store for testing
const createMockStore = (initialState = {}) => {
  const store = configureStore({
    reducer: {
      memoir: memoirReducer,
    },
    preloadedState: {
      memoir: {
        currentMemoir: null,
        loading: false,
        error: null,
        ...initialState,
      },
    },
  });
  return store;
};

describe('TimelineBoard Component', () => {
  // Mock memoir data
  const mockMemoir = {
    _id: '67fd6433e5bbf10bbd28ffe4',
    title: 'My Memoir',
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
        events: [
          { _id: 'event3', title: 'Event 3', content: 'Description 3' },
          { _id: 'event4', title: 'Event 4', content: 'Description 4' },
        ],
      },
    ],
  };

  // Mock store with initial data for most tests
  let store;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock API responses
    axios.get.mockResolvedValue({ data: mockMemoir });
    axios.post.mockResolvedValue({ data: { message: 'Success' } });

    // Initialize store with the mock memoir for tests that need it
    store = createMockStore({ currentMemoir: mockMemoir });
  });

  it('fetches and displays memoir data', async () => {
    const loadingStore = createMockStore();
    render(
      <Provider store={loadingStore}>
        <TimelineBoard memoirId='67fd6433e5bbf10bbd28ffe4' />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
      expect(screen.getByTestId('chapter-chapter2')).toBeInTheDocument();
      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.getByTestId('event-event2')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(loadingStore.getState().memoir.currentMemoir).toEqual(mockMemoir);
      expect(loadingStore.getState().memoir.loading).toBe(false);
    });
  });

  it('handles API error gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));
    const errorStore = createMockStore();

    render(
      <Provider store={errorStore}>
        <TimelineBoard memoirId='67fd6433e5bbf10bbd28ffe4' />
      </Provider>,
    );

    expect(screen.getByText('Loading memoir...')).toBeInTheDocument();

    await waitFor(() => {
      expect(errorStore.getState().memoir.error).not.toBeNull();
      expect(
        screen.getByText(/Error loading memoir:/i),
      ).toBeInTheDocument();
    });
  });

  it('allows adding a new chapter', async () => {
    render(
      <Provider store={store}>
        <TimelineBoard memoirId='67fd6433e5bbf10bbd28ffe4' />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
    });

    const addChapterButton = screen.getByTestId('add-chapter-button');
    fireEvent.click(addChapterButton);

    const chapterInput = screen.getByTestId('chapter-title-input');
    expect(chapterInput).toBeInTheDocument();

    fireEvent.change(chapterInput, { target: { value: 'New Chapter Title' } });
    expect(chapterInput.value).toBe('New Chapter Title');

    const saveChapterButton = screen.getByTestId('save-chapter-button');
    fireEvent.click(saveChapterButton);

    await waitFor(() => {
      expect(screen.queryByTestId('chapter-title-input')).not.toBeInTheDocument();
    });
  });

  it('allows canceling adding a new chapter', async () => {
    render(
      <Provider store={store}>
        <TimelineBoard memoirId='67fd6433e5bbf10bbd28ffe4' />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
    });

    const addChapterButton = screen.getByTestId('add-chapter-button');
    fireEvent.click(addChapterButton);

    const chapterInput = screen.getByTestId('chapter-title-input');
    expect(chapterInput).toBeInTheDocument();
    fireEvent.change(chapterInput, { target: { value: 'Temporary Title' } });

    const cancelChapterButton = screen.getByTestId('cancel-chapter-button');
    fireEvent.click(cancelChapterButton);

    expect(screen.queryByTestId('chapter-title-input')).not.toBeInTheDocument();
    expect(store.getState().memoir.currentMemoir.chapters.length).toBe(
      mockMemoir.chapters.length,
    );
  });

  it('allows adding a new event to a chapter', async () => {
    const chapterIdToAddEvent = 'chapter1';
    render(
      <Provider store={store}>
        <TimelineBoard memoirId='67fd6433e5bbf10bbd28ffe4' />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
    });

    const addEventButton = screen.getByTestId(
      `add-event-button-${chapterIdToAddEvent}`,
    );
    fireEvent.click(addEventButton);

    const eventInput = screen.getByTestId(
      `new-event-input-${chapterIdToAddEvent}`,
    );
    expect(eventInput).toBeInTheDocument();

    fireEvent.change(eventInput, { target: { value: 'New Event Title' } });
    expect(eventInput.value).toBe('New Event Title');

    const saveEventButton = screen.getByTestId(
      `save-event-button-${chapterIdToAddEvent}`,
    );
    fireEvent.click(saveEventButton);

    await waitFor(() => {
      expect(
        screen.queryByTestId(`new-event-input-${chapterIdToAddEvent}`),
      ).not.toBeInTheDocument();
    });
  });

  it('allows canceling adding a new event', async () => {
    const chapterIdToCancelEvent = 'chapter1';
    render(
      <Provider store={store}>
        <TimelineBoard memoirId='67fd6433e5bbf10bbd28ffe4' />
      </Provider>,
    );

    await waitFor(() => {
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
    });

    const addEventButton = screen.getByTestId(
      `add-event-button-${chapterIdToCancelEvent}`,
    );
    fireEvent.click(addEventButton);

    const eventInput = screen.getByTestId(
      `new-event-input-${chapterIdToCancelEvent}`,
    );
    expect(eventInput).toBeInTheDocument();
    fireEvent.change(eventInput, { target: { value: 'Temporary Event' } });

    const cancelEventButton = screen.getByTestId(
      `cancel-event-button-${chapterIdToCancelEvent}`,
    );
    fireEvent.click(cancelEventButton);

    expect(
      screen.queryByTestId(`new-event-input-${chapterIdToCancelEvent}`),
    ).not.toBeInTheDocument();
    const chapterState = store
      .getState()
      .memoir.currentMemoir.chapters.find((c) => c._id === chapterIdToCancelEvent);
    const originalChapter = mockMemoir.chapters.find((c) => c._id === chapterIdToCancelEvent);
    expect(chapterState.events.length).toBe(originalChapter.events.length);
  });

  // Drag and drop tests would go here, likely requiring helper functions
  // or libraries like @testing-library/react-testing-library-beautiful-dnd
});
