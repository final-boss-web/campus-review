import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { QRCodeSVG } from 'qrcode.react';
import {
  MapPin,
  Phone,
  User as UserIcon,
  Wifi,
  Wind,
  ShieldCheck,
  MessageSquare,
  ThumbsUp,
  AlertTriangle,
  Trash2,
  Share2,
  Calendar,
  Layers,
  Star,
  Check,
  Plus,
  Compass,
  ArrowLeft,
} from 'lucide-react';
import api from '../services/api.js';
import RatingStars from '../components/RatingStars.jsx';
import ImageUpload from '../components/ImageUpload.jsx';
import { openLoginModal } from '../store/authSlice.js';

export const PlaceDetail = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  // Listing details states
  const [place, setPlace] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Review Form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewPros, setReviewPros] = useState('');
  const [reviewCons, setReviewCons] = useState('');
  const [reviewImages, setReviewImages] = useState([]);

  // Detailed ratings parameter sliders (1-5)
  const [params, setParams] = useState({
    price: 4,
    food: 4,
    cleanliness: 4,
    behaviour: 4,
    safety: 4,
    internet: 4,
    facilities: 4,
  });

  // Comments state
  const [activeReviewComments, setActiveReviewComments] = useState({}); // { reviewId: [comments] }
  const [commentText, setCommentText] = useState({}); // { reviewId: text }

  // Share Widget
  const [showShareQR, setShowShareQR] = useState(false);

  useEffect(() => {
    fetchPlaceDetails();
  }, [type, id]);

  const fetchPlaceDetails = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/places/${type}/${id}`);
      setPlace(data.place);
      setReviews(data.reviews);

      // Fetch comments for all reviews
      data.reviews.forEach((rev) => {
        fetchReviewComments(rev._id);
      });
    } catch (err) {
      console.error(err);
      setError('Listing not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewComments = async (reviewId) => {
    try {
      const { data } = await api.get(`/comments/review/${reviewId}`);
      setActiveReviewComments((prev) => ({ ...prev, [reviewId]: data }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleInteractionClick = (action) => {
    if (!isAuthenticated) {
      dispatch(openLoginModal());
      return false;
    }
    return true;
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!handleInteractionClick()) return;

    try {
      const payload = {
        placeId: id,
        placeType: type,
        rating: reviewRating,
        reviewText,
        pros: reviewPros,
        cons: reviewCons,
        images: reviewImages,
        ...params,
      };

      const { data } = await api.post('/reviews', payload);
      setReviews([data.review, ...reviews]);
      setShowReviewForm(false);
      
      // Reset review form
      setReviewRating(5);
      setReviewText('');
      setReviewPros('');
      setReviewCons('');
      setReviewImages([]);
      
      // Reload rating counts
      fetchPlaceDetails();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to post review.');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      setReviews(reviews.filter((r) => r._id !== reviewId));
      fetchPlaceDetails();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLikeReview = async (reviewId) => {
    if (!handleInteractionClick()) return;
    try {
      const { data } = await api.post(`/reviews/${reviewId}/like`);
      setReviews(
        reviews.map((r) => (r._id === reviewId ? { ...r, likes: data.likes } : r))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleFlagReview = async (reviewId) => {
    if (!handleInteractionClick()) return;
    try {
      await api.post(`/reviews/${reviewId}/flag`);
      alert('Review has been reported to Admin for review verification.');
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (reviewId) => {
    if (!handleInteractionClick()) return;
    const text = commentText[reviewId];
    if (!text || !text.trim()) return;

    try {
      const { data } = await api.post('/comments', {
        reviewId,
        contentText: text,
      });

      setActiveReviewComments((prev) => ({
        ...prev,
        [reviewId]: [...(prev[reviewId] || []), data.comment],
      }));

      setCommentText((prev) => ({ ...prev, [reviewId]: '' }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (reviewId, commentId) => {
    if (!window.confirm('Delete comment?')) return;
    try {
      await api.delete(`/comments/${commentId}`);
      setActiveReviewComments((prev) => ({
        ...prev,
        [reviewId]: prev[reviewId].filter((c) => c._id !== commentId),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 animate-pulse space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl w-1/3"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl"></div>
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <Compass className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="text-xl font-bold">Listing not found</h3>
        <p className="text-sm text-slate-400">The listing you requested could not be retrieved.</p>
        <button onClick={() => navigate(-1)} className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 pb-20 relative">
      <div className="flex justify-start">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-black text-slate-500 hover:text-cyber-purple dark:text-slate-400 dark:hover:text-cyber-cyan transition-all duration-200 bg-white/50 dark:bg-slate-900/50 px-4 py-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="absolute top-20 right-10 w-[400px] h-[400px] radial-glow-purple rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* 1. Header Card with sharing details */}
      <div className="glass-card p-6 sm:p-8 flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 radial-glow-blue rounded-full blur-2xl opacity-40"></div>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider py-1 px-3 bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/20 rounded-full shadow-glow-purple">
              {type} Profile
            </span>
            <span className="flex items-center text-xs font-bold text-slate-400 dark:text-slate-500">
              <MapPin className="w-3.5 h-3.5 mr-1 text-cyber-blue" />
              {place.nearbyDistance} km from Campus
            </span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight font-sans text-slate-900 dark:text-slate-100">{place.name}</h1>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-lg border border-amber-500/20 font-sans">
              <RatingStars rating={place.averageRating} size={15} />
              <span className="text-sm font-black ml-1">{place.averageRating}</span>
            </div>
            <span className="text-xs font-bold text-slate-400 dark:text-slate-500">({place.ratingsCount} verified reviews)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
            <span className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-cyber-blue" /> {place.address}</span>
            <span className="flex items-center"><Phone className="w-4 h-4 mr-2 text-cyber-cyan" /> {place.phone}</span>
            <span className="flex items-center"><UserIcon className="w-4 h-4 mr-2 text-cyber-purple" /> Contact: {place.ownerName || place.contact || 'N/A'}</span>
          </div>
        </div>

        {/* Dynamic QR Sharing widget */}
        <div className="flex flex-col items-center justify-center border border-slate-200/60 dark:border-slate-800/60 p-4 rounded-3xl bg-white/60 dark:bg-slate-950/40 max-w-[200px] self-center shadow-sm">
          <QRCodeSVG value={window.location.href} size={100} level="M" />
          <span className="text-[9px] text-slate-400 mt-3.5 font-black tracking-widest uppercase text-center">Scan to Share</span>
        </div>
      </div>

      {/* 2. Media Gallery */}
      <div className="space-y-4">
        <h3 className="text-xl font-extrabold font-sans tracking-tight">Photos & Gallery</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {place.images.map((img, idx) => (
            <a
              key={img.fileId}
              href={img.url}
              target="_blank"
              rel="noreferrer"
              className="group relative rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/40 hover:shadow-md transition"
            >
              <img
                src={img.url}
                alt={`${place.name} media ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />
            </a>
          ))}
        </div>
      </div>

      {/* 3. Detailed Specifications Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Specifications */}
        <div className="lg:col-span-2 glass-card p-6 space-y-6">
          <h3 className="text-xl font-extrabold font-sans tracking-tight">Details & Amenities</h3>
          
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
            {place.description || 'No detailed description available for this listing.'}
          </p>

          {/* Pricing cards */}
          <div className="grid grid-cols-2 gap-4">
            {type === 'Hostel' && (
              <>
                <div className="p-4 bg-slate-50 dark:bg-[#090d16] border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Monthly Room Rent</span>
                  <p className="text-2xl font-black text-cyber-purple mt-1">₹{place.roomRent}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#090d16] border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Refundable Deposit</span>
                  <p className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">₹{place.deposit}</p>
                </div>
              </>
            )}

            {type === 'Mess' && (
              <>
                <div className="p-4 bg-slate-50 dark:bg-[#090d16] border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Monthly charges</span>
                  <p className="text-2xl font-black text-cyber-purple mt-1">₹{place.monthlyCharges}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#090d16] border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Daily Meal Price</span>
                  <p className="text-2xl font-black text-slate-700 dark:text-slate-300 mt-1">₹{place.dailyCharges}</p>
                </div>
              </>
            )}
          </div>

          {/* Hostel specific features */}
          {type === 'Hostel' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'Air Conditioning', val: place.ac, emoji: '❄️' },
                { name: 'Room Fan / Cooler', val: place.nonAc, emoji: '💨' },
                { name: 'High-speed WiFi', val: place.wifi, emoji: '⚡' },
                { name: 'Laundry Machine', val: place.laundry, emoji: '🧺' },
                { name: 'Washing Machine', val: place.washing, emoji: '🧴' },
                { name: 'Bicycle/Bike Parking', val: place.parking, emoji: '🚲' },
                { name: '24/7 Security Guard', val: place.security, emoji: '🛡️' },
                { name: 'RO Water Filter', val: place.water, emoji: '🚰' },
                { name: 'Mess Dining Available', val: place.messAvailable, emoji: '🍽️' },
              ].map((item) => (
                <div
                  key={item.name}
                  className={`flex items-center space-x-2 text-xs p-3.5 rounded-2xl border transition duration-200 font-extrabold ${
                    item.val
                      ? 'border-cyber-purple/20 bg-cyber-purple/5 text-slate-800 dark:text-slate-100'
                      : 'border-slate-100 bg-slate-50/20 text-slate-400 dark:border-slate-850/10'
                  }`}
                >
                  <Check className={`w-4 h-4 flex-shrink-0 ${item.val ? 'text-cyber-purple' : 'text-slate-300 dark:text-slate-700'}`} />
                  <span>{item.name} {item.emoji}</span>
                </div>
              ))}
            </div>
          )}

          {/* Mess specific features */}
          {type === 'Mess' && (
            <div className="space-y-4">
              <div className="p-4 border border-slate-200/50 dark:border-slate-800/40 bg-slate-50 dark:bg-[#090d16] rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Dining Timings</span>
                <p className="text-xs font-black text-slate-700 dark:text-slate-350">{place.foodTiming}</p>
              </div>
              <div className="p-4 border border-slate-200/50 dark:border-slate-800/40 bg-slate-50 dark:bg-[#090d16] rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Weekly Food Menu</span>
                <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed font-bold">{place.menu || 'Not updated.'}</p>
              </div>
            </div>
          )}

          {/* Shop specific features */}
          {type === 'Shop' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200/50 dark:border-slate-800/40 bg-slate-50 dark:bg-[#090d16] rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Shop Category</span>
                <p className="text-xs font-black text-cyber-purple">{place.category}</p>
              </div>
              <div className="p-4 border border-slate-200/50 dark:border-slate-800/40 bg-slate-50 dark:bg-[#090d16] rounded-2xl space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Operational Hours</span>
                <p className="text-xs font-black text-slate-700 dark:text-slate-300">{place.openingTime} - {place.closingTime}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar rating details */}
        <div className="lg:col-span-1 glass-card p-6 shadow-sm space-y-4 h-fit">
          <h4 className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-slate-100">Location Map</h4>
          <a
            href={place.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(place.address)}`}
            target="_blank"
            rel="noreferrer"
            className="block relative rounded-2xl overflow-hidden aspect-video bg-slate-100 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800/40 hover:scale-[1.01] transition duration-200"
          >
            <div className="absolute inset-0 bg-brand-500/10 flex flex-col items-center justify-center p-4 text-center">
              <MapPin className="w-8 h-8 text-cyber-purple animate-bounce" />
              <span className="text-xs font-black text-slate-800 dark:text-slate-100 mt-2">Open Google Maps Direction</span>
            </div>
          </a>
        </div>
      </div>

      {/* 4. Reviews List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-3">
          <h3 className="text-2xl font-extrabold font-sans tracking-tight">Reviews & Ratings</h3>
          <button
            onClick={() => {
              if (handleInteractionClick()) {
                setShowReviewForm(!showReviewForm);
              }
            }}
            className="py-2.5 px-5 bg-gradient-to-r from-cyber-purple to-cyber-blue hover:opacity-95 text-white font-extrabold rounded-xl shadow-md text-xs transition"
          >
            Write Review
          </button>
        </div>

        {/* Inline review form */}
        {showReviewForm && (
          <form onSubmit={handlePostReview} className="glass-card p-6 space-y-4 animate-slide-down">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100">Rate your student experience</h4>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-black block text-slate-400 dark:text-slate-500 uppercase tracking-widest">Star Rating *</label>
                  <RatingStars rating={reviewRating} size={24} interactive={true} onChange={setReviewRating} />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-black block text-slate-400 dark:text-slate-500 uppercase tracking-widest">Review content *</label>
                  <textarea
                    required
                    rows="3"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell other students about wifi speeds, warden behaviour, food tastes, water supply, laundry costs..."
                    className="w-full bg-slate-50 dark:bg-[#090d16] border border-slate-200/60 dark:border-slate-800/80 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-cyber-purple/55 text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-black text-green-600 dark:text-green-400 uppercase tracking-widest">Pros</label>
                    <input
                      type="text"
                      value={reviewPros}
                      onChange={(e) => setReviewPros(e.target.value)}
                      placeholder="e.g. Free high-speed WiFi"
                      className="w-full bg-slate-50 dark:bg-[#090d16] border border-slate-200/60 dark:border-slate-800/80 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-cyber-purple/55 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-black text-red-600 dark:text-red-400 uppercase tracking-widest">Cons</label>
                    <input
                      type="text"
                      value={reviewCons}
                      onChange={(e) => setReviewCons(e.target.value)}
                      placeholder="e.g. CURFEW strictly 8pm"
                      className="w-full bg-slate-50 dark:bg-[#090d16] border border-slate-200/60 dark:border-slate-800/80 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-cyber-purple/55 text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>
              </div>

              {/* Slider / Detailed parameters inputs */}
              <div className="w-full sm:w-72 bg-slate-50 dark:bg-[#090d16]/30 border border-slate-200/50 dark:border-slate-800/40 p-4 rounded-2xl space-y-3">
                <span className="text-[10px] uppercase font-black text-slate-400 dark:text-slate-500 tracking-wider">Detailed parameters (1-5)</span>
                {[
                  { key: 'price', label: 'Pricing / Value' },
                  { key: 'food', label: 'Food Quality' },
                  { key: 'cleanliness', label: 'Cleanliness' },
                  { key: 'behaviour', label: 'Warden/Owner Behaviour' },
                  { key: 'safety', label: 'Safety & Security' },
                  { key: 'internet', label: 'Internet / WiFi' },
                  { key: 'facilities', label: 'Facilities' },
                ].map((item) => (
                  <div key={item.key} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span>{item.label}</span>
                      <span>{params[item.key]} / 5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={params[item.key]}
                      onChange={(e) => setParams({ ...params, [item.key]: parseInt(e.target.value) })}
                      className="w-full accent-cyber-purple h-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Review images upload */}
            <ImageUpload
              images={reviewImages}
              onChange={setReviewImages}
              maxFiles={4}
              label="Review Photos / proof"
            />

            <div className="flex justify-end space-x-3 pt-3">
              <button
                type="button"
                onClick={() => setShowReviewForm(false)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-2.5 px-4 bg-gradient-to-r from-cyber-purple to-cyber-blue text-white rounded-xl text-xs font-semibold shadow-md"
              >
                Post Review
              </button>
            </div>
          </form>
        )}

        {/* Reviews Lists */}
        {reviews.length === 0 ? (
          <div className="text-center py-10 glass-card text-xs font-bold text-slate-400">
            No reviews yet. Be the first to share your campus review!
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="glass-card p-6 space-y-4 hover:border-cyber-purple/20 duration-300 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 radial-glow-purple rounded-full blur-2xl opacity-40"></div>
                {/* Reviewer Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={rev.author?.avatar || 'https://picsum.photos/150'}
                      alt={rev.author?.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-250/50 dark:border-slate-850/50"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <h4 className="text-sm font-black text-slate-800 dark:text-slate-150">{rev.author?.name}</h4>
                        {rev.author?.badges?.slice(0, 1).map((b) => (
                          <span key={b} className="text-[9px] font-black px-1.5 py-0.5 rounded bg-cyber-purple/10 text-cyber-purple">
                            {b}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold block mt-0.5">
                        Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <RatingStars rating={rev.rating} size={14} />
                    {(rev.author?._id === user?.id || user?.role === 'admin') && (
                      <button
                        onClick={() => handleDeleteReview(rev._id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-cyber-pink hover:bg-slate-100 dark:hover:bg-slate-850/30 transition"
                        title="Delete Review"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Review Body */}
                <p className="text-xs text-slate-650 dark:text-slate-300 leading-relaxed font-medium">
                  {rev.reviewText}
                </p>

                {/* Pros/Cons */}
                {(rev.pros || rev.cons) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-semibold">
                    {rev.pros && (
                      <span className="text-green-600 dark:text-green-400 flex items-start">
                        <span className="font-black mr-1.5 uppercase text-[9px] tracking-wider bg-green-500/10 text-green-600 px-1 py-0.5 rounded mt-0.5">Pros</span> {rev.pros}
                      </span>
                    )}
                    {rev.cons && (
                      <span className="text-red-600 dark:text-red-400 flex items-start">
                        <span className="font-black mr-1.5 uppercase text-[9px] tracking-wider bg-red-500/10 text-red-600 px-1 py-0.5 rounded mt-0.5">Cons</span> {rev.cons}
                      </span>
                    )}
                  </div>
                )}

                {/* Review Images */}
                {rev.images?.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {rev.images.map((img) => (
                      <a
                        key={img.fileId}
                        href={img.url}
                        target="_blank"
                        rel="noreferrer"
                        className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200/50 dark:border-slate-800/40"
                      >
                        <img src={img.url} alt="Review attachment" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}

                {/* Helpful slider indicators */}
                <div className="flex flex-wrap gap-2 text-[10px] text-slate-500 font-black bg-slate-50/50 dark:bg-slate-950/40 p-3 rounded-2xl border border-slate-200/50 dark:border-slate-800/20">
                  {rev.price && <span className="text-cyber-purple">Price: {rev.price}/5</span>}
                  {rev.food && <span className="ml-2 border-l border-slate-200 dark:border-slate-800 pl-2 text-cyber-blue">Food: {rev.food}/5</span>}
                  {rev.cleanliness && <span className="ml-2 border-l border-slate-200 dark:border-slate-800 pl-2 text-cyber-pink">Clean: {rev.cleanliness}/5</span>}
                  {rev.behaviour && <span className="ml-2 border-l border-slate-200 dark:border-slate-800 pl-2 text-amber-500">Warden: {rev.behaviour}/5</span>}
                  {rev.safety && <span className="ml-2 border-l border-slate-200 dark:border-slate-800 pl-2 text-emerald-500">Safety: {rev.safety}/5</span>}
                  {rev.internet && <span className="ml-2 border-l border-slate-200 dark:border-slate-800 pl-2 text-indigo-500">WiFi: {rev.internet}/5</span>}
                </div>

                {/* Likes, comments, and reports */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-4 text-slate-400 font-bold">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => handleLikeReview(rev._id)}
                      className={`flex items-center space-x-1.5 text-xs transition ${
                        rev.likes?.includes(user?.id) ? 'text-cyber-purple font-black shadow-glow-purple' : 'hover:text-slate-650'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{rev.likes?.length || 0} Helpful</span>
                    </button>
                    <span className="flex items-center space-x-1 text-xs">
                      <MessageSquare className="w-4 h-4" />
                      <span>{activeReviewComments[rev._id]?.length || 0} Comments</span>
                    </span>
                  </div>

                  <button
                    onClick={() => handleFlagReview(rev._id)}
                    className="flex items-center space-x-1 text-xs hover:text-cyber-pink transition"
                  >
                    <AlertTriangle className="w-4.5 h-4.5 text-slate-300 dark:text-slate-700" />
                    <span>Report Fake</span>
                  </button>
                </div>

                {/* Comment Section Thread */}
                <div className="mt-4 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-2xl space-y-4 border border-slate-200/50 dark:border-slate-800/20">
                  {activeReviewComments[rev._id]?.map((comm) => (
                    <div key={comm._id} className="flex items-start space-x-3 text-xs">
                      <img
                        src={comm.author?.avatar || 'https://picsum.photos/150'}
                        alt={comm.author?.name}
                        className="w-7 h-7 rounded-full object-cover border"
                      />
                      <div className="flex-1 bg-white/80 dark:bg-[#090d16]/75 border border-slate-200/50 dark:border-slate-800/40 p-2.5 rounded-2xl relative shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-black text-slate-800 dark:text-slate-200">{comm.author?.name}</span>
                          {(comm.author?._id === user?.id || user?.role === 'admin') && (
                            <button
                              onClick={() => handleDeleteComment(rev._id, comm._id)}
                              className="text-slate-400 hover:text-cyber-pink"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">{comm.contentText}</p>
                      </div>
                    </div>
                  ))}

                  {/* Add comment box */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentText[rev._id] || ''}
                      onChange={(e) => setCommentText({ ...commentText, [rev._id]: e.target.value })}
                      onKeyDown={(e) => e.key === 'Enter' && handlePostComment(rev._id)}
                      className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 px-3.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-cyber-purple/55 text-slate-850 dark:text-slate-100"
                    />
                    <button
                      onClick={() => handlePostComment(rev._id)}
                      className="py-2 px-4 bg-gradient-to-r from-cyber-purple to-cyber-blue text-white rounded-xl text-xs font-black transition"
                    >
                      Post
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceDetail;
