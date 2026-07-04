import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import {
  Shield,
  Users,
  MessageSquare,
  Home as HomeIcon,
  AlertTriangle,
  Image as ImageIcon,
  CheckCircle,
  XCircle,
  Trash2,
  TrendingUp,
  Award,
  ArrowLeft,
  Calendar,
  Download,
  Activity,
  Globe,
  Monitor,
  ShieldAlert,
  Clock,
  ArrowRight,
  Eye,
  FileText,
  Mail
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  CartesianGrid,
  Legend
} from 'recharts';
import api from '../services/api.js';

export const AdminDashboard = () => {
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  // Admin access validation
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        navigate('/');
      }
    }
  }, [user, authLoading, navigate]);

  // Dashboard Stats States (Moderation)
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  // Analytics Dashboard States
  const [analyticsData, setAnalyticsData] = useState(null);
  const [analyticsRange, setAnalyticsRange] = useState('7d');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Management Lists
  const [unapprovedPlaces, setUnapprovedPlaces] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [scamReports, setScamReports] = useState([]);
  const [flaggedReviews, setFlaggedReviews] = useState([]);
  const [supportTickets, setSupportTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Activity Log States
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [selectedUserForActivity, setSelectedUserForActivity] = useState(null);
  const [userActivityLogs, setUserActivityLogs] = useState([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [activityActionFilter, setActivityActionFilter] = useState('');

  // Scam details Modal states
  const [isScamModalOpen, setIsScamModalOpen] = useState(false);
  const [selectedScam, setSelectedScam] = useState(null);

  useEffect(() => {
    if (!authLoading && user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [authLoading, user]);

  // Fetch stats when filter changes
  useEffect(() => {
    if (!authLoading && user && user.role === 'admin' && analyticsRange !== 'custom') {
      fetchAnalyticsData(analyticsRange);
    }
  }, [analyticsRange, authLoading, user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch main dashboard analytics
      const { data } = await api.get('/analytics/dashboard');
      setStats(data);

      // 2. Fetch unapproved places and support tickets
      const [hRes, mRes, sRes, uRes, scRes, rRes, supRes] = await Promise.all([
        api.get('/places?type=Hostel&approvedOnly=false'),
        api.get('/places?type=Mess&approvedOnly=false'),
        api.get('/places?type=Shop&approvedOnly=false'),
        api.get('/users'), // admin route
        api.get('/scams'),
        api.get('/reviews/flagged'),
        api.get('/support'),
      ]);

      const combinedUnapproved = [
        ...hRes.data.map((x) => ({ ...x, type: 'Hostel' })),
        ...mRes.data.map((x) => ({ ...x, type: 'Mess' })),
        ...sRes.data.map((x) => ({ ...x, type: 'Shop' })),
      ].filter((place) => !place.approved);

      setUnapprovedPlaces(combinedUnapproved);
      setAllUsers(uRes.data);
      setScamReports(scRes.data);
      setFlaggedReviews(rRes.data);
      setSupportTickets(supRes.data || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyticsData = async (range, start = '', end = '') => {
    setAnalyticsLoading(true);
    try {
      const params = { range };
      if (range === 'custom') {
        params.startDate = start;
        params.endDate = end;
      }
      const { data } = await api.get('/analytics/dashboard', { params });
      setAnalyticsData(data);
    } catch (err) {
      console.error('Error fetching analytics dashboard stats:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleApplyCustomFilter = () => {
    if (!customStartDate || !customEndDate) {
      alert('Please select both start and end dates.');
      return;
    }
    fetchAnalyticsData('custom', customStartDate, customEndDate);
  };

  const handleExport = async (format) => {
    try {
      const { data } = await api.get('/analytics/export');
      if (!data || data.length === 0) {
        alert('No audit logs available to export.');
        return;
      }

      const headers = ['Timestamp', 'Session ID', 'Username', 'Full Name', 'Action', 'IP', 'Country', 'Region/State', 'City', 'Browser', 'OS', 'Page', 'Status', 'Response Time (ms)'];
      const rows = data.map(log => [
        new Date(log.timestamp).toLocaleString(),
        log.sessionId || 'Guest Session',
        log.username || 'Guest',
        log.fullName || 'Guest',
        log.action,
        log.ip || '',
        log.country || '',
        log.state || '',
        log.city || '',
        log.browser || '',
        log.os || '',
        log.currentPage || '',
        log.responseStatus || '',
        log.responseTime || ''
      ]);

      if (format === 'csv') {
        const csvContent = [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `activity_logs_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
      } else if (format === 'excel') {
        let tabContent = '<table><thead><tr>' + headers.map(h => `<th>${h}</th>`).join('') + '</tr></thead><tbody>';
        rows.forEach(r => {
          tabContent += '<tr>' + r.map(val => `<td>${val}</td>`).join('') + '</tr>';
        });
        tabContent += '</tbody></table>';
        const blob = new Blob([tabContent], { type: 'application/vnd.ms-excel' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `activity_logs_${new Date().toISOString().slice(0, 10)}.xls`;
        link.click();
      }
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to export activity logs.');
    }
  };

  const handlePrintPDF = () => {
    window.print();
  };

  const handleApproveListing = async (type, id) => {
    try {
      await api.put(`/places/${type}/${id}/approve`);
      setUnapprovedPlaces(unapprovedPlaces.filter((p) => p._id !== id));
      alert('Listing approved and published successfully.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteListing = async (type, id) => {
    if (!window.confirm('Delete listing?')) return;
    try {
      await api.delete(`/places/${type}/${id}`);
      setUnapprovedPlaces(unapprovedPlaces.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBanUser = async (userId) => {
    try {
      const { data } = await api.put(`/users/ban/${userId}`);
      setAllUsers(
        allUsers.map((u) => (u._id === userId ? { ...u, status: data.user.status } : u))
      );
      alert(data.message);
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewActivityLogs = async (user) => {
    setSelectedUserForActivity(user);
    setIsActivityModalOpen(true);
    setActivityLoading(true);
    setUserActivityLogs([]);
    setActivityActionFilter('');
    try {
      const { data } = await api.get(`/analytics/logs?userId=${user._id}`);
      setUserActivityLogs(data);
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    } finally {
      setActivityLoading(false);
    }
  };

  const handleVerifyScam = async (scamId) => {
    try {
      await api.put(`/scams/${scamId}/verify`);
      setScamReports(
        scamReports.map((sc) => (sc._id === scamId ? { ...sc, isVerifiedScam: true } : sc))
      );
      alert('Scam report marked as VERIFIED SCAM.');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteScam = async (scamId) => {
    if (!window.confirm('Delete scam report?')) return;
    try {
      await api.delete(`/scams/${scamId}`);
      setScamReports(scamReports.filter((sc) => sc._id !== scamId));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this flagged review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      setFlaggedReviews(flaggedReviews.filter((r) => r._id !== reviewId));
      alert('Review deleted successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete review.');
    }
  };

  const handleToggleReadTicket = async (ticketId) => {
    try {
      const { data } = await api.put(`/support/${ticketId}/read`);
      setSupportTickets(
        supportTickets.map((t) => (t._id === ticketId ? { ...t, isRead: data.ticket.isRead } : t))
      );
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket({ ...selectedTicket, isRead: data.ticket.isRead });
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update ticket read status.');
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to delete this support ticket?')) return;
    try {
      await api.delete(`/support/${ticketId}`);
      setSupportTickets(supportTickets.filter((t) => t._id !== ticketId));
      if (selectedTicket && selectedTicket._id === ticketId) {
        setSelectedTicket(null);
      }
      alert('Support ticket deleted successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to delete support ticket.');
    }
  };

  if (loading || !stats) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center animate-pulse space-y-6">
        <div className="h-8 bg-[#15152E] border border-[#2A2A3D] rounded w-1/4 mx-auto"></div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[#15152E] border border-[#2A2A3D] rounded-3xl"></div>
          ))}
        </div>
      </div>
    );
  }

  // Color palettes for Recharts
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  // Processing Trend Data
  const trendDates = Array.from(new Set([
    ...(analyticsData?.trends?.visitorTrend?.map(x => x._id) || []),
    ...(analyticsData?.trends?.userGrowth?.map(x => x._id) || [])
  ])).sort();

  const trendChartData = trendDates.map(date => {
    const visitorData = analyticsData?.trends?.visitorTrend?.find(x => x._id === date);
    const userData = analyticsData?.trends?.userGrowth?.find(x => x._id === date);
    return {
      date: date.substring(5), // MM-DD for cleaner X-Axis labels
      'Unique Visitors': visitorData ? visitorData.visitors : 0,
      'New Signups': userData ? userData.registrations : 0
    };
  });

  const reviewsTrendData = (analyticsData?.trends?.reviewsTrend || []).map(x => ({
    date: x._id.substring(5),
    Reviews: x.reviews
  }));

  const browserPieData = (analyticsData?.breakdowns?.topBrowsers || []).map(x => ({
    name: x._id || 'Other',
    value: x.count
  }));

  const devicePieData = (analyticsData?.breakdowns?.topDevices || []).map(x => ({
    name: x._id || 'Other',
    value: x.count
  }));

  const countryPieData = (analyticsData?.breakdowns?.countries || []).map(x => ({
    name: x._id || 'Other',
    value: x.count
  }));

  const overviewCards = [
    { label: 'Total Members', val: stats.cards.totalUsers, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Total Reviews', val: stats.cards.totalReviews, icon: MessageSquare, color: 'text-indigo-500 bg-indigo-500/10' },
    { label: 'Total Listings', val: stats.cards.totalHostels + stats.cards.totalShops + stats.cards.totalMesses, icon: HomeIcon, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Scam Reports', val: stats.cards.totalScamReports, icon: AlertTriangle, color: 'text-red-500 bg-red-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 pb-20">
      <div className="flex justify-start print:hidden">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-black text-slate-500 hover:text-cyber-purple dark:text-slate-400 dark:hover:text-cyber-cyan transition-all duration-200 bg-[#15152E] px-4 py-2.5 rounded-xl border border-[#2A2A3D] shadow-sm hover:border-white transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>
      
      {/* Title */}
      <div className="flex items-center space-x-3 border-b border-[#2A2A3D] pb-4">
        <Shield className="w-8 h-8 text-indigo-600" />
        <div>
          <h1 className="text-3xl font-black tracking-tight font-sans">Administrator Dashboard</h1>
          <p className="text-xs text-slate-400">Moderation center for listing approvals, scam verification, and community activity</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#2A2A3D] gap-6 overflow-x-auto print:hidden">
        {['Overview', 'Analytics Dashboard', 'Approve Listings', 'Moderate Scams', 'User Accounts', 'Moderate Reviews', 'Support Tickets'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-xs font-bold transition-all relative flex-shrink-0 ${
              activeTab === tab
                ? 'text-[#38BDF8] border-b-2 border-[#38BDF8]'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 1. OVERVIEW TAB */}
      {activeTab === 'Overview' && (
        <div className="space-y-8 animate-fade-in">
          {/* Counters Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {overviewCards.map((card) => (
              <div
                key={card.label}
                className="bg-[#15152E] border border-[#2A2A3D] p-6 rounded-3xl flex items-center justify-between shadow-sm"
              >
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400">{card.label}</span>
                  <p className="text-2xl font-black">{card.val}</p>
                </div>
                <div className={`p-3.5 rounded-2xl ${card.color}`}>
                  <card.icon className="w-6 h-6" />
                </div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-[#15152E] border border-[#2A2A3D] p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold font-sans">Highest Rated Places</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.charts?.highestRatedHostels?.map((h) => ({ name: h.name.substring(0, 12) + '...', Rating: h.averageRating })) || []}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                    <Bar dataKey="Rating" fill="#4d70ff" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#15152E] border border-[#2A2A3D] p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="text-sm font-bold font-sans">Most Active Reviewers (Reviews written)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.charts?.activeStudents?.map((s) => ({ name: s.name.split(' ')[0], Reviews: s.count })) || []}>
                    <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                    <Bar dataKey="Reviews" fill="#4f46e5" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ANALYTICS DASHBOARD TAB */}
      {activeTab === 'Analytics Dashboard' && (
        <div className="space-y-8 animate-fade-in">
          
          {/* Dashboard Control Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#15152E] border border-[#2A2A3D] p-6 rounded-3xl shadow-sm print:hidden">
            
            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: 'Today', value: 'today' },
                { label: 'Yesterday', value: 'yesterday' },
                { label: '7 Days', value: '7d' },
                { label: '30 Days', value: '30d' },
                { label: '90 Days', value: '90d' },
                { label: 'Custom', value: 'custom' },
              ].map((btn) => (
                <button
                  key={btn.value}
                  onClick={() => setAnalyticsRange(btn.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border ${
                    analyticsRange === btn.value
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-500/10'
                      : 'bg-[#0D0D1A] border-[#2A2A3D] text-slate-300 hover:border-white hover:bg-[#15152E]'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Custom Dates inputs */}
            {analyticsRange === 'custom' && (
              <div className="flex flex-wrap items-center gap-2 border-l border-[#2A2A3D] pl-4 py-1">
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-[#0D0D1A] border border-[#2A2A3D] px-3 py-1 text-xs rounded-xl focus:outline-none"
                />
                <span className="text-slate-400 text-xs">to</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-[#0D0D1A] border border-[#2A2A3D] px-3 py-1 text-xs rounded-xl focus:outline-none"
                />
                <button
                  onClick={handleApplyCustomFilter}
                  className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition duration-200"
                >
                  Apply
                </button>
              </div>
            )}

            {/* Exports controls */}
            <div className="flex items-center gap-2 self-stretch md:self-auto border-t md:border-t-0 md:border-l border-[#2A2A3D] pt-4 md:pt-0 pl-0 md:pl-4">
              <button
                onClick={() => handleExport('csv')}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#0D0D1A] border border-[#2A2A3D] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:border-white transition"
                title="Export CSV"
              >
                <Download className="w-3.5 h-3.5 text-slate-400" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => handleExport('excel')}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#0D0D1A] border border-[#2A2A3D] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:border-white transition"
                title="Export Excel"
              >
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                <span>Excel</span>
              </button>
              <button
                onClick={handlePrintPDF}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-[#0D0D1A] border border-[#2A2A3D] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:border-white transition"
                title="Print Dashboard or Save to PDF"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>PDF / Print</span>
              </button>
            </div>
          </div>

          {analyticsLoading || !analyticsData ? (
            <div className="p-20 text-center animate-pulse text-xs text-slate-400">
              Gathering activity aggregates and rendering live charts...
            </div>
          ) : (
            <>
              {/* Metric Cards Row */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                {[
                  { label: 'Active Users', val: analyticsData.cards.activeUsers, cap: 'In Date Filter', icon: Users, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20' },
                  { label: 'Live Visitors', val: analyticsData.cards.onlineUsers, cap: 'Last 5 Minutes', icon: Activity, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' },
                  { label: 'Today\'s Users', val: analyticsData.cards.todayUsers, cap: 'Unique Pings', icon: Clock, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/20' },
                  { label: 'Weekly Users', val: analyticsData.cards.weeklyUsers, cap: 'Last 7 Days', icon: Calendar, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' },
                  { label: 'Monthly Users', val: analyticsData.cards.monthlyUsers, cap: 'Last 30 Days', icon: Calendar, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/20' },
                  { label: 'Reviews Today', val: analyticsData.cards.reviewsToday, cap: 'New reviews', icon: MessageSquare, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20' },
                ].map((card, idx) => (
                  <div
                    key={idx}
                    className="bg-[#15152E] border border-[#2A2A3D] p-5 rounded-3xl shadow-sm hover:shadow-md transition-all duration-300 relative group overflow-hidden"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block">{card.label}</span>
                        <span className="text-2xl font-black block">{card.val}</span>
                      </div>
                      <div className={`p-2.5 rounded-xl ${card.color}`}>
                        <card.icon className="w-5 h-5" />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-3 font-medium">{card.cap}</span>
                  </div>
                ))}
              </div>

              {/* Auxiliary cards: Likes, Comments, Uploads, Visitors */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { title: 'Reviews Views & Popularity', val1: analyticsData.cards.totalReviews, cap1: 'Total Reviews', val2: analyticsData.cards.reviewsToday, cap2: 'Reviews Today', icon: MessageSquare, color: 'border-l-4 border-l-brand-600' },
                  { title: 'Interactive Comments Feed', val1: analyticsData.cards.totalComments, cap1: 'Total Comments', val2: analyticsData.cards.commentsToday, cap2: 'Comments Today', icon: MessageSquare, color: 'border-l-4 border-l-blue-500' },
                  { title: 'Helpful Likes Counter', val1: analyticsData.cards.totalLikes, cap1: 'Total Likes', val2: analyticsData.cards.dailyLikes, cap2: 'Likes in Period', icon: Award, color: 'border-l-4 border-l-indigo-500' },
                  { title: 'Image & File Uploads', val1: analyticsData.cards.imagesUploaded, cap1: 'Images in Database', val2: analyticsData.cards.filesUploaded, cap2: 'Upload Logs in Period', icon: ImageIcon, color: 'border-l-4 border-l-emerald-500' },
                ].map((card, idx) => (
                  <div
                    key={idx}
                    className={`bg-[#15152E] border border-[#2A2A3D] p-5 rounded-3xl shadow-sm flex flex-col justify-between ${card.color}`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-50 dark:border-slate-800/60 mb-3">
                      <span className="text-[10px] font-black text-slate-450 uppercase">{card.title}</span>
                      <card.icon className="w-4 h-4 text-slate-350" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">{card.cap1}</span>
                        <span className="text-lg font-black">{card.val1}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 font-medium block">{card.cap2}</span>
                        <span className="text-lg font-black">{card.val2}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Major Charts Rows */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Visitor & Signup Trend Chart */}
                <div className="bg-[#15152E] border border-[#2A2A3D] p-6 rounded-3xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold font-sans">Visitor Traffic & Signup Trend</h3>
                    <span className="text-[10px] bg-[#0D0D1A] border border-[#2A2A3D] px-2 py-0.5 rounded text-slate-400 font-bold">Daily Aggregations</span>
                  </div>
                  <div className="h-72">
                    {trendChartData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">No trend data available for this range.</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendChartData}>
                          <defs>
                            <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="colorSignups" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                          <XAxis dataKey="date" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #e2e8f0' }} />
                          <Legend wrapperStyle={{ fontSize: '11px' }} />
                          <Area type="monotone" dataKey="Unique Visitors" stroke="#4f46e5" fillOpacity={1} fill="url(#colorVisitors)" strokeWidth={2} />
                          <Area type="monotone" dataKey="New Signups" stroke="#10b981" fillOpacity={1} fill="url(#colorSignups)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Reviews Written Trend Chart */}
                <div className="bg-[#15152E] border border-[#2A2A3D] p-6 rounded-3xl shadow-sm space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-bold font-sans">Reviews Written Trend</h3>
                    <span className="text-[10px] bg-[#0D0D1A] border border-[#2A2A3D] px-2 py-0.5 rounded text-slate-400 font-bold">Reviews Count</span>
                  </div>
                  <div className="h-72">
                    {reviewsTrendData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-xs text-slate-400">No reviews created in this date range.</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={reviewsTrendData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:hidden" />
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" className="hidden dark:block" />
                          <XAxis dataKey="date" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={9} tickLine={false} axisLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px', border: '1px solid #e2e8f0' }} />
                          <Bar dataKey="Reviews" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Distributions Row (Browser share and Device Type and Country) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Browser Share */}
                <div className="bg-[#15152E] border border-[#2A2A3D] p-5 rounded-3xl shadow-sm flex flex-col justify-between h-80">
                  <h3 className="text-xs font-black uppercase text-slate-400 mb-2">Browser Distribution</h3>
                  <div className="h-48">
                    {browserPieData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[10px] text-slate-400">No data</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={browserPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={65}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {browserPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Device Distribution */}
                <div className="bg-[#15152E] border border-[#2A2A3D] p-5 rounded-3xl shadow-sm flex flex-col justify-between h-80">
                  <h3 className="text-xs font-black uppercase text-slate-400 mb-2">Device Distribution</h3>
                  <div className="h-48">
                    {devicePieData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[10px] text-slate-400">No data</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={devicePieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={65}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {devicePieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Country Share */}
                <div className="bg-[#15152E] border border-[#2A2A3D] p-5 rounded-3xl shadow-sm flex flex-col justify-between h-80">
                  <h3 className="text-xs font-black uppercase text-slate-400 mb-2">Country Distribution</h3>
                  <div className="h-48">
                    {countryPieData.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-[10px] text-slate-400">No data</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={countryPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={50}
                            outerRadius={65}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {countryPieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>

              {/* Navigation & Search Breakdowns */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Top Visited Pages */}
                <div className="bg-[#15152E] border border-[#2A2A3D] p-6 rounded-3xl shadow-sm">
                  <h3 className="text-xs font-black uppercase text-slate-455 mb-4">Top Visited Pages</h3>
                  <div className="space-y-3">
                    {analyticsData.breakdowns?.topPages?.length === 0 ? (
                      <div className="text-xs text-slate-400 py-4">No records captured.</div>
                    ) : (
                      analyticsData.breakdowns.topPages.map((page, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800/40 pb-2">
                          <span className="text-xs font-bold text-white truncate max-w-[350px]" title={page._id}>
                            {page._id || '/'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                            {page.count} views
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Top Search Keywords */}
                <div className="bg-[#15152E] border border-[#2A2A3D] p-6 rounded-3xl shadow-sm">
                  <h3 className="text-xs font-black uppercase text-slate-455 mb-4">Top Search Queries</h3>
                  <div className="space-y-3">
                    {analyticsData.breakdowns?.topSearchKeywords?.length === 0 ? (
                      <div className="text-xs text-slate-400 py-4">No search keywords found.</div>
                    ) : (
                      analyticsData.breakdowns.topSearchKeywords.map((kw, idx) => (
                        <div key={idx} className="flex justify-between items-center border-b border-slate-50 dark:border-slate-800/40 pb-2">
                          <span className="text-xs font-bold text-white truncate max-w-[350px]">
                            "{kw._id}"
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400">
                            {kw.count} searches
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Geographic and Error break downs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Geographic break down (Region, City) */}
                <div className="bg-[#15152E] border border-[#2A2A3D] p-6 rounded-3xl shadow-sm space-y-5">
                  <h3 className="text-xs font-black uppercase text-slate-455 mb-1">Geographic Breakdowns</h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2.5">Top States / Regions</h4>
                      <div className="space-y-2">
                        {analyticsData.breakdowns?.states?.map((st, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="font-bold text-white truncate max-w-[120px]">{st._id || 'Unknown'}</span>
                            <span className="text-slate-400">{st.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-2.5">Top Cities</h4>
                      <div className="space-y-2">
                        {analyticsData.breakdowns?.cities?.map((ci, i) => (
                          <div key={i} className="flex justify-between items-center text-xs">
                            <span className="font-bold text-white truncate max-w-[120px]">{ci._id || 'Unknown'}</span>
                            <span className="text-slate-400">{ci.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* API and System Errors Registry */}
                <div className="bg-[#15152E] border border-[#2A2A3D] p-6 rounded-3xl shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase text-slate-455 mb-4">Error Diagnostics</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                          <span className="text-xs font-bold text-white">Internal Server Errors (500+)</span>
                        </div>
                        <span className="text-xs font-black text-slate-600 dark:text-slate-300">{analyticsData.breakdowns.errors.apiErrors} triggers</span>
                      </div>

                      <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                          <span className="text-xs font-bold text-white">Page Not Found Errors (404)</span>
                        </div>
                        <span className="text-xs font-black text-slate-600 dark:text-slate-300">{analyticsData.breakdowns.errors.notFoundErrors} occurrences</span>
                      </div>

                      <div className="flex items-center justify-between border-b dark:border-slate-800 pb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                          <span className="text-xs font-bold text-white">Authentication & Ban Failures</span>
                        </div>
                        <span className="text-xs font-black text-slate-600 dark:text-slate-300">{analyticsData.breakdowns.errors.authErrors} events</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200/50 dark:border-red-900/30 rounded-2xl p-4.5 text-xs text-red-700 dark:text-red-400 mt-4 leading-relaxed flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>Diagnostics alert: High concentrations of 404 or 401 exceptions can imply coordinate mapping conflicts, expired client tokens, or potential intrusion attempts. Check audit log CSV exports for client IP traces.</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 3. APPROVE LISTINGS TAB */}
      {activeTab === 'Approve Listings' && (
        <div className="bg-[#15152E] border border-[#2A2A3D] rounded-3xl overflow-hidden shadow-sm animate-fade-in print:hidden">
          <div className="p-6 border-b border-[#2A2A3D]">
            <h3 className="font-bold text-sm">Listing Submissions Pending Approval ({unapprovedPlaces.length})</h3>
          </div>
          {unapprovedPlaces.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No listings pending verification approval.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="bg-slate-50 dark:bg-slate-950 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Address</th>
                    <th className="p-4">Phone</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {unapprovedPlaces.map((place) => (
                    <tr key={place._id}>
                      <td className="p-4 font-bold text-white">{place.name}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px]">
                          {place.type}
                        </span>
                      </td>
                      <td className="p-4 truncate max-w-[200px]">{place.address}</td>
                      <td className="p-4">{place.phone}</td>
                      <td className="p-4 flex space-x-2">
                        <button
                          onClick={() => handleApproveListing(place.type, place._id)}
                          className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-950/20 rounded"
                          title="Approve Listing"
                        >
                          <CheckCircle className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteListing(place.type, place._id)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded"
                          title="Reject / Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 4. MODERATE SCAMS TAB */}
      {activeTab === 'Moderate Scams' && (
        <div className="bg-[#15152E] border border-[#2A2A3D] rounded-3xl overflow-hidden shadow-sm animate-fade-in print:hidden">
          <div className="p-6 border-b border-[#2A2A3D]">
            <h3 className="font-bold text-sm">Scam Reports Registry Moderation</h3>
          </div>
          {scamReports.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No scam reports recorded.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="bg-slate-50 dark:bg-slate-950 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Report Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Reported By</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {scamReports.map((scam) => (
                    <tr key={scam._id}>
                      <td className="p-4">
                        <button
                          onClick={() => {
                            setSelectedScam(scam);
                            setIsScamModalOpen(true);
                          }}
                          className="font-bold text-white hover:text-indigo-400 hover:underline transition text-left"
                        >
                          {scam.title}
                        </button>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-600 font-bold text-[10px]">
                          {scam.category}
                        </span>
                      </td>
                      <td className="p-4">
                        {scam.student ? (
                          <div>
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{scam.student.name}</span>
                            <span className="block text-[10px] text-slate-400">{scam.student.email}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Anonymous Student</span>
                        )}
                      </td>
                      <td className="p-4">
                        {scam.isVerifiedScam ? (
                          <span className="text-red-600 font-bold flex items-center">
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Verified Scam
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold">Unverified</span>
                        )}
                      </td>
                      <td className="p-4 flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedScam(scam);
                            setIsScamModalOpen(true);
                          }}
                          className="p-1 text-indigo-400 hover:bg-indigo-500/10 rounded"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {!scam.isVerifiedScam && (
                          <button
                            onClick={() => handleVerifyScam(scam._id)}
                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                            title="Verify Scam Report"
                          >
                            <CheckCircle className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteScam(scam._id)}
                          className="p-1 text-red-500 hover:bg-red-55 rounded"
                          title="Delete Report"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 5. USER ACCOUNTS TAB */}
      {activeTab === 'User Accounts' && (
        <div className="bg-[#15152E] border border-[#2A2A3D] rounded-3xl overflow-hidden shadow-sm animate-fade-in print:hidden">
          <div className="p-6 border-b border-[#2A2A3D]">
            <h3 className="font-bold text-sm">Student Registry & Ban moderation</h3>
          </div>
          {allUsers.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No users registered.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="bg-slate-50 dark:bg-slate-950 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {allUsers.map((u) => (
                    <tr key={u._id}>
                      <td className="p-4 flex items-center space-x-3">
                        <img src={u.avatar || 'https://picsum.photos/150'} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                        <span className="font-bold text-white">{u.name}</span>
                      </td>
                      <td className="p-4">{u.email}</td>
                      <td className="p-4 capitalize">{u.role}</td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.status === 'active'
                              ? 'bg-green-500/10 text-green-600'
                              : 'bg-red-500/10 text-red-600'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 flex items-center space-x-2">
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleBanUser(u._id)}
                            className={`py-1.5 px-3 rounded-lg text-[10px] font-bold transition ${
                              u.status === 'active'
                                ? 'bg-red-500/10 text-red-600 hover:bg-red-100'
                                : 'bg-green-500/10 text-green-600 hover:bg-green-100'
                            }`}
                          >
                            {u.status === 'active' ? 'Ban User' : 'Unban'}
                          </button>
                        )}
                        <button
                          onClick={() => handleViewActivityLogs(u)}
                          className="py-1.5 px-3 bg-indigo-500/10 text-indigo-600 hover:bg-indigo-500/20 dark:bg-indigo-500/20 dark:text-indigo-400 dark:hover:bg-indigo-500/30 rounded-lg text-[10px] font-bold transition flex items-center space-x-1"
                        >
                          <Activity className="w-3 h-3 animate-pulse" />
                          <span>View Activity</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. MODERATE REVIEWS TAB */}
      {activeTab === 'Moderate Reviews' && (
        <div className="bg-[#15152E] border border-[#2A2A3D] rounded-3xl overflow-hidden shadow-sm animate-fade-in print:hidden">
          <div className="p-6 border-b border-[#2A2A3D]">
            <h3 className="font-bold text-sm">Flagged Reviews Moderation ({flaggedReviews.length})</h3>
          </div>
          {flaggedReviews.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No reviews have been flagged by the community.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-500">
                <thead className="bg-slate-50 dark:bg-slate-950 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4">Place</th>
                    <th className="p-4">Reviewer</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Comment</th>
                    <th className="p-4">Flags</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {flaggedReviews.map((rev) => (
                    <tr key={rev._id}>
                      <td className="p-4 font-bold text-slate-850 dark:text-slate-900">
                        {rev.placeId?.name || 'Unknown Place'}
                        <span className="ml-1.5 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[9px] uppercase font-bold">
                          {rev.placeType}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-white">{rev.author?.name}</div>
                        <div className="text-[10px] text-slate-400">{rev.author?.email}</div>
                      </td>
                      <td className="p-4 font-extrabold text-amber-500">{rev.rating} ★</td>
                      <td className="p-4 max-w-xs truncate leading-relaxed" title={rev.reviewText}>
                        {rev.reviewText}
                      </td>
                      <td className="p-4 font-black text-red-500">{rev.flags?.length} flags</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded flex items-center gap-1 font-bold text-xs"
                          title="Delete Fake/Flagged Review"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 7. SUPPORT TICKETS TAB */}
      {activeTab === 'Support Tickets' && (
        <div className="space-y-6 animate-fade-in print:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Ticket List (Left column, 1/3 wide on desktop) */}
            <div className="lg:col-span-1 bg-[#15152E] border border-[#2A2A3D] rounded-3xl overflow-hidden shadow-sm flex flex-col max-h-[700px]">
              <div className="p-4 border-b border-[#2A2A3D] flex items-center justify-between">
                <h3 className="font-bold text-xs">Inbox ({supportTickets.length})</h3>
                <span className="text-[9px] uppercase px-2 py-0.5 rounded-full font-black bg-indigo-500/10 text-indigo-400">
                  {supportTickets.filter(t => !t.isRead).length} Unread
                </span>
              </div>
              <div className="divide-y divide-[#2A2A3D] overflow-y-auto max-h-[640px]">
                {supportTickets.length === 0 ? (
                  <div className="p-12 text-center text-xs text-slate-400">
                    No support tickets found.
                  </div>
                ) : (
                  supportTickets.map((ticket) => (
                    <div
                      key={ticket._id}
                      onClick={() => setSelectedTicket(ticket)}
                      className={`p-4 cursor-pointer transition-all flex flex-col gap-1.5 ${
                        selectedTicket?._id === ticket._id
                          ? 'bg-indigo-600/15 border-l-4 border-l-indigo-500'
                          : ticket.isRead
                          ? 'bg-transparent hover:bg-white/5 border-l-4 border-l-transparent'
                          : 'bg-[#2A2A3D]/20 hover:bg-white/5 border-l-4 border-l-cyan-400'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[9px] uppercase font-black text-slate-400">
                        <span className="truncate max-w-[120px]">{ticket.category}</span>
                        <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs font-extrabold text-white truncate">{ticket.subject}</h4>
                      <p className="text-[10px] text-slate-350 truncate">From: {ticket.senderName}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Ticket Details (Right column, 2/3 wide on desktop) */}
            <div className="lg:col-span-2 bg-[#15152E] border border-[#2A2A3D] rounded-3xl p-6 shadow-sm space-y-6 min-h-[400px]">
              {selectedTicket ? (
                <div className="space-y-6">
                  {/* Header details */}
                  <div className="flex flex-wrap justify-between items-start gap-4 border-b border-[#2A2A3D] pb-4">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {selectedTicket.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          selectedTicket.isRead
                            ? 'bg-slate-800 text-slate-400 border border-slate-700'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {selectedTicket.isRead ? 'Read' : 'Unread'}
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-white">{selectedTicket.subject}</h3>
                      <p className="text-xs text-slate-400 font-semibold">
                        From: <span className="text-white font-bold">{selectedTicket.senderName}</span> ({selectedTicket.senderEmail})
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleReadTicket(selectedTicket._id)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase border transition ${
                          selectedTicket.isRead
                            ? 'bg-[#0D0D1A] border-[#2A2A3D] hover:border-slate-350'
                            : 'bg-indigo-600 border-indigo-600 text-white'
                        }`}
                      >
                        {selectedTicket.isRead ? 'Mark Unread' : 'Mark Read'}
                      </button>
                      <button
                        onClick={() => handleDeleteTicket(selectedTicket._id)}
                        className="p-2 bg-[#EF4444]/10 hover:bg-[#EF4444]/20 border border-[#EF4444]/20 text-[#EF4444] rounded-xl transition"
                        title="Delete Ticket"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Message body */}
                  <div className="space-y-4">
                    <div className="text-xs font-extrabold uppercase text-cyan-400 tracking-wider">Message Text</div>
                    <pre className="p-5 bg-[#0D0D1A] border border-[#2A2A3D] rounded-2xl font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[400px] overflow-y-auto select-all">
                      {selectedTicket.messageText}
                    </pre>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 border-t border-[#2A2A3D] flex justify-end">
                    <a
                      href={`mailto:${selectedTicket.senderEmail}?subject=Re: ${encodeURIComponent(selectedTicket.subject)}`}
                      className="inline-flex items-center space-x-2 py-2.5 px-6 rounded-xl text-xs font-black text-black bg-cyan-400 border border-cyan-400 hover:shadow-[3px_3px_0px_0px_#FFFFFF] hover:-translate-x-0.5 hover:-translate-y-0.5 transition duration-150"
                    >
                      <ArrowRight className="w-4 h-4" />
                      <span>Reply via Email</span>
                    </a>
                  </div>
                </div>
              ) : (
                <div className="h-full py-20 flex flex-col justify-center items-center text-center text-slate-400 space-y-3">
                  <Mail className="w-12 h-12 text-[#2A2A3D] animate-pulse" />
                  <h4 className="font-bold text-sm">No ticket selected</h4>
                  <p className="text-xs max-w-xs leading-relaxed font-semibold">
                    Select a support ticket from the inbox list on the left to view full ticket details and send replies.
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Student Activity Log Modal */}
      {isActivityModalOpen && selectedUserForActivity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl bg-[#15152E] border border-[#2A2A3D] rounded-3xl shadow-2xl glass-effect p-6 overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2A2A3D] pb-4 mb-4 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <img
                  src={selectedUserForActivity.avatar || 'https://picsum.photos/150'}
                  alt={selectedUserForActivity.name}
                  className="w-12 h-12 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                />
                <div>
                  <h3 className="text-lg font-black flex items-center text-indigo-600 dark:text-indigo-400">
                    <Activity className="w-5 h-5 mr-1.5 animate-pulse" />
                    <span>{selectedUserForActivity.name}'s Activity History</span>
                  </h3>
                  <p className="text-xs text-slate-400">{selectedUserForActivity.email} • {selectedUserForActivity.role} account</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsActivityModalOpen(false);
                  setSelectedUserForActivity(null);
                  setUserActivityLogs([]);
                }}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <XCircle className="w-6 h-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
              </button>
            </div>

            {/* Filter Section */}
            {!activityLoading && userActivityLogs.length > 0 && (
              <div className="flex justify-between items-center mb-4 flex-shrink-0 bg-slate-50 dark:bg-slate-950/20 p-3 rounded-2xl border border-[#2A2A3D]/80">
                <span className="text-xs text-slate-500 font-semibold">
                  Showing {filteredActivityLogs.length} of {userActivityLogs.length} logged activities
                </span>
                <div className="flex items-center space-x-2">
                  <label className="text-xs text-slate-400">Filter Action:</label>
                  <select
                    value={activityActionFilter}
                    onChange={(e) => setActivityActionFilter(e.target.value)}
                    className="bg-[#15152E] border border-[#2A2A3D] py-1 px-3.5 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">All Actions</option>
                    {Array.from(new Set(userActivityLogs.map(log => log.action))).map((act) => (
                      <option key={act} value={act}>{act}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto min-h-[300px]">
              {activityLoading ? (
                <div className="h-full flex flex-col justify-center items-center py-20 space-y-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                  <p className="text-xs text-slate-400">Retrieving student activity history...</p>
                </div>
              ) : filteredActivityLogs.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center py-20 text-slate-400 space-y-3">
                  <Activity className="w-12 h-12 text-slate-300 dark:text-slate-700" />
                  <h4 className="font-bold text-sm">No activity recorded</h4>
                  <p className="text-xs max-w-xs text-center">No logs were recorded matching this user or the active filter.</p>
                </div>
              ) : (
                <div className="space-y-3 pr-2">
                  {filteredActivityLogs.map((log) => (
                    <div
                      key={log._id}
                      className="p-4 bg-slate-50 dark:bg-slate-950/20 border border-[#2A2A3D]/80 rounded-2xl space-y-3 shadow-sm transition hover:shadow"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-850 pb-2">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
                              log.action === 'Login'
                                ? 'bg-green-500/10 text-green-600'
                                : log.action === 'Logout'
                                ? 'bg-yellow-500/10 text-yellow-600'
                                : log.action === 'Page View'
                                ? 'bg-indigo-500/10 text-indigo-600'
                                : log.action === 'JavaScript Error'
                                ? 'bg-red-500/10 text-red-600'
                                : 'bg-brand-500/10 text-brand-600'
                            }`}
                          >
                            {log.action}
                          </span>
                          <span className="text-[10px] text-slate-400 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-[10px] text-slate-400">
                          <span className="flex items-center flex-wrap">
                            <Monitor className="w-3 h-3 mr-1 text-indigo-500" /> {log.os || 'Unknown OS'} ({log.browser || 'Unknown Browser'})
                          </span>
                          {log.ip && (
                            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                              IP: {log.ip}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Target Page / Endpoint</span>
                          <div className="font-mono bg-[#15152E] border border-[#2A2A3D] px-2.5 py-1.5 rounded-xl truncate text-[11px]" title={log.currentPage || log.apiEndpoint}>
                            {log.httpMethod && <span className="text-slate-400 mr-1.5 font-bold uppercase">{log.httpMethod}</span>}
                            {log.currentPage || log.apiEndpoint}
                          </div>
                        </div>

                        {log.country && (
                          <div className="space-y-1">
                            <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider">Geolocation Context</span>
                            <div className="bg-[#15152E] border border-[#2A2A3D] px-2.5 py-1.5 rounded-xl text-[11px] text-slate-300">
                              📍 {log.city ? `${log.city}, ` : ''}{log.state ? `${log.state}, ` : ''}{log.country}
                            </div>
                          </div>
                        )}
                      </div>

                      {log.requestBody && Object.keys(log.requestBody).length > 0 && (
                        <div className="bg-[#15152E] border border-[#2A2A3D] p-2.5 rounded-xl">
                          <span className="text-[9px] uppercase font-bold text-slate-400 block tracking-wider mb-1">Payload / Details</span>
                          <pre className="text-[10px] font-mono text-slate-500 overflow-x-auto whitespace-pre-wrap max-h-[80px]">
                            {JSON.stringify(log.requestBody, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#2A2A3D] pt-4 mt-4 flex justify-end flex-shrink-0">
              <button
                onClick={() => {
                  setIsActivityModalOpen(false);
                  setSelectedUserForActivity(null);
                  setUserActivityLogs([]);
                }}
                className="py-2.5 px-6 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-[#15152E] border border-[#2A2A3D] dark:hover:bg-slate-700 transition text-xs"
              >
                Close Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Scam Report Details Modal */}
      {isScamModalOpen && selectedScam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-[#15152E] border border-[#2A2A3D] rounded-3xl shadow-2xl glass-effect p-6 overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2A2A3D] pb-4 mb-4 flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-500/10 rounded-xl text-red-500">
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Scam Report Details</h3>
                  <span className="text-xs text-slate-400">
                    Category: <span className="text-red-500 font-bold">{selectedScam.category}</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsScamModalOpen(false);
                  setSelectedScam(null);
                }}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <XCircle className="w-6 h-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-slate-300">
              {/* Title & Date */}
              <div className="bg-[#1C1C3A] border border-[#2A2A3D] p-4 rounded-2xl">
                <h4 className="text-sm font-bold text-white mb-1">Report Title</h4>
                <p className="text-xs font-semibold text-slate-300">{selectedScam.title}</p>
                
                <div className="mt-3 flex items-center space-x-2 text-[10px] text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Reported on: {new Date(selectedScam.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {/* Reported By */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#1C1C3A] border border-[#2A2A3D] p-4 rounded-2xl">
                  <h4 className="text-sm font-bold text-white mb-2">Reporter Information</h4>
                  {selectedScam.student ? (
                    <div className="flex items-center space-x-3">
                      <img
                        src={selectedScam.student.avatar || 'https://picsum.photos/150'}
                        alt={selectedScam.student.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{selectedScam.student.name}</p>
                        <p className="text-[10px] text-slate-400">{selectedScam.student.email}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">Anonymous Student</p>
                  )}
                </div>

                <div className="bg-[#1C1C3A] border border-[#2A2A3D] p-4 rounded-2xl">
                  <h4 className="text-sm font-bold text-white mb-2">Status & Verification</h4>
                  <div className="space-y-2">
                    <div className="flex items-center text-xs">
                      <span className="text-slate-400 mr-2">Current Status:</span>
                      {selectedScam.isVerifiedScam ? (
                        <span className="px-2.5 py-0.5 rounded bg-green-500/10 text-green-600 font-bold text-[10px] flex items-center">
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Verified
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-600 font-bold text-[10px]">
                          Unverified
                        </span>
                      )}
                    </div>

                    {selectedScam.targetPlaceId && (
                      <div className="text-xs">
                        <span className="text-slate-400 mr-1">Target Place:</span>
                        <span className="font-bold text-indigo-400">
                          {selectedScam.targetPlaceId.name} ({selectedScam.targetPlaceType})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-[#1C1C3A] border border-[#2A2A3D] p-4 rounded-2xl">
                <h4 className="text-sm font-bold text-white mb-2">Description & Incident Details</h4>
                <p className="text-xs leading-relaxed text-slate-300 whitespace-pre-wrap font-semibold">
                  {selectedScam.description}
                </p>
              </div>

              {/* Proof Images */}
              <div className="bg-[#1C1C3A] border border-[#2A2A3D] p-4 rounded-2xl">
                <h4 className="text-sm font-bold text-white mb-3">Uploaded Proof & Evidence</h4>
                {selectedScam.proofImages && selectedScam.proofImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedScam.proofImages.map((img, index) => (
                      <a
                        key={img.fileId || index}
                        href={img.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group relative rounded-xl overflow-hidden aspect-video border border-[#2A2A3D] bg-slate-900 block"
                        title="Click to view full size"
                      >
                        <img
                          src={img.thumbnailUrl || img.url}
                          alt={`Proof ${index + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          <Eye className="w-5 h-5 text-white" />
                        </div>
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No proof images uploaded for this report.</p>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-[#2A2A3D] pt-4 mt-4 flex justify-between flex-shrink-0">
              <div className="flex space-x-2">
                {!selectedScam.isVerifiedScam && (
                  <button
                    onClick={() => {
                      handleVerifyScam(selectedScam._id);
                      setIsScamModalOpen(false);
                      setSelectedScam(null);
                    }}
                    className="py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs transition flex items-center space-x-1"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Verify Report</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    handleDeleteScam(selectedScam._id);
                    setIsScamModalOpen(false);
                    setSelectedScam(null);
                  }}
                  className="py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Report</span>
                </button>
              </div>

              <button
                onClick={() => {
                  setIsScamModalOpen(false);
                  setSelectedScam(null);
                }}
                className="py-2.5 px-6 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-[#15152E] border border-[#2A2A3D] dark:hover:bg-slate-700 transition text-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;

