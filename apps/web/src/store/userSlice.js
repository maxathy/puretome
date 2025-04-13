import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    email: "",
    role: "",
  },
  reducers: {
    setUser: (state, action) => {
      state.email = action.payload.email;
      state.role = action.payload.role;
    },
    clearUser: (state) => {
      state.email = "";
      state.role = "";
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
