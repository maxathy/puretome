import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import memoirReducer from './memoirSlice';

const store = configureStore({
  reducer: {
    user: userReducer,
    memoir: memoirReducer
  },
});

export default store;
