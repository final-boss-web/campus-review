import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Sparkles, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import api from '../services/api.js';

export const Contact = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [category, setCategory] = useState('scam'); // scam, listing, partnership, other
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  
  // State for forms
  const [scamDetails, setScamDetails] = useState({
    scammerName: '',
    scammerPhone: '',
    scammerUpi: '',
    description: '',
  });

  const [listingDetails, setListingDetails] = useState({
    placeName: '',
    placeType: 'Hostel', // Hostel, Mess, Shop
    link: '',
    ownerName: '',
    ownerEmail: '',
    ownerMobile: '',
    issueDescription: '',
  });

  const [partnershipDetails, setPartnershipDetails] = useState({
    companyName: '',
    contactPhone: '',
    proposalDetails: '',
  });

  const [generalDetails, setGeneralDetails] = useState({
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Sync user details on mount/change
  useEffect(() => {
    if (user) {
      setSenderName(user.name);
      setSenderEmail(user.email);
    } else {
      setSenderName('');
      setSenderEmail('');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim()) {
      setErrorMsg('Please enter your name and email.');
      return;
    }

    // Basic validation based on category
    if (category === 'scam' && (!scamDetails.scammerName.trim() || !scamDetails.scammerPhone.trim() || !scamDetails.description.trim())) {
      setErrorMsg('Please fill in all required fields marked with *');
      return;
    }
    if (category === 'listing' && (!listingDetails.placeName.trim() || !listingDetails.issueDescription.trim())) {
      setErrorMsg('Please fill in all required fields marked with *');
      return;
    }
    if (category === 'partnership' && (!partnershipDetails.contactPhone.trim() || !partnershipDetails.proposalDetails.trim())) {
      setErrorMsg('Please fill in all required fields marked with *');
      return;
    }
    if (category === 'other' && (!generalDetails.subject.trim() || !generalDetails.message.trim())) {
      setErrorMsg('Please fill in all required fields marked with *');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Build formatted text and subject
      let msgText = '';
      let emailSubject = '';
      const dateStr = new Date().toLocaleDateString();
      const userStr = user ? `${user.name} (${user.email})` : `${senderName} (${senderEmail})`;

      msgText += `==============================================\n`;
      msgText += `          CAMPUS REVIEW - SUPPORT TICKET      \n`;
      msgText += `==============================================\n`;
      msgText += `Date      : ${dateStr}\n`;
      msgText += `Sender    : ${userStr}\n`;

      let messageDetails = {};

      if (category === 'scam') {
        emailSubject = `[Scam Alert] - Report by ${senderName.split(' ')[0]}`;
        msgText += `Category  : Rental Scam Report\n`;
        msgText += `==============================================\n\n`;
        msgText += `Scammer Name/Company: \n${scamDetails.scammerName}\n\n`;
        msgText += `Scammer Contact No./Email: \n${scamDetails.scammerPhone}\n\n`;
        msgText += `Scammer Bank/UPI Details (if any): \n${scamDetails.scammerUpi || 'N/A'}\n\n`;
        msgText += `Incident Description: \n${scamDetails.description}\n`;
        messageDetails = scamDetails;
      } else if (category === 'listing') {
        emailSubject = `[Listing Issue] - ${listingDetails.placeName}`;
        msgText += `Category  : Listing Correction / Abuse Report\n`;
        msgText += `==============================================\n\n`;
        msgText += `Place Name: \n${listingDetails.placeName} (${listingDetails.placeType})\n\n`;
        msgText += `Listing Link (if any): \n${listingDetails.link || 'N/A'}\n\n`;
        msgText += `Owner Name: \n${listingDetails.ownerName || 'N/A'}\n\n`;
        msgText += `Owner Email: \n${listingDetails.ownerEmail || 'N/A'}\n\n`;
        msgText += `Owner Mobile: \n${listingDetails.ownerMobile || 'N/A'}\n\n`;
        msgText += `Problem / Correction Details: \n${listingDetails.issueDescription}\n`;
        messageDetails = listingDetails;
      } else if (category === 'partnership') {
        emailSubject = `[Partnership Pitch] - ${partnershipDetails.companyName || senderName}`;
        msgText += `Category  : Partnership / Collaboration\n`;
        msgText += `==============================================\n\n`;
        msgText += `Company / Organization: \n${partnershipDetails.companyName || 'N/A'}\n\n`;
        msgText += `Contact Phone/Mobile  : \n${partnershipDetails.contactPhone || 'N/A'}\n\n`;
        msgText += `Pitch / Proposal Details: \n${partnershipDetails.proposalDetails}\n`;
        messageDetails = partnershipDetails;
      } else {
        emailSubject = `[Support Request] - ${generalDetails.subject}`;
        msgText += `Category  : General Support / Feedback\n`;
        msgText += `==============================================\n\n`;
        msgText += `Subject   : ${generalDetails.subject}\n\n`;
        msgText += `Message   : \n${generalDetails.message}\n`;
        messageDetails = generalDetails;
      }

      msgText += `\n==============================================\n`;
      msgText += `Generated automatically via Campus Review Hub.`;

      const payload = {
        senderName,
        senderEmail,
        category,
        subject: emailSubject,
        messageText: msgText,
        messageDetails,
      };

      const { data } = await api.post('/support', payload);
      setSuccessMsg(data.message || 'Support ticket submitted successfully!');
      
      // Reset details
      setScamDetails({ scammerName: '', scammerPhone: '', scammerUpi: '', description: '' });
      setListingDetails({ placeName: '', placeType: 'Hostel', link: '', ownerName: '', ownerEmail: '', ownerMobile: '', issueDescription: '' });
      setPartnershipDetails({ companyName: '', contactPhone: '', proposalDetails: '' });
      setGeneralDetails({ subject: '', message: '' });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Failed to submit message. Please check backend connection.');
    } finally {
      setSubmitting(false);
    }
  };

  if (successMsg) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center text-white space-y-6 animate-fade-in">
        <div className="w-16 h-16 bg-emerald-550/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
          <CheckCircle className="w-9 h-9" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black">Message Sent!</h2>
          <p className="text-xs text-slate-300 leading-relaxed font-semibold">
            {successMsg} Our team will review your inquiry and get back to you at <span className="text-cyan-400 font-bold">{senderEmail}</span> if necessary.
          </p>
        </div>
        <div className="flex justify-center space-x-3 pt-4">
          <button
            onClick={() => setSuccessMsg('')}
            className="px-5 py-2.5 rounded-xl text-xs font-black text-black bg-cyan-400 border border-cyan-400 hover:shadow-[3px_3px_0px_0px_#FFFFFF] hover:-translate-x-0.5 hover:-translate-y-0.5 transition duration-150 cursor-pointer"
          >
            Send Another Message
          </button>
          <Link
            to="/"
            className="px-5 py-2.5 rounded-xl text-xs font-black text-white bg-[#15152E] border border-[#2A2A3D] hover:border-slate-350 transition duration-150"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-6 pb-20 text-white animate-fade-in">
      {/* Back to Home Link */}
      <div className="flex justify-start">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs font-black text-slate-400 hover:text-cyan-400 transition bg-[#15152E] px-4 py-2.5 rounded-xl border border-[#2A2A3D] shadow-sm hover:border-slate-350"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Header Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1E1B4B] to-[#111827] rounded-3xl border border-[#2A2A3D] p-8 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Mail className="w-40 h-40 text-cyan-400" />
        </div>
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center space-x-2 bg-cyan-500/10 text-cyan-400 px-3 py-1 rounded-full text-xs font-bold border border-cyan-500/20">
            <Sparkles className="w-3 h-3" />
            <span>Support desk</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Contact Site Administrator
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-semibold leading-relaxed">
            Need to appeal a ban, report listing abuse, pitch a partnership, or flag a housing scam? Fill out the details below to contact the site administrator.
          </p>
        </div>
      </div>

      {/* Interactive Form */}
      <form onSubmit={handleSubmit} className="bg-[#15152E] border border-[#2A2A3D] p-6 sm:p-8 rounded-3xl space-y-6 shadow-md">
        
        {errorMsg && (
          <div className="flex items-center space-x-2 bg-[#EF4444]/10 border border-[#EF4444]/20 p-4 rounded-2xl text-xs font-bold text-[#EF4444] animate-shake">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Sender details if guest */}
        {!isAuthenticated ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Your Name *</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Your Email *</label>
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
              />
            </div>
          </div>
        ) : (
          <div className="bg-[#0D0D1A] border border-[#2A2A3D] p-4 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-slate-400 font-bold">Sending as logged-in user:</span>
            <span className="text-cyan-400 font-extrabold">{senderName} ({senderEmail})</span>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-xs font-extrabold uppercase text-cyan-400 tracking-wider">
            Select Message Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { id: 'scam', label: 'Rental Scam' },
              { id: 'listing', label: 'Listing Abuse' },
              { id: 'partnership', label: 'Partnership' },
              { id: 'other', label: 'Other Support' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-2.5 rounded-xl text-xs font-black border transition-all ${
                  category === cat.id
                    ? 'bg-cyan-500 border-cyan-500 text-black shadow-lg shadow-cyan-500/15'
                    : 'bg-[#0D0D1A] border-[#2A2A3D] text-slate-300 hover:border-slate-350 hover:bg-[#15152E]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <hr className="border-[#2A2A3D]" />

        {/* DYNAMIC FORM FIELDS */}
        <div className="space-y-4">
          {category === 'scam' && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Scammer / Broker Name *</label>
                <input
                  type="text"
                  placeholder="John Landlord, Royal PG Brokers"
                  value={scamDetails.scammerName}
                  onChange={(e) => setScamDetails({ ...scamDetails, scammerName: e.target.value })}
                  className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition animate-fade-in"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Contact Phone / Email *</label>
                <input
                  type="text"
                  placeholder="+91 9876543210, scammer@mail.com"
                  value={scamDetails.scammerPhone}
                  onChange={(e) => setScamDetails({ ...scamDetails, scammerPhone: e.target.value })}
                  className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition animate-fade-in"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">UPI ID / Bank details (if any)</label>
                <input
                  type="text"
                  placeholder="scammer@ybl, HDFC Acc No 1234..."
                  value={scamDetails.scammerUpi}
                  onChange={(e) => setScamDetails({ ...scamDetails, scammerUpi: e.target.value })}
                  className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition animate-fade-in"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Detailed Incident Description *</label>
                <textarea
                  rows={4}
                  placeholder="Describe how they tried to scam you (e.g. asking for advance security deposit without showing hostel, vanishing after receiving money, etc.)"
                  value={scamDetails.description}
                  onChange={(e) => setScamDetails({ ...scamDetails, description: e.target.value })}
                  className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition resize-none animate-fade-in"
                />
              </div>
            </>
          )}

          {category === 'listing' && (
            <>
              <div className="grid grid-cols-3 gap-2 animate-fade-in">
                <div className="col-span-2 space-y-1">
                  <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Place / Listing Name *</label>
                  <input
                    type="text"
                    placeholder="Sunrise PG, Green Valley Mess"
                    value={listingDetails.placeName}
                    onChange={(e) => setListingDetails({ ...listingDetails, placeName: e.target.value })}
                    className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Type *</label>
                  <select
                    value={listingDetails.placeType}
                    onChange={(e) => setListingDetails({ ...listingDetails, placeType: e.target.value })}
                    className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-3 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 transition"
                  >
                    <option value="Hostel">Hostel/PG</option>
                    <option value="Mess">Mess</option>
                    <option value="Shop">Shop</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1 animate-fade-in">
                <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Listing URL (Optional)</label>
                <input
                  type="url"
                  placeholder="http://campusreview.app/place/hostel/hostel-id"
                  value={listingDetails.link}
                  onChange={(e) => setListingDetails({ ...listingDetails, link: e.target.value })}
                  className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>

              {/* Owner details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 animate-fade-in">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Owner Name</label>
                  <input
                    type="text"
                    placeholder="Ram Singh"
                    value={listingDetails.ownerName}
                    onChange={(e) => setListingDetails({ ...listingDetails, ownerName: e.target.value })}
                    className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Owner Email</label>
                  <input
                    type="email"
                    placeholder="owner@gmail.com"
                    value={listingDetails.ownerEmail}
                    onChange={(e) => setListingDetails({ ...listingDetails, ownerEmail: e.target.value })}
                    className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Owner Mobile</label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={listingDetails.ownerMobile}
                    onChange={(e) => setListingDetails({ ...listingDetails, ownerMobile: e.target.value })}
                    className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>
              </div>

              <div className="space-y-1 animate-fade-in">
                <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Explain Abuse / Mistake *</label>
                <textarea
                  rows={4}
                  placeholder="Describe the issue (e.g. false reviews, wrong pricing details, fake photos, incorrect contact number, or listing owner requests info correction)"
                  value={listingDetails.issueDescription}
                  onChange={(e) => setListingDetails({ ...listingDetails, issueDescription: e.target.value })}
                  className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition resize-none"
                />
              </div>
            </>
          )}

          {category === 'partnership' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Company / Organization Name</label>
                  <input
                    type="text"
                    placeholder="e.g. College Club, PG Owner Association, Local Brand"
                    value={partnershipDetails.companyName}
                    onChange={(e) => setPartnershipDetails({ ...partnershipDetails, companyName: e.target.value })}
                    className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Contact Number / Mobile *</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={partnershipDetails.contactPhone}
                    onChange={(e) => setPartnershipDetails({ ...partnershipDetails, contactPhone: e.target.value })}
                    className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                  />
                </div>
              </div>
              <div className="space-y-1 animate-fade-in">
                <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Partnership / Collaboration Pitch Details *</label>
                <textarea
                  rows={5}
                  placeholder="Describe your partnership proposal, event sponsorships, advertising interest, or collaboration ideas..."
                  value={partnershipDetails.proposalDetails}
                  onChange={(e) => setPartnershipDetails({ ...partnershipDetails, proposalDetails: e.target.value })}
                  className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition resize-none"
                />
              </div>
            </>
          )}

          {category === 'other' && (
            <>
              <div className="space-y-1 animate-fade-in">
                <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Subject Topic *</label>
                <input
                  type="text"
                  placeholder="Account restoration, Ban appeal, Bug report"
                  value={generalDetails.subject}
                  onChange={(e) => setGeneralDetails({ ...generalDetails, subject: e.target.value })}
                  className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
              </div>
              <div className="space-y-1 animate-fade-in">
                <label className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">Your Message / Enquiry *</label>
                <textarea
                  rows={6}
                  placeholder="Enter your detailed query, feedback, or message here."
                  value={generalDetails.message}
                  onChange={(e) => setGeneralDetails({ ...generalDetails, message: e.target.value })}
                  className="w-full bg-[#0D0D1A] border border-[#2A2A3D] rounded-xl px-4 py-2.5 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition resize-none"
                />
              </div>
            </>
          )}
        </div>

        <hr className="border-[#2A2A3D]" />

        {/* Action buttons */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 py-3 px-8 rounded-2xl text-xs font-black text-black bg-cyan-400 border border-cyan-400 transition duration-150 cursor-pointer ${
              submitting ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-[4px_4px_0px_0px_#FFFFFF] hover:-translate-x-0.5 hover:-translate-y-0.5'
            }`}
          >
            <Send className={`w-4 h-4 ${submitting ? 'animate-pulse' : ''}`} />
            <span>{submitting ? 'Sending Message...' : 'Send Message'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default Contact;
