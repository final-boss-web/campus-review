import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  ChevronRight,
  TrendingUp,
  AlertOctagon,
  MessageSquare,
  Home as HomeIcon,
  ShoppingBag,
  Utensils,
  Award,
  ThumbsUp,
  MapPin,
  HelpCircle,
  ShieldCheck,
} from 'lucide-react';
import api from '../services/api.js';
import RatingStars from '../components/RatingStars.jsx';
import LazyImage from '../components/LazyImage.jsx';
import { getOptimizedImageUrl } from '../utils/imageOptimizer.js';

export const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data showcases
  const [topHostels, setTopHostels] = useState([]);
  const [topMesses, setTopMesses] = useState([]);
  const [topShops, setTopShops] = useState([]);
  const [scamAlerts, setScamAlerts] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);

  // Animated Typing Placeholder
  const placeholders = [
    "Search Hostels, PG, Mess, Cafes, Laundry by name...",
    "Search hostels near Gate 1...",
    "Search pure veg messes...",
    "Search stationery photocopy shops..."
  ];
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentPlaceholder, setCurrentPlaceholder] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    let timer;
    const activeString = placeholders[placeholderIndex];
    if (!isDeleting && charIndex < activeString.length) {
      timer = setTimeout(() => {
        setCurrentPlaceholder((prev) => prev + activeString[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 60);
    } else if (isDeleting && charIndex > 0) {
      timer = setTimeout(() => {
        setCurrentPlaceholder((prev) => prev.slice(0, -1));
        setCharIndex((prev) => prev - 1);
      }, 30);
    } else if (!isDeleting && charIndex === activeString.length) {
      timer = setTimeout(() => setIsDeleting(true), 1500);
    } else if (isDeleting && charIndex === 0) {
      setIsDeleting(false);
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }
    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, placeholderIndex]);

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    try {
      const [hostelsRes, messesRes, shopsRes, scamsRes] = await Promise.all([
        api.get('/places?type=Hostel'),
        api.get('/places?type=Mess'),
        api.get('/places?type=Shop'),
        api.get('/scams?verifiedOnly=true'),
      ]);

      setTopHostels(hostelsRes.data.slice(0, 3));
      setTopMesses(messesRes.data.slice(0, 3));
      setTopShops(shopsRes.data.slice(0, 3));
      setScamAlerts(scamsRes.data.slice(0, 3));

      const { data: recentRes } = await api.get('/reviews/recent').catch(() => ({ data: [] }));
      setRecentReviews(recentRes || []);
    } catch (err) {
      console.error('Error fetching homepage data:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const categories = [
    { name: 'Hostels & PGs', type: 'Hostel', icon: HomeIcon, color: 'bg-[#38BDF8]/10 border border-[#38BDF8]/25 text-[#38BDF8]' },
    { name: 'Messes', type: 'Mess', icon: Utensils, color: 'bg-[#38BDF8]/10 border border-[#38BDF8]/25 text-[#38BDF8]' },
    { name: 'Stationery & Books', type: 'Shop', category: 'Stationery & Photocopy', icon: ShoppingBag, color: 'bg-white/5 border border-white/10 text-white' },
    { name: 'Restaurants & Cafes', type: 'Shop', category: 'Restaurant & Cafe', icon: Utensils, color: 'bg-white/5 border border-white/10 text-white' },
  ];

  return (
    <div className="space-y-16 pb-24 relative overflow-hidden bg-[#0D0D1A]">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] radial-glow-purple rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] radial-glow-blue rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* 1. Hero Section */}
      <header className="relative py-28 bg-[#0D0D1A] text-white rounded-b-[48px] overflow-hidden bg-grid-pattern border-b border-[#2A2A3D] shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/20 via-[#0D0D1A] to-sky-950/20"></div>
        <div className="relative max-w-5xl mx-auto px-6 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-4.5 py-2 rounded-xl text-xs font-black bg-[#15152E] text-[#38BDF8] border border-[#2A2A3D]">
            <span>🎓</span> <span className="tracking-wider">CAMPUS REVIEW HUB</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight leading-tight text-white uppercase">
            Find the Best Near <br />
            <span className="gradient-text-neon">Your College</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-355 max-w-xl mx-auto leading-relaxed font-semibold">
            Real student reviews of PGs, Hostels, Messes, Cafes, and photocopy shops. No broker cap 🧢, just 100% verified student experiences.
          </p>

          {/* Search bar widget - Refined Neubrutalist style */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center bg-[#15152E] p-2.5 rounded-2xl border border-[#2A2A3D] focus-within:border-white focus-within:-translate-x-0.5 focus-within:-translate-y-0.5 focus-within:shadow-brutal-blue transition-all duration-200">
            <Search className="w-5.5 h-5.5 text-[#38BDF8] ml-3 flex-shrink-0" />
            <input
              type="text"
              placeholder={currentPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow w-full bg-transparent border-none focus:outline-none focus:ring-0 text-white placeholder-slate-500 text-sm py-2 px-3 font-semibold"
            />
            <button
              type="submit"
              className="py-3 px-8 rounded-xl font-black text-black bg-[#00D68F] border border-[#00D68F] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#FFFFFF] transition duration-150 text-sm"
            >
              Search
            </button>
          </form>

          {/* Gen-Z Badges - Mapped to Blue color story */}
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <span className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-black bg-[#38BDF8]/5 text-[#38BDF8] border border-[#38BDF8]/30 tracking-wider hover:-translate-y-0.5 transition duration-150">
              No Cap 🧢
            </span>
            <span className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-black bg-[#38BDF8]/5 text-[#38BDF8] border border-[#38BDF8]/30 tracking-wider hover:-translate-y-0.5 transition duration-150">
              Verified Reviews ✅
            </span>
            <span className="inline-flex items-center px-4 py-2.5 rounded-xl text-xs font-black bg-[#38BDF8]/5 text-[#38BDF8] border border-[#38BDF8]/30 tracking-wider hover:-translate-y-0.5 transition duration-150">
              Direct Contact 🚫 Brokerage
            </span>
          </div>
        </div>
      </header>

      {/* 2. Categories Section */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        <h2 className="text-3xl font-black tracking-tight text-white uppercase">Explore Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const query = cat.category 
              ? `type=${cat.type}&category=${encodeURIComponent(cat.category)}` 
              : `type=${cat.type}`;
            return (
              <Link
                key={cat.name}
                to={`/search?${query}`}
                className="flex flex-col items-center justify-center p-8 bg-[#15152E] border border-[#2A2A3D] rounded-2xl transition duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:border-white hover:shadow-brutal-blue group"
              >
                <div className={`flex items-center justify-center w-16 h-16 rounded-xl mb-4 ${cat.color} group-hover:scale-105 transition duration-200 shadow-sm`}>
                  <cat.icon className="w-7 h-7" />
                </div>
                <span className="text-base font-black text-white text-center">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Scam Alerts Ticker - Neubrutalist Red Alert */}
      {scamAlerts.length > 0 && (
        <section className="max-w-7xl mx-auto px-6">
          <div className="bg-[#15152E] border border-[#EF4444] rounded-[32px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-brutal-red hover:-translate-x-1 hover:-translate-y-1 transition duration-300">
            <div className="flex items-start space-x-5">
              <div className="p-4 bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 rounded-2xl">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-black text-[#EF4444] uppercase tracking-widest flex items-center bg-[#EF4444]/10 px-2.5 py-1 rounded border border-[#EF4444]/30 w-fit">
                  ⚠️ Alert: SCAM PATROL
                </span>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">Beware of Fake PGs & Hostels</h3>
                <p className="text-sm text-slate-305 font-bold">
                  Never send advance UPI token deposits before visiting the property in person!
                </p>
              </div>
            </div>
            <Link
              to="/scams"
              className="flex items-center space-x-2 py-3.5 px-7 rounded-xl font-black text-white bg-[#EF4444] border border-[#EF4444] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#FFFFFF] transition duration-150 text-xs"
            >
              <span>View Scam Alerts</span>
              <ChevronRight className="w-4.5 h-4.5" />
            </Link>
          </div>
        </section>
      )}

      {/* 4. Showcase: Top Rated Hostels */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight text-white uppercase">Top Rated Hostels</h2>
            <p className="text-xs text-slate-400 font-bold">Verified for safety, WiFi speed, cleanliness, and security refunds</p>
          </div>
          <Link to="/search?type=Hostel" className="text-xs text-[#38BDF8] font-black hover:underline flex items-center space-x-0.5">
            <span>View All</span>
            <ChevronRight className="w-4.5 h-4.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topHostels.map((hostel) => (
            <Link
              key={hostel._id}
              to={`/place/Hostel/${hostel.slug || hostel._id}`}
              className="group bg-[#15152E] border border-[#2A2A3D] rounded-2xl hover:-translate-x-1 hover:-translate-y-1 hover:border-white hover:shadow-brutal-blue transition duration-200 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video border-b border-[#2A2A3D] overflow-hidden">
                  <LazyImage
                    src={getOptimizedImageUrl(hostel.images[0], 600, 400)}
                    alt={hostel.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 py-1.5 px-3 bg-black/85 border border-[#2A2A3D] text-[11px] font-black text-[#38BDF8] rounded-xl">
                    ₹{hostel.roomRent}/mo
                  </span>
                  <span className="absolute bottom-3 right-3 py-1.5 px-3 bg-[#15152E] border border-[#2A2A3D] text-white text-[9px] font-black rounded-xl">
                    {hostel.nearbyDistance} km away
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <RatingStars rating={hostel.averageRating} size={13} />
                    <span className="text-[10px] font-black text-slate-400">({hostel.ratingsCount} reviews)</span>
                  </div>
                  <h3 className="font-black text-xl truncate text-white group-hover:text-[#38BDF8] transition duration-150">
                    {hostel.name}
                  </h3>
                  <p className="text-xs text-slate-300 font-semibold line-clamp-2 leading-relaxed">
                    {hostel.description}
                  </p>
                </div>
              </div>
              <div className="p-6 pt-0 flex flex-wrap gap-2">
                {hostel.ac && <span className="text-[9px] px-2 py-0.5 bg-[#38BDF8]/10 border border-[#38BDF8]/35 text-[#38BDF8] rounded-md font-bold">AC ❄️</span>}
                {hostel.wifi && <span className="text-[9px] px-2 py-0.5 bg-white/5 border border-white/10 text-white rounded-md font-bold">WiFi ⚡</span>}
                {hostel.laundry && <span className="text-[9px] px-2 py-0.5 bg-white/5 border border-white/10 text-white rounded-md font-bold">Laundry 🧺</span>}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Showcase: Top Rated Messes */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight text-white uppercase">Top Rated Messes</h2>
            <p className="text-xs text-slate-400 font-bold">Search fresh meal plans, clean seating, and daily/monthly charge reviews</p>
          </div>
          <Link to="/search?type=Mess" className="text-xs text-[#38BDF8] font-black hover:underline flex items-center space-x-0.5">
            <span>View All</span>
            <ChevronRight className="w-4.5 h-4.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topMesses.map((mess) => {
            const isRedSpice = mess.name?.toLowerCase().includes("red spice");
            const fallbackImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop";
            return (
              <Link
                key={mess._id}
                to={`/place/Mess/${mess.slug || mess._id}`}
                className="group bg-[#15152E] border border-[#2A2A3D] rounded-2xl hover:-translate-x-1 hover:-translate-y-1 hover:border-white hover:shadow-brutal-blue transition duration-200 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video border-b border-[#2A2A3D] overflow-hidden">
                    <LazyImage
                      src={getOptimizedImageUrl(isRedSpice ? fallbackImage : (mess.images[0]?.url || fallbackImage), 600, 400)}
                      alt={mess.name}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <span className="absolute top-3 left-3 py-1.5 px-3 bg-black/85 border border-[#2A2A3D] text-[11px] font-black text-[#38BDF8] rounded-xl">
                      ₹{mess.monthlyCharges}/mo
                    </span>
                    <span className="absolute bottom-3 right-3 py-1.5 px-3 bg-[#15152E] border border-[#2A2A3D] text-white text-[9px] font-black rounded-xl">
                      Daily: ₹{mess.dailyCharges}
                    </span>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <RatingStars rating={mess.averageRating} size={13} />
                      <span className="text-[10px] font-black text-slate-400">({mess.ratingsCount} reviews)</span>
                    </div>
                    <h3 className="font-black text-xl truncate text-white group-hover:text-[#38BDF8] transition duration-150">
                      {mess.name}
                    </h3>
                    <p className="text-xs text-slate-300 font-semibold line-clamp-2 leading-relaxed">
                      Menu: {mess.menu}
                    </p>
                  </div>
                </div>
                <div className="p-6 pt-0 flex gap-2">
                  {mess.veg && <span className="text-[9px] px-3 py-0.5 bg-[#00D68F]/10 border border-[#00D68F]/30 text-[#00D68F] rounded-full font-black">Pure Veg 🥬</span>}
                  {mess.nonVeg && <span className="text-[9px] px-3 py-0.5 bg-white/5 border border-white/10 text-white rounded-full font-black">Non-Veg 🍗</span>}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 6. Showcase: Top Cafes, Books, & Shops */}
      <section className="max-w-7xl mx-auto px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-black tracking-tight text-white uppercase">Top Cafes, Books & Services</h2>
            <p className="text-xs text-slate-400 font-bold">Student recommended hangouts, printing services, and book retailers</p>
          </div>
          <Link to="/search?type=Shop" className="text-xs text-[#38BDF8] font-black hover:underline flex items-center space-x-0.5">
            <span>View All</span>
            <ChevronRight className="w-4.5 h-4.5" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {topShops.map((shop) => (
            <Link
              key={shop._id}
              to={`/place/Shop/${shop.slug || shop._id}`}
              className="group bg-[#15152E] border border-[#2A2A3D] rounded-2xl hover:-translate-x-1 hover:-translate-y-1 hover:border-white hover:shadow-brutal-blue transition duration-200 overflow-hidden flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-video border-b border-[#2A2A3D] overflow-hidden">
                  <LazyImage
                    src={getOptimizedImageUrl(shop.images[0]?.url || 'https://picsum.photos/600/400', 600, 400)}
                    alt={shop.name}
                    className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 py-1.5 px-3 bg-[#15152E] border border-[#2A2A3D] text-[#38BDF8] text-[10px] font-black rounded-xl">
                    {shop.category}
                  </span>
                  <span className="absolute bottom-3 right-3 py-1.5 px-2.5 bg-black/80 border border-[#2A2A3D] text-white text-[9px] font-black rounded-xl">
                    {shop.openingTime} - {shop.closingTime}
                  </span>
                </div>
                <div className="p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <RatingStars rating={shop.averageRating} size={13} />
                    <span className="text-[10px] font-black text-slate-400">({shop.ratingsCount} reviews)</span>
                  </div>
                  <h3 className="font-black text-xl truncate text-white group-hover:text-[#38BDF8] transition duration-150">
                    {shop.name}
                  </h3>
                  <p className="text-xs text-slate-300 font-semibold truncate">
                    📍 {shop.address}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. Recent Reviews Section */}
      {recentReviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl font-black tracking-tight text-white uppercase">Recent Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {recentReviews.map((rev) => {
              const studentAvatarUrl = `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(rev.author?.name || 'student')}`;
              return (
                <div
                  key={rev._id}
                  className="bg-[#15152E] border border-[#2A2A3D] rounded-2xl p-6 transition duration-200 hover:-translate-x-1 hover:-translate-y-1 hover:border-white hover:shadow-brutal-blue space-y-4 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={studentAvatarUrl}
                        alt={rev.author?.name}
                        loading="lazy"
                        className="w-12 h-12 rounded-xl object-cover border border-[#2A2A3D] bg-slate-900 shadow-[2px_2px_0px_#000000]"
                      />
                      <div>
                        <h4 className="text-base font-black text-white">{rev.author?.name}</h4>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mt-0.5">
                          Reviewed {rev.placeId?.name || 'Listing'}
                        </span>
                      </div>
                    </div>
                    <RatingStars rating={rev.rating} size={12} />
                  </div>
                  <p className="text-xs text-slate-205 font-semibold leading-relaxed italic">
                    "{rev.reviewText}"
                  </p>
                  {rev.pros && (
                    <p className="text-xs text-[#00D68F] flex items-center gap-1.5 font-bold">
                      <strong className="text-[9px] uppercase font-black tracking-wider bg-[#00D68F]/10 border border-[#00D68F]/30 px-1.5 py-0.5 rounded">Pros</strong> {rev.pros}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;
