import React, { useEffect, lazy, Suspense } from 'react';
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

// Pages
// Pages loaded dynamically to optimize initial bundle size
const Home = lazy(() => import('./pages/Home.jsx'));
const Search = lazy(() => import('./pages/Search.jsx'));
const PlaceDetail = lazy(() => import('./pages/PlaceDetail.jsx'));
const ScamAlerts = lazy(() => import('./pages/ScamAlerts.jsx'));
const Profile = lazy(() => import('./pages/Profile.jsx'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard.jsx'));
const Login = lazy(() => import('./pages/Login.jsx'));
const Register = lazy(() => import('./pages/Register.jsx'));
const VerifyRegistration = lazy(() => import('./pages/VerifyRegistration.jsx'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'));
const Contact = lazy(() => import('./pages/Contact.jsx'));
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

  // Force dark theme on first boot
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.add('dark');
    document.body.classList.add('dark');
    localStorage.setItem('color-theme', 'dark');
  }, []);


  return (
    <Router>
      <ScrollToTop />
      <ActivityTrackerTrigger />
      <div className="min-h-screen flex flex-col justify-between bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-900 font-sans transition-colors duration-300">
        <div>

          <Navbar />
          <main className="max-w-7xl mx-auto px-0 sm:px-4 lg:px-0">
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[50vh] text-[#38BDF8]">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-10 h-10 border-4 border-[#38BDF8] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-[10px] tracking-widest uppercase font-black animate-pulse">Loading Page...</span>
                </div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<Search />} />
                <Route path="/place/:type/:id" element={<PlaceDetail />} />
                <Route path="/scams" element={<ScamAlerts />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/verify-registration" element={<VerifyRegistration />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
              </Routes>
            </Suspense>
          </main>
        </div>
        <Footer />
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
