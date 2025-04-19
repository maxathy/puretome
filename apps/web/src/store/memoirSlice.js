// apps/web/src/store/memoirSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

/**
 * Fetch a memoir by ID
 * @param {string} memoirId - ID of the memoir to fetch
 */
export const fetchMemoir = createAsyncThunk(
  'memoir/fetch',
  async (memoirId, { rejectWithValue }) => {
    try {
      const response = await axios.get(`/api/memoir/${memoirId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching memoir:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch memoir',
      );
    }
  },
);

/**
 * Update a memoir's timeline (chapters and events structure)
 * @param {Object} updatedMemoir - Memoir object with updated structure
 */
export const updateMemoirTimeline = createAsyncThunk(
  'memoir/updateTimeline',
  async (updatedMemoir, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/memoir', updatedMemoir);
      return response.data;
    } catch (error) {
      console.error('Error saving memoir:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update memoir timeline',
      );
    }
  },
);

/**
 * Create a new memoir
 * @param {Object} memoirData - New memoir data
 */
export const createMemoir = createAsyncThunk(
  'memoir/create',
  async (memoirData, { rejectWithValue }) => {
    try {
      if (!memoirData.title) {
        return rejectWithValue('Memoir title is required');
      }

      const response = await axios.post('/api/memoir', memoirData);
      return response.data;
    } catch (error) {
      console.error('Error creating memoir:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create memoir',
      );
    }
  },
);

/**
 * Memoir slice for state management related to memoirs
 * Handles both creation and timeline editing functionality
 */
const memoirSlice = createSlice({
  name: 'memoir',
  initialState: {
    // Current memoir data (used for viewing/editing)
    currentMemoir: null,
    currentId: null,

    // Form data for memoir creation
    title: '',
    content: '',
    chapters: [
      {
        title: 'New Chapter',
        events: [{ title: 'New Event', content: '' }],
      },
    ],

    // State flags
    loading: false,
    error: null,
  },
  reducers: {
    // Timeline board reducers
    updateChaptersOrder: (state, action) => {
      if (!state.currentMemoir) return;
      state.currentMemoir.chapters = action.payload;
    },
    updateEvents: (state, action) => {
      if (!state.currentMemoir) return;

      const { sourceColId, destColId, sourceItems, destItems } = action.payload;

      state.currentMemoir.chapters = state.currentMemoir.chapters.map(
        (chapter) => {
          if (chapter._id === sourceColId)
            return { ...chapter, events: sourceItems };
          if (chapter._id === destColId)
            return { ...chapter, events: destItems };
          return chapter;
        },
      );
    },

    // Create memoir form reducers
    resetMemoir: (state) => {
      state.title = '';
      state.content = '';
      state.chapters = [
        {
          title: 'New Chapter',
          events: [{ title: 'New Event', content: '' }],
        },
      ];
      state.currentId = null;
      state.error = null;
    },
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
        title: 'New Chapter',
        events: [{ title: 'New Event', content: '' }],
      });
    },
    addEvent: (state, action) => {
      const chapterIndex = action.payload;
      state.chapters[chapterIndex].events.push({
        title: 'New Event',
        content: '',
      });
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchMemoir
      .addCase(fetchMemoir.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMemoir.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMemoir = action.payload;
        state.error = null;
      })
      .addCase(fetchMemoir.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle updateMemoirTimeline
      .addCase(updateMemoirTimeline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMemoirTimeline.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update the memoir with the response
        // state.currentMemoir = action.payload.memoir;
      })
      .addCase(updateMemoirTimeline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle createMemoir
      .addCase(createMemoir.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMemoir.fulfilled, (state, action) => {
        state.loading = false;
        state.currentId = action.payload.memoir._id;
        state.error = null;
      })
      .addCase(createMemoir.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  // Timeline board actions
  updateChaptersOrder,
  updateEvents,

  // Create memoir form actions
  resetMemoir,
  updateTitle,
  updateContent,
  updateChapterTitle,
  updateEvent,
  addChapter,
  addEvent,
} = memoirSlice.actions;

export default memoirSlice.reducer;
