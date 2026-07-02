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
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo & Description */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-600 text-white font-black text-md">
                C
              </span>
              <span className="font-extrabold text-lg">
                Campus<span className="text-brand-600 dark:text-brand-400">Review</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
              Campus Review Hub is a community-driven application helping college students discover the best local hostels, messes, and shops, while reporting rental scams and bad services.
            </p>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              <span>Verified Scam Moderation</span>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="md:col-span-2 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Browse Categories
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat.name}
                  to={cat.path}
                  className="text-xs text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Developer/Resource links */}
          <div className="md:col-span-1 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Information & Help
            </h4>
            <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <li className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5" />
                <span>Around University Campus</span>
              </li>
              <li>
                <Link to="/scams" className="hover:underline flex items-center space-x-1 text-red-500 font-semibold">
                  <span>Reported Scam Portal</span>
                </Link>
              </li>
              <li className="flex items-center space-x-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Support: support@campushub.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs text-slate-400 dark:text-slate-500">
          <p>© {new Date().getFullYear()} Campus Review Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
