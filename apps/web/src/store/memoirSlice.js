// apps/web/src/store/memoirSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

/**
 * Redux slice for memoir state management
 *
 * @thunk createMemoir - Creates a new memoir by sending data to the API
 * @thunk fetchMemoir - Fetches memoir data from the API
 */

// Create async thunk for saving memoir
export const createMemoir = createAsyncThunk(
  'memoir/create',
  async (memoirData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/memoir', memoirData);
      return response.data.memoir;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create memoir'
      );
    }
  }
);

// Create async thunk for fetching a memoir
export const fetchMemoir = createAsyncThunk(
  'memoir/fetch',
  async (memoirId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/memoir/${memoirId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch memoir'
      );
    }
  }
);

const initialMemoirState = {
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

const memoirSlice = createSlice({
  name: 'memoir',
  initialState: initialMemoirState,
  reducers: {
    updateTitle: (state, action) => {
      state.title = action.payload;
    },
    updateContent: (state, action) => {
      state.content = action.payload;
    },
    updateChapterTitle: (state, action) => {
      const { index, title } = action.payload;
      state.chapters[index].title = title;
    },
    updateEvent: (state, action) => {
      const { chapterIndex, eventIndex, field, value } = action.payload;
      state.chapters[chapterIndex].events[eventIndex][field] = value;
    },
    addChapter: (state) => {
      state.chapters.push({
        title: `Chapter ${state.chapters.length + 1}`,
        events: [{ title: 'New Event', content: '' }]
      });
    },
    addEvent: (state, action) => {
      const chapterIndex = action.payload;
      state.chapters[chapterIndex].events.push({
        title: 'New Event',
        content: ''
      });
    },
    resetMemoir: () => initialMemoirState
  },
  extraReducers: (builder) => {
    builder
      // Handle createMemoir
      .addCase(createMemoir.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMemoir.fulfilled, (state, action) => {
        state.loading = false;
        state.currentId = action.payload._id;
      })
      .addCase(createMemoir.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Handle fetchMemoir
      .addCase(fetchMemoir.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemoir.fulfilled, (state, action) => {
        return {
          ...action.payload,
          loading: false,
          error: null
        };
      })
      .addCase(fetchMemoir.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const {
  updateTitle,
  updateContent,
  updateChapterTitle,
  updateEvent,
  addChapter,
  addEvent,
  resetMemoir
} = memoirSlice.actions;

export default memoirSlice.reducer;
