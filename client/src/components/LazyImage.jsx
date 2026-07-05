import React, { useState, useEffect } from 'react';
import { Loader2, Image as ImageIcon } from 'lucide-react';

/**
 * LazyImage component shows a pulsing skeleton loader while loading,
 * supports lazy loading, error fallbacks, and fades in once fully downloaded.
 */
export const LazyImage = ({ src, alt, className = '', containerClassName = '' }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Reset states when the image source changes
    setLoaded(false);
    setError(false);
  }, [src]);

  return (
    <div className={`relative w-full h-full bg-[#15152E] flex items-center justify-center overflow-hidden ${containerClassName}`}>
      {/* Loading Skeleton */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-[#1A1A36] animate-pulse flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#38BDF8] animate-spin opacity-70" />
        </div>
      )}

      {/* Error Fallback */}
      {error && (
        <div className="absolute inset-0 bg-[#1A1A36] flex flex-col items-center justify-center p-4 text-center text-slate-500">
          <ImageIcon className="w-8 h-8 mb-2 text-slate-600 animate-bounce" />
          <span className="text-[10px] uppercase tracking-wider font-black text-slate-450">Image unavailable</span>
        </div>
      )}

      {/* Image Tag */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`${className} transition-all duration-500 ease-out ${
          loaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-95 blur-xs absolute'
        }`}
      />
    </div>
  );
};

export default LazyImage;
