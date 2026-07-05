import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Image as ImageIcon } from 'lucide-react';

/**
 * LazyImage component shows a pulsing skeleton loader while loading,
 * supports lazy loading, error fallbacks, and fades in once fully downloaded.
 */
export const LazyImage = ({ src, alt, className = '', containerClassName = '' }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    // Reset states when the image source changes
    setLoaded(false);
    setError(false);

    // If the image is already cached/complete in browser memory, show it immediately
    if (imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }
  }, [src]);

  return (
    <div className={`relative w-full h-full bg-[#15152E] flex items-center justify-center overflow-hidden ${containerClassName}`}>
      {/* Image Tag - kept in layout flow so lazy-loading engine detects viewport placement */}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        className={`${className} transition-all duration-300 ease-out ${
          loaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-98 blur-xs text-transparent'
        } ${error ? 'hidden' : ''}`}
        style={!loaded ? { textIndent: '-9999px' } : undefined}
      />

      {/* Loading Skeleton Overlay */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-[#1A1A36] animate-pulse flex items-center justify-center pointer-events-none">
          <Loader2 className="w-5 h-5 text-[#38BDF8] animate-spin opacity-70" />
        </div>
      )}

      {/* Error Fallback Overlay */}
      {error && (
        <div className="absolute inset-0 bg-[#1A1A36] flex flex-col items-center justify-center p-4 text-center text-slate-500 pointer-events-none">
          <ImageIcon className="w-7 h-7 mb-1.5 text-slate-650" />
          <span className="text-[9px] uppercase tracking-wider font-black text-slate-450">Image unavailable</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
