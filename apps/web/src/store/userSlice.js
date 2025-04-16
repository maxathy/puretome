import { createSlice } from '@reduxjs/toolkit';
/**
 * Redux slice for user state management
 *
 * @property {String} email - User email
 * @property {String} role - User role
 *
 * @action setUser - Sets user information
 * @action clearUser - Clears user information
 */

const userSlice = createSlice({
  name: 'user',
  initialState: {
    email: '',
    role: '',
  },
  reducers: {
    setUser: (state, action) => {
      state.email = action.payload.email;
      state.role = action.payload.role;
    },
    clearUser: (state) => {
      state.email = '';
      state.role = '';
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
