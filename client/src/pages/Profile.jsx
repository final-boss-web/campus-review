import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  User as UserIcon,
  Mail,
  Award,
  Bookmark,
  MessageSquare,
  Image as ImageIcon,
  AlertTriangle,
  Calendar,
  Star,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';
import api from '../services/api.js';
import RatingStars from '../components/RatingStars.jsx';

export const Profile = () => {
  const { id } = useParams();
  const currentUser = useSelector((state) => state.auth.user);

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [scamReports, setScamReports] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/users/profile/${id}`);
      setProfile(data.user);
      setReviews(data.reviews);
      setScamReports(data.scamReports);
      setBookmarks(data.bookmarks);
      setImages(data.images);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 animate-pulse space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
          </div>
        </div>
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center">
        <UserIcon className="w-12 h-12 text-slate-300 mx-auto" />
        <h3 className="text-xl font-bold">Profile not found</h3>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile._id;

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
      
      {/* 1. Header Profile details */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-x-6 gap-4">
          <img
            src={profile.avatar || 'https://picsum.photos/150'}
            alt={profile.name}
            className="w-24 h-24 rounded-full object-cover border-4 border-brand-500/10"
          />
          <div className="space-y-3 text-center sm:text-left">
            <h1 className="text-3xl font-black font-sans">{profile.name}</h1>
            <div className="flex items-center justify-center sm:justify-start space-x-4 text-slate-500 text-xs">
              <span className="flex items-center"><Mail className="w-4 h-4 mr-1 text-slate-300" /> {profile.email}</span>
              <span className="flex items-center"><Award className="w-4 h-4 mr-1 text-slate-300" /> {profile.role} account</span>
            </div>
            
            {/* Badges list */}
            {profile.badges?.length > 0 && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 pt-1">
                {profile.badges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-600 dark:bg-brand-950/20 dark:text-brand-400 border border-brand-500/10"
                  >
                    <Award className="w-3.5 h-3.5 mr-1" />
                    <span>{badge}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Stats card counter */}
        <div className="flex space-x-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl text-center min-w-[80px]">
            <span className="text-xl font-black text-brand-600 block">{reviews.length}</span>
            <span className="text-[9px] uppercase font-bold text-slate-400">Reviews</span>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-950/20 rounded-2xl text-center min-w-[80px]">
            <span className="text-xl font-black text-indigo-600 block">{scamReports.length}</span>
            <span className="text-[9px] uppercase font-bold text-slate-400">Scams</span>
          </div>
        </div>
      </div>

      {/* 2. Main Profile Tabs layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Bookmarks & Images collage */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Bookmarks Section (Only visible on own profile) */}
          {isOwnProfile && (
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-bold text-sm flex items-center space-x-2 text-brand-600">
                <Bookmark className="w-4 h-4" />
                <span>Bookmarks ({bookmarks.length})</span>
              </h3>
              <div className="space-y-3">
                {bookmarks.length === 0 ? (
                  <span className="block text-xs text-slate-400">No bookmarked places yet.</span>
                ) : (
                  bookmarks.map((bookmark) => (
                    <Link
                      key={bookmark.place._id}
                      to={`/place/${bookmark.placeType}/${bookmark.place._id}`}
                      className="block p-3 rounded-2xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate max-w-[150px]">
                          {bookmark.place.name}
                        </span>
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-400">
                          {bookmark.placeType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                        <RatingStars rating={bookmark.place.averageRating} size={10} />
                        <span>Rent/charges: ₹{bookmark.place.roomRent || bookmark.place.monthlyCharges || 'Shop'}</span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}

          {/* User media uploads */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-bold text-sm flex items-center space-x-2">
              <ImageIcon className="w-4 h-4" />
              <span>Media Uploads ({images.length})</span>
            </h3>
            {images.length === 0 ? (
              <span className="block text-xs text-slate-400">No images uploaded yet.</span>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {images.map((img, idx) => (
                  <a
                    key={idx}
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl overflow-hidden aspect-square border bg-slate-100 hover:opacity-95"
                  >
                    <img src={img.url} alt="Student upload" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Reviews feed & scam reports feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Reviews authored */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-slate-400" />
              <span>Reviews Written</span>
            </h3>

            {reviews.length === 0 ? (
              <div className="p-10 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-xs text-slate-400">
                No reviews written yet.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/place/${rev.placeType}/${rev.placeId?._id}`}
                        className="text-xs font-bold hover:underline text-brand-600 truncate max-w-[200px]"
                      >
                        {rev.placeId?.name || 'Deleted Listing'}
                      </Link>
                      <RatingStars rating={rev.rating} size={12} />
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      "{rev.reviewText}"
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                      <span>{rev.likes?.length || 0} helpful marks</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scams reported */}
          <div className="space-y-4">
            <h3 className="font-bold text-lg flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <span>Scam Reports Filed</span>
            </h3>

            {scamReports.length === 0 ? (
              <div className="p-10 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl text-xs text-slate-400">
                No scam reports filed yet.
              </div>
            ) : (
              <div className="space-y-4">
                {scamReports.map((scam) => (
                  <div
                    key={scam._id}
                    className="p-6 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm relative overflow-hidden"
                  >
                    {scam.isVerifiedScam && (
                      <span className="absolute top-0 right-0 bg-red-600 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-bl-lg">
                        Verified Scam
                      </span>
                    )}
                    <div className="flex items-center space-x-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 bg-red-500/10 text-red-600 rounded">
                        {scam.category}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold">{scam.title}</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">{scam.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
};

export default Profile;
