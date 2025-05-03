import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// Get token and user from localStorage on init
const tokenFromStorage = localStorage.getItem('token');
const userFromStorage = localStorage.getItem('user');

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, thunkAPI) => {
    try {
      const res = await axios.post('/api/users/login', { email, password });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { user, token };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message ||
          'Login failed. Please check your credentials.',
      );
    }
  },
);

export const logout = createAsyncThunk('auth/logout', async (_, thunkAPI) => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  delete axios.defaults.headers.common['Authorization'];
  return true;
});

export const register = createAsyncThunk(
  'auth/register',
  async ({ name, email, password }, thunkAPI) => {
    try {
      const res = await axios.post('/api/users/register', {
        name,
        email,
        password,
      });
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      return { user, token };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Registration failed.',
      );
    }
  },
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (userData, thunkAPI) => {
    try {
      const res = await axios.put('/api/users/profile', userData);
      const { user } = res.data;
      
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      return { user };
    } catch (err) {
      return thunkAPI.rejectWithValue(
        err.response?.data?.message || 'Profile update failed.',
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: userFromStorage ? JSON.parse(userFromStorage) : null,
    token: tokenFromStorage || null,
    loading: false,
    error: null,
    hydrated: false,
  },
  reducers: {
    setHydrated(state) {
      state.hydrated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.error = null;
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setHydrated } = authSlice.actions;
export default authSlice.reducer;
