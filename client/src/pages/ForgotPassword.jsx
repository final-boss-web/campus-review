import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, Sparkles, KeyRound, Mail, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api.js';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Steps: 'email', 'otp', 'password'
  const [step, setStep] = useState('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setSuccess(data.message || 'OTP verification code has been sent to your email.');
      setStep('otp');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to send verification code. Please check the email.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-reset-otp', { email, otp });
      setSuccess(data.message || 'OTP verified! Please enter your new password.');
      setStep('password');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Invalid OTP code. Please check and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/reset-password', { email, password });
      setSuccess(data.message || 'Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResending(true);
    try {
      const { data } = await api.post('/auth/resend-otp', { email, type: 'forgot' });
      setSuccess(data.message || 'Verification code resent successfully!');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to resend verification code.');
    } finally {
      setResending(false);
    }
  };

  const inputClass = "w-full bg-[#0D0D1A] border border-[#2A2A3D] text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8] focus:ring-1 focus:ring-[#38BDF8] transition-all duration-200 text-sm py-3 pr-4 pl-10 rounded-xl";

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center px-4 py-12 relative bg-[#0D0D1A]">
      <div className="absolute top-20 left-10 w-[300px] h-[300px] radial-glow-purple rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-[300px] h-[300px] radial-glow-blue rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md overflow-hidden bg-[#15152E] border border-[#2A2A3D] rounded-2xl shadow-xl transition-all duration-300 relative">
        {/* Decorative glows */}
        <div className="absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-[#38BDF8]/5 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 -ml-8 -mb-8 bg-[#00D68F]/5 rounded-full blur-2xl"></div>

        {/* Back Link */}
        <div className="p-4 pb-0">
          <Link to="/login" className="inline-flex items-center text-xs text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Login
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[#2A2A3D]">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#38BDF8]" />
            <h3 className="text-lg font-black uppercase text-white tracking-tight">
              Reset Password
            </h3>
          </div>
        </div>

        {/* Step 1: Input Email */}
        {step === 'email' && (
          <form onSubmit={handleEmailSubmit} className="p-6 space-y-4">
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Enter your registered email address below. We'll send you a 6-digit OTP code to verify your identity.
            </p>

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

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-wider">Email Address</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00D68F] border border-[#00D68F] hover:border-white text-black rounded-xl font-black text-xs transition duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-blue active:scale-95 flex items-center justify-center cursor-pointer"
            >
              {loading ? 'Sending Code...' : 'Send OTP Verification Code'}
            </button>
          </form>
        )}

        {/* Step 2: Input OTP */}
        {step === 'otp' && (
          <form onSubmit={handleOtpVerify} className="p-6 space-y-4">
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              We have sent a 6-digit verification code to <strong className="text-white">{email}</strong>. Please enter it below.
            </p>

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
                  placeholder="Enter 6-digit OTP code"
                  className={`${inputClass} text-center tracking-widest font-black text-base`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00D68F] border border-[#00D68F] hover:border-white text-black rounded-xl font-black text-xs transition duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-blue active:scale-95 flex items-center justify-center cursor-pointer"
            >
              {loading ? 'Verifying OTP...' : 'Verify OTP Code'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                disabled={resending}
                onClick={handleResend}
                className="text-xs text-[#38BDF8] hover:underline font-black uppercase tracking-wider disabled:text-slate-500 cursor-pointer"
              >
                {resending ? 'Resending...' : 'Resend Verification Code'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: Input New Password */}
        {step === 'password' && (
          <form onSubmit={handlePasswordReset} className="p-6 space-y-4">
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Your identity has been verified! Please enter your new password below.
            </p>

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

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-wider">New Password</label>
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

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#00D68F] border border-[#00D68F] hover:border-white text-black rounded-xl font-black text-xs transition duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-blue active:scale-95 flex items-center justify-center cursor-pointer"
            >
              {loading ? 'Updating Password...' : 'Reset Password & Save'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
