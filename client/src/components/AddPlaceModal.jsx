import React, { useState, useEffect } from 'react';
import { X, Plus, Building2, Utensils, ShoppingBag, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import api from '../services/api.js';
import ImageUpload from './ImageUpload.jsx';

export const AddPlaceModal = ({ isOpen, onClose, onSuccess, initialData = null }) => {
  const isEditing = Boolean(initialData);

  const [placeType, setPlaceType] = useState(initialData?.type || 'Hostel');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    googleMapsUrl: '',
    description: '',
    nearbyDistance: '0.5',
    coverImage: null,
    images: [],
    // Hostel specific
    ownerName: '',
    roomRent: '',
    deposit: '',
    ac: false,
    wifi: false,
    laundry: false,
    washing: false,
    parking: false,
    security: false,
    messAvailable: false,
    // Mess specific
    monthlyCharges: '',
    dailyCharges: '',
    foodTiming: '',
    menu: '',
    veg: true,
    nonVeg: false,
    // Shop specific
    category: 'Restaurant & Cafe',
    openingTime: '09:00 AM',
    closingTime: '09:00 PM',
    menuImages: [],
  });

  useEffect(() => {
    if (initialData) {
      setPlaceType(initialData.type || 'Hostel');
      setFormData({
        name: initialData.name || '',
        address: initialData.address || '',
        phone: initialData.phone || '',
        googleMapsUrl: initialData.googleMapsUrl || '',
        description: initialData.description || '',
        nearbyDistance: initialData.nearbyDistance?.toString() || '0.5',
        coverImage: initialData.coverImage || null,
        images: initialData.images || [],
        // Hostel
        ownerName: initialData.ownerName || '',
        roomRent: initialData.roomRent?.toString() || '',
        deposit: initialData.deposit?.toString() || '',
        ac: Boolean(initialData.ac),
        wifi: Boolean(initialData.wifi),
        laundry: Boolean(initialData.laundry),
        washing: Boolean(initialData.washing),
        parking: Boolean(initialData.parking),
        security: Boolean(initialData.security),
        messAvailable: Boolean(initialData.messAvailable),
        // Mess
        monthlyCharges: initialData.monthlyCharges?.toString() || '',
        dailyCharges: initialData.dailyCharges?.toString() || '',
        foodTiming: initialData.foodTiming || '',
        menu: initialData.menu || '',
        veg: initialData.veg !== undefined ? initialData.veg : true,
        nonVeg: Boolean(initialData.nonVeg),
        // Shop
        category: initialData.category || 'Restaurant & Cafe',
        openingTime: initialData.openingTime || '09:00 AM',
        closingTime: initialData.closingTime || '09:00 PM',
        menuImages: initialData.menuImages || [],
      });
    } else {
      resetForm();
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setError('');
    setSuccess('');
    setFormData({
      name: '',
      address: '',
      phone: '',
      googleMapsUrl: '',
      description: '',
      nearbyDistance: '0.5',
      coverImage: null,
      images: [],
      ownerName: '',
      roomRent: '',
      deposit: '',
      ac: false,
      wifi: false,
      laundry: false,
      washing: false,
      parking: false,
      security: false,
      messAvailable: false,
      monthlyCharges: '',
      dailyCharges: '',
      foodTiming: '',
      menu: '',
      veg: true,
      nonVeg: false,
      category: 'Restaurant & Cafe',
      openingTime: '09:00 AM',
      closingTime: '09:00 PM',
      menuImages: [],
    });
  };

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim() || !formData.address.trim() || !formData.phone.trim()) {
      setError('Please fill in all required fields (Name, Address, Phone).');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        type: placeType,
        name: formData.name.trim(),
        address: formData.address.trim(),
        phone: formData.phone.trim(),
        googleMapsUrl: formData.googleMapsUrl.trim(),
        description: formData.description.trim(),
        coverImage: formData.coverImage || (formData.images.length > 0 ? formData.images[0].url : null),
        images: formData.images,
        nearbyDistance: parseFloat(formData.nearbyDistance) || 0.5,
      };

      if (placeType === 'Hostel') {
        payload.ownerName = formData.ownerName.trim();
        payload.roomRent = parseFloat(formData.roomRent) || 0;
        payload.deposit = parseFloat(formData.deposit) || 0;
        payload.ac = formData.ac;
        payload.wifi = formData.wifi;
        payload.laundry = formData.laundry;
        payload.washing = formData.washing;
        payload.parking = formData.parking;
        payload.security = formData.security;
        payload.messAvailable = formData.messAvailable;
      } else if (placeType === 'Mess') {
        payload.monthlyCharges = parseFloat(formData.monthlyCharges) || 0;
        payload.dailyCharges = parseFloat(formData.dailyCharges) || 0;
        payload.foodTiming = formData.foodTiming.trim();
        payload.menu = formData.menu.trim();
        payload.veg = formData.veg;
        payload.nonVeg = formData.nonVeg;
        payload.contact = formData.phone.trim();
      } else if (placeType === 'Shop') {
        payload.category = formData.category;
        payload.openingTime = formData.openingTime;
        payload.closingTime = formData.closingTime;
        payload.menuImages = formData.menuImages;
      }

      let responseData;
      if (isEditing) {
        const { data } = await api.put(`/places/${placeType}/${initialData._id}`, payload);
        responseData = data;
        setSuccess('Listing updated successfully!');
      } else {
        const { data } = await api.post('/places', payload);
        responseData = data;
        setSuccess(data.message || 'Listing submitted successfully! Admin will review your listing shortly.');
      }

      if (onSuccess) onSuccess(responseData);

      setTimeout(() => {
        onClose();
        resetForm();
      }, 1800);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save place listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-[#15152E] border border-[#2A2A3D] rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl my-8 relative text-white animate-fade-in">
        {/* Header */}
        <div className="p-6 border-b border-[#2A2A3D] flex items-center justify-between bg-[#0D0D1A]">
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              {isEditing ? '✏️ Edit Place Listing' : '🚀 List a New Campus Place'}
            </h2>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              {isEditing ? 'Update place info and images' : 'Add Hostels, PGs, Messes, Cafes or Shops for fellow students'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-4 bg-[#EF4444]/15 border border-[#EF4444] rounded-2xl flex items-center space-x-3 text-xs font-black text-[#EF4444]">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-[#00D68F]/15 border border-[#00D68F] rounded-2xl flex items-center space-x-3 text-xs font-black text-[#00D68F]">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Place Type Toggle */}
          {!isEditing && (
            <div className="space-y-2">
              <label className="text-xs font-black text-[#38BDF8] uppercase tracking-wider block">
                Select Category *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { type: 'Hostel', label: 'Hostel / PG', icon: Building2 },
                  { type: 'Mess', label: 'Food Mess', icon: Utensils },
                  { type: 'Shop', label: 'Shop / Service', icon: ShoppingBag },
                ].map((cat) => {
                  const Icon = cat.icon;
                  const active = placeType === cat.type;
                  return (
                    <button
                      key={cat.type}
                      type="button"
                      onClick={() => setPlaceType(cat.type)}
                      className={`p-3.5 rounded-2xl border text-xs font-black flex items-center justify-center space-x-2 transition ${
                        active
                          ? 'bg-[#00D68F] text-black border-[#00D68F] shadow-sm'
                          : 'bg-[#0D0D1A] border-[#2A2A3D] text-slate-300 hover:border-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-wider block">
                Place Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Royal Boys Hostel, Annapurna Mess, Campus Photocopy"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-wider block">
                Address / Location near Campus *
              </label>
              <input
                type="text"
                required
                placeholder="Full address, landmark, or gate number..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-wider block">
                Contact Phone Number *
              </label>
              <input
                type="tel"
                required
                placeholder="+91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-wider block">
                Distance from Campus (KM)
              </label>
              <input
                type="number"
                step="0.1"
                placeholder="0.5"
                value={formData.nearbyDistance}
                onChange={(e) => setFormData({ ...formData, nearbyDistance: e.target.value })}
                className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-wider block">
                Google Maps Link (Optional)
              </label>
              <input
                type="url"
                placeholder="https://maps.google.com/..."
                value={formData.googleMapsUrl}
                onChange={(e) => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
              />
            </div>
          </div>

          {/* Type-Specific Fields */}
          {placeType === 'Hostel' && (
            <div className="p-4 bg-[#0D0D1A] border border-[#2A2A3D] rounded-2xl space-y-4">
              <h3 className="text-xs font-black uppercase text-[#00D68F]">Hostel / PG Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Owner / Warden Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                    className="w-full bg-[#15152E] border border-[#2A2A3D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Monthly Room Rent (₹)</label>
                  <input
                    type="number"
                    placeholder="6500"
                    value={formData.roomRent}
                    onChange={(e) => setFormData({ ...formData, roomRent: e.target.value })}
                    className="w-full bg-[#15152E] border border-[#2A2A3D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Security Deposit (₹)</label>
                  <input
                    type="number"
                    placeholder="5000"
                    value={formData.deposit}
                    onChange={(e) => setFormData({ ...formData, deposit: e.target.value })}
                    className="w-full bg-[#15152E] border border-[#2A2A3D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
              </div>

              {/* Amenity Checkboxes */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Amenities Available</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { key: 'ac', label: 'AC Rooms' },
                    { key: 'wifi', label: 'WiFi Included' },
                    { key: 'laundry', label: 'Laundry Service' },
                    { key: 'washing', label: 'Washing Machine' },
                    { key: 'parking', label: 'Parking Space' },
                    { key: 'security', label: 'CCTV Security' },
                    { key: 'messAvailable', label: 'Mess Attached' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center space-x-2 text-xs text-slate-300 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData[item.key]}
                        onChange={(e) => setFormData({ ...formData, [item.key]: e.target.checked })}
                        className="rounded border-[#2A2A3D] text-[#00D68F] focus:ring-0"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {placeType === 'Mess' && (
            <div className="p-4 bg-[#0D0D1A] border border-[#2A2A3D] rounded-2xl space-y-4">
              <h3 className="text-xs font-black uppercase text-[#00D68F]">Mess Meal Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Monthly Charges (₹)</label>
                  <input
                    type="number"
                    placeholder="3500"
                    value={formData.monthlyCharges}
                    onChange={(e) => setFormData({ ...formData, monthlyCharges: e.target.value })}
                    className="w-full bg-[#15152E] border border-[#2A2A3D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Daily Meal Charge (₹)</label>
                  <input
                    type="number"
                    placeholder="120"
                    value={formData.dailyCharges}
                    onChange={(e) => setFormData({ ...formData, dailyCharges: e.target.value })}
                    className="w-full bg-[#15152E] border border-[#2A2A3D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Meal Timings</label>
                  <input
                    type="text"
                    placeholder="e.g. Lunch 12-3 PM | Dinner 8-10:30 PM"
                    value={formData.foodTiming}
                    onChange={(e) => setFormData({ ...formData, foodTiming: e.target.value })}
                    className="w-full bg-[#15152E] border border-[#2A2A3D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Typical Menu Items</label>
                  <textarea
                    rows={2}
                    placeholder="Roti, Sabzi, Dal, Rice, Salad, Special Sweet on Sunday..."
                    value={formData.menu}
                    onChange={(e) => setFormData({ ...formData, menu: e.target.value })}
                    className="w-full bg-[#15152E] border border-[#2A2A3D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-1">
                <label className="flex items-center space-x-2 text-xs text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.veg}
                    onChange={(e) => setFormData({ ...formData, veg: e.target.checked })}
                    className="rounded border-[#2A2A3D] text-[#00D68F] focus:ring-0"
                  />
                  <span>Pure Veg 🥬</span>
                </label>
                <label className="flex items-center space-x-2 text-xs text-slate-300 font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.nonVeg}
                    onChange={(e) => setFormData({ ...formData, nonVeg: e.target.checked })}
                    className="rounded border-[#2A2A3D] text-[#00D68F] focus:ring-0"
                  />
                  <span>Non-Veg Served 🍗</span>
                </label>
              </div>
            </div>
          )}

          {placeType === 'Shop' && (
            <div className="p-4 bg-[#0D0D1A] border border-[#2A2A3D] rounded-2xl space-y-4">
              <h3 className="text-xs font-black uppercase text-[#00D68F]">Shop Category & Hours</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#15152E] border border-[#2A2A3D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                  >
                    <option value="Restaurant & Cafe">Restaurant & Cafe</option>
                    <option value="Stationery & Photocopy">Stationery & Photocopy</option>
                    <option value="Grocery & General Store">Grocery & General Store</option>
                    <option value="Laundry & Dry Cleaning">Laundry & Dry Cleaning</option>
                    <option value="Pharmacy & Medical">Pharmacy & Medical</option>
                    <option value="Other Service">Other Service</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Opening Time</label>
                  <input
                    type="text"
                    placeholder="09:00 AM"
                    value={formData.openingTime}
                    onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                    className="w-full bg-[#15152E] border border-[#2A2A3D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Closing Time</label>
                  <input
                    type="text"
                    placeholder="09:00 PM"
                    value={formData.closingTime}
                    onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                    className="w-full bg-[#15152E] border border-[#2A2A3D] rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#38BDF8]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[#38BDF8] uppercase tracking-wider block">
              Description & Highlights
            </label>
            <textarea
              rows={3}
              placeholder="Tell fellow students about rooms, food quality, owner behavior, rules..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#38BDF8]"
            />
          </div>

          {/* Image Upload Component */}
          <div className="space-y-2">
            <ImageUpload
              images={formData.images}
              onChange={(newImages) => setFormData({ ...formData, images: newImages })}
              maxFiles={10}
              label="Place Photos / Menu Images"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-[#2A2A3D]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#2A2A3D] text-xs font-black text-slate-400 hover:text-white hover:bg-white/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs font-black text-black bg-[#00D68F] border border-[#00D68F] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[3px_3px_0px_0px_#FFFFFF] transition duration-150 flex items-center space-x-2 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>{isEditing ? 'Update Listing' : 'Publish Listing'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlaceModal;
