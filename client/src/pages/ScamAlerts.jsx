import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  Plus,
  ShieldCheck,
  Calendar,
  X,
  FileText,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';
import api from '../services/api.js';
import ImageUpload from '../components/ImageUpload.jsx';

export const ScamAlerts = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Scams feed state
  const [scams, setScams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Report Scam Modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [newScam, setNewScam] = useState({
    title: '',
    category: 'Deposit Scam',
    description: '',
    proofImages: [],
  });

  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchScams();
  }, [searchQuery, selectedCategory]);

  const fetchScams = async () => {
    setLoading(true);
    try {
      let url = '/scams';
      const params = [];
      if (searchQuery) params.push(`search=${encodeURIComponent(searchQuery)}`);
      if (selectedCategory) params.push(`category=${encodeURIComponent(selectedCategory)}`);
      if (params.length) url += `?${params.join('&')}`;

      const { data } = await api.get(url);
      setScams(data);
    } catch (err) {
      console.error(err);
      setScams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReportButtonClick = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      setIsReportModalOpen(true);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    setReportError('');
    setReportSuccess('');
    setSubmitting(true);

    try {
      const { data } = await api.post('/scams', newScam);
      setReportSuccess(data.message);
      setNewScam({
        title: '',
        category: 'Deposit Scam',
        description: '',
        proofImages: [],
      });
      fetchScams();
      setTimeout(() => setIsReportModalOpen(false), 2000);
    } catch (err) {
      console.error(err);
      setReportError(err.response?.data?.message || 'Failed to submit scam report.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = [
    'Fake Hostel',
    'Fraud Owner',
    'Deposit Scam',
    'Overcharging',
    'Bad Food',
    'Hidden Charges',
    'Fake Promises',
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 pb-20">
      <div className="flex justify-start">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-black text-slate-500 hover:text-cyber-purple dark:text-slate-400 dark:hover:text-cyber-cyan transition-all duration-200 bg-white/50 dark:bg-slate-900/50 px-4 py-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black tracking-tight font-sans flex items-center text-red-600 dark:text-red-500">
            <AlertTriangle className="w-8 h-8 mr-2 text-red-600" />
            <span>Scam Alerts & Fraud Registry</span>
          </h1>
          <p className="text-xs text-slate-400">
            Reports submitted by students to alert peers of fake properties, hidden charges, and deposit retention frauds.
          </p>
        </div>
        <button
          onClick={handleReportButtonClick}
          className="flex items-center space-x-2 py-3 px-6 bg-red-600 hover:bg-red-500 text-white rounded-2xl shadow-lg shadow-red-500/10 font-bold transition text-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Report a Scam / Fraud</span>
        </button>
      </div>

      {/* Filter and Search controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div className="md:col-span-2 relative">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search scam alerts by landlord name, PG name, key words..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 pl-10 rounded-2xl text-xs focus:outline-none focus:border-red-500 text-slate-800 dark:text-slate-100 shadow-sm"
          />
        </div>

        {/* Category select */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl text-xs focus:outline-none text-slate-800 dark:text-slate-100 shadow-sm"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Scams Feed */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl h-44"></div>
          ))}
        </div>
      ) : scams.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-slate-400 space-y-4">
          <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-lg">No scam reports found</h3>
          <p className="text-xs">No fraud alerts match your search. Campus is relatively clean!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {scams.map((scam) => (
            <div
              key={scam._id}
              className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 p-6 rounded-3xl shadow-sm space-y-4 relative overflow-hidden"
            >
              {/* Badge for verified scams */}
              {scam.isVerifiedScam && (
                <span className="absolute top-0 right-0 py-1.5 px-4 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-bl-2xl flex items-center">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Scam
                </span>
              )}

              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-bold uppercase tracking-wider py-1 px-3 bg-red-500/10 text-red-600 rounded-full">
                  {scam.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1" />
                  {new Date(scam.createdAt).toLocaleDateString()}
                </span>
              </div>

              <h3 className="text-xl font-bold font-sans text-slate-800 dark:text-slate-100">
                {scam.title}
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {scam.description}
              </p>

              {/* Attachments (bills / proof screenshots) */}
              {scam.proofImages?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center">
                    <FileText className="w-3.5 h-3.5 mr-1" /> Proof Documents / Attachments
                  </span>
                  <div className="flex flex-wrap gap-3">
                    {scam.proofImages.map((img) => (
                      <a
                        key={img.fileId}
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-20 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100"
                      >
                        <img src={img.url} alt="Proof Bill" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Author footer */}
              <div className="pt-4 border-t border-slate-50 dark:border-slate-800/40 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img
                    src={scam.student?.avatar || 'https://picsum.photos/150'}
                    alt={scam.student?.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="text-[10px] font-semibold text-slate-500">
                    Reported by {scam.student?.name || 'Student'}
                  </span>
                </div>
                {scam.targetPlaceId && (
                  <Link
                    to={`/place/${scam.targetPlaceType}/${scam.targetPlaceId.slug || scam.targetPlaceId._id}`}
                    className="text-[10px] text-brand-600 font-bold hover:underline"
                  >
                    View Place Listing
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Report Scam Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl glass-effect p-6 overflow-y-auto max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold flex items-center text-red-600">
                  <AlertTriangle className="w-6 h-6 mr-1.5" />
                  <span>Report Fraudulent Activity</span>
                </h3>
                <p className="text-xs text-slate-400">Share your experiences to warn other students.</p>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Status alerts */}
            {reportError && (
              <div className="p-3 mb-4 text-xs font-semibold text-red-600 bg-red-50 rounded-xl border border-red-200">
                {reportError}
              </div>
            )}
            {reportSuccess && (
              <div className="p-3 mb-4 text-xs font-semibold text-green-600 bg-green-50 rounded-xl border border-green-200">
                {reportSuccess}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleReportSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Report Title *</label>
                  <input
                    type="text"
                    required
                    value={newScam.title}
                    onChange={(e) => setNewScam({ ...newScam, title: e.target.value })}
                    placeholder="e.g. UPI Deposit scam by Shanti Devi"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Scam Category *</label>
                  <select
                    value={newScam.category}
                    onChange={(e) => setNewScam({ ...newScam, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs focus:outline-none"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold">Fraud Details *</label>
                <textarea
                  required
                  rows="4"
                  value={newScam.description}
                  onChange={(e) => setNewScam({ ...newScam, description: e.target.value })}
                  placeholder="Explain exactly what happened. Mention landlord phone numbers, UPI IDs used, dates, and why it is a scam. Be as precise as possible."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs focus:outline-none"
                />
              </div>

              {/* Screenshot uploader */}
              <ImageUpload
                images={newScam.proofImages}
                onChange={(imgs) => setNewScam({ ...newScam, proofImages: imgs })}
                maxFiles={4}
                label="Upload Proof (Bills, Curfew messages, cur-out screenshots)"
              />

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="py-3 px-6 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-3 px-6 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 shadow-md shadow-red-500/10 transition text-xs flex items-center"
                >
                  {submitting ? 'Submitting Scam Alert...' : 'File Scam Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default ScamAlerts;
