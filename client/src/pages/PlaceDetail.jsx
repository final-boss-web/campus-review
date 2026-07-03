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
  Clock,
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
  const [activeReviewComments, setActiveReviewComments] = useState({});
  const [commentText, setCommentText] = useState({});

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
        placeId: place._id,
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
      
      setReviewRating(5);
      setReviewText('');
      setReviewPros('');
      setReviewCons('');
      setReviewImages([]);
      
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
      <div className="max-w-4xl mx-auto py-24 px-6 animate-pulse space-y-6">
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl w-1/3"></div>
        <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-[32px]"></div>
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  if (error || !place) {
    return (
      <div className="max-w-md mx-auto py-24 px-6 text-center space-y-4">
        <Compass className="w-12 h-12 text-[#EF4444] mx-auto animate-bounce" />
        <h3 className="text-xl font-black text-white uppercase">Listing not found</h3>
        <p className="text-sm text-slate-400 font-semibold">The listing you requested could not be retrieved.</p>
        <button onClick={() => navigate(-1)} className="py-2.5 px-5 bg-zinc-100 dark:bg-slate-800 rounded-xl text-xs font-bold transition">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 sm:px-8 space-y-8 pb-20 relative bg-[#0D0D1A]">
      <div className="flex justify-start">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-black text-white hover:text-[#38BDF8] transition-all duration-200 bg-[#15152E] px-4 py-2.5 rounded-xl border border-[#2A2A3D] shadow-sm hover:border-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="absolute top-20 right-10 w-[400px] h-[400px] radial-glow-purple rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* 1. Header Card */}
      <div className="bg-[#15152E] border border-[#2A2A3D] rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden transition duration-200 hover:border-white hover:shadow-brutal-blue">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider py-1 px-3 bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/30 rounded-xl">
              {type} Profile
            </span>
            <span className="flex items-center text-xs font-black text-white">
              <MapPin className="w-3.5 h-3.5 mr-1 text-[#EF4444]" />
              {place.nearbyDistance} km from Campus
            </span>
          </div>

          <h1 className="text-4xl font-black uppercase text-white tracking-tight">{place.name}</h1>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-xl border border-amber-500/30">
              <RatingStars rating={place.averageRating} size={15} />
              <span className="text-sm font-black ml-1">{place.averageRating}</span>
            </div>
            <span className="text-xs font-bold text-slate-400">({place.ratingsCount} verified reviews)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-semibold text-slate-350">
            <span className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-[#38BDF8]" /> {place.address}</span>
            <span className="flex items-center"><Phone className="w-4 h-4 mr-2 text-[#38BDF8]" /> {place.phone}</span>
            <span className="flex items-center"><UserIcon className="w-4 h-4 mr-2 text-[#38BDF8]" /> Contact: {place.ownerName || place.contact || 'N/A'}</span>
          </div>
        </div>

        {/* Dynamic QR Sharing widget */}
        <div className="flex flex-col items-center justify-center border border-[#2A2A3D] p-4 rounded-2xl bg-[#0D0D1A] max-w-[200px] self-center shadow-sm">
          <QRCodeSVG value={window.location.href} size={100} level="M" />
          <span className="text-[9px] text-[#38BDF8] mt-3 font-black tracking-widest uppercase text-center">Scan to Share</span>
        </div>
      </div>

      {/* 2. Media Gallery */}
      {place.images?.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Photos & Gallery</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {place.images.map((img, idx) => (
              <a
                key={img.fileId}
                href={img.url}
                target="_blank"
                rel="noreferrer"
                className="group relative rounded-2xl overflow-hidden aspect-video bg-zinc-950 border border-[#2A2A3D] shadow-sm hover:border-white transition duration-150"
              >
                <img
                  src={img.url}
                  alt={`${place.name} media ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 3. Detailed Specifications Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Specifications */}
        <div className="lg:col-span-2 bg-[#15152E] border border-[#2A2A3D] rounded-2xl p-6 space-y-6 transition duration-200 hover:border-white hover:shadow-brutal-blue">
          <h3 className="text-xl font-black text-white uppercase tracking-tight">Details & Amenities</h3>
          
          <p className="text-xs sm:text-sm text-slate-350 leading-relaxed font-semibold">
            {place.description || 'No detailed description available for this listing.'}
          </p>

          {/* Pricing cards */}
          <div className="grid grid-cols-2 gap-4">
            {type === 'Hostel' && (
              <>
                <div className="p-4 bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Monthly Room Rent</span>
                  <p className="text-2xl font-black text-[#38BDF8] mt-1">₹{place.roomRent}</p>
                </div>
                <div className="p-4 bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Refundable Deposit</span>
                  <p className="text-2xl font-black text-white mt-1">₹{place.deposit}</p>
                </div>
              </>
            )}

            {type === 'Mess' && (
              <>
                <div className="p-4 bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Monthly charges</span>
                  <p className="text-2xl font-black text-[#38BDF8] mt-1">₹{place.monthlyCharges}</p>
                </div>
                <div className="p-4 bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl">
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Daily Meal Price</span>
                  <p className="text-2xl font-black text-white mt-1">₹{place.dailyCharges}</p>
                </div>
              </>
            )}
          </div>

          {/* Hostel specific features */}
          {type === 'Hostel' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
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
                  className={`flex items-center space-x-2 text-xs p-3.5 rounded-xl border transition duration-150 font-black ${
                    item.val
                      ? 'border-[#38BDF8] bg-[#38BDF8]/5 text-[#38BDF8]'
                      : 'border-[#2A2A3D] bg-[#0D0D1A] text-slate-500'
                  }`}
                >
                  <Check className={`w-4 h-4 flex-shrink-0 ${item.val ? 'text-[#38BDF8]' : 'text-slate-500'}`} />
                  <span>{item.name} {item.emoji}</span>
                </div>
              ))}
            </div>
          )}

          {/* Mess specific features */}
          {type === 'Mess' && (
            <div className="space-y-4">
              <div className="p-4 border border-[#2A2A3D] bg-[#0D0D1A] rounded-xl space-y-1">
                <span className="text-[9px] font-black uppercase text-[#38BDF8] tracking-wider">Dining Timings</span>
                <p className="text-xs font-black text-white">{place.foodTiming}</p>
              </div>
              <div className="p-4 border border-[#2A2A3D] bg-[#0D0D1A] rounded-xl space-y-1">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Weekly Food Menu</span>
                <p className="text-xs text-white whitespace-pre-line leading-relaxed font-bold">{place.menu || 'Not updated.'}</p>
              </div>
            </div>
          )}

          {/* Shop specific features */}
          {type === 'Shop' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-[#2A2A3D] bg-[#0D0D1A] rounded-xl space-y-1">
                <span className="text-[9px] font-black uppercase text-[#38BDF8] tracking-wider">Shop Category</span>
                <p className="text-xs font-black text-white">{place.category}</p>
              </div>
              <div className="p-4 border border-[#2A2A3D] bg-[#0D0D1A] rounded-xl space-y-1">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Operational Hours</span>
                <p className="text-xs font-black text-slate-350">{place.openingTime} - {place.closingTime}</p>
              </div>
            </div>
          )}

          {/* Menu / Catalog Images */}
          {place.menuImages?.length > 0 && (
            <div className="space-y-2">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Menu Cards / Price Lists</span>
              <div className="flex flex-wrap gap-3">
                {place.menuImages.map((img, idx) => (
                  <a
                    key={img.fileId || idx}
                    href={img.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative w-24 h-24 rounded-xl overflow-hidden border border-[#2A2A3D] hover:border-white transition duration-150"
                  >
                    <img src={img.url} alt="Menu page" className="w-full h-full object-cover" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar details */}
        <div className="lg:col-span-1 bg-[#15152E] border border-[#2A2A3D] rounded-2xl p-6 space-y-4 h-fit">
          <h4 className="font-black text-sm tracking-tight text-white uppercase">Location Map</h4>
          <a
            href={place.googleMapsUrl || `https://maps.google.com/?q=${encodeURIComponent(place.address)}`}
            target="_blank"
            rel="noreferrer"
            className="block relative rounded-2xl overflow-hidden aspect-video bg-zinc-950 border border-[#2A2A3D] hover:border-white transition duration-150"
          >
            <div className="absolute inset-0 bg-[#38BDF8]/5 flex flex-col items-center justify-center p-4 text-center">
              <MapPin className="w-8 h-8 text-[#38BDF8] animate-bounce" />
              <span className="text-xs font-black text-white mt-2 uppercase tracking-wider bg-black border border-[#2A2A3D] px-2 py-0.5 rounded">Directions</span>
            </div>
          </a>
        </div>
      </div>

      {/* 4. Reviews List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#2A2A3D] pb-3">
          <h3 className="text-2xl font-black text-white uppercase tracking-tight">Reviews & Ratings</h3>
          <button
            onClick={() => {
              if (handleInteractionClick()) {
                setShowReviewForm(!showReviewForm);
              }
            }}
            className="py-2.5 px-5 bg-[#00D68F] border border-[#00D68F] hover:border-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-blue transition duration-150 text-black font-black rounded-xl text-xs active:scale-95"
          >
            Write Review
          </button>
        </div>

        {/* Inline review form */}
        {showReviewForm && (
          <form onSubmit={handlePostReview} className="bg-[#15152E] border border-[#2A2A3D] rounded-2xl p-6 space-y-4 animate-slide-down hover:border-white hover:shadow-brutal-blue transition duration-200">
            <h4 className="font-black text-sm text-white uppercase">Rate your student experience</h4>
            
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black block text-[#38BDF8] uppercase tracking-wider">Star Rating *</label>
                  <RatingStars rating={reviewRating} size={24} interactive={true} onChange={setReviewRating} />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black block text-slate-400 uppercase tracking-wider">Review content *</label>
                  <textarea
                    required
                    rows="3"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder="Tell other students about wifi speeds, warden behaviour, food tastes, water supply, laundry costs..."
                    className="premium-input bg-[#0D0D1A]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#00D68F] uppercase tracking-wider">Pros</label>
                    <input
                      type="text"
                      value={reviewPros}
                      onChange={(e) => setReviewPros(e.target.value)}
                      placeholder="e.g. Free high-speed WiFi"
                      className="premium-input bg-[#0D0D1A]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#EF4444] uppercase tracking-wider">Cons</label>
                    <input
                      type="text"
                      value={reviewCons}
                      onChange={(e) => setReviewCons(e.target.value)}
                      placeholder="e.g. CURFEW strictly 8pm"
                      className="premium-input bg-[#0D0D1A]"
                    />
                  </div>
                </div>
              </div>

              {/* Slider inputs */}
              <div className="w-full sm:w-72 bg-[#0D0D1A] border border-[#2A2A3D] p-4 rounded-xl space-y-3 shadow-sm">
                <span className="text-[10px] uppercase font-black text-[#38BDF8] tracking-widest block">Parameters Score (1-5)</span>
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
                    <div className="flex items-center justify-between text-[10px] font-black text-slate-350">
                      <span>{item.label}</span>
                      <span>{params[item.key]} / 5</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={params[item.key]}
                      onChange={(e) => setParams({ ...params, [item.key]: parseInt(e.target.value) })}
                      className="w-full accent-[#38BDF8] h-1.5 bg-slate-800 rounded-lg cursor-pointer"
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
                className="py-3 px-5 bg-slate-900 border border-[#2A2A3D] rounded-xl text-xs font-black text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="py-3 px-5 bg-[#00D68F] border border-[#00D68F] hover:border-white hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-blue transition duration-150 active:scale-95 text-black font-black"
              >
                Post Review
              </button>
            </div>
          </form>
        )}

        {/* Reviews Lists */}
        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-[#15152E] border border-[#2A2A3D] rounded-2xl shadow-sm text-xs font-bold text-slate-500">
            No reviews yet. Be the first to share your campus review!
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((rev) => {
              const studentAvatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(rev.author?.name || 'student')}`;
              return (
                <div
                  key={rev._id}
                  className="bg-[#15152E] border border-[#2A2A3D] rounded-2xl p-6 transition duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:border-white hover:shadow-brutal-blue space-y-4 relative overflow-hidden"
                >
                  {/* Reviewer Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={studentAvatarUrl}
                        alt={rev.author?.name}
                        className="w-12 h-12 rounded-xl object-cover border border-[#2A2A3D] bg-slate-900 shadow-sm"
                      />
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <h4 className="text-sm font-black text-white">{rev.author?.name}</h4>
                          {rev.author?.badges?.slice(0, 1).map((b) => (
                            <span key={b} className="text-[9px] font-black px-1.5 py-0.5 rounded border border-[#38BDF8]/30 bg-[#38BDF8]/5 text-[#38BDF8]">
                              {b}
                            </span>
                          ))}
                        </div>
                        <span className="text-[10px] text-slate-400 font-bold block mt-0.5">
                          Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <RatingStars rating={rev.rating} size={13} />
                      {(rev.author?._id === user?.id || user?.role === 'admin') && (
                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#EF4444] hover:bg-slate-900 border border-transparent hover:border-white transition"
                          title="Delete Review"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Review Body */}
                  <p className="text-xs text-white leading-relaxed font-semibold">
                    {rev.reviewText}
                  </p>

                  {/* Pros/Cons */}
                  {(rev.pros || rev.cons) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs font-semibold">
                      {rev.pros && (
                        <span className="text-[#00D68F] flex items-start">
                          <span className="font-black mr-1.5 uppercase text-[9px] tracking-wider bg-[#00D68F]/10 border border-[#00D68F]/30 text-[#00D68F] px-1.5 py-0.5 rounded mt-0.5">Pros</span> {rev.pros}
                        </span>
                      )}
                      {rev.cons && (
                        <span className="text-[#EF4444] flex items-start">
                          <span className="font-black mr-1.5 uppercase text-[9px] tracking-wider bg-[#EF4444]/10 border border-[#EF4444]/30 text-[#EF4444] px-1.5 py-0.5 rounded mt-0.5">Cons</span> {rev.cons}
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
                          className="w-16 h-12 rounded-lg overflow-hidden border border-[#2A2A3D]"
                        >
                          <img src={img.url} alt="Review attachment" className="w-full h-full object-cover" />
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Detailed score metrics */}
                  <div className="flex flex-wrap gap-2 text-[10px] text-white font-black bg-[#0D0D1A] p-3 rounded-xl border border-[#2A2A3D]">
                    {rev.price && <span className="text-[#38BDF8]">Price: {rev.price}/5</span>}
                    {rev.food && <span className="ml-2 border-l border-[#2A2A3D] pl-2 text-slate-350">Food: {rev.food}/5</span>}
                    {rev.cleanliness && <span className="ml-2 border-l border-[#2A2A3D] pl-2 text-slate-350">Clean: {rev.cleanliness}/5</span>}
                    {rev.behaviour && <span className="ml-2 border-l border-[#2A2A3D] pl-2 text-slate-350">Warden: {rev.behaviour}/5</span>}
                    {rev.safety && <span className="ml-2 border-l border-[#2A2A3D] pl-2 text-slate-350">Safety: {rev.safety}/5</span>}
                    {rev.internet && <span className="ml-2 border-l border-[#2A2A3D] pl-2 text-[#38BDF8] font-bold">WiFi: {rev.internet}/5</span>}
                  </div>

                  {/* Likes, comments, and reports */}
                  <div className="flex items-center justify-between border-t border-[#2A2A3D] pt-4 text-slate-400 font-black">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLikeReview(rev._id)}
                        className={`flex items-center space-x-1.5 text-xs transition ${
                          rev.likes?.includes(user?.id) ? 'text-[#38BDF8] font-black' : 'hover:text-white'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>{rev.likes?.length || 0} Helpful</span>
                      </button>
                      <span className="flex items-center space-x-1 text-xs text-slate-355">
                        <MessageSquare className="w-4.5 h-4.5" />
                        <span>{activeReviewComments[rev._id]?.length || 0} Comments</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleFlagReview(rev._id)}
                      className="flex items-center space-x-1 text-xs hover:text-[#EF4444] transition"
                    >
                      <AlertTriangle className="w-4.5 h-4.5 text-slate-500" />
                      <span>Report Fake</span>
                    </button>
                  </div>

                  {/* Comment Section Thread */}
                  <div className="mt-4 bg-[#0D0D1A] p-4 rounded-xl space-y-4 border border-[#2A2A3D]">
                    {activeReviewComments[rev._id]?.map((comm) => (
                      <div key={comm._id} className="flex items-start space-x-3 text-xs">
                        <img
                          src={`https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(comm.author?.name || 'student')}`}
                          alt={comm.author?.name}
                          className="w-7 h-7 rounded-lg object-cover border border-[#2A2A3D] bg-slate-900 shadow-sm"
                        />
                        <div className="flex-1 bg-[#15152E] border border-[#2A2A3D] p-2.5 rounded-xl relative">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-white">{comm.author?.name}</span>
                            {(comm.author?._id === user?.id || user?.role === 'admin') && (
                              <button
                                onClick={() => handleDeleteComment(rev._id, comm._id)}
                                className="text-slate-400 hover:text-[#EF4444]"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-white font-semibold">{comm.contentText}</p>
                        </div>
                      </div>
                    ))}

                    {/* Add comment box */}
                    <div className="flex gap-2.5">
                      <input
                        type="text"
                        placeholder="Write a comment..."
                        value={commentText[rev._id] || ''}
                        onChange={(e) => setCommentText({ ...commentText, [rev._id]: e.target.value })}
                        onKeyDown={(e) => e.key === 'Enter' && handlePostComment(rev._id)}
                        className="flex-1 bg-[#15152E] border border-[#2A2A3D] p-2 px-3.5 rounded-xl text-xs focus:outline-none focus:border-[#38BDF8] text-white"
                      />
                      <button
                        onClick={() => handlePostComment(rev._id)}
                        className="py-2.5 px-4 bg-[#00D68F] text-black font-black border border-[#00D68F] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-blue transition rounded-xl text-xs"
                      >
                        Post
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaceDetail;
