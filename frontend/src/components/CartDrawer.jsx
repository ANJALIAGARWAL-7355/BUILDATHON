import React from 'react';
import { X, Trash2, ShoppingCart, ArrowRight } from 'lucide-react';
import { resolveImageUrl } from '../services/api';

export default function CartDrawer({ isOpen, cart, onRemoveItem, onCheckout, onClose }) {
  if (!isOpen) return null;

  const items = cart?.items || [];
  const total = items.reduce((sum, item) => sum + item.price_at_time * item.quantity, 0);

  return (
    <div className='fixed inset-0 z-50 overflow-hidden animate-fade-in'>
      <div
        className='absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity'
        onClick={onClose}
      />

      <div className='fixed inset-y-0 right-0 max-w-full flex pl-10'>
        <div className='w-screen max-w-md glass-card bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl animate-slide-in'>
          {/* Header */}
          <div className='p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/50'>
            <div className='flex items-center gap-2.5'>
              <div className='p-2 rounded-xl bg-purple-600/10 text-purple-400 border border-purple-500/20'>
                <ShoppingCart size={18} />
              </div>
              <div>
                <h2 className='text-base font-bold text-white'>Your Shopping Bag</h2>
                <p className='text-[11px] text-slate-400'>
                  {items.reduce((s, i) => s + i.quantity, 0)} items selected
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition'
            >
              <X size={18} />
            </button>
          </div>

          {/* Items List */}
          <div className='flex-1 overflow-y-auto p-6 space-y-4'>
            {items.length === 0 ? (
              <div className='text-center py-16 space-y-3'>
                <div className='w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-500'>
                  <ShoppingCart size={24} />
                </div>
                <p className='text-sm font-bold text-slate-300'>Your cart is currently empty</p>
                <p className='text-xs text-slate-500 max-w-xs mx-auto'>
                  Explore the curated fashion store and add items to simulate cart recovery.
                </p>
              </div>
            ) : (
              <div className='space-y-3'>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className='p-3 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex gap-3 items-center group'
                  >
                    <img
                      src={resolveImageUrl(item.product?.image_url)}
                      alt={item.product?.name || 'Product'}
                      className='w-16 h-16 rounded-xl object-cover border border-slate-800 flex-shrink-0'
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                    <div className='flex-1 min-w-0'>
                      <h4 className='text-xs font-bold text-slate-200 truncate'>
                        {item.product?.name || 'Product'}
                      </h4>
                      <p className='text-[10px] text-slate-400 mt-0.5'>
                        Qty: <strong className='text-slate-200'>{item.quantity}</strong> × ₹{item.price_at_time.toLocaleString('en-IN')}
                      </p>
                      <p className='text-xs font-black text-purple-400 mt-1'>
                        ₹{(item.price_at_time * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <button
                      onClick={() => onRemoveItem(item.product_id)}
                      className='p-2 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition'
                      title='Remove'
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <div className='p-6 border-t border-slate-800 bg-slate-950/60 space-y-4'>
              <div className='flex justify-between items-baseline'>
                <span className='text-xs font-bold uppercase tracking-wider text-slate-400'>
                  Estimated Total
                </span>
                <span className='text-2xl font-black text-white'>
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onCheckout();
                }}
                className='w-full btn-primary py-3 text-xs font-bold flex items-center justify-center gap-2'
              >
                <span>Proceed to Checkout</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
