import React, { useState } from 'react';
import { ShoppingCart, Star, Heart, Eye, Camera, Check, Sparkles } from 'lucide-react';
import ProductImage from './ProductImage';

export default function ProductCard({
  product,
  onAddToCart,
  onViewDetails,
  onEditImage,
  isWishlisted = false,
  onToggleWishlist = null,
}) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation();
    if (onAddToCart) {
      onAddToCart(product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    }
  };

  return (
    <div className="glass-card overflow-hidden group flex flex-col h-full relative border border-slate-800/80 hover:border-purple-500/40 transition-all duration-300 rounded-2xl">
      {/* Top Floating Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1 pointer-events-none">
        <span className="bg-slate-950/80 backdrop-blur-md text-purple-400 border border-purple-500/20 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold tracking-wide uppercase shadow-md">
          {product.category}
        </span>
        {product.inventory < 10 && (
          <span className="bg-rose-500/85 backdrop-blur-md text-white px-2 py-0.5 rounded-lg text-[9px] font-extrabold uppercase tracking-wide shadow-md animate-pulse">
            Only {product.inventory} Left
          </span>
        )}
      </div>

      {/* Top Floating Action Buttons (Wishlist & Change Picture) */}
      <div className="absolute top-3 right-3 z-10 flex gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
        {onEditImage && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditImage(product);
            }}
            className="p-2 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-slate-300 hover:text-white hover:border-purple-500 transition shadow-lg"
            title="Change Product Picture"
          >
            <Camera size={13} />
          </button>
        )}

        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            className={`p-2 rounded-xl backdrop-blur-md border transition shadow-lg ${
              isWishlisted
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                : 'bg-slate-950/80 border-slate-700/60 text-slate-300 hover:text-white hover:border-rose-500/50'
            }`}
            title="Add to Wishlist"
          >
            <Heart size={13} fill={isWishlisted ? 'currentColor' : 'none'} />
          </button>
        )}
      </div>

      {/* Product Image Component */}
      <div className="cursor-pointer" onClick={onViewDetails}>
        <ProductImage
          src={product.image_url}
          alt={product.name}
          aspectRatio="h-56 sm:h-60"
          showQuickView={true}
          onQuickView={onViewDetails}
        />
      </div>

      {/* Product Info Content */}
      <div className="p-4 flex flex-col flex-1 justify-between bg-slate-950/30">
        <div>
          {/* Rating */}
          <div className="flex items-center justify-between gap-1.5 mb-2">
            <div className="flex items-center gap-1.5">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={11}
                    fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={2}
                  />
                ))}
              </div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-800/40 px-1.5 py-0.5 rounded border border-slate-700/30">
                {product.rating}
              </span>
            </div>

            <span className="text-[10px] font-semibold text-slate-500">
              Stock: <strong className="text-slate-300">{product.inventory}</strong>
            </span>
          </div>

          {/* Title */}
          <h3
            className="font-bold text-sm text-slate-100 mb-1 group-hover:text-purple-400 transition-colors duration-200 line-clamp-1 cursor-pointer"
            onClick={onViewDetails}
          >
            {product.name}
          </h3>

          {/* Description */}
          <p className="text-slate-400 text-xs mb-3 line-clamp-2 leading-relaxed h-8">
            {product.description}
          </p>
        </div>

        <div>
          {/* Price */}
          <div className="flex items-end justify-between mb-3 pt-2 border-t border-slate-800/60">
            <div>
              <p className="text-[9px] uppercase text-slate-500 font-extrabold tracking-wider">Price</p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-black text-white">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-slate-500 line-through">
                  ₹{(product.price * 1.3).toFixed(0)}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded font-bold border border-emerald-500/20">
              In Stock
            </span>
          </div>

          {/* Add to Cart Actions */}
          <div className="flex gap-2">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl px-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(Math.max(1, quantity - 1));
                }}
                className="w-6 h-7 flex items-center justify-center text-slate-400 hover:text-white text-xs font-bold"
              >
                -
              </button>
              <span className="w-6 text-center text-xs font-bold text-white">{quantity}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setQuantity(Math.min(product.inventory, quantity + 1));
                }}
                className="w-6 h-7 flex items-center justify-center text-slate-400 hover:text-white text-xs font-bold"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAdd}
              disabled={product.inventory <= 0}
              className={`flex-grow py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-200 shadow-md ${
                added
                  ? 'bg-emerald-600 text-white'
                  : 'btn-primary'
              }`}
            >
              {added ? (
                <>
                  <Check size={14} />
                  <span>Added!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={13} />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
