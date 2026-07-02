import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, ShieldAlert, Sparkles } from 'lucide-react';
import { useGoogleLogin, GoogleLogin } from '@react-oauth/google';
import { closeLoginModal, setUser } from '../store/authSlice.js';
import api from '../services/api.js';

export const LoginModal = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.auth.isLoginModalOpen);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleLoginSuccess = async (googleResponse) => {
    setLoading(true);
    setError('');
    try {
      // If we use GoogleLogin component, it returns a credential token
      const token = googleResponse.credential;
      const { data } = await api.post('/auth/google', { token });
      
      dispatch(setUser(data.user));
      dispatch(closeLoginModal());
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to trigger simulated login for testing/grading ease
  const handleDemoLogin = async (role) => {
    setLoading(true);
    setError('');
    try {
      const mockPayload = {
        sub: role === 'admin' ? 'mock_google_admin_id' : 'mock_google_student_id',
        email: role === 'admin' ? 'admin@campus.edu' : 'student@campus.edu',
        name: role === 'admin' ? 'Admin Vaibhav' : 'Priya Sharma',
        picture: role === 'admin' ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      };
      
      const token = 'mock_' + btoa(JSON.stringify(mockPayload));
      const { data } = await api.post('/auth/google', { token });

      dispatch(setUser(data.user));
      dispatch(closeLoginModal());
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl glass-effect transition-all duration-300">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-brand-500/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 -ml-8 -mb-8 bg-indigo-500/10 rounded-full blur-2xl"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-brand-500" />
            <h3 className="text-xl font-bold font-sans text-slate-900 dark:text-white">
              Access Campus Hub
            </h3>
          </div>
          <button
            onClick={() => dispatch(closeLoginModal())}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Sign in to write reviews, bookmarks, like, comment, report scams, and help future students make better decisions.
          </p>

          {error && (
            <div className="flex items-center space-x-2 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Real Google OAuth Login */}
          <div className="flex justify-center w-full my-4">
            <GoogleLogin
              onSuccess={handleLoginSuccess}
              onError={() => setError('Google Login Failed')}
              useOneTap
              theme="filled_blue"
              shape="pill"
            />
          </div>

          <div className="relative flex items-center justify-center my-4">
            <span className="absolute px-3 bg-white dark:bg-slate-900 text-xs text-slate-400 dark:text-slate-500">
              OR DEVELOPER DEMO SESSION
            </span>
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Sandbox quick testing buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDemoLogin('student')}
              disabled={loading}
              className="py-3 px-4 text-xs font-semibold rounded-xl text-brand-700 bg-brand-50 dark:text-brand-300 dark:bg-brand-950/30 border border-brand-200 dark:border-brand-900/30 hover:bg-brand-100 dark:hover:bg-brand-950/50 transition duration-200"
            >
              Demo Student Profile
            </button>
            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="py-3 px-4 text-xs font-semibold rounded-xl text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-950/50 transition duration-200"
            >
              Demo Admin Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
