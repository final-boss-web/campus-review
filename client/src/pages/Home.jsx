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

export const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Data showcases
  const [stats, setStats] = useState({ hostelsCount: 0, shopsCount: 0, messesCount: 0 });
  const [topHostels, setTopHostels] = useState([]);
  const [topShops, setTopShops] = useState([]);
  const [topMesses, setTopMesses] = useState([]);
  const [scamAlerts, setScamAlerts] = useState([]);
  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    fetchHomepageData();
  }, []);

  const fetchHomepageData = async () => {
    try {
      // Fetch approved places
      const [hostelsRes, messesRes, shopsRes, scamsRes] = await Promise.all([
        api.get('/places?type=Hostel'),
        api.get('/places?type=Mess'),
        api.get('/places?type=Shop'),
        api.get('/scams?verifiedOnly=true'),
      ]);

      // Top rated filters
      setTopHostels(hostelsRes.data.slice(0, 3));
      setTopMesses(messesRes.data.slice(0, 3));
      setTopShops(shopsRes.data.slice(0, 3));

      // Scam alerts
      setScamAlerts(scamsRes.data.slice(0, 3));

      // Fetch combined lists for reviews (we can pull from the place detail or a generic route. Let's make an adhoc fetch or simulate if empty)
      // For now, let's create a combined recent reviews list
      const allReviews = [];
      hostelsRes.data.forEach(h => h.reviewsCount > 0 && allReviews.push(...(h.reviews || [])));
      
      // Let's query recent reviews from database
      const { data: analyticsRes } = await api.get('/analytics/dashboard').catch(() => ({ data: null }));
      if (analyticsRes) {
        setRecentReviews(analyticsRes.recent?.recentReviews || []);
      }
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
    { name: 'Hostels & PGs', type: 'Hostel', icon: HomeIcon, color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' },
    { name: 'Messes', type: 'Mess', icon: Utensils, color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
    { name: 'Stationery & Photocopy', type: 'Shop', category: 'Stationery & Photocopy', icon: ShoppingBag, color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { name: 'Restaurants & Cafes', type: 'Shop', category: 'Restaurant & Cafe', icon: Utensils, color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400' },
  ];

  return (
    <div className="space-y-16 pb-20 relative overflow-hidden">
      {/* Decorative Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] radial-glow-purple rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] radial-glow-blue rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* 1. Hero Section */}
      <header className="relative py-24 bg-slate-950 text-white rounded-b-[40px] overflow-hidden bg-grid-pattern border-b border-slate-800/50 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-purple/20 via-slate-950 to-cyber-blue/20"></div>
        <div className="relative max-w-5xl mx-auto px-4 text-center space-y-8">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full text-xs font-black bg-gradient-to-r from-cyber-purple/10 to-cyber-blue/10 text-cyber-cyan border border-cyber-cyan/30 shadow-glow-blue animate-pulse-glow">
            <span>🎓</span> <span>Campus Review Hub</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-tight font-sans">
            Find the Best Near <br className="sm:hidden" />
            <span className="gradient-text-neon bg-gradient-to-r from-cyber-purple via-[#8b5cf6] to-cyber-blue">Your College</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-sans leading-relaxed">
            Real student reviews of PGs, Hostels, Messes, Cafes, and photocopy shops. <br />
            No broker cap 🧢, just 100% verified student experiences.
          </p>

          {/* Search bar widget */}
          <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto flex items-center bg-white/95 dark:bg-slate-900/90 p-2 rounded-2xl shadow-2xl border border-slate-200/55 dark:border-slate-800/80 backdrop-blur-md focus-within:ring-2 focus-within:ring-cyber-purple/55 transition-all duration-300">
            <Search className="w-6 h-6 text-slate-400 ml-3" />
            <input
              type="text"
              placeholder="Search Hostels, PG, Mess, Cafes, Laundry by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm py-2 px-3"
            />
            <button
              type="submit"
              className="py-3 px-6 rounded-xl font-bold text-white gradient-bg-neon hover:opacity-90 shadow-md transition duration-200 text-sm"
            >
              Search
            </button>
          </form>

          {/* Gen-Z Badges */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black bg-cyber-purple/10 text-cyber-purple border border-cyber-purple/20 shadow-glow-purple">
              No Cap 🧢
            </span>
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black bg-cyber-blue/10 text-cyber-cyan border border-cyber-blue/20 shadow-glow-blue">
              Verified Student Reviews ✅
            </span>
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-black bg-cyber-pink/10 text-cyber-pink border border-cyber-pink/20 shadow-glow-pink">
              Direct Contact 🚫 Brokerage
            </span>
          </div>
        </div>
      </header>

      {/* 2. Categories Section */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-extrabold font-sans tracking-tight">Explore Categories</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {categories.map((cat) => {
            const query = cat.category 
              ? `type=${cat.type}&category=${encodeURIComponent(cat.category)}` 
              : `type=${cat.type}`;
            return (
              <Link
                key={cat.name}
                to={`/search?${query}`}
                className="flex flex-col items-center justify-center p-6 glass-card hover:-translate-y-2 hover:shadow-lg dark:hover:border-cyber-purple/30 group duration-300"
              >
                <div className={`flex items-center justify-center w-14 h-14 rounded-2xl mb-3 ${cat.color} group-hover:scale-110 transition duration-300`}>
                  <cat.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-extrabold text-slate-800 dark:text-slate-200 text-center">
                  {cat.name}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. Scam Alerts Ticker */}
      {scamAlerts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4">
          <div className="bg-red-500/5 dark:bg-red-950/20 border-2 border-red-500/30 rounded-[32px] p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-glow-pink">
            <div className="flex items-start space-x-4">
              <div className="p-3.5 bg-gradient-to-br from-red-500 to-cyber-pink text-white rounded-2xl shadow-lg shadow-red-500/20 animate-pulse-glow">
                <AlertOctagon className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-black text-cyber-pink uppercase tracking-widest flex items-center">
                  <ShieldCheck className="w-4 h-4 mr-1" /> Alert: Scam Patrol
                </span>
                <h3 className="text-2xl font-black font-sans tracking-tight text-slate-900 dark:text-red-100">Beware of Fake PGs/Hostels</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Don't send advance UPI token deposits before visiting the property in person!
                </p>
              </div>
            </div>
            <Link
              to="/scams"
              className="flex items-center space-x-2 py-3 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-red-600 to-cyber-pink hover:opacity-90 transition shadow-md shadow-red-500/10 text-sm whitespace-nowrap"
            >
              <span>View Scam Alerts</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}

      {/* 4. Showcase: Top Rated Hostels */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold font-sans tracking-tight">Top Rated Student Hostels</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Student reviews verified for safety, WiFi, laundry, and rent refunding</p>
          </div>
          <Link to="/search?type=Hostel" className="text-sm text-cyber-purple dark:text-cyber-cyan font-bold hover:underline flex items-center">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topHostels.map((hostel) => (
            <Link
              key={hostel._id}
              to={`/place/Hostel/${hostel.slug || hostel._id}`}
              className="group glass-card overflow-hidden hover:-translate-y-1.5 duration-300 hover:shadow-lg dark:hover:border-cyber-purple/20"
            >
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-950 overflow-hidden">
                <img
                  src={hostel.images[0]?.url || 'https://picsum.photos/600/400'}
                  alt={hostel.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />
                <span className="absolute top-3 left-3 py-1 px-3 bg-slate-900/90 dark:bg-slate-950/90 text-xs font-black text-cyber-cyan rounded-full border border-cyber-cyan/30 shadow-md">
                  ₹{hostel.roomRent}/mo
                </span>
                <span className="absolute bottom-3 right-3 py-1 px-2.5 bg-gradient-to-r from-cyber-purple to-brand-600 text-white text-[10px] font-black rounded-full shadow-md">
                  {hostel.nearbyDistance} km away
                </span>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <RatingStars rating={hostel.averageRating} size={14} />
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">({hostel.ratingsCount} reviews)</span>
                </div>
                <h3 className="font-extrabold text-xl truncate text-slate-800 dark:text-slate-100 group-hover:text-cyber-purple dark:group-hover:text-cyber-cyan transition duration-200">
                  {hostel.name}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                  {hostel.description}
                </p>
                <div className="pt-2 flex flex-wrap gap-1.5">
                  {hostel.ac && <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-md font-bold">AC ❄️</span>}
                  {hostel.wifi && <span className="text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 rounded-md font-bold">WiFi ⚡</span>}
                  {hostel.laundry && <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-md font-bold">Laundry 🧺</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Showcase: Top Rated Messes */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold font-sans tracking-tight">Top Rated Messes</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Search fresh meal plans, clean seating, and daily/monthly charge reviews</p>
          </div>
          <Link to="/search?type=Mess" className="text-sm text-cyber-purple dark:text-cyber-cyan font-bold hover:underline flex items-center">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topMesses.map((mess) => (
            <Link
              key={mess._id}
              to={`/place/Mess/${mess.slug || mess._id}`}
              className="group glass-card overflow-hidden hover:-translate-y-1.5 duration-300 hover:shadow-lg dark:hover:border-cyber-blue/20"
            >
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-950 overflow-hidden">
                <img
                  src={mess.images[0]?.url || 'https://picsum.photos/600/400'}
                  alt={mess.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />
                <span className="absolute top-3 left-3 py-1 px-3 bg-slate-900/90 dark:bg-slate-950/90 text-xs font-black text-cyber-cyan rounded-full border border-cyber-cyan/30 shadow-md">
                  ₹{mess.monthlyCharges}/mo
                </span>
                <span className="absolute bottom-3 right-3 py-1 px-2.5 bg-gradient-to-r from-cyber-blue to-cyan-600 text-white text-[10px] font-black rounded-full shadow-md">
                  Daily: ₹{mess.dailyCharges}
                </span>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <RatingStars rating={mess.averageRating} size={14} />
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">({mess.ratingsCount} reviews)</span>
                </div>
                <h3 className="font-extrabold text-xl truncate text-slate-800 dark:text-slate-100 group-hover:text-cyber-purple dark:group-hover:text-cyber-cyan transition duration-200">
                  {mess.name}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                  Menu: {mess.menu}
                </p>
                <div className="pt-2 flex gap-2">
                  {mess.veg && <span className="text-[10px] px-2.5 py-0.5 bg-green-500/10 text-green-600 rounded-full font-bold">Pure Veg 🥬</span>}
                  {mess.nonVeg && <span className="text-[10px] px-2.5 py-0.5 bg-red-500/10 text-red-600 rounded-full font-bold">Non-Veg 🍗</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Showcase: Top Rated Shops */}
      <section className="max-w-7xl mx-auto px-4 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold font-sans tracking-tight">Top Cafes, Books, & Shops</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Student recommended hangouts, printing services, and book retailers</p>
          </div>
          <Link to="/search?type=Shop" className="text-sm text-cyber-purple dark:text-cyber-cyan font-bold hover:underline flex items-center">
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topShops.map((shop) => (
            <Link
              key={shop._id}
              to={`/place/Shop/${shop.slug || shop._id}`}
              className="group glass-card overflow-hidden hover:-translate-y-1.5 duration-300 hover:shadow-lg dark:hover:border-cyber-purple/20"
            >
              <div className="relative aspect-video bg-slate-100 dark:bg-slate-950 overflow-hidden">
                <img
                  src={shop.images[0]?.url || 'https://picsum.photos/600/400'}
                  alt={shop.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />
                <span className="absolute top-3 left-3 py-1 px-3 bg-gradient-to-r from-cyber-purple to-cyber-blue text-white text-xs font-black rounded-full shadow-md">
                  {shop.category}
                </span>
                <span className="absolute bottom-3 right-3 py-1 px-2.5 bg-slate-950/90 text-cyber-cyan text-[10px] font-black rounded-full shadow-md border border-cyber-cyan/30">
                  {shop.openingTime} - {shop.closingTime}
                </span>
              </div>
              <div className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <RatingStars rating={shop.averageRating} size={14} />
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">({shop.ratingsCount} reviews)</span>
                </div>
                <h3 className="font-extrabold text-xl truncate text-slate-800 dark:text-slate-100 group-hover:text-cyber-purple dark:group-hover:text-cyber-cyan transition duration-200">
                  {shop.name}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">
                  📍 {shop.address}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7. Recent Reviews Section */}
      {recentReviews.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 space-y-6">
          <h2 className="text-3xl font-extrabold font-sans tracking-tight">Recent Reviews</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentReviews.map((rev) => (
              <div
                key={rev._id}
                className="glass-card p-6 space-y-4 hover:border-cyber-purple/20 duration-300 hover:shadow-lg relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 radial-glow-purple rounded-full blur-2xl opacity-40"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={rev.author?.avatar || 'https://picsum.photos/150'}
                      alt={rev.author?.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-800"
                    />
                    <div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-100">{rev.author?.name}</h4>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                        Reviewed {rev.placeId?.name || 'Listing'}
                      </span>
                    </div>
                  </div>
                  <RatingStars rating={rev.rating} size={14} />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 italic">
                  "{rev.reviewText}"
                </p>
                {rev.pros && (
                  <p className="text-[11px] text-green-600 dark:text-green-400 flex items-center gap-1">
                    <strong className="text-[9px] uppercase font-black tracking-wider bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded">Pros</strong> {rev.pros}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default Home;

