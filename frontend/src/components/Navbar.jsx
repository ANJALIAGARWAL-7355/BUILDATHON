import React from 'react';
import { ShoppingCart, Menu, X, Home, BarChart3, ShieldAlert, Sparkles, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function Navbar({ currentPage, setCurrentPage, onOpenCartDrawer, wishlistCount = 0 }) {
  const { cart, currentCustomer } = useCart();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const cartItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            className="flex items-center cursor-pointer group"
            onClick={() => setCurrentPage('home')}
          >
            <div className="flex items-center gap-2">
              <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-white font-black p-2 rounded-xl shadow-lg shadow-purple-500/25 group-hover:scale-105 transition-transform duration-200">
                RG
              </span>
              <span className="text-xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                RazorGrowth
              </span>
              <span className="text-[10px] font-extrabold tracking-wider uppercase bg-purple-500/10 border border-purple-500/30 text-purple-400 px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.15)]">
                AI Agent
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => setCurrentPage('home')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${
                currentPage === 'home'
                  ? 'text-white bg-purple-600/15 border border-purple-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <Home size={16} />
              <span>Store</span>
            </button>

            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${
                currentPage === 'dashboard'
                  ? 'text-white bg-purple-600/15 border border-purple-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <BarChart3 size={16} />
              <span>AI Dashboard</span>
            </button>

            <button
              onClick={() => {
                if (onOpenCartDrawer) {
                  onOpenCartDrawer();
                } else {
                  setCurrentPage('cart');
                }
              }}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all duration-200 relative ${
                currentPage === 'cart'
                  ? 'text-white bg-purple-600/15 border border-purple-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <ShoppingCart size={16} />
              <span>Cart</span>
              {cartItems > 0 && (
                <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[10px] font-extrabold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center border border-slate-950 shadow-md animate-pulse">
                  {cartItems}
                </span>
              )}
            </button>
          </div>

          {/* Customer Info Badge */}
          <div className="hidden md:flex items-center space-x-3">
            {currentCustomer ? (
              <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                <span className="text-xs font-extrabold">
                  Customer #{currentCustomer} Active
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25">
                <ShieldAlert size={14} className="text-amber-500" />
                <span className="text-xs font-bold text-amber-400">
                  Select Sandbox Customer
                </span>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-800"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Navigation Dropdown */}
        {menuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-slate-900 space-y-2">
            <button
              onClick={() => {
                setCurrentPage('home');
                setMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${
                currentPage === 'home' ? 'text-white bg-purple-600/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              Store
            </button>
            <button
              onClick={() => {
                setCurrentPage('dashboard');
                setMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${
                currentPage === 'dashboard' ? 'text-white bg-purple-600/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              AI Dashboard
            </button>
            <button
              onClick={() => {
                setCurrentPage('cart');
                setMenuOpen(false);
              }}
              className={`block w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold ${
                currentPage === 'cart' ? 'text-white bg-purple-600/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cart ({cartItems})
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
