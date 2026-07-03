import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, MapPin, ShieldCheck, HelpCircle } from 'lucide-react';

export const Footer = () => {
  const categories = [
    { name: 'Hostels & PGs', path: '/search?type=Hostel' },
    { name: 'Messes', path: '/search?type=Mess' },
    { name: 'Stationery & Photocopy', path: '/search?type=Shop&category=Stationery+%26+Photocopy' },
    { name: 'Medical Stores', path: '/search?type=Shop&category=Medical+Store' },
    { name: 'Restaurants & Cafes', path: '/search?type=Shop&category=Restaurant+&+Cafe' },
    { name: 'Tea Stalls', path: '/search?type=Shop&category=Tea+Stall' },
    { name: 'Book Stores', path: '/search?type=Shop&category=Book+Store' },
  ];

  return (
    <footer className="mt-16 bg-[#15152E] border-t border-[#2A2A3D] transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-16 sm:px-8 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-white">
          
          {/* Logo & Description */}
          <div className="md:col-span-1 space-y-5">
            <Link to="/" className="flex items-center space-x-2.5 group">
              <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00D68F] to-[#38BDF8] text-black font-extrabold text-lg border border-[#2A2A3D] shadow-[2px_2px_0px_#000000]">
                C
              </span>
              <span className="font-extrabold text-lg tracking-tight">
                Campus<span className="gradient-text-neon font-black">Review</span>
              </span>
            </Link>
            <p className="text-xs text-slate-350 leading-relaxed font-semibold">
              Campus Review Hub is a community-driven application helping college students discover the best local hostels, messes, and shops, while reporting rental scams and bad services.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-300 font-bold">
              <ShieldCheck className="w-4 h-4 text-[#00D68F]" />
              <span>Verified Scam Moderation</span>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#38BDF8]">
              Browse Categories
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-2">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.path}
                  className="text-xs text-slate-300 hover:text-[#38BDF8] font-semibold transition"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Developer/Resource links */}
          <div className="md:col-span-1 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-[#EF4444]">
              Information & Help
            </h4>
            <ul className="space-y-3 text-xs text-slate-300 font-semibold">
              <li className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#38BDF8]" />
                <span>Around University Campus</span>
              </li>
              <li>
                <Link to="/scams" className="hover:underline flex items-center space-x-1 text-[#EF4444] font-black">
                  <span>Reported Scam Portal</span>
                </Link>
              </li>
              <li className="flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-[#38BDF8]" />
                <a href="mailto:studentcodercampus@gmail.com" className="hover:text-white transition">
                  studentcodercampus@gmail.com
                </a>
              </li>
              <li className="text-[10px] text-slate-400 leading-normal">
                For promotions, feedback, or general info, contact us at the email above.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#2A2A3D] text-center text-xs text-slate-400 font-semibold">
          <p>© {new Date().getFullYear()} Campus Review Hub. Built with ❤️ for college students.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
