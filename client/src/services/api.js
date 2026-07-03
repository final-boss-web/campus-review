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

// Request interceptor to attach tracking headers on every outgoing API request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const sessionId = sessionStorage.getItem('analytics_session_id');
    const geoDataStr = sessionStorage.getItem('client_geo');

    if (sessionId) {
      config.headers['x-client-session-id'] = sessionId;
    }

    config.headers['x-client-screen-resolution'] = `${window.screen.width}x${window.screen.height}`;
    config.headers['x-client-timezone'] = Intl.DateTimeFormat().resolvedOptions().timeZone;
    config.headers['x-client-current-page'] = window.location.pathname + window.location.search;
    config.headers['x-client-previous-page'] = sessionStorage.getItem('analytics_prev_page') || '';
    config.headers['x-client-referrer'] = document.referrer || '';

    if (geoDataStr) {
      try {
        const geo = JSON.parse(geoDataStr);
        if (geo.country) config.headers['x-client-country'] = geo.country;
        if (geo.region) config.headers['x-client-state'] = geo.region;
        if (geo.city) config.headers['x-client-city'] = geo.city;
        if (geo.latitude) config.headers['x-client-latitude'] = String(geo.latitude);
        if (geo.longitude) config.headers['x-client-longitude'] = String(geo.longitude);
      } catch (e) {
        // Ignore
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


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
