import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldAlert, Sparkles, KeyRound, Mail, User as UserIcon, Lock, CheckCircle } from 'lucide-react';
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

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Base input utility classes to avoid specificity issues with horizontal padding overrides
  const inputClass = "w-full bg-[#0D0D1A] border border-[#2A2A3D] text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] transition-all duration-200 text-sm py-3 pr-4 pl-10 rounded-xl";

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs animate-fade-in cursor-pointer"
    >
      <div className="relative w-full max-w-md overflow-hidden bg-[#15152E] border border-[#2A2A3D] rounded-2xl shadow-xl transition-all duration-300 cursor-default">
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-[#38BDF8]/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 -ml-8 -mb-8 bg-[#00D68F]/5 rounded-full blur-2xl"></div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[#2A2A3D]">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#38BDF8]" />
            <h3 className="text-lg font-black uppercase text-white tracking-tight">
              {mode === 'login' && 'Access Campus Hub'}
              {mode === 'register' && 'Create Account'}
              {mode === 'forgot' && 'Forgot Password'}
              {mode === 'reset' && 'Reset Password'}
            </h3>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center space-x-2 p-3 text-xs font-black text-white bg-[#EF4444] border border-[#EF4444] rounded-xl">
              <ShieldAlert className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center space-x-2 p-3 text-xs font-black text-black bg-[#00D68F] border border-[#00D68F] rounded-xl">
              <CheckCircle className="w-4.5 h-4.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Registration fields */}
          {mode === 'register' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 z-10">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya Sharma"
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-wider">Email ID</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 z-10">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. priya@campus.edu"
                className={inputClass}
              />
            </div>
          </div>

          {/* OTP field for Reset screen */}
          {mode === 'reset' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-wider">Verification OTP Code</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 z-10">
                  <KeyRound className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className={`${inputClass} font-bold tracking-widest text-center`}
                />
              </div>
            </div>
          )}

          {/* Password field (for Register, Login, Reset screens) */}
          {mode !== 'forgot' && (
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-wider">
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
                    className="text-[10px] text-[#38BDF8] hover:underline font-black uppercase tracking-wider"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 z-10">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00D68F] border border-[#00D68F] hover:border-white text-black rounded-xl font-black text-xs transition duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-blue active:scale-95 flex items-center justify-center"
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
              <span className="text-slate-400 font-semibold">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-[#38BDF8] font-black hover:underline"
                >
                  Register
                </button>
              </span>
            )}
            {mode === 'register' && (
              <span className="text-slate-400 font-semibold">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                    setSuccess('');
                  }}
                  className="text-[#38BDF8] font-black hover:underline"
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
                className="text-slate-400 font-semibold hover:text-[#38BDF8] hover:underline"
              >
                Back to Login
              </button>
            )}
          </div>

          {/* Third Party Social Logins */}
          {(mode === 'login' || mode === 'register') && (
            <>
              <div className="relative flex items-center justify-center my-6">
                <span className="absolute px-3 bg-[#15152E] text-[10px] text-slate-400 font-black tracking-wider uppercase">
                  OR USE OPTIONS BELOW
                </span>
                <div className="w-full border-t border-[#2A2A3D]"></div>
              </div>

              {/* Google login component */}
              <div className="flex justify-center w-full my-2">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Login Failed')}
                  useOneTap
                  theme="outline"
                  shape="pill"
                />
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
