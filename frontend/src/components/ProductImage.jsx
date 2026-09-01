import React, { useState } from 'react';
import { ImageOff, Eye } from 'lucide-react';
import { resolveImageUrl } from '../services/api';

export default function ProductImage({
  src,
  alt = 'Product Image',
  className = '',
  aspectRatio = 'h-56',
  showQuickView = false,
  onQuickView = null,
  showZoom = true,
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const finalSrc = resolveImageUrl(src);

  const fallbackSvg = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300' fill='%230f172a'><rect width='400' height='300' fill='%230f172a'/><circle cx='200' cy='130' r='50' fill='%238b5cf6' opacity='0.25'/><text x='200' y='220' font-size='16' font-family='sans-serif' fill='%2394a3b8' text-anchor='middle'>RazorGrowth Luxury Collection</text></svg>";

  return (
    <div className={`relative overflow-hidden bg-slate-900 ${aspectRatio} ${className} group`}>
      {/* Loading Skeleton */}
      {!loaded && !error && (
        <div className="absolute inset-0 bg-slate-800/80 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-purple-500/30 border-t-purple-500 animate-spin"></div>
        </div>
      )}

      {/* Main Image */}
      <img
        src={error ? fallbackSvg : finalSrc}
        alt={alt}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        className={`w-full h-full object-cover transition-all duration-700 ${
          loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
        } ${showZoom ? 'group-hover:scale-110' : ''}`}
      />

      {/* Error badge */}
      {error && (
        <div className="absolute bottom-2 right-2 bg-slate-950/80 backdrop-blur-md px-2 py-1 rounded text-[10px] text-amber-400 border border-amber-500/30 flex items-center gap-1">
          <ImageOff size={10} />
          <span>Fallback</span>
        </div>
      )}

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

      {/* Quick view / Lightbox button */}
      {showQuickView && (
        <div className="absolute inset-0 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 bg-slate-950/40 backdrop-blur-[2px]">
          {onQuickView && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickView();
              }}
              className="bg-white text-slate-950 font-bold px-3 py-2 rounded-xl text-xs hover:scale-105 transition shadow-lg flex items-center gap-1.5"
            >
              <Eye size={13} />
              <span>Quick View</span>
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setLightbox(true);
            }}
            className="bg-slate-900/90 text-slate-200 border border-slate-700/80 font-semibold p-2 rounded-xl text-xs hover:text-white hover:border-purple-500 transition shadow-lg"
            title="Zoom Image"
          >
            <Eye size={13} />
          </button>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <div className="relative max-w-3xl max-h-[85vh] w-full flex flex-col items-center">
            <img
              src={error ? fallbackSvg : finalSrc}
              alt={alt}
              className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-purple-500/30 ring-1 ring-white/10"
            />
            <p className="text-slate-300 text-sm mt-3 font-semibold">{alt}</p>
            <span className="text-xs text-slate-500 mt-1">Click anywhere to close</span>
          </div>
        </div>
      )}
    </div>
  );
}
