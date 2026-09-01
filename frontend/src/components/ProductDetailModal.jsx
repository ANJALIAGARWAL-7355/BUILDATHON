import React, { useState } from 'react';
import { X, ShoppingCart, Star, Sparkles, Check, Truck, RotateCcw, ShieldCheck, Heart } from 'lucide-react';
import ProductImage from './ProductImage';

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
  onAddToCart,
  isWishlisted = false,
  onToggleWishlist = null,
}) {
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Default');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [added, setAdded] = useState(false);

  if (!isOpen || !product) return null;

  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const colors = [
    { name: 'Noir Black', hex: '#0f172a' },
    { name: 'Emerald Gem', hex: '#059669' },
    { name: 'Rose Quartz', hex: '#f43f5e' },
    { name: 'Royal Sapphire', hex: '#2563eb' },
  ];

  const handleAdd = () => {
    if (onAddToCart) {
      onAddToCart(product.id, quantity);
      setAdded(true);
      setTimeout(() => setAdded(false), 1800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="glass-card max-w-3xl w-full bg-slate-900 border border-slate-800 shadow-2xl rounded-3xl overflow-hidden my-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/80 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-800 transition shadow-lg"
        >
          <X size={18} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Product Image Gallery */}
          <div className="relative bg-slate-950 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
            <div className="absolute top-4 left-4 z-10 flex gap-2">
              <span className="bg-slate-900/90 backdrop-blur-md text-purple-400 border border-purple-500/20 px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wider">
                {product.category}
              </span>
              {product.inventory < 10 && (
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded-xl text-[11px] font-bold animate-pulse">
                  Only {product.inventory} left
                </span>
              )}
            </div>

            <div className="my-auto py-4">
              <ProductImage
                src={product.image_url}
                alt={product.name}
                aspectRatio="h-72 md:h-96"
                className="rounded-2xl border border-slate-800/80 shadow-2xl"
                showZoom={true}
              />
            </div>

            {/* Quick value badges */}
            <div className="grid grid-cols-3 gap-2 pt-2 text-[10px] text-slate-400 text-center">
              <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col items-center gap-1">
                <Truck size={14} className="text-purple-400" />
                <span>Free Express</span>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col items-center gap-1">
                <RotateCcw size={14} className="text-purple-400" />
                <span>30-Day Return</span>
              </div>
              <div className="p-2 bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col items-center gap-1">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span>Verified AI Item</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Customization & Details */}
          <div className="p-6 md:p-8 flex flex-col justify-between space-y-6">
            <div>
              {/* Rating & Wishlist */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < Math.floor(product.rating) ? 'currentColor' : 'none'}
                        stroke="currentColor"
                      />
                    ))}
                  </div>
                  <span className="text-xs font-extrabold text-slate-300">
                    {product.rating} (128 reviews)
                  </span>
                </div>

                {onToggleWishlist && (
                  <button
                    onClick={() => onToggleWishlist(product.id)}
                    className={`p-2 rounded-xl border transition ${
                      isWishlisted
                        ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                    title="Save to Wishlist"
                  >
                    <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
                  </button>
                )}
              </div>

              {/* Title & Price */}
              <h2 className="text-2xl font-black text-white leading-tight">{product.name}</h2>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-3xl font-black text-white">
                  ₹{product.price.toLocaleString('en-IN')}
                </span>
                <span className="text-sm text-slate-500 line-through">
                  ₹{(product.price * 1.35).toFixed(0)}
                </span>
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Save 26%
                </span>
              </div>

              {/* Tabs */}
              <div className="flex gap-4 border-b border-slate-800 mt-5 text-xs font-bold text-slate-400">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`pb-2 transition ${
                    activeTab === 'overview'
                      ? 'text-purple-400 border-b-2 border-purple-500'
                      : 'hover:text-slate-200'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-2 transition ${
                    activeTab === 'specs'
                      ? 'text-purple-400 border-b-2 border-purple-500'
                      : 'hover:text-slate-200'
                  }`}
                >
                  Fabric & Care
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-2 transition ${
                    activeTab === 'reviews'
                      ? 'text-purple-400 border-b-2 border-purple-500'
                      : 'hover:text-slate-200'
                  }`}
                >
                  AI Review Summary
                </button>
              </div>

              {/* Tab Content */}
              <div className="py-3 text-xs text-slate-400 leading-relaxed min-h-[60px]">
                {activeTab === 'overview' && <p>{product.description}</p>}
                {activeTab === 'specs' && (
                  <ul className="space-y-1 list-disc list-inside text-slate-300">
                    <li>100% sustainable high-grade breathable fabric</li>
                    <li>Dry clean recommended / cold gentle cycle</li>
                    <li>Designed & tailored for premium commerce showroom</li>
                  </ul>
                )}
                {activeTab === 'reviews' && (
                  <p className="text-slate-300 bg-purple-950/20 p-2.5 rounded-xl border border-purple-500/20">
                    ✨ <strong>96% positive sentiment</strong>: Customers praise the exquisite contour silhouette, high-end stitching, and accurate true-to-size fitting.
                  </p>
                )}
              </div>

              {/* Size Selector */}
              <div className="space-y-2 mt-2">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-slate-300 uppercase tracking-wider">Select Size</span>
                  <span className="text-purple-400 hover:underline cursor-pointer">Size Guide</span>
                </div>
                <div className="flex gap-2">
                  {sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`w-10 h-10 rounded-xl text-xs font-extrabold transition border ${
                        selectedSize === sz
                          ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/25'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Swatches */}
              <div className="space-y-2 mt-4">
                <span className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Color Edition: <span className="text-purple-400 font-normal">{selectedColor}</span>
                </span>
                <div className="flex gap-2.5">
                  {colors.map((c, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedColor(c.name)}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        selectedColor === c.name
                          ? 'scale-125 border-purple-500 shadow-md shadow-purple-500/40'
                          : 'border-slate-700 hover:scale-110'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions: Quantity & Add to Cart */}
            <div className="space-y-3 pt-4 border-t border-slate-800/80">
              <div className="flex gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-slate-800 rounded-lg text-base font-bold"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-sm font-black text-white">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))}
                    className="w-8 h-8 flex items-center justify-center text-slate-300 hover:bg-slate-800 rounded-lg text-base font-bold"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={handleAdd}
                  disabled={product.inventory <= 0}
                  className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                    added
                      ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                      : 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:brightness-110 shadow-purple-600/30'
                  }`}
                >
                  {added ? (
                    <>
                      <Check size={18} />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      <span>Add to Bag • ₹{(product.price * quantity).toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
