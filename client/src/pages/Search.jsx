import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
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
import LazyImage from '../components/LazyImage.jsx';
import { getOptimizedImageUrl } from '../utils/imageOptimizer.js';

export const Search = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [searchParams, setSearchParams] = useSearchParams();

  // Search results
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
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
    googleMapsUrl: '',
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
    coverImage: null,
    images: [],
    menuImages: [],
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
      navigate('/login');
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
        googleMapsUrl: newPlaceData.googleMapsUrl,
        phone: newPlaceData.phone,
        description: newPlaceData.description,
        coverImage: newPlaceData.coverImage,
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
        payload.menuImages = newPlaceData.menuImages;
        payload.veg = newPlaceData.veg;
        payload.nonVeg = newPlaceData.nonVeg;
        payload.contact = newPlaceData.phone;
      } else if (newPlaceType === 'Shop') {
        payload.openingTime = newPlaceData.openingTime;
        payload.closingTime = newPlaceData.closingTime;
        payload.category = newPlaceData.category;
        payload.menuImages = newPlaceData.menuImages;
      }

      const { data } = await api.post('/places', payload);
      setAddSuccess(data.message);
      
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
        menuImages: [],
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
    <div className="max-w-7xl mx-auto px-6 py-8 sm:px-8 space-y-8 relative bg-[#0D0D1A]">
      <div className="flex justify-start">
        <Link
          to="/#categories"
          className="inline-flex items-center space-x-2 text-xs font-black text-white hover:text-[#38BDF8] transition-all duration-200 bg-[#15152E] px-4 py-2.5 rounded-xl border border-[#2A2A3D] shadow-sm hover:border-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="absolute top-10 right-1/4 w-[300px] h-[300px] radial-glow-purple rounded-full blur-3xl -z-10 pointer-events-none"></div>

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">Discover Local Places</h1>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Search & verified student filter logs</p>
        </div>
        {isAuthenticated && (
          <button
            onClick={handleAddButtonClick}
            className="flex items-center space-x-2 py-3 px-6 bg-[#00D68F] text-black rounded-xl border border-[#00D68F] hover:border-white font-black transition duration-200 text-sm hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-blue active:scale-95"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>Add Listing</span>
          </button>
        )}
      </div>

      {/* Type Toggle Grid */}
      <div className="flex border border-[#2A2A3D] rounded-xl overflow-hidden max-w-sm bg-[#15152E] shadow-sm p-1">
        {['Hostel', 'Mess', 'Shop'].map((type) => (
          <button
            key={type}
            onClick={() => {
              setPlaceType(type);
              setSearchParams({ type });
            }}
            className={`flex-1 py-2 text-center text-xs font-black rounded-lg transition duration-200 ${
              placeType === type
                ? 'bg-[#00D68F] text-black border border-[#00D68F] shadow-sm'
                : 'text-white hover:bg-white/5'
            }`}
          >
            {type}s
          </button>
        ))}
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <form onSubmit={applyFilters} className="lg:col-span-1 bg-[#15152E] border border-[#2A2A3D] rounded-2xl p-6 space-y-6 transition duration-200 hover:border-white hover:shadow-brutal-blue">
          <div className="flex items-center justify-between border-b border-[#2A2A3D] pb-3">
            <span className="font-black flex items-center space-x-2 text-white text-sm uppercase tracking-wider">
              <Filter className="w-4.5 h-4.5 text-[#38BDF8]" />
              <span>Filters</span>
            </span>
            <button
              type="button"
              onClick={resetFilters}
              className="text-[10px] font-black text-slate-400 hover:text-[#EF4444] uppercase tracking-widest transition"
            >
              Clear All
            </button>
          </div>

          {/* Search bar */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-wider">Search Keyword</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Name or Address..."
              className="premium-input"
            />
          </div>

          {/* Price Range Filter */}
          {(placeType === 'Hostel' || placeType === 'Mess') && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                {placeType === 'Hostel' ? 'Rent Range (₹)' : 'Monthly Charge (₹)'}
              </label>
              <div className="flex gap-2.5">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="premium-input w-1/2"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="premium-input w-1/2"
                />
              </div>
            </div>
          )}

          {/* Shop specific Categories */}
          {placeType === 'Shop' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-wider">Shop Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="premium-input"
              >
                <option value="" className="bg-[#15152E]">All Categories</option>
                <option value="Restaurant & Cafe" className="bg-[#15152E]">Restaurant & Cafe</option>
                <option value="Medical Store" className="bg-[#15152E]">Medical Store</option>
                <option value="Stationery & Photocopy" className="bg-[#15152E]">Stationery & Photocopy</option>
                <option value="Tea Stall" className="bg-[#15152E]">Tea Stall</option>
                <option value="Book Store" className="bg-[#15152E]">Book Store</option>
              </select>
            </div>
          )}

          {/* Hostel specific specifications */}
          {placeType === 'Hostel' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-wider">Gender Option</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="premium-input"
                >
                  <option value="" className="bg-[#15152E]">All Hostels</option>
                  <option value="boys" className="bg-[#15152E]">Boys Hostel</option>
                  <option value="girls" className="bg-[#15152E]">Girls Hostel</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Amenities</label>
                <div className="space-y-2.5 flex flex-col">
                  <label className="flex items-center space-x-2.5 text-xs font-bold cursor-pointer">
                    <input type="checkbox" checked={ac} onChange={(e) => setAc(e.target.checked)} className="rounded border-[#2A2A3D] bg-slate-900 text-[#38BDF8] focus:ring-0 w-4.5 h-4.5" />
                    <span className="text-white">AC Available ❄️</span>
                  </label>
                  <label className="flex items-center space-x-2.5 text-xs font-bold cursor-pointer">
                    <input type="checkbox" checked={wifi} onChange={(e) => setWifi(e.target.checked)} className="rounded border-[#2A2A3D] bg-slate-900 text-[#38BDF8] focus:ring-0 w-4.5 h-4.5" />
                    <span className="text-white">WiFi Included ⚡</span>
                  </label>
                  <label className="flex items-center space-x-2.5 text-xs font-bold cursor-pointer">
                    <input type="checkbox" checked={laundry} onChange={(e) => setLaundry(e.target.checked)} className="rounded border-[#2A2A3D] bg-slate-900 text-[#38BDF8] focus:ring-0 w-4.5 h-4.5" />
                    <span className="text-white">Laundry Included 🧺</span>
                  </label>
                  <label className="flex items-center space-x-2.5 text-xs font-bold cursor-pointer">
                    <input type="checkbox" checked={washing} onChange={(e) => setWashing(e.target.checked)} className="rounded border-[#2A2A3D] bg-slate-900 text-[#38BDF8] focus:ring-0 w-4.5 h-4.5" />
                    <span className="text-white">Washing Machine</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Mess specific specifications */}
          {placeType === 'Mess' && (
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Food Options</label>
              <div className="space-y-2.5 flex flex-col">
                <label className="flex items-center space-x-2.5 text-xs font-bold cursor-pointer">
                  <input type="checkbox" checked={veg} onChange={(e) => setVeg(e.target.checked)} className="rounded border-[#2A2A3D] bg-slate-900 text-[#38BDF8] focus:ring-0 w-4.5 h-4.5" />
                  <span className="text-white">Pure Veg meals 🥬</span>
                </label>
                <label className="flex items-center space-x-2.5 text-xs font-bold cursor-pointer">
                  <input type="checkbox" checked={nonVeg} onChange={(e) => setNonVeg(e.target.checked)} className="rounded border-[#2A2A3D] bg-slate-900 text-[#38BDF8] focus:ring-0 w-4.5 h-4.5" />
                  <span className="text-white">Non-Veg served 🍗</span>
                </label>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#00D68F] border border-[#00D68F] rounded-xl text-black font-black hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-blue transition duration-150 text-xs"
          >
            Apply Filters
          </button>
        </form>

        {/* Results List */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2, 4].map((i) => (
                <div key={i} className="animate-pulse bg-[#15152E] border border-[#2A2A3D] rounded-2xl h-64 shadow-sm"></div>
              ))}
            </div>
          ) : places.length === 0 ? (
            <div className="text-center py-24 bg-[#15152E] border border-[#2A2A3D] rounded-2xl shadow-sm space-y-5">
              <Compass className="w-12 h-12 text-[#EF4444] mx-auto animate-spin" />
              <h3 className="text-xl font-black text-white uppercase">No listings found</h3>
              <p className="text-xs text-slate-355 max-w-sm mx-auto">
                No approved listings matching your filters were found. Try resetting filters or search again.
              </p>
              <button
                onClick={resetFilters}
                className="py-2.5 px-5 bg-[#00D68F] text-black font-black border border-[#00D68F] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-blue rounded-xl text-xs transition-all duration-150"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              {places.map((place) => {
                const isRedSpice = place.name?.toLowerCase().includes("red spice");
                const fallbackImage = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop";
                return (
                  <Link
                    key={place._id}
                    to={`/place/${placeType}/${place.slug || place._id}`}
                    className="group bg-[#15152E] border border-[#2A2A3D] rounded-2xl hover:-translate-x-1 hover:-translate-y-1 hover:border-white hover:shadow-brutal-blue transition duration-200 overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      <div className="relative aspect-video border-b border-[#2A2A3D] overflow-hidden">
                        <LazyImage
                          src={getOptimizedImageUrl(isRedSpice ? fallbackImage : (place.coverImage || place.images[0] || fallbackImage), 600, 400)}
                          alt={place.name}
                          className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
                        />
                        <span className="absolute top-3 left-3 py-1.5 px-3 bg-black/85 border border-[#2A2A3D] text-[11px] font-black text-[#38BDF8] rounded-xl">
                          {placeType === 'Hostel' && `₹${place.roomRent}/mo`}
                          {placeType === 'Mess' && `₹${place.monthlyCharges}/mo`}
                          {placeType === 'Shop' && `${place.category}`}
                        </span>
                        {placeType === 'Hostel' && (
                          <span className="absolute bottom-3 right-3 py-1.5 px-3 bg-[#15152E] border border-[#2A2A3D] text-white text-[9px] font-black rounded-xl">
                            {place.nearbyDistance} km from gate
                          </span>
                        )}
                      </div>

                      <div className="p-6 space-y-3">
                        <div className="flex items-center justify-between">
                          <RatingStars rating={place.averageRating} size={13} />
                          <span className="text-[10px] font-black text-slate-400">({place.ratingsCount} reviews)</span>
                        </div>
                        <h3 className="font-black text-xl truncate text-white group-hover:text-[#38BDF8] transition duration-150">
                          {place.name}
                        </h3>
                        <p className="text-xs text-slate-300 font-semibold line-clamp-2 leading-relaxed">
                          {place.description || place.address}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-3 border-t border-[#2A2A3D] flex items-center justify-between text-[10px] text-slate-355 font-bold">
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-[#38BDF8]" />
                        <span className="truncate max-w-[150px]">{place.address}</span>
                      </span>
                      <span className="bg-[#38BDF8]/5 border border-[#38BDF8]/30 text-[#38BDF8] px-2.5 py-0.5 rounded font-black">Verified Listing</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>


      {/* Add Place Dialog Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-[#15152E] border border-[#2A2A3D] rounded-2xl shadow-xl p-6 overflow-y-auto max-h-[90vh]">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#2A2A3D] pb-4 mb-6">
              <div>
                <h3 className="text-xl font-black text-white uppercase">Add New Place Listing</h3>
                <p className="text-xs text-slate-400 font-semibold">Add hostels, mess dining rooms, or bookstore photocopy outlets</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 border border-[#2A2A3D] bg-[#0D0D1A] rounded-xl hover:bg-[#15152E] transition"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Success / Error Alerts */}
            {addError && (
              <div className="p-3.5 mb-4 text-xs font-black text-white bg-[#EF4444] border border-[#EF4444] rounded-xl">
                {addError}
              </div>
            )}
            {addSuccess && (
              <div className="p-3.5 mb-4 text-xs font-black text-black bg-[#00D68F] border border-[#00D68F] rounded-xl">
                {addSuccess}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddSubmit} className="space-y-6">
              {/* Type Switcher */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-wider">Listing Type</label>
                <div className="flex gap-2.5 p-1 bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl max-w-sm">
                  {['Hostel', 'Mess', 'Shop'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setNewPlaceType(t)}
                      className={`flex-1 py-1.5 text-center text-xs font-black rounded-lg transition ${
                        newPlaceType === t
                          ? 'bg-[#00D68F] text-black border border-[#00D68F]'
                          : 'text-white hover:bg-white/5'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Common Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-white uppercase tracking-wider">Name of Place *</label>
                  <input
                    type="text"
                    required
                    value={newPlaceData.name}
                    onChange={(e) => setNewPlaceData({ ...newPlaceData, name: e.target.value })}
                    placeholder="e.g. Starlight Boys Residency"
                    className="premium-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-white uppercase tracking-wider">Address Location *</label>
                  <input
                    type="text"
                    required
                    value={newPlaceData.address}
                    onChange={(e) => setNewPlaceData({ ...newPlaceData, address: e.target.value })}
                    placeholder="e.g. Street Lane 4, opposite gate"
                    className="premium-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-white uppercase tracking-wider">Contact / Phone Number *</label>
                  <input
                    type="text"
                    required
                    value={newPlaceData.phone}
                    onChange={(e) => setNewPlaceData({ ...newPlaceData, phone: e.target.value })}
                    placeholder="e.g. +91 98765 43210"
                    className="premium-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-white uppercase tracking-wider">Distance from Campus Gate (km) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={newPlaceData.nearbyDistance}
                    onChange={(e) => setNewPlaceData({ ...newPlaceData, nearbyDistance: e.target.value })}
                    placeholder="e.g. 0.4"
                    className="premium-input"
                  />
                </div>
                {/* Google Maps / Location URL */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-black text-white uppercase tracking-wider">Google Maps / Location URL</label>
                  <input
                    type="text"
                    value={newPlaceData.googleMapsUrl}
                    onChange={(e) => setNewPlaceData({ ...newPlaceData, googleMapsUrl: e.target.value })}
                    placeholder="e.g. https://maps.app.goo.gl/..."
                    className="premium-input"
                  />
                </div>
              </div>

              {/* Hostel specific inputs */}
              {newPlaceType === 'Hostel' && (
                <div className="p-5 bg-[#0D0D1A] rounded-xl space-y-4 border border-[#2A2A3D] shadow-sm">
                  <h4 className="text-xs font-black text-[#38BDF8] uppercase tracking-widest">Hostel / PG Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-white">Owner Name *</label>
                      <input
                        type="text"
                        required={newPlaceType === 'Hostel'}
                        value={newPlaceData.ownerName}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, ownerName: e.target.value })}
                        className="premium-input bg-[#15152E]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-white">Monthly Rent (₹) *</label>
                      <input
                        type="number"
                        required={newPlaceType === 'Hostel'}
                        value={newPlaceData.roomRent}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, roomRent: e.target.value })}
                        className="premium-input bg-[#15152E]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-white">Security Deposit (₹) *</label>
                      <input
                        type="number"
                        required={newPlaceType === 'Hostel'}
                        value={newPlaceData.deposit}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, deposit: e.target.value })}
                        className="premium-input bg-[#15152E]"
                      />
                    </div>
                  </div>

                  {/* Amenities checkboxes */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                    {['ac', 'wifi', 'laundry', 'washing', 'parking', 'security', 'messAvailable'].map((field) => (
                      <label key={field} className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newPlaceData[field]}
                          onChange={(e) => setNewPlaceData({ ...newPlaceData, [field]: e.target.checked })}
                          className="rounded text-indigo-650 focus:ring-0"
                        />
                        <span className="capitalize text-slate-350">
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
                <div className="p-5 bg-[#0D0D1A] rounded-xl space-y-4 border border-[#2A2A3D] shadow-sm">
                  <h4 className="text-xs font-black text-[#38BDF8] uppercase tracking-widest">Mess / Dining Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-white">Monthly Charges (₹) *</label>
                      <input
                        type="number"
                        required={newPlaceType === 'Mess'}
                        value={newPlaceData.monthlyCharges}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, monthlyCharges: e.target.value })}
                        className="premium-input bg-[#15152E]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-white">Daily Food Charge (₹) *</label>
                      <input
                        type="number"
                        required={newPlaceType === 'Mess'}
                        value={newPlaceData.dailyCharges}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, dailyCharges: e.target.value })}
                        className="premium-input bg-[#15152E]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-white">Food Timing *</label>
                      <input
                        type="text"
                        required={newPlaceType === 'Mess'}
                        placeholder="Lunch 1-3, Dinner 8-10"
                        value={newPlaceData.foodTiming}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, foodTiming: e.target.value })}
                        className="premium-input bg-[#15152E]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-white">Weekly Menu Description</label>
                      <textarea
                        rows="2"
                        placeholder="Monday veg paneer, Wednesday egg curry..."
                        value={newPlaceData.menu}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, menu: e.target.value })}
                        className="premium-input bg-[#15152E]"
                      />
                    </div>
                    <div className="space-y-2 flex flex-col justify-center">
                      <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newPlaceData.veg}
                          onChange={(e) => setNewPlaceData({ ...newPlaceData, veg: e.target.checked })}
                          className="rounded text-[#38BDF8]"
                        />
                        <span className="text-slate-350">Serves Pure Veg</span>
                      </label>
                      <label className="flex items-center space-x-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newPlaceData.nonVeg}
                          onChange={(e) => setNewPlaceData({ ...newPlaceData, nonVeg: e.target.checked })}
                          className="rounded text-[#38BDF8]"
                        />
                        <span className="text-slate-350">Serves Non-Veg Options</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Shop specific inputs */}
              {newPlaceType === 'Shop' && (
                <div className="p-5 bg-[#0D0D1A] rounded-xl space-y-4 border border-[#2A2A3D] shadow-sm">
                  <h4 className="text-xs font-black text-[#38BDF8] uppercase tracking-widest">Shop / Service Specifications</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-white">Shop Category *</label>
                      <select
                        value={newPlaceData.category}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, category: e.target.value })}
                        className="premium-input bg-[#15152E]"
                      >
                        <option value="Restaurant & Cafe" className="bg-[#15152E]">Restaurant & Cafe</option>
                        <option value="Medical Store" className="bg-[#15152E]">Medical Store</option>
                        <option value="Stationery & Photocopy" className="bg-[#15152E]">Stationery & Photocopy</option>
                        <option value="Tea Stall" className="bg-[#15152E]">Tea Stall</option>
                        <option value="Book Store" className="bg-[#15152E]">Book Store</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-white">Opening Time *</label>
                      <input
                        type="text"
                        placeholder="e.g. 09:00 AM"
                        value={newPlaceData.openingTime}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, openingTime: e.target.value })}
                        className="premium-input bg-[#15152E]"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-black text-white">Closing Time *</label>
                      <input
                        type="text"
                        placeholder="e.g. 10:00 PM"
                        value={newPlaceData.closingTime}
                        onChange={(e) => setNewPlaceData({ ...newPlaceData, closingTime: e.target.value })}
                        className="premium-input bg-[#15152E]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-black text-white uppercase tracking-wider">Detailed Description</label>
                <textarea
                  rows="3"
                  value={newPlaceData.description}
                  onChange={(e) => setNewPlaceData({ ...newPlaceData, description: e.target.value })}
                  placeholder="Tell students about pricing structures, wifi speeds, amenities, deposit refund rules..."
                  className="premium-input"
                />
              </div>

              {/* Featured Cover Image (Single file) */}
              <ImageUpload
                images={newPlaceData.coverImage ? [newPlaceData.coverImage] : []}
                onChange={(imgs) => setNewPlaceData({ ...newPlaceData, coverImage: imgs[0] || null })}
                maxFiles={1}
                label="Featured Cover Image (Displays on Listing Card)"
              />

              {/* Multiple Image Uploads */}
              <ImageUpload
                images={newPlaceData.images}
                onChange={(imgs) => setNewPlaceData({ ...newPlaceData, images: imgs })}
                maxFiles={15}
                label="Listing Media / Room Photos"
              />

              {/* Menu Card Uploads */}
              {(newPlaceType === 'Mess' || newPlaceType === 'Shop') && (
                <ImageUpload
                  images={newPlaceData.menuImages || []}
                  onChange={(imgs) => setNewPlaceData({ ...newPlaceData, menuImages: imgs })}
                  maxFiles={4}
                  label="Upload Menu Cards / Price Lists"
                />
              )}

              {/* Action buttons */}
              <div className="flex justify-end space-x-3.5 pt-4 border-t border-[#2A2A3D]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="py-3 px-6 rounded-xl font-black text-white bg-[#0D0D1A] border border-[#2A2A3D] hover:bg-[#15152E] transition text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="py-3 px-6 rounded-xl font-black text-black bg-[#00D68F] border border-[#00D68F] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-brutal-blue transition text-xs flex items-center"
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
