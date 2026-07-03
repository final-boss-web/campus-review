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
      const payload = action.payload;
      if (payload && payload.user !== undefined) {
        state.user = payload.user;
        state.isAuthenticated = !!payload.user;
        if (payload.token) {
          localStorage.setItem('auth_token', payload.token);
        }
      } else {
        // Fallback for direct user assignment
        state.user = payload;
        state.isAuthenticated = !!payload;
      }
      state.loading = false;
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem('auth_token');
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
