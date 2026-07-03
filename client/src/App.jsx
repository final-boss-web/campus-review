import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sparkles, ShieldAlert, X } from 'lucide-react';

import { store } from './store/index.js';
import { setUser, setLoading } from './store/authSlice.js';
import api from './services/api.js';

// Components & Layouts
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import LoginModal from './components/LoginModal.jsx';

// Pages
import Home from './pages/Home.jsx';
import Search from './pages/Search.jsx';
import PlaceDetail from './pages/PlaceDetail.jsx';
import ScamAlerts from './pages/ScamAlerts.jsx';
import Profile from './pages/Profile.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import { useActivityTracker } from './hooks/useActivityTracker.js';

const queryClient = new QueryClient();

// Helper component to force window scroll to top on every route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

// Activity log tracking trigger rendered within the router context
const ActivityTrackerTrigger = () => {
  useActivityTracker();
  return null;
};

// App contents that need access to Redux hooks
const MainAppContent = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);

  // Check login session on startup
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data } = await api.get('/auth/me');
        if (data.user) {
          dispatch(setUser(data.user));
        } else {
          dispatch(setUser(null));
        }
      } catch (err) {
        console.log('No active session.');
        dispatch(setUser(null));
      } finally {
        dispatch(setLoading(false));
      }
    };
    restoreSession();
  }, [dispatch]);

  // Sync theme on first boot
  useEffect(() => {
    const theme = localStorage.getItem('color-theme') || 'light';
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, []);


  return (
    <Router>
      <ScrollToTop />
      <ActivityTrackerTrigger />
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
        <div>

          <Navbar />
          <main className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/search" element={<Search />} />
              <Route path="/place/:type/:id" element={<PlaceDetail />} />
              <Route path="/scams" element={<ScamAlerts />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </main>
        </div>
        <Footer />
        <LoginModal />
      </div>
    </Router>
  );
};

export const App = () => {
  // Config Google Client ID. Defaults to a standard sandbox string.
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'your_google_client_id.apps.googleusercontent.com';

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <MainAppContent />
        </QueryClientProvider>
      </Provider>
    </GoogleOAuthProvider>
  );
};

export default App;
