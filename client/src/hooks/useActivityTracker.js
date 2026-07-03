import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Generate simple unique session ID
const generateSessionId = () => {
  return 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

export const useActivityTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // 1. Establish Session ID
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem('analytics_session_id', sessionId);
    }

    // 3. Resolve Geolocation (Once per session with caching)
    const resolveGeo = async () => {
      const cachedGeo = sessionStorage.getItem('client_geo');
      if (cachedGeo) return JSON.parse(cachedGeo);

      try {
        // Fetch client coordinates and location details from free Geo-IP service
        const response = await axios.get('https://ipapi.co/json/', { timeout: 3000 });
        if (response.data) {
          const geo = {
            country: response.data.country_name || '',
            region: response.data.region || '', // state
            city: response.data.city || '',
            timezone: response.data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            latitude: response.data.latitude || null,
            longitude: response.data.longitude || null,
          };
          sessionStorage.setItem('client_geo', JSON.stringify(geo));
          return geo;
        }
      } catch (err) {
        console.debug('Geo IP lookup skipped or failed, using local browser fallback.');
      }

      // Fallback details if network request fails
      const fallback = {
        country: '',
        region: '',
        city: '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        latitude: null,
        longitude: null,
      };
      sessionStorage.setItem('client_geo', JSON.stringify(fallback));
      return fallback;
    };

    resolveGeo();
  }, []);

  // 4. Track Route Changes (Page Views)
  useEffect(() => {
    const handlePageRoute = async () => {
      const sessionId = sessionStorage.getItem('analytics_session_id') || generateSessionId();
      const cachedGeo = sessionStorage.getItem('client_geo');
      const geo = cachedGeo ? JSON.parse(cachedGeo) : {
        country: '', region: '', city: '', latitude: null, longitude: null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      };

      const currentPage = location.pathname + location.search;
      const previousPage = sessionStorage.getItem('analytics_prev_page') || '';

      // Save page state for next transition
      sessionStorage.setItem('analytics_prev_page', currentPage);

      // Post activity log to MongoDB
      try {
        await axios.post(`${API_BASE_URL}/analytics/log`, {
          action: 'Page View',
          sessionId,
          currentPage,
          previousPage,
          referrer: document.referrer || '',
          screenResolution: `${window.screen.width}x${window.screen.height}`,
          timezone: geo.timezone,
          country: geo.country,
          state: geo.region,
          city: geo.city,
          latitude: geo.latitude,
          longitude: geo.longitude,
        }, {
          headers: {
            'Content-Type': 'application/json',
            'x-client-session-id': sessionId,
            'x-client-screen-resolution': `${window.screen.width}x${window.screen.height}`,
            'x-client-timezone': geo.timezone,
            'x-client-current-page': currentPage,
            'x-client-previous-page': previousPage,
            'x-client-referrer': document.referrer || '',
            'x-client-country': geo.country,
            'x-client-state': geo.region,
            'x-client-city': geo.city,
            'x-client-latitude': geo.latitude || '',
            'x-client-longitude': geo.longitude || '',
          }
        });
      } catch (err) {
        // Silently fail analytics network issues in prod
        console.debug('Failed to send pageview log payload to server.', err.message);
      }
    };

    handlePageRoute();
  }, [location]);

  // 5. Global Client-Side Error Logging (Uncaught JS and Promise exceptions)
  useEffect(() => {
    const handleJsErrors = async (event) => {
      const errorMsg = event.message || 'Unknown javascript execution error';
      const errorStack = event.error ? event.error.stack : '';
      
      // Server Log
      try {
        const sessionId = sessionStorage.getItem('analytics_session_id');
        await axios.post(`${API_BASE_URL}/analytics/log`, {
          action: 'JavaScript Error',
          sessionId,
          currentPage: location.pathname,
          requestBody: { message: errorMsg, stack: errorStack },
        });
      } catch (err) {
        // Silently ignore
      }
    };

    const handleRejections = async (event) => {
      const reason = event.reason ? (event.reason.message || String(event.reason)) : 'Unhandled Promise Rejection';
      
      // Server Log
      try {
        const sessionId = sessionStorage.getItem('analytics_session_id');
        await axios.post(`${API_BASE_URL}/analytics/log`, {
          action: 'JavaScript Error',
          sessionId,
          currentPage: location.pathname,
          requestBody: { reason },
        });
      } catch (err) {
        // Silently ignore
      }
    };

    window.addEventListener('error', handleJsErrors);
    window.addEventListener('unhandledrejection', handleRejections);

    return () => {
      window.removeEventListener('error', handleJsErrors);
      window.removeEventListener('unhandledrejection', handleRejections);
    };
  }, [location]);
};
