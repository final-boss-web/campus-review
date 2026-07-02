import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Sun,
  Moon,
  Bell,
  Menu,
  X,
  LogOut,
  User,
  Shield,
  AlertTriangle,
  BookOpen,
  CheckCircle,
} from 'lucide-react';
import { toggleTheme } from '../store/themeSlice.js';
import { openLoginModal, logoutUser, setUser } from '../store/authSlice.js';
import api from '../services/api.js';
import useSocket from '../hooks/useSocket.js';

export const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const themeMode = useSelector((state) => state.theme.mode);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications initially
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const { data } = await api.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  // Listen to live socket notifications
  useSocket(
    (newNotif) => {
      // Audio or toast alert can be played here
      fetchNotifications();
    },
    (newPlace) => {
      // New hostel/mess/shop added
      fetchNotifications();
    },
    (newScam) => {
      // Verified scam alert
      fetchNotifications();
    }
  );

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(
        notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      dispatch(logoutUser());
      navigate('/');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const navLinks = [
    { name: 'Browse Listings', path: '/' },
    { name: 'Scam Feed', path: '/scams' },
  ];

  return (
    <nav className="sticky top-3 z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between rounded-2xl border border-slate-200/50 dark:border-slate-800/40 glass-effect shadow-lg">
        {/* Logo */}
        <div className="flex-1 flex justify-start items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-cyber-purple to-cyber-blue text-white font-black text-lg shadow-md hover:scale-105 hover:rotate-3 transition duration-200">
              C
            </span>
            <span className="font-extrabold text-xl tracking-tight hidden sm:block">
              Campus<span className="gradient-text-neon bg-gradient-to-r from-cyber-purple to-cyber-blue">Review</span>
            </span>
          </Link>
        </div>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex justify-center items-center space-x-2">
          {navLinks.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition duration-200 ${
                  active
                    ? 'text-cyber-purple dark:text-cyber-cyan bg-slate-100 dark:bg-slate-800/50 font-bold shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-cyber-purple dark:hover:text-cyber-cyan hover:bg-slate-50 dark:hover:bg-slate-800/30'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`px-4 py-2 rounded-xl text-sm font-semibold flex items-center space-x-1.5 transition duration-200 ${
                location.pathname === '/admin'
                  ? 'text-cyber-pink bg-red-50 dark:bg-red-950/20 font-bold shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-cyber-pink hover:bg-red-50/50 dark:hover:bg-red-950/10'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin Panel</span>
            </Link>
          )}
        </div>

        {/* Action Buttons (Right) */}
        <div className="flex-1 flex justify-end items-center space-x-2 sm:space-x-4">
          {/* Theme Toggle */}
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Toggle theme"
          >
            {themeMode === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-500" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-cyber-pink text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden glass-effect animate-slide-down">
                  <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                    <span className="font-bold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-cyber-purple dark:text-cyber-cyan hover:underline"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                        No notifications yet.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => markRead(notif._id)}
                          className={`p-3 border-b border-slate-50 dark:border-slate-800/40 flex items-start space-x-3 cursor-pointer transition ${
                            notif.isRead
                              ? 'bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800/20'
                              : 'bg-brand-50/30 dark:bg-brand-950/10 hover:bg-brand-50/50 dark:hover:bg-brand-950/20'
                          }`}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {notif.type === 'scam_verified' ? (
                              <AlertTriangle className="w-4 h-4 text-cyber-pink" />
                            ) : notif.type === 'review_approval' ? (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            ) : (
                              <BookOpen className="w-4 h-4 text-cyber-purple" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1">
                              {new Date(notif.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Profile Dropdown or Login Trigger */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <Link
                to={`/profile/${user.id}`}
                className="flex items-center space-x-2 p-1.5 pr-3 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition"
              >
                <img
                  src={user.avatar || 'https://picsum.photos/150'}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-600"
                />
                <span className="text-xs font-semibold max-w-[80px] truncate hidden sm:inline-block">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl text-slate-500 hover:text-cyber-pink hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => dispatch(openLoginModal())}
              className="py-2 px-4 rounded-xl text-sm font-semibold text-white gradient-bg-neon hover:opacity-90 shadow-md shadow-brand-500/10 transition"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 border border-slate-200/50 dark:border-slate-800/40 px-4 pt-2 pb-4 space-y-1 rounded-2xl bg-white/90 dark:bg-[#0f172a]/95 glass-effect shadow-xl">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              {link.name}
            </Link>
          ))}
          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-xl text-base font-semibold text-cyber-pink hover:bg-red-50 dark:hover:bg-red-950/10"
            >
              Admin Panel
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
