import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import memoirReducer from './memoirSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    memoir: memoirReducer,
  },
});

export default store;
