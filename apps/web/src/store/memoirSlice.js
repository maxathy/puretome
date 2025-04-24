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
 * Update memoir details (title, content)
 * @param {Object} memoirData - Object containing { _id, title, content }
 */
export const updateMemoirDetails = createAsyncThunk(
  'memoir/updateDetails',
  async (memoirData, { rejectWithValue }) => {
    try {
      if (!memoirData._id || !memoirData.title) {
        return rejectWithValue('Memoir ID and title are required for update');
      }
      // Only send necessary fields for update
      const { _id, title, content } = memoirData;
      const response = await axios.post('/api/memoir', { _id, title, content });
      return response.data; // Should return { message: 'Memoir saved', memoir: updatedMemoir }
    } catch (error) {
      console.error('Error updating memoir details:', error);
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update memoir details',
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
 * Delete a memoir by ID
 * @param {string} memoirId - ID of the memoir to delete
 */
export const deleteMemoir = createAsyncThunk(
  'memoir/delete',
  async (memoirId, { rejectWithValue }) => {
    try {
      // The API route expects the ID in the request body for this setup
      const response = await axios.delete('/api/memoir', {
        data: { _id: memoirId },
      });
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

      // Handle updateMemoirTimeline
      .addCase(updateMemoirTimeline.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMemoirTimeline.fulfilled, (state, action) => {
        state.loading = false;
        // Optionally update the memoir with the response
        state.currentMemoir = action.payload.memoir;
      })
      .addCase(updateMemoirTimeline.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Handle updateMemoirDetails
      .addCase(updateMemoirDetails.pending, (state) => {
        state.loading = true; // Use the general loading state
        state.error = null;
      })
      .addCase(updateMemoirDetails.fulfilled, (state, action) => {
        state.loading = false;
        if (
          state.currentMemoir &&
          state.currentMemoir._id === action.payload.memoir._id
        ) {
          // Update currentMemoir if it's the one being edited
          state.currentMemoir.title = action.payload.memoir.title;
          state.currentMemoir.content = action.payload.memoir.content;
        }
        // Update the memoir in the userMemoirs list as well
        const index = state.userMemoirs.findIndex(
          (m) => m._id === action.payload.memoir._id,
        );
        if (index !== -1) {
          state.userMemoirs[index].title = action.payload.memoir.title;
          state.userMemoirs[index].content = action.payload.memoir.content;
        }
        state.error = null;
      })
      .addCase(updateMemoirDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload; // Set the general error state
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
        // If current memoir is loaded, update it with new collaborator
        if (
          state.currentMemoir &&
          state.currentMemoir._id === action.meta.arg.memoirId
        ) {
          if (!state.currentMemoir.collaborators) {
            state.currentMemoir.collaborators = [];
          }
          state.currentMemoir.collaborators.push(action.payload.collaborator);
        }
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
