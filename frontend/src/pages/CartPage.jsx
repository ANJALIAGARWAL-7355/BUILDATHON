import React, { useState } from 'react';
import { ShoppingCart, ArrowLeft, AlertCircle, Trash2, ArrowRight, Tag, Check, Sparkles, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { resolveImageUrl } from '../services/api';
import ToastNotification from '../components/ToastNotification';

export default function CartPage({ onNavigate }) {
  const { cart, removeFromCart, addToCart, startCheckout, loading, error } = useCart();
  const [promoCode, setPromoCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCode, setAppliedCode] = useState('');
  const [promoError, setPromoError] = useState(null);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError(null);
    const code = promoCode.trim().toUpperCase();

    if (!code) return;

    if (code === 'RAZOR20' || code === 'GROWTH20') {
      setDiscountPercent(20);
      setAppliedCode(code);
      showToast('20% AI Growth discount applied!', 'success');
    } else if (code === 'AGENT10' || code === 'SAVE10') {
      setDiscountPercent(10);
      setAppliedCode(code);
      showToast('10% Recovery discount applied!', 'success');
    } else if (code === 'FREESHIP') {
      setDiscountPercent(5);
      setAppliedCode(code);
      showToast('Free Express Shipping unlocked!', 'success');
    } else {
      setPromoError('Invalid discount code. Try RAZOR20 or AGENT10.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-slate-400 text-xs font-bold">Synchronizing bag state...</p>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="py-12 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold text-xs transition"
        >
          <ArrowLeft size={16} />
          <span>Continue Shopping</span>
        </button>

        <div className="glass-card p-12 text-center flex flex-col items-center justify-center bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-3xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600/10 border border-purple-500/20 text-purple-400 flex items-center justify-center animate-bounce">
            <ShoppingCart size={32} />
          </div>
          <h2 className="text-2xl font-black text-white">Your Cart is Empty</h2>
          <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
            Add items to your cart from our fashion catalog to test the autonomous AI intent analysis and recovery flow.
          </p>
          <button
            onClick={() => onNavigate('home')}
            className="btn-primary text-xs px-6 py-3 font-bold"
          >
            Explore Fashion Catalog
          </button>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.price_at_time * item.quantity, 0);
  const discountAmount = (subtotal * discountPercent) / 100;
  const shipping = subtotal > 3000 || appliedCode === 'FREESHIP' ? 0 : 150;
  const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

  // Free shipping threshold (Rs. 3000)
  const freeShipThreshold = 3000;
  const progressPercent = Math.min(100, (subtotal / freeShipThreshold) * 100);

  const handleCheckout = async () => {
    const success = await startCheckout();
    if (success) {
      onNavigate('checkout');
    }
  };

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <ToastNotification
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
      />

      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold text-xs transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Continue Shopping</span>
      </button>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 flex items-start gap-2.5 text-xs">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Free Shipping Progress Meter */}
      <div className="glass-card p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
        <div className="flex items-center justify-between text-xs font-bold mb-2">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Truck size={15} className="text-purple-400" />
            {subtotal >= freeShipThreshold ? (
              <span className="text-emerald-400">🎉 You unlocked Free Express Shipping!</span>
            ) : (
              <span>Add ₹{(freeShipThreshold - subtotal).toLocaleString('en-IN')} more for Free Express Shipping</span>
            )}
          </span>
          <span className="text-purple-400 font-extrabold">{progressPercent.toFixed(0)}%</span>
        </div>
        <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-purple-600 to-pink-500 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card p-6 bg-slate-950/80 border border-slate-800/80 rounded-3xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-900 mb-4">
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <ShoppingCart size={18} className="text-purple-400" />
                <span>Review Cart Items</span>
              </h2>
              <span className="text-xs font-bold text-slate-500">
                ({items.reduce((s, i) => s + i.quantity, 0)} total pieces)
              </span>
            </div>

            <div className="divide-y divide-slate-900">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                  <img
                    src={resolveImageUrl(item.product?.image_url)}
                    alt={item.product?.name || 'Product'}
                    className="w-20 h-20 object-cover rounded-2xl border border-slate-800 flex-shrink-0 bg-slate-900"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80';
                    }}
                  />

                  <div className="flex-grow flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-sm text-slate-100 truncate">
                          {item.product?.name || 'Product'}
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors"
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <p className="text-slate-400 text-xs line-clamp-1 mt-0.5">{item.product?.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-slate-400 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-xl">
                        Qty: <strong>{item.quantity}</strong> × ₹{item.price_at_time.toLocaleString('en-IN')}
                      </span>
                      <span className="font-black text-sm text-white">
                        ₹{(item.price_at_time * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Order Summary & Promo Code */}
        <div className="lg:col-span-1 space-y-4">
          {/* Promo Code Box */}
          <div className="glass-card p-5 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Tag size={13} className="text-purple-400" />
              <span>Promo & Recovery Coupons</span>
            </span>

            <form onSubmit={handleApplyPromo} className="flex gap-2">
              <input
                type="text"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                placeholder="e.g., RAZOR20"
                className="w-full input-field text-xs py-2 uppercase"
              />
              <button
                type="submit"
                className="btn-secondary text-xs px-3.5 py-2 font-bold flex-shrink-0"
              >
                Apply
              </button>
            </form>

            {promoError && (
              <p className="text-[11px] text-rose-400 font-semibold">{promoError}</p>
            )}

            {appliedCode && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-bold">
                <span>Code {appliedCode} (-{discountPercent}%)</span>
                <Check size={14} />
              </div>
            )}
          </div>

          {/* Cost Summary Box */}
          <div className="glass-card p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-5">
            <h3 className="text-sm font-bold text-slate-100 border-b border-slate-900 pb-3 uppercase tracking-wider">
              Order Summary
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal</span>
                <span className="text-slate-200 font-bold">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Discount ({discountPercent}%)</span>
                  <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400">
                <span>Shipping Fee</span>
                <span className={shipping === 0 ? "text-emerald-400 font-bold uppercase" : "text-slate-200"}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>

              <div className="flex justify-between text-slate-400 pb-3 border-b border-slate-900">
                <span>Estimated Tax (GST)</span>
                <span className="text-slate-300">Included</span>
              </div>

              <div className="flex justify-between items-baseline pt-2">
                <span className="text-sm font-black text-white">Total Amount</span>
                <span className="text-2xl font-black text-purple-400">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full btn-primary py-3 text-xs font-black flex items-center justify-center gap-2 rounded-xl shadow-lg"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={14} />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 pt-1">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Razorpay Secured 256-bit Encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
