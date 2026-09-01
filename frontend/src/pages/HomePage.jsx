import React, { useEffect, useState } from 'react';
import { productService, customerService, eventService, agentService } from '../services/api';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import ProductDetailModal from '../components/ProductDetailModal';
import ImageUploadModal from '../components/ImageUploadModal';
import ToastNotification from '../components/ToastNotification';
import {
  Users,
  AlertCircle,
  Sparkles,
  Filter,
  Plus,
  Search,
  Zap,
  CheckCircle2,
  X,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';

export default function HomePage({ onNavigate }) {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured');
  const [maxPrice, setMaxPrice] = useState(5000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searching, setSearching] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  const { setCustomer, currentCustomer, addToCart } = useCart();

  const categories = ['All', 'Dresses', 'Tops', 'Shoes', 'Accessories'];

  useEffect(() => {
    loadProducts();
    loadCustomers();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getAll();
      setProducts(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to synchronize product catalog from API');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customerService.getAll();
      if (response.data && response.data.length > 0) {
        const metadataMap = {
          1: { tag: 'HIGH INTENT', desc: 'Simulated checkout abandonment 30m ago. Ideal for recovery agent demo.', color: 'border-rose-500/30 text-rose-400 bg-rose-500/10' },
          2: { tag: 'COMPLETED', desc: 'Completed purchase 10m ago. Demonstrates standard happy path.', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
          3: { tag: 'BROWSING', desc: 'Active browser. Viewed casual top 1x. Intent score is low.', color: 'border-slate-700 text-slate-400 bg-slate-800/40' },
          4: { tag: 'BROWSING', desc: 'Active browser. Viewed heels 1x. Intent score is low.', color: 'border-slate-700 text-slate-400 bg-slate-800/40' },
          5: { tag: 'INACTIVE', desc: 'Inactive shopper. No events recorded in last 24 hours.', color: 'border-slate-700 text-slate-400 bg-slate-800/40' },
        };
        const mapped = response.data.map(c => ({
          ...c,
          tag: metadataMap[c.id]?.tag || 'BROWSING',
          desc: metadataMap[c.id]?.desc || 'Standard customer profile.',
          color: metadataMap[c.id]?.color || 'border-slate-700 text-slate-400 bg-slate-800/40',
        }));
        setCustomers(mapped);
      }
    } catch (err) {
      console.error('Failed to load customers from API, using defaults:', err);
    }
  };

  const handleSearch = async (nextQuery = searchQuery) => {
    const trimmed = nextQuery.trim();
    if (!trimmed) {
      await loadProducts();
      return;
    }

    try {
      setSearching(true);
      setError(null);
      const response = await productService.search(trimmed, 16);
      const resultProducts = response.data?.products || response.data || [];
      setProducts(resultProducts);
    } catch (err) {
      setError('Product search failed. Reverting to standard catalog.');
      console.error(err);
      await loadProducts();
    } finally {
      setSearching(false);
    }
  };

  const handleSelectCustomer = (customerId) => {
    setCustomer(customerId);
    const cust = customers.find(c => c.id === customerId);
    showToast(`Active sandbox customer set to ${cust?.name || customerId}`, 'info');
  };

  const handleAddToCart = async (productId, quantity = 1) => {
    if (!currentCustomer) {
      setError('Sandbox Mode Required: Please select a test customer profile below first.');
      window.scrollTo({ top: 120, behavior: 'smooth' });
      showToast('Please select a Sandbox Customer profile first!', 'error');
      return;
    }

    try {
      await eventService.record({
        customer_id: currentCustomer,
        event_type: 'product_view',
        product_id: productId,
      });
    } catch (err) {
      console.error('Failed to record product_view event:', err);
    }

    const success = await addToCart(productId, quantity);
    if (success) {
      const prod = products.find(p => p.id === productId);
      showToast(`Added ${quantity}x ${prod?.name || 'item'} to bag!`, 'success');
      setError(null);
    }
  };

  const handleToggleWishlist = (productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      const next = exists ? prev.filter(id => id !== productId) : [...prev, productId];
      showToast(exists ? 'Removed from Wishlist' : 'Saved to Wishlist!', 'info');
      return next;
    });
  };

  const handleSimulateBrowse3x = async () => {
    if (!currentCustomer) {
      showToast('Please select a Sandbox Customer first!', 'error');
      return;
    }
    setSimulating(true);
    try {
      const sampleProduct = products[0] || { id: 1 };
      for (let i = 0; i < 3; i++) {
        await eventService.record({
          customer_id: currentCustomer,
          event_type: 'product_view',
          product_id: sampleProduct.id,
        });
      }
      showToast('Simulated 3x Product Views for active customer', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const handleSimulateAbandon = async () => {
    if (!currentCustomer) {
      showToast('Please select a Sandbox Customer first!', 'error');
      return;
    }
    setSimulating(true);
    try {
      await eventService.record({
        customer_id: currentCustomer,
        event_type: 'checkout_started',
      });
      await eventService.record({
        customer_id: currentCustomer,
        event_type: 'cart_abandoned',
      });
      showToast('Simulated Cart Abandonment event successfully!', 'success');
    } catch (err) {
      console.error(err);
    } finally {
      setSimulating(false);
    }
  };

  const activeCustomer = customers.find(c => c.id === currentCustomer);

  const filteredProducts = products
    .filter(p => selectedCategory === 'All' || p.category === selectedCategory)
    .filter(p => p.price <= maxPrice)
    .filter(p => p.rating >= minRating)
    .filter(p => !inStockOnly || p.inventory > 0)
    .filter(p => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'stock') return b.inventory - a.inventory;
      return 0;
    });

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-slate-400 text-xs font-semibold">Synchronizing catalog and pictures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
      <ToastNotification
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Hero Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3 pt-2 pb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-purple-500/10 border border-purple-500/25 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]">
          <Sparkles size={13} className="animate-spin" />
          <span>Autonomous AI Commerce & Revenue Recovery</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
          Luxury Fashion <span className="text-gradient">Agentic Storefront</span>
        </h1>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed">
          Browse high-fashion collections, test live image uploads, and simulate customer behaviors to observe autonomous recovery in action.
        </p>
      </div>

      {/* Interactive Sandbox Customer Simulator */}
      <div className="glass-card p-6 border border-purple-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950/20 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-600/15 text-purple-400 border border-purple-500/20">
              <Users size={20} />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <span>1. Select Sandbox Customer</span>
                {activeCustomer && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                    Active: {activeCustomer.name}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                Pick a simulated customer session to record real-time e-commerce actions
              </p>
            </div>
          </div>

          {/* Quick Simulation Trigger Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSimulateBrowse3x}
              disabled={simulating || !currentCustomer}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-300 hover:text-white hover:border-purple-500/50 transition flex items-center gap-1.5"
              title="Simulate 3 product views"
            >
              <Zap size={12} className="text-amber-400" />
              <span>Simulate 3x Views</span>
            </button>
            <button
              onClick={handleSimulateAbandon}
              disabled={simulating || !currentCustomer}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-bold text-slate-300 hover:text-white hover:border-rose-500/50 transition flex items-center gap-1.5"
              title="Simulate cart abandonment"
            >
              <AlertCircle size={12} className="text-rose-400" />
              <span>Simulate Abandon</span>
            </button>
            <button
              onClick={() => onNavigate('checkout')}
              disabled={!currentCustomer}
              className="px-3 py-1.5 rounded-xl btn-primary text-[11px] font-bold flex items-center gap-1.5"
            >
              <span>Run AI Recovery</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 flex items-start gap-2.5 text-xs">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Customer Profile Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {customers.map(customer => {
            const isSelected = currentCustomer === customer.id;
            return (
              <button
                key={customer.id}
                onClick={() => handleSelectCustomer(customer.id)}
                className={`sandbox-btn text-left p-3.5 ${
                  isSelected
                    ? 'border-purple-500 bg-purple-500/15 shadow-[0_0_25px_rgba(168,85,247,0.2)] ring-1 ring-purple-500'
                    : 'hover:border-slate-700 bg-slate-950/70'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <img
                    src={customer.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt={customer.name}
                    className={`w-9 h-9 rounded-full object-cover border-2 ${
                      isSelected ? 'border-purple-400 ring-2 ring-purple-500/30' : 'border-slate-700'
                    }`}
                  />
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border ${customer.color}`}>
                    {customer.tag}
                  </span>
                </div>

                <span className="font-black text-xs text-white truncate w-full">{customer.name}</span>
                <span className="text-[10px] text-slate-500 truncate w-full">{customer.email}</span>
                <span className="text-[10px] text-slate-400 mt-2 border-t border-slate-900 pt-2 w-full leading-tight">
                  {customer.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Catalog Search & Controls Bar */}
      <div className="glass-card p-4 border border-slate-800 bg-slate-950/80 space-y-4">
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          {/* Search Bar */}
          <form
            className="flex-1 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name, category, or style..."
                className="w-full input-field pl-9 pr-20 py-2 text-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    loadProducts();
                  }}
                  className="absolute right-12 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X size={13} />
                </button>
              )}
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-purple-600/20 text-purple-400 border border-purple-500/30 text-[10px] font-bold px-2.5 py-1 rounded-lg"
              >
                {searching ? '...' : 'Search'}
              </button>
            </div>
          </form>

          {/* Action Buttons: Add Product & Upload Picture */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsUploadModalOpen(true);
              }}
              className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Add Product / Upload Photo</span>
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field text-xs py-2 pr-8"
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Top Rated</option>
              <option value="stock">Inventory</option>
            </select>
          </div>
        </div>

        {/* Secondary Interactive Filters (Price Slider, Rating, In-stock) */}
        <div className="pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {categories.map(cat => {
              const count = cat === 'All' ? products.length : products.filter(p => p.category === cat).length;
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-purple-600 border-purple-500 text-white shadow-md shadow-purple-500/20'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-purple-900/60 text-purple-200' : 'bg-slate-800 text-slate-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Interactive Range & Toggles */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Max: ₹{maxPrice}</span>
              <input
                type="range"
                min="500"
                max="5000"
                step="250"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-24 accent-purple-500 cursor-pointer"
              />
            </div>

            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded bg-slate-900 border-slate-800 text-purple-600 focus:ring-0"
              />
              <span className="text-xs font-semibold text-slate-300">In Stock Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <ShoppingBag size={20} className="text-purple-400" />
              <span>{selectedCategory === 'All' ? 'Curated Catalog' : selectedCategory}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-500 space-y-3">
            <p className="text-sm">No products found matching the current filters.</p>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setMaxPrice(5000);
                setSearchQuery('');
                loadProducts();
              }}
              className="btn-secondary text-xs px-4 py-2"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onViewDetails={() => setSelectedProduct(product)}
                onEditImage={(prod) => {
                  setEditingProduct(prod);
                  setIsUploadModalOpen(true);
                }}
                isWishlisted={wishlist.includes(product.id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      <ProductDetailModal
        isOpen={Boolean(selectedProduct)}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        isWishlisted={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Add / Edit Product & Upload Picture Modal */}
      <ImageUploadModal
        isOpen={isUploadModalOpen}
        product={editingProduct}
        onClose={() => {
          setIsUploadModalOpen(false);
          setEditingProduct(null);
        }}
        onSuccess={() => {
          loadProducts();
          showToast(
            editingProduct
              ? 'Product picture updated successfully!'
              : 'New product published to catalog!',
            'success'
          );
        }}
      />
    </div>
  );
}
