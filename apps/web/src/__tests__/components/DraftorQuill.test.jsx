import React from 'react';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import memoirReducer, { saveMemoir } from '../../store/memoirSlice';
import DraftorQuill from '../../components/DraftorQuill';
import '@testing-library/jest-dom';
import * as memoirSlice from '../../store/memoirSlice';

// Helper to create a real redux store with memoirReducer
const createMockStore = (initialMemoir = null) => {
  return configureStore({
    reducer: { memoir: memoirReducer },
    preloadedState: {
      memoir: {
        currentMemoir: initialMemoir,
        loading: false,
        error: null,
      },
    },
  });
};

describe('DraftorQuill', () => {
  const memoirId = 'memoir1';
  const chapterId = 'chapter1';

  function getMemoir(events = []) {
    return {
      _id: memoirId,
      chapters: [{ _id: chapterId, events }],
    };
  }

  it('renders editor in read-only mode when no events', () => {
    const store = createMockStore(getMemoir([]));
    render(
      <Provider store={store}>
        <DraftorQuill memoirId={memoirId} chapterId={chapterId} />
      </Provider>,
    );
    expect(screen.getByText('All changes are autosaved.')).toBeInTheDocument();
    expect(
      screen.getByText('Add an event to start editing this chapter.'),
    ).toBeInTheDocument();
    expect(document.querySelector('.ql-container')).toBeInTheDocument();
    expect(document.querySelector('.ql-disabled')).toBeInTheDocument();
  });

  it('renders event delimiters and content for each event', async () => {
    const events = [
      { _id: 'e1', title: 'Event 1', content: '<p>First event</p>' },
      { _id: 'e2', title: 'Event 2', content: '<p>Second event</p>' },
    ];
    const store = createMockStore(getMemoir(events));
    await act(async () => {
      render(
        <Provider store={store}>
          <DraftorQuill memoirId={memoirId} chapterId={chapterId} />
        </Provider>,
      );
    });
    expect(screen.getByText('Event 1')).toBeInTheDocument();
    expect(screen.getByText('Event 2')).toBeInTheDocument();
    expect(screen.getByText('First event')).toBeInTheDocument();
    expect(screen.getByText('Second event')).toBeInTheDocument();
    expect(document.querySelector('.ql-disabled')).not.toBeInTheDocument();
  });

  it('shows autosave message', () => {
    const store = createMockStore(
      getMemoir([{ _id: 'e1', title: 'Event 1', content: '' }]),
    );
    render(
      <Provider store={store}>
        <DraftorQuill memoirId={memoirId} chapterId={chapterId} />
      </Provider>,
    );
    expect(screen.getByText('All changes are autosaved.')).toBeInTheDocument();
  });
});
