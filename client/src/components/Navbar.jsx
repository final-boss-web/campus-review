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
      fetchNotifications();
    },
    (newPlace) => {
      fetchNotifications();
    },
    (newScam) => {
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
    <nav className="sticky top-4 z-40 max-w-7xl mx-auto px-4">
      <div className="px-5 h-16 flex items-center justify-between rounded-2xl border border-[#2A2A3D] bg-[#15152E] shadow-xl shadow-black/10 transition-all duration-200">
        {/* Logo */}
        <div className="flex-1 flex justify-start items-center">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-[#00D68F] to-[#38BDF8] text-black font-extrabold text-xl border border-[#2A2A3D] shadow-[2px_2px_0px_#000000] hover:scale-105 hover:rotate-3 transition duration-200">
              C
            </span>
            <span className="font-bold text-xl tracking-tight hidden sm:block text-white">
              Campus<span className="gradient-text-neon font-black">Review</span>
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
                className={`px-4 py-1.5 rounded-xl text-xs font-black transition duration-150 border ${
                  active
                    ? 'text-[#38BDF8] border-[#38BDF8] bg-[#38BDF8]/5'
                    : 'text-white border-transparent hover:text-[#38BDF8] hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            );
          })}

          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`px-4 py-1.5 rounded-xl text-xs font-black flex items-center space-x-1.5 transition duration-150 border ${
                location.pathname === '/admin'
                  ? 'text-[#EF4444] border-[#EF4444] bg-[#EF4444]/5'
                  : 'text-white border-transparent hover:text-[#EF4444] hover:bg-white/5'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Admin Panel</span>
            </Link>
          )}
        </div>

        {/* Action Buttons (Right) */}
        <div className="flex-1 flex justify-end items-center space-x-3">
          {/* Notifications Dropdown */}
          {isAuthenticated && (
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2.5 rounded-xl text-white hover:bg-white/10 transition-colors border border-transparent"
              >
                <Bell className="w-4.5 h-4.5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#EF4444] text-white rounded-full flex items-center justify-center text-[9px] font-black border border-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-[#15152E] border border-[#2A2A3D] rounded-2xl shadow-xl shadow-black/20 overflow-hidden z-50">
                  <div className="flex items-center justify-between p-4 pb-3 border-b border-[#2A2A3D]">
                    <span className="font-bold text-sm text-white">Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs font-black text-[#38BDF8] hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400 font-medium">
                        All caught up! No notifications.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif._id}
                          onClick={() => {
                            markRead(notif._id);
                            if (notif.placeId) {
                              navigate(`/place/${notif.placeType}/${notif.placeId}`);
                            } else if (notif.type === 'scam_verified') {
                              navigate('/scams');
                            }
                            setNotificationsOpen(false);
                          }}
                          className={`p-3.5 border-b border-[#2A2A3D] flex items-start space-x-3 cursor-pointer transition ${
                            notif.isRead
                              ? 'bg-transparent hover:bg-white/5'
                              : 'bg-[#EF4444]/10 hover:bg-[#EF4444]/20'
                          }`}
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {notif.type === 'scam_verified' ? (
                              <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
                            ) : notif.type === 'review_approval' ? (
                              <CheckCircle className="w-4 h-4 text-[#00D68F]" />
                            ) : (
                              <BookOpen className="w-4 h-4 text-[#38BDF8]" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="text-xs text-white font-semibold leading-relaxed">
                              {notif.message}
                            </p>
                            <span className="text-[10px] text-slate-400 block mt-1 font-bold">
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
            <div className="flex items-center space-x-1 sm:space-x-2">
              <Link
                to={`/profile/${user.id}`}
                className="flex items-center space-x-2 p-1 pr-3 rounded-xl border border-[#2A2A3D] bg-[#0D0D1A] hover:bg-white/5 transition"
              >
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(user.name)}`}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#2A2A3D]"
                />
                <span className="text-xs font-black max-w-[80px] truncate hidden sm:inline-block text-white">
                  {user.name.split(' ')[0]}
                </span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2.5 rounded-xl text-white hover:text-[#EF4444] hover:bg-white/5 transition"
                title="Sign Out"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => dispatch(openLoginModal())}
              className="py-2 px-5 rounded-xl text-xs font-black text-black bg-[#00D68F] border border-[#00D68F] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#FFFFFF] transition duration-150"
            >
              Sign In
            </button>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl text-white hover:bg-white/10 md:hidden transition border border-transparent"
          >
            {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 border border-[#2A2A3D] px-4 pt-2 pb-4 space-y-1 rounded-2xl bg-[#15152E] shadow-xl z-50 relative">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-black text-white hover:bg-white/5 hover:text-[#38BDF8]"
            >
              {link.name}
            </Link>
          ))}
          {isAuthenticated && user?.role === 'admin' && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-xl text-sm font-black text-[#EF4444] hover:bg-[#EF4444]/10"
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
