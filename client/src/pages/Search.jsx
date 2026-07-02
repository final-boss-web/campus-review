import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Filter,
  Plus,
  Home as HomeIcon,
  ShoppingBag,
  Utensils,
  MapPin,
  Compass,
  ArrowUpDown,
  X,
  PlusCircle,
  HelpCircle,
  ArrowLeft,
} from 'lucide-react';
import api from '../services/api.js';
import RatingStars from '../components/RatingStars.jsx';
import ImageUpload from '../components/ImageUpload.jsx';
import { openLoginModal } from '../store/authSlice.js';

export const Search = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();

  // Search results
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State (populated from search parameters initially)
  const [placeType, setPlaceType] = useState(searchParams.get('type') || 'Hostel');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [ac, setAc] = useState(searchParams.get('ac') === 'true');
  const [wifi, setWifi] = useState(searchParams.get('wifi') === 'true');
  const [laundry, setLaundry] = useState(searchParams.get('laundry') === 'true');
  const [washing, setWashing] = useState(searchParams.get('washing') === 'true');
  const [veg, setVeg] = useState(searchParams.get('veg') === 'true');
  const [nonVeg, setNonVeg] = useState(searchParams.get('nonVeg') === 'true');
  const [gender, setGender] = useState(searchParams.get('gender') || '');

  // Add Listing Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPlaceType, setNewPlaceType] = useState('Hostel');
  const [newPlaceData, setNewPlaceData] = useState({
    name: '',
    address: '',
    phone: '',
    ownerName: '',
    roomRent: '',
    deposit: '',
    monthlyCharges: '',
    dailyCharges: '',
    foodTiming: '',
    openingTime: '09:00 AM',
    closingTime: '09:00 PM',
    menu: '',
    category: 'Restaurant & Cafe',
    description: '',
    nearbyDistance: '0.5',
    images: [],
    ac: false,
    wifi: false,
    laundry: false,
    washing: false,
    parking: false,
    security: false,
    messAvailable: false,
    veg: true,
    nonVeg: false,
  });

  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Reload places when filters change
  useEffect(() => {
    fetchPlaces();
  }, [searchParams]);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams(searchParams).toString();
      const { data } = await api.get(`/places?${query}`);
      setPlaces(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setPlaces([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (e) => {
    if (e) e.preventDefault();
    
    const params = {};
    if (placeType) params.type = placeType;
    if (searchQuery) params.search = searchQuery;
    if (category && placeType === 'Shop') params.category = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;
    if (ac && placeType === 'Hostel') params.ac = 'true';
    if (wifi && placeType === 'Hostel') params.wifi = 'true';
    if (laundry && placeType === 'Hostel') params.laundry = 'true';
    if (washing && placeType === 'Hostel') params.washing = 'true';
    if (veg && placeType === 'Mess') params.veg = 'true';
    if (nonVeg && placeType === 'Mess') params.nonVeg = 'true';
    if (gender && placeType === 'Hostel') params.gender = gender;

    setSearchParams(params);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setAc(false);
    setWifi(false);
    setLaundry(false);
    setWashing(false);
    setVeg(false);
    setNonVeg(false);
    setGender('');
    setSearchParams({ type: placeType });
  };

  const handleAddButtonClick = () => {
    if (!isAuthenticated) {
      dispatch(openLoginModal());
    } else {
      setIsAddModalOpen(true);
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    setSubmitting(true);

    try {
      const payload = {
        type: newPlaceType,
        name: newPlaceData.name,
        address: newPlaceData.address,
        phone: newPlaceData.phone,
        description: newPlaceData.description,
        images: newPlaceData.images,
        nearbyDistance: parseFloat(newPlaceData.nearbyDistance) || 0.5,
      };

      if (newPlaceType === 'Hostel') {
        payload.ownerName = newPlaceData.ownerName;
        payload.roomRent = parseFloat(newPlaceData.roomRent) || 0;
        payload.deposit = parseFloat(newPlaceData.deposit) || 0;
        payload.ac = newPlaceData.ac;
        payload.wifi = newPlaceData.wifi;
        payload.laundry = newPlaceData.laundry;
        payload.washing = newPlaceData.washing;
        payload.parking = newPlaceData.parking;
        payload.security = newPlaceData.security;
        payload.messAvailable = newPlaceData.messAvailable;
      } else if (newPlaceType === 'Mess') {
        payload.monthlyCharges = parseFloat(newPlaceData.monthlyCharges) || 0;
        payload.dailyCharges = parseFloat(newPlaceData.dailyCharges) || 0;
        payload.foodTiming = newPlaceData.foodTiming;
        payload.menu = newPlaceData.menu;
        payload.veg = newPlaceData.veg;
        payload.nonVeg = newPlaceData.nonVeg;
        payload.contact = newPlaceData.phone; // map contact
      } else if (newPlaceType === 'Shop') {
        payload.openingTime = newPlaceData.openingTime;
        payload.closingTime = newPlaceData.closingTime;
        payload.category = newPlaceData.category;
      }

      const { data } = await api.post('/places', payload);
      setAddSuccess(data.message);
      
      // Reset form
      setNewPlaceData({
        name: '',
        address: '',
        phone: '',
        ownerName: '',
        roomRent: '',
        deposit: '',
        monthlyCharges: '',
        dailyCharges: '',
        foodTiming: '',
        openingTime: '09:00 AM',
        closingTime: '09:00 PM',
        menu: '',
        category: 'Restaurant & Cafe',
        description: '',
        nearbyDistance: '0.5',
        images: [],
        ac: false,
        wifi: false,
        laundry: false,
        washing: false,
        parking: false,
        security: false,
        messAvailable: false,
        veg: true,
        nonVeg: false,
      });

      // Reload
      fetchPlaces();
      setTimeout(() => setIsAddModalOpen(false), 2000);
    } catch (err) {
      console.error(err);
      setAddError(err.response?.data?.message || 'Failed to submit place.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 relative">
      <div className="flex justify-start">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-black text-slate-500 hover:text-cyber-purple dark:text-slate-400 dark:hover:text-cyber-cyan transition-all duration-200 bg-white/50 dark:bg-slate-900/50 px-4 py-2.5 rounded-xl border border-slate-200/40 dark:border-slate-800/40 shadow-sm hover:shadow-md"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="absolute top-10 right-1/4 w-[300px] h-[300px] radial-glow-purple rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight font-sans">Discover Local Places</h1>
          <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Search & verified student filter logs</p>
        </div>
        <button
          onClick={handleAddButtonClick}
          className="flex items-center space-x-2 py-3 px-6 bg-gradient-to-r from-cyber-purple to-brand-600 hover:opacity-95 text-white rounded-2xl shadow-lg shadow-brand-500/10 font-black transition duration-200 text-sm hover:scale-[1.02]"
        >
          <Plus className="w-4 h-4" />
          <span>Add Listing</span>
        </button>
      </div>

      {/* Type Toggle Grid */}
      <div className="flex border border-slate-200/50 dark:border-slate-800/40 rounded-2xl overflow-hidden max-w-sm bg-white/70 dark:bg-[#0f172a]/60 backdrop-blur-md shadow-sm p-1">
        {['Hostel', 'Mess', 'Shop'].map((type) => (
          <button
            key={type}
            onClick={() => {
              setPlaceType(type);
              setSearchParams({ type });
            }}
            className={`flex-1 py-2.5 text-center text-xs font-black rounded-xl transition duration-200 ${
              placeType === type
                ? 'bg-gradient-to-r from-cyber-purple to-cyber-blue text-white shadow-md'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/40'
            }`}
          >
            {type}s
          </button>
        ))}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <form onSubmit={applyFilters} className="lg:col-span-1 glass-card p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/60 pb-3">
            <span className="font-extrabold flex items-center space-x-2">
              <Filter className="w-4 h-4 text-cyber-purple" />
              <span>Filters</span>
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="text-[10px] font-black text-slate-400 hover:text-cyber-purple uppercase tracking-widest transition"
            >
              Clear All
            </button>
          </div>

          {/* Search bar */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Search Keyword</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name or Address..."
              className="w-full bg-slate-50 dark:bg-[#090d16] border border-slate-200/60 dark:border-slate-800/80 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-cyber-purple/55 transition"
            />
          </div>

          {/* Price Range Filter (Hostel & Mess only) */}
          {(placeType === 'Hostel' || placeType === 'Mess') && (
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                {placeType === 'Hostel' ? 'Rent Range (₹)' : 'Monthly Charge (₹)'}
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 bg-slate-50 dark:bg-[#090d16] border border-slate-200/60 dark:border-slate-800/80 p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-cyber-purple/55 focus:outline-none"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 bg-slate-50 dark:bg-[#090d16] border border-slate-200/60 dark:border-slate-800/80 p-2.5 rounded-xl text-xs focus:ring-1 focus:ring-cyber-purple/55 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Shop specific Categories */}
          {placeType === 'Shop' && (
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Shop Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 dark:bg-[#090d16] border border-slate-200/60 dark:border-slate-800/80 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-cyber-purple/55"
              >
                <option value="">All Categories</option>
                <option value="Restaurant & Cafe">Restaurant & Cafe</option>
                <option value="Medical Store">Medical Store</option>
                <option value="Stationery & Photocopy">Stationery & Photocopy</option>
                <option value="Tea Stall">Tea Stall</option>
                <option value="Book Store">Book Store</option>
              </select>
            </div>
          )}

          {/* Hostel specific specifications */}
          {placeType === 'Hostel' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Gender Option</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#090d16] border border-slate-200/60 dark:border-slate-800/80 p-2.5 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-cyber-purple/55"
                >
                  <option value="">All Hostels</option>
                  <option value="boys">Boys Hostel</option>
                  <option value="girls">Girls Hostel</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Amenities</label>
                <div className="space-y-2 flex flex-col">
                  <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                    <input type="checkbox" checked={ac} onChange={(e) => setAc(e.target.checked)} className="rounded border-slate-300 text-cyber-purple focus:ring-cyber-purple" />
                    <span>AC Available ❄️</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                    <input type="checkbox" checked={wifi} onChange={(e) => setWifi(e.target.checked)} className="rounded border-slate-300 text-cyber-purple focus:ring-cyber-purple" />
                    <span>WiFi Included ⚡</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                    <input type="checkbox" checked={laundry} onChange={(e) => setLaundry(e.target.checked)} className="rounded border-slate-300 text-cyber-purple focus:ring-cyber-purple" />
                    <span>Laundry Included 🧺</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                    <input type="checkbox" checked={washing} onChange={(e) => setWashing(e.target.checked)} className="rounded border-slate-300 text-cyber-purple focus:ring-cyber-purple" />
                    <span>Washing Machine</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Mess specific specifications */}
          {placeType === 'Mess' && (
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Food Options</label>
              <div className="space-y-2 flex flex-col">
                <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                  <input type="checkbox" checked={veg} onChange={(e) => setVeg(e.target.checked)} className="rounded border-slate-300 text-cyber-purple focus:ring-cyber-purple" />
                  <span>Pure Veg meals 🥬</span>
                </label>
                <label className="flex items-center space-x-2 text-xs font-medium cursor-pointer">
                  <input type="checkbox" checked={nonVeg} onChange={(e) => setNonVeg(e.target.checked)} className="rounded border-slate-300 text-cyber-purple focus:ring-cyber-purple" />
                  <span>Non-Veg served 🍗</span>
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-cyber-purple to-cyber-blue text-white rounded-xl font-extrabold transition hover:opacity-95 text-xs shadow-md shadow-brand-500/10"
          >
            Apply Filters
          </button>
        </form>

        {/* Results List */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 4].map((i) => (
                <div key={i} className="animate-pulse bg-white dark:bg-[#0f172a]/40 border border-slate-200/50 dark:border-slate-800/40 rounded-3xl h-64"></div>
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="text-center py-20 glass-card space-y-4">
              <Compass className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-lg font-bold">No listings found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No approved listings matching your filters were found. Try resetting filters or add a new place.
              </p>
              <button
                onClick={resetFilters}
                className="py-2 px-4 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
              {places.map((place) => (
                <Link
                  key={place._id}
                  to={`/place/${placeType}/${place._id}`}
                  className="group glass-card overflow-hidden hover:-translate-y-1.5 duration-300 hover:shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-video bg-slate-100 dark:bg-slate-950 overflow-hidden">
                      <img
                        src={place.images[0]?.url || 'https://picsum.photos/600/400'}
                        alt={place.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                      />
                      <span className="absolute top-3 left-3 py-1 px-3 bg-slate-900/95 dark:bg-slate-950/95 text-xs font-black text-cyber-cyan rounded-full border border-cyber-cyan/30 shadow-md">
                        {placeType === 'Hostel' && `₹${place.roomRent}/mo`}
                        {placeType === 'Mess' && `₹${place.monthlyCharges}/mo`}
                        {placeType === 'Shop' && `${place.category}`}
                      </span>
                      {placeType === 'Hostel' && (
                        <span className="absolute bottom-3 right-3 py-1 px-2.5 bg-gradient-to-r from-cyber-purple to-brand-600 text-white text-[10px] font-black rounded-full shadow-md">
                          {place.nearbyDistance} km from Gate
                        </span>
                      )}
                    </div>

                    <div className="p-6 space-y-2">
                      <div className="flex items-center justify-between">
                        <RatingStars rating={place.averageRating} size={14} />
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500">({place.ratingsCount} reviews)</span>
                      </div>
                      <h3 className="font-extrabold text-xl truncate text-slate-800 dark:text-slate-100 group-hover:text-cyber-purple dark:group-hover:text-cyber-cyan transition duration-200">
                        {place.name}
                      </h3>
                      <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 leading-relaxed">
                        {place.description || place.address}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="flex items-center">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-300" />
                      <span className="truncate max-w-[150px]">{place.address}</span>
                    </span>
                    <span className="bg-green-500/10 text-green-600 px-1.5 py-0.5 rounded font-black">Verified listing</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>


      {/* Add Place Dialog Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl glass-effect p-6 overflow-y-auto max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-6">
              <div>
                <h3 className="text-xl font-bold">Add New Place Listing</h3>
                <p className="text-xs text-slate-400">Add hostels, mess dining rooms, or bookstore photocopy outlets</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Success / Error Alerts */}
            {addError && (
              <div className="p-3 mb-4 text-xs font-semibold text-red-600 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200">
                {addError}
              </div>
            )}
            {addSuccess && (
              <div className="p-3 mb-4 text-xs font-semibold text-green-600 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-200">
                {addSuccess}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddSubmit} className="space-y-6">
              {/* Type Switcher */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Listing Type</label>
                <div className="flex gap-2 p-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm">
                  {['Hostel', 'Mess', 'Shop'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewPlaceType(t)}
                      className={`flex-1 py-2 text-center text-xs font-bold rounded-xl transition ${
                        newPlaceType === t
                          ? 'bg-brand-600 text-white shadow-md'
                          : 'text-slate-500 hover:bg-slate-200/50'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Common Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Name of Place *</label>
                  <input
                    type="text"
                    required
                    value={newPlaceData.name}
                    onChange={(e) => setNewPlaceData({ ...newPlaceData, name: e.target.value })}
                    placeholder="e.g. Starlight Boys Residency"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Address Location *</label>
                  <input
                    type="text"
                    required
                    value={newPlaceData.address}
                    onChange={(e) => setNewPlaceData({ ...newPlaceData, address: e.target.value })}
                    placeholder="e.g. Street Lane 4, opposite gate"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Contact / Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newPlaceData.phone}
                    onChange={(e) => setNewPlaceData({ ...newPlaceData, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Distance from Campus Gate (km) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newPlaceData.nearbyDistance}
                    onChange={(e) => setNewPlaceData({ ...newPlaceData, nearbyDistance: e.target.value })}
                    placeholder="e.g. 0.4"
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs focus:outline-none"
                  />
                </div>
              </div>

              {/* Hostel specific inputs */}
              {newPlaceType === 'Hostel' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-brand-600 uppercase tracking-widest">Hostel / PG Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Owner Name *</label>
                      <input
                        type="text"
                        required={newPlaceType === 'Hostel'}
                        value={newPlaceData.ownerName}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, ownerName: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Monthly Rent (₹) *</label>
                      <input
                        type="number"
                        required={newPlaceType === 'Hostel'}
                        value={newPlaceData.roomRent}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, roomRent: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Security Deposit (₹) *</label>
                      <input
                        type="number"
                        required={newPlaceType === 'Hostel'}
                        value={newPlaceData.deposit}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, deposit: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  {/* Amenities checkboxes */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-2">
                    {['ac', 'wifi', 'laundry', 'washing', 'parking', 'security', 'messAvailable'].map((field) => (
                      <label key={field} className="flex items-center space-x-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newPlaceData[field]}
                          onChange={(e) => setNewPlaceData({ ...newPlaceData, [field]: e.target.checked })}
                          className="rounded text-brand-600"
                        />
                        <span className="capitalize">
                          {field === 'ac' ? 'AC' :
                           field === 'wifi' ? 'WiFi' :
                           field === 'messAvailable' ? 'Mess Available' :
                           field === 'washing' ? 'Washing Machine' :
                           field.replace('Available', '').replace('mess', 'Mess')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Mess specific inputs */}
              {newPlaceType === 'Mess' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-brand-600 uppercase tracking-widest">Mess / Dining Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Monthly Charges (₹) *</label>
                      <input
                        type="number"
                        required={newPlaceType === 'Mess'}
                        value={newPlaceData.monthlyCharges}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, monthlyCharges: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Daily Food Charge (₹) *</label>
                      <input
                        type="number"
                        required={newPlaceType === 'Mess'}
                        value={newPlaceData.dailyCharges}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, dailyCharges: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Food Timing *</label>
                      <input
                        type="text"
                        required={newPlaceType === 'Mess'}
                        placeholder="e.g. Lunch 1-3, Dinner 8-10"
                        value={newPlaceData.foodTiming}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, foodTiming: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Weekly Menu Description</label>
                      <textarea
                        rows="2"
                        placeholder="e.g. Monday veg paneer, Wednesday egg curry..."
                        value={newPlaceData.menu}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, menu: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-2 flex flex-col justify-center">
                      <label className="flex items-center space-x-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newPlaceData.veg}
                          onChange={(e) => setNewPlaceData({ ...newPlaceData, veg: e.target.checked })}
                          className="rounded text-brand-600"
                        />
                        <span>Serves Pure Veg</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newPlaceData.nonVeg}
                          onChange={(e) => setNewPlaceData({ ...newPlaceData, nonVeg: e.target.checked })}
                          className="rounded text-brand-600"
                        />
                        <span>Serves Non-Veg Options</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Shop specific inputs */}
              {newPlaceType === 'Shop' && (
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl space-y-4">
                  <h4 className="text-xs font-bold text-brand-600 uppercase tracking-widest">Shop / Service Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Shop Category *</label>
                      <select
                        value={newPlaceData.category}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, category: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs"
                      >
                        <option value="Restaurant & Cafe">Restaurant & Cafe</option>
                        <option value="Medical Store">Medical Store</option>
                        <option value="Stationery & Photocopy">Stationery & Photocopy</option>
                        <option value="Tea Stall">Tea Stall</option>
                        <option value="Book Store">Book Store</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Opening Time *</label>
                      <input
                        type="text"
                        placeholder="e.g. 09:00 AM"
                        value={newPlaceData.openingTime}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, openingTime: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold">Closing Time *</label>
                      <input
                        type="text"
                        placeholder="e.g. 10:00 PM"
                        value={newPlaceData.closingTime}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, closingTime: e.target.value })}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xs font-semibold">Detailed Description</label>
                <textarea
                  rows="3"
                  value={newPlaceData.description}
                  onChange={(e) => setNewPlaceData({ ...newPlaceData, description: e.target.value })}
                  placeholder="Tell students about pricing structures, wifi speeds, amenities, deposit refund rules..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs focus:outline-none"
                />
              </div>

              {/* Multiple Image Uploads */}
              <ImageUpload
                images={newPlaceData.images}
                onChange={(imgs) => setNewPlaceData({ ...newPlaceData, images: imgs })}
                maxFiles={5}
                label="Listing Media / Room Photos"
              />

              {/* Action buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-3 px-6 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-3 px-6 rounded-xl font-bold text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-brand-500/10 transition text-xs flex items-center"
                >
                  {submitting ? 'Submitting for Verification...' : 'Submit Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Search;
