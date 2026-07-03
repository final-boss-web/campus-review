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
      <div className="max-w-4xl mx-auto py-20 px-6 animate-pulse space-y-6">
        <div className="flex items-center space-x-4">
          <div className="w-20 h-20 bg-slate-800 rounded-full border border-[#2A2A3D]"></div>
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-slate-850 rounded w-1/3"></div>
            <div className="h-4 bg-slate-850 rounded w-1/4"></div>
          </div>
        </div>
        <div className="h-40 bg-slate-850 rounded-2xl border border-[#2A2A3D]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto py-20 px-6 text-center space-y-4">
        <UserIcon className="w-12 h-12 text-[#EF4444] mx-auto" />
        <h3 className="text-xl font-black text-white uppercase">Profile not found</h3>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === profile._id;

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 sm:px-8 space-y-8 pb-20 bg-[#0D0D1A]">
      <div className="flex justify-start">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-black text-white hover:text-[#38BDF8] transition-all duration-200 bg-[#15152E] px-4 py-2.5 rounded-xl border border-[#2A2A3D] shadow-sm hover:border-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>
      
      {/* 1. Header Profile details */}
      <div className="bg-[#15152E] border border-[#2A2A3D] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 relative transition duration-200 hover:border-white hover:shadow-brutal-blue">
        <div className="flex flex-col sm:flex-row items-center sm:items-start space-x-6 gap-4">
          <img
            src={profile.avatar || `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(profile.name)}`}
            alt={profile.name}
            className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-[2px_2px_0px_#000000]"
          />
          <div className="space-y-3 text-center sm:text-left">
            <h1 className="text-3xl font-black uppercase text-white tracking-tight">{profile.name}</h1>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-slate-300 text-xs font-semibold">
              <span className="flex items-center"><Mail className="w-4 h-4 mr-1.5 text-[#38BDF8]" /> {profile.email}</span>
              <span className="flex items-center"><Award className="w-4 h-4 mr-1.5 text-[#38BDF8]" /> {profile.role} account</span>
            </div>
            
            {/* Badges list */}
            {profile.badges?.length > 0 && (
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1">
                {profile.badges.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center px-3 py-1 rounded-xl text-[10px] font-black bg-[#38BDF8]/5 text-[#38BDF8] border border-[#38BDF8]/30 uppercase tracking-wider"
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
          <div className="p-4 bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl text-center min-w-[90px] shadow-sm">
            <span className="text-2xl font-black text-[#38BDF8] block">{reviews.length}</span>
            <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 mt-0.5 block">Reviews</span>
          </div>
          {(isOwnProfile || currentUser?.role === 'admin') && (
            <div className="p-4 bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl text-center min-w-[90px] shadow-sm">
              <span className="text-2xl font-black text-[#EF4444] block">{scamReports.length}</span>
              <span className="text-[9px] uppercase font-black tracking-widest text-slate-400 mt-0.5 block">Scams</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Profile Tabs layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left column: Bookmarks & Images collage */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Bookmarks Section (Only visible on own profile) */}
          {isOwnProfile && (
            <div className="bg-[#15152E] border border-[#2A2A3D] p-6 rounded-2xl transition duration-200 hover:border-white hover:shadow-brutal-blue space-y-4">
              <h3 className="font-black text-sm flex items-center space-x-2 text-[#38BDF8] uppercase tracking-wider">
                <Bookmark className="w-4 h-4" />
                <span>Bookmarks ({bookmarks.length})</span>
              </h3>
              <div className="space-y-3">
                {bookmarks.length === 0 ? (
                  <span className="block text-xs text-slate-400 font-bold">No bookmarked places yet.</span>
                ) : (
                  bookmarks.map((bookmark) => (
                    <Link
                      key={bookmark.place._id}
                      to={`/place/${bookmark.placeType}/${bookmark.place.slug || bookmark.place._id}`}
                      className="block p-3.5 rounded-xl border border-[#2A2A3D] hover:bg-[#0D0D1A] hover:border-white transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white truncate max-w-[150px]">
                          {bookmark.place.name}
                        </span>
                        <span className="text-[9px] font-black px-2 py-0.5 rounded bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 uppercase">
                          {bookmark.placeType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 font-bold">
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
          <div className="bg-[#15152E] border border-[#2A2A3D] p-6 rounded-2xl transition duration-200 hover:border-white hover:shadow-brutal-blue space-y-4">
            <h3 className="font-black text-sm flex items-center space-x-2 text-[#38BDF8] uppercase tracking-wider">
              <ImageIcon className="w-4 h-4" />
              <span>Media Uploads ({images.length})</span>
            </h3>
            {images.length === 0 ? (
              <span className="block text-xs text-slate-400 font-bold">No images uploaded yet.</span>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {images.map((img, idx) => (
                  <a
                    key={idx}
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl overflow-hidden aspect-square border border-[#2A2A3D] hover:border-white transition bg-slate-900"
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
            <h3 className="font-black text-lg flex items-center space-x-2 text-white uppercase tracking-tight">
              <MessageSquare className="w-5 h-5 text-[#38BDF8]" />
              <span>Reviews Written</span>
            </h3>

            {reviews.length === 0 ? (
              <div className="p-10 text-center bg-[#15152E] border border-[#2A2A3D] rounded-2xl text-xs text-slate-400 font-bold">
                No reviews written yet.
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-6 bg-[#15152E] border border-[#2A2A3D] rounded-2xl space-y-3.5 hover:border-white hover:shadow-brutal-blue transition duration-200 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/place/${rev.placeType}/${rev.placeId?.slug || rev.placeId?._id}`}
                        className="text-xs font-black hover:underline text-[#38BDF8] uppercase tracking-wider truncate max-w-[200px]"
                      >
                        {rev.placeId?.name || 'Deleted Listing'}
                      </Link>
                      <RatingStars rating={rev.rating} size={12} />
                    </div>
                    <p className="text-xs text-white leading-relaxed font-semibold">
                      "{rev.reviewText}"
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold border-t border-[#2A2A3D] pt-3 mt-1">
                      <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                      <span>{rev.likes?.length || 0} helpful marks</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Scams reported */}
          {(isOwnProfile || currentUser?.role === 'admin') && (
            <div className="space-y-4">
              <h3 className="font-black text-lg flex items-center space-x-2 text-white uppercase tracking-tight">
                <AlertTriangle className="w-5 h-5 text-[#EF4444]" />
                <span>Scam Reports Filed</span>
              </h3>

              {scamReports.length === 0 ? (
                <div className="p-10 text-center bg-[#15152E] border border-[#2A2A3D] rounded-2xl text-xs text-slate-400 font-bold">
                  No scam reports filed yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {scamReports.map((scam) => (
                    <div
                      key={scam._id}
                      className="p-6 bg-[#15152E] border border-[#EF4444] rounded-2xl space-y-3 shadow-sm relative overflow-hidden hover:shadow-brutal-red transition duration-200"
                    >
                      {scam.isVerifiedScam && (
                        <span className="absolute top-0 right-0 bg-[#EF4444] text-white text-[8px] font-black uppercase px-2 py-1 rounded-bl-lg">
                          Verified Scam
                        </span>
                      )}
                      <div className="flex items-center space-x-2">
                        <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-0.5 bg-[#EF4444]/10 text-[#EF4444] rounded border border-[#EF4444]/30">
                          {scam.category}
                        </span>
                      </div>
                      <h4 className="text-xs font-black uppercase tracking-tight text-white">{scam.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-semibold">{scam.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
};

export default Profile;
