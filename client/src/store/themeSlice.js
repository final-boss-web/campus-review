import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  mode: 'dark',
};

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      // Force dark mode only
      state.mode = 'dark';
      localStorage.setItem('color-theme', 'dark');
      
      const root = window.document.documentElement;
      root.classList.add('dark');
      document.body.classList.add('dark');
    },
    setTheme: (state, action) => {
      state.mode = 'dark';
      localStorage.setItem('color-theme', 'dark');
      
      const root = window.document.documentElement;
      root.classList.add('dark');
      document.body.classList.add('dark');
    }
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
