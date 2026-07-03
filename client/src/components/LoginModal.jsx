import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { X, ShieldAlert, Sparkles, KeyRound, Mail, User as UserIcon, Lock, CheckCircle } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { closeLoginModal, setUser } from '../store/authSlice.js';
import api from '../services/api.js';

export const LoginModal = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.auth.isLoginModalOpen);
  
  // Forms states
  const [mode, setMode] = useState('login'); // 'login', 'register', 'forgot', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleSuccess = async (googleResponse) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
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

  const handleDemoLogin = async (role) => {
    setLoading(true);
    setError('');
    setSuccess('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (mode === 'login') {
        const { data } = await api.post('/auth/login', { email, password });
        dispatch(setUser(data.user));
        dispatch(closeLoginModal());
      } else if (mode === 'register') {
        const { data } = await api.post('/auth/register', { name, email, password });
        dispatch(setUser(data.user));
        dispatch(closeLoginModal());
      } else if (mode === 'forgot') {
        const { data } = await api.post('/auth/forgot-password', { email });
        setSuccess(data.message || 'OTP sent successfully!');
        setMode('reset');
      } else if (mode === 'reset') {
        const { data } = await api.post('/auth/reset-password', { email, otp, password });
        setSuccess(data.message || 'Password reset successfully!');
        setMode('login');
        setPassword('');
        setOtp('');
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    dispatch(closeLoginModal());
    // Reset form states
    setMode('login');
    setEmail('');
    setPassword('');
    setName('');
    setOtp('');
    setError('');
    setSuccess('');
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
              {mode === 'login' && 'Access Campus Hub'}
              {mode === 'register' && 'Create Account'}
              {mode === 'forgot' && 'Forgot Password'}
              {mode === 'reset' && 'Reset Password'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 p-3 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-xl">
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 p-3 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/20 border border-green-250 rounded-xl">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Registration fields */}
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500">Email ID</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. priya@campus.edu"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* OTP field for Reset screen */}
          {mode === 'reset' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500">Verification OTP Code</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none font-bold tracking-widest text-center"
                />
              </div>
            </div>
          )}

          {/* Password field (for Register, Login, Reset screens) */}
          {mode !== 'forgot' && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs font-semibold text-slate-500">
                  {mode === 'reset' ? 'New Password' : 'Password'}
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setSuccess('');
                    }}
                    className="text-[11px] text-brand-600 hover:underline font-bold"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyber-purple to-brand-600 text-white rounded-xl font-bold text-xs transition duration-200 hover:opacity-95 shadow-md shadow-brand-500/10"
          >
            {loading ? 'Processing...' : (
              mode === 'login' ? 'Sign In' :
              mode === 'register' ? 'Register Account' :
              mode === 'forgot' ? 'Send OTP Verification Code' :
              'Reset Password & Login'
            )}
          </button>

          {/* Mode Switcher links */}
          <div className="text-center text-xs pt-1">
            {mode === 'login' && (
              <span className="text-slate-500">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-brand-600 font-bold hover:underline"
                >
                  Register
                </button>
              </span>
            )}
            {mode === 'register' && (
              <span className="text-slate-500">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-brand-600 font-bold hover:underline"
                >
                  Login
                </button>
              </span>
            )}
            {(mode === 'forgot' || mode === 'reset') && (
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError('');
                  setSuccess('');
                }}
                className="text-slate-400 font-semibold hover:text-slate-600 dark:hover:text-slate-200 hover:underline"
              >
                Back to Login
              </button>
            )}
          </div>

          {/* Third Party Social and Demo Logins */}
          {(mode === 'login' || mode === 'register') && (
            <>
              <div className="relative flex items-center justify-center my-6">
                <span className="absolute px-3 bg-white dark:bg-slate-900 text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wider">
                  OR USE OPTIONS BELOW
                </span>
                <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
              </div>

              {/* Google login component */}
              <div className="flex justify-center w-full my-2">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Login Failed')}
                  useOneTap
                  theme="filled_blue"
                  shape="pill"
                />
              </div>

              {/* Demo Quick Logins */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('student')}
                  disabled={loading}
                  className="py-2.5 px-4 text-[10px] font-bold rounded-xl text-brand-700 bg-brand-50 dark:text-brand-300 dark:bg-brand-950/30 border border-brand-200/50 dark:border-brand-900/30 hover:bg-brand-100 transition duration-200"
                >
                  Demo Student
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={loading}
                  className="py-2.5 px-4 text-[10px] font-bold rounded-xl text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950/30 border border-indigo-200/50 dark:border-indigo-900/30 hover:bg-indigo-100 transition duration-200"
                >
                  Demo Admin
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
