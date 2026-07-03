import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Sparkles, Mail, Lock, User as UserIcon, CheckCircle, ArrowLeft } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { setUser } from '../store/authSlice.js';
import api from '../services/api.js';

export const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async (googleResponse) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const token = googleResponse.credential;
      const { data } = await api.post('/auth/google', { token });
      dispatch(setUser({ user: data.user, token: data.token }));
      navigate('/');
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
      const { data } = await api.post('/auth/register', { name, email, password });
      setSuccess(data.message || 'Registration successful!');
      
      // Redirect to verification screen with email prefilled
      setTimeout(() => {
        navigate(`/verify-registration?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
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
          <Link to="/" className="inline-flex items-center text-xs text-slate-400 hover:text-white transition">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to listings
          </Link>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-[#2A2A3D]">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#38BDF8]" />
            <h3 className="text-lg font-black uppercase text-white tracking-tight">
              Create Account
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

          {/* Full Name field */}
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

          {/* Password field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-wider">Password</label>
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

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#00D68F] border border-[#00D68F] hover:border-white text-black rounded-xl font-black text-xs transition duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-blue active:scale-95 flex items-center justify-center cursor-pointer"
          >
            {loading ? 'Processing...' : 'Register Account'}
          </button>

          {/* Mode Switcher links */}
          <div className="text-center text-xs pt-1">
            <span className="text-slate-400 font-semibold">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#38BDF8] font-black hover:underline"
              >
                Login
              </Link>
            </span>
          </div>

          {/* Third Party Social Logins */}
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
        </form>
      </div>
    </div>
  );
};

export default Register;
