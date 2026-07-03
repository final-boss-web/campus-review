import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    updateBookmarks: (state, action) => {
      if (state.user) {
        state.user.bookmarks = action.payload;
      }
    },
    updateBadges: (state, action) => {
      if (state.user) {
        state.user.badges = action.payload;
      }
    }
  },
});

export const {
  setUser,
  logoutUser,
  setLoading,
  updateBookmarks,
  updateBadges,
} = authSlice.actions;

export default authSlice.reducer;
