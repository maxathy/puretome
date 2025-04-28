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
 * Fetch all memoirs for the logged-in user
 */
export const fetchUserMemoirs = createAsyncThunk(
  'memoir/fetchUserMemoirs',
  async (_, { rejectWithValue }) => {
    // No argument needed for this thunk
    try {
      const response = await axios.get('/api/memoir'); // Assuming token is handled by axios interceptor or sent manually if needed
      return response.data;
    } catch (error) {
      console.error('Error fetching user memoirs:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch user memoirs',
      );
    }
  },
);

/**
 * Save (Create or Update) a memoir
 * If memoirData has _id, it updates (PUT). Otherwise, it creates (POST).
 * @param {Object} memoirData - Memoir data, must include title. May include _id, content, chapters, etc.
 */
export const saveMemoir = createAsyncThunk(
  'memoir/save',
  async (memoirData, { rejectWithValue }) => {
    try {
      if (!memoirData.title) {
        return rejectWithValue('Memoir title is required.');
      }

      const { _id, ...dataToSend } = memoirData;

      let response;
      if (_id) {
        // Update existing memoir
        response = await axios.put(`/api/memoir/${_id}`, dataToSend);
      } else {
        // Create new memoir
        response = await axios.post('/api/memoir', dataToSend);
      }

      return response.data; // Should return { message: '...', memoir: savedMemoir }
    } catch (error) {
      console.error('Error saving memoir:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to save memoir',
      );
    }
  },
);

/**
 * Delete a memoir by ID
 * @param {string} memoirId - ID of the memoir to delete
 */
export const deleteMemoir = createAsyncThunk(
  'memoir/delete',
  async (memoirId, { rejectWithValue }) => {
    try {
      // Use the new API path with ID in the URL
      const response = await axios.delete(`/api/memoir/${memoirId}`);
      return { deletedMemoirId: memoirId, ...response.data }; // Include ID for removal from state
    } catch (error) {
      console.error('Error deleting memoir:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete memoir',
      );
    }
  },
);
// Add collaborator thunk
export const inviteCollaborator = createAsyncThunk(
  'memoir/inviteCollaborator',
  async ({ memoirId, email, role }, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `/api/memoir/${memoirId}/collaborators`,
        {
          email,
          role,
        },
      );
      return response.data;
    } catch (error) {
      console.error('Error inviting collaborator:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to invite collaborator',
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

    // List of user's memoirs (for MemoirPicker)
    userMemoirs: [],
    userMemoirsLoading: false,
    userMemoirsError: null,

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
      })
      .addCase(fetchMemoir.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMemoir = action.payload;
      })
      .addCase(fetchMemoir.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle fetchUserMemoirs
      .addCase(fetchUserMemoirs.pending, (state) => {
        state.userMemoirsLoading = true;
        state.userMemoirsError = null;
      })
      .addCase(fetchUserMemoirs.fulfilled, (state, action) => {
        state.userMemoirsLoading = false;
        state.userMemoirs = action.payload;
        state.userMemoirsError = null;
      })
      .addCase(fetchUserMemoirs.rejected, (state, action) => {
        state.userMemoirsLoading = false;
        state.userMemoirsError = action.payload;
      })

      // Handle saveMemoir (Create/Update)
      .addCase(saveMemoir.pending, (state) => {
        state.loading = true; // Use general loading/error for save
        state.error = null;
      })
      .addCase(saveMemoir.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMemoir = action.payload.memoir; // Update current memoir
        state.currentId = action.payload.memoir._id;

        // Update or add in userMemoirs list
        const index = state.userMemoirs.findIndex(
          (m) => m._id === action.payload.memoir._id,
        );
        if (index !== -1) {
          state.userMemoirs[index] = action.payload.memoir;
        } else {
          state.userMemoirs.push(action.payload.memoir);
        }
      })
      .addCase(saveMemoir.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle deleteMemoir
      .addCase(deleteMemoir.pending, (state) => {
        state.loading = true; // Could use a specific loading state if preferred
        state.error = null;
      })
      .addCase(deleteMemoir.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted memoir from the userMemoirs list
        state.userMemoirs = state.userMemoirs.filter(
          (memoir) => memoir._id !== action.payload.deletedMemoirId,
        );
        // If the deleted memoir was the current one, clear it
        if (
          state.currentMemoir &&
          state.currentMemoir._id === action.payload.deletedMemoirId
        ) {
          state.currentMemoir = null;
          state.currentId = null; // Also clear currentId if used
        }
        state.error = null;
      })
      .addCase(deleteMemoir.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Set the general error state
      })
      .addCase(inviteCollaborator.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(inviteCollaborator.fulfilled, (state, action) => {
        state.loading = false;
        // No direct state manipulation needed here,
        // as fetchMemoir will be dispatched to get the updated list including the pending invite.
        // We might want to clear any specific invitation-related error here if we had one.
        state.error = null; // Clear potential previous errors
      })
      .addCase(inviteCollaborator.rejected, (state, action) => {
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
