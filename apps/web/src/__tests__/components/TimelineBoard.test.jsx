// apps/web/src/__tests__/components/TimelineBoard.test.jsx
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';
import TimelineBoard from '../../components/TimelineBoard';
import memoirReducer, { fetchMemoir } from '../../store/memoirSlice';

// Create a mock store for testing
const createMockStore = (initialState = {}) => {
  return configureStore({
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
    ],
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Mock API responses
    axios.get.mockResolvedValue({ data: mockMemoir });
    axios.post.mockResolvedValue({ data: { message: 'Success' } });
  });

  it('fetches and displays memoir data', async () => {
    const store = createMockStore();

    render(
      <Provider store={store}>
        <TimelineBoard memoirId='67fd6433e5bbf10bbd28ffe4' />
      </Provider>,
    );

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Chapter 1')).toBeInTheDocument();
      expect(screen.getByText('Event 1')).toBeInTheDocument();
      expect(screen.getByText('Event 2')).toBeInTheDocument();
    });

    // Check that the action was dispatched
    const actions = store.getState();
    expect(actions.memoir.currentMemoir).toEqual(mockMemoir);
  });

  it('handles API error gracefully', async () => {
    // Mock API error
    axios.get.mockRejectedValueOnce(new Error('Network error'));
    const store = createMockStore();

    render(
      <Provider store={store}>
        <TimelineBoard memoirId='67fd6433e5bbf10bbd28ffe4' />
      </Provider>,
    );

    // Check loading state first
    expect(screen.getByText('Loading memoir...')).toBeInTheDocument();

    // Wait for error state
    await waitFor(() => {
      expect(store.getState().memoir.error).not.toBeNull();
    });
  });

  // Additional tests for drag and drop would require more complex setup
  // and likely use of the react-beautiful-dnd test utilities
});
