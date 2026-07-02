import axios from 'axios';
import store from '../store/index.js';
import { logoutUser } from '../store/authSlice.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Crucial for HTTP-only cookies
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle session timeouts and bans
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;
      
      // Banned or expired tokens
      if (status === 401 || (status === 403 && data.message?.toLowerCase().includes('ban'))) {
        store.dispatch(logoutUser());
      }
    }
    return Promise.reject(error);
  }
);

export default api;
