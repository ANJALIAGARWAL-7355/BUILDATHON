import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  TrendingUp,
  Users,
  ShoppingCart,
  CheckCircle,
  Zap,
  BarChart3,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  Layers,
  Bot,
  Plus,
  Camera,
  Trash2,
  ExternalLink,
  Package,
} from 'lucide-react';
import { dashboardService, productService, seedService, resolveImageUrl } from '../services/api';
import MetricCard from '../components/MetricCard';
import AgentActivity from '../components/AgentActivity';
import AgentThoughtModal from '../components/AgentThoughtModal';
import ImageUploadModal from '../components/ImageUploadModal';
import ToastNotification from '../components/ToastNotification';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState(null);
  const [activities, setActivities] = useState([]);
  const [revenueChart, setRevenueChart] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('analytics'); // 'analytics', 'activity', 'catalog'
  const [activityFilter, setActivityFilter] = useState('all');
  const [inspectingDecision, setInspectingDecision] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  useEffect(() => {
    loadDashboard();
    loadCatalog();
    const interval = setInterval(loadDashboard, 6000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      if (!loading) setRefreshing(true);
      const metricsRes = await dashboardService.getMetrics();
      const activitiesRes = await dashboardService.getActivity(15);
      const chartRes = await dashboardService.getRevenueChart(7);

      setMetrics(metricsRes.data);
      setActivities(activitiesRes.data.activities || []);

      const mappedChart = (chartRes.data || []).map(point => {
        try {
          const dateObj = new Date(point.date);
          const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          return {
            ...point,
            displayDate: formattedDate,
            recoveredAmount: Math.round(point.amount * 0.45),
          };
        } catch {
          return { ...point, displayDate: point.date, recoveredAmount: 0 };
        }
      });
      setRevenueChart(mappedChart);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.detail || 'Telemetry dashboard synchronization failed.');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCatalog = async () => {
    try {
      const res = await productService.getAll();
      setProducts(res.data || []);
    } catch (err) {
      console.error('Failed to load products in catalog manager:', err);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset database with fresh demo scenarios and curated fashion photography?')) {
      return;
    }
    setResetting(true);
    try {
      await seedService.reset();
      await loadDashboard();
      await loadCatalog();
      showToast('Database reset and seeded with fresh demo data!', 'success');
    } catch (err) {
      showToast('Failed to reset demo data', 'error');
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this product from the catalog?')) return;
    try {
      await productService.delete(productId);
      await loadCatalog();
      showToast('Product removed from catalog', 'info');
    } catch (err) {
      showToast('Failed to delete product', 'error');
    }
  };

  const filteredActivities = activities.filter(a => {
    if (activityFilter === 'all') return true;
    if (activityFilter === 'recovered') return a.status === 'success';
    if (activityFilter === 'active') return a.status === 'pending';
    if (activityFilter === 'high') return a.intent_score >= 70;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="text-slate-400 text-xs font-semibold">Synchronizing merchant telemetry dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <ToastNotification
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
      />

      {/* Dashboard Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-500/10 border border-purple-500/25 text-purple-400 mb-2">
            <Sparkles size={12} />
            <span>Autonomous Intelligence Suite</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white flex items-center gap-2.5">
            <div className="p-2 bg-purple-600/15 text-purple-400 border border-purple-500/30 rounded-2xl">
              <BarChart3 size={24} />
            </div>
            <span>Merchant Growth & Recovery Command Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time intent telemetry, autonomous recovery actions, and catalog picture management
          </p>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setEditingProduct(null);
              setIsUploadModalOpen(true);
            }}
            className="btn-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5"
          >
            <Plus size={14} />
            <span>Add Product</span>
          </button>

          <button
            onClick={handleResetDemo}
            disabled={resetting}
            className="btn-secondary text-xs py-2 px-3 font-bold flex items-center gap-1.5"
            title="Reseed database with fresh demo scenarios"
          >
            <RotateCcw size={13} className={resetting ? 'animate-spin text-purple-400' : 'text-slate-400'} />
            <span>{resetting ? 'Resetting...' : 'Reset Demo'}</span>
          </button>

          <button
            onClick={loadDashboard}
            disabled={refreshing}
            className="btn-secondary text-xs py-2 px-3 font-bold flex items-center gap-1.5"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-purple-400' : 'text-slate-400'} />
            <span>{refreshing ? 'Syncing...' : 'Sync'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 text-xs">
          {error}
        </div>
      )}

      {/* KPI Cards Grid */}
      {metrics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <MetricCard
            title="Gross Merchandise Value"
            value={metrics.total_revenue}
            unit="₹"
            icon={TrendingUp}
            color="green"
          />
          <MetricCard
            title="Revenue Saved by AI"
            value={metrics.revenue_recovered_by_ai}
            unit="₹"
            icon={Zap}
            color="purple"
          />
          <MetricCard
            title="Recovered Carts Count"
            value={metrics.customers_reengaged}
            icon={ShieldCheck}
            color="blue"
          />
          <MetricCard
            title="Active Abandoned Carts"
            value={metrics.abandoned_carts_count}
            icon={ShoppingCart}
            color="yellow"
          />
          <MetricCard
            title="AI Recovery Success Rate"
            value={metrics.ai_intervention_success_rate}
            unit="%"
            icon={CheckCircle}
            color="green"
          />
          <MetricCard
            title="Total Registered Customers"
            value={metrics.total_customers}
            icon={Users}
            color="blue"
          />
        </div>
      )}

      {/* Interactive Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition ${
            activeTab === 'analytics'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BarChart3 size={15} />
          <span>Telemetry & Analytics</span>
        </button>

        <button
          onClick={() => setActiveTab('activity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition ${
            activeTab === 'activity'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Bot size={15} />
          <span>Live Agent Activity Feed ({activities.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-black transition ${
            activeTab === 'catalog'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20'
              : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Package size={15} />
          <span>Catalog & Pictures ({products.length})</span>
        </button>
      </div>

      {/* TAB 1: TELEMETRY & ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Revenue Trend Area Chart (Left 8 cols) */}
            <div className="lg:col-span-8 glass-card p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-900 pb-3">
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-wider">
                    Revenue & Autonomous AI Recovery Trend
                  </h3>
                  <p className="text-[11px] text-slate-500">7-Day comparison of GMV vs AI-recovered orders</p>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Live Telemetry
                </span>
              </div>

              {revenueChart && revenueChart.length > 0 ? (
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueChart}>
                      <defs>
                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorRec" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.4} />
                      <XAxis dataKey="displayDate" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#090d16',
                          borderColor: 'rgba(139, 92, 246, 0.3)',
                          borderRadius: '1rem',
                          color: '#f8fafc',
                          fontSize: '11px',
                          fontWeight: 'bold',
                        }}
                      />
                      <Area type="monotone" dataKey="amount" name="Total GMV" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                      <Area type="monotone" dataKey="recoveredAmount" name="AI Recovered" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorRec)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center text-slate-500 text-xs">
                  Chart synchronization pending...
                </div>
              )}
            </div>

            {/* AI Recovery Funnel (Right 4 cols) */}
            <div className="lg:col-span-4 glass-card p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-4">
              <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-slate-900 pb-3">
                Recovery Conversion Funnel
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-300 mb-1">
                    <span>1. Store Browsing</span>
                    <span className="text-purple-400">100%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-purple-600 h-2 rounded-full w-full"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-300 mb-1">
                    <span>2. Items Added to Bag</span>
                    <span className="text-purple-400">74%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full w-[74%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-300 mb-1">
                    <span>3. Checkout Started</span>
                    <span className="text-amber-400">42%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-amber-500 h-2 rounded-full w-[42%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-300 mb-1">
                    <span>4. AI Omnichannel Recovered</span>
                    <span className="text-emerald-400 font-extrabold">{metrics?.ai_intervention_success_rate ? metrics.ai_intervention_success_rate.toFixed(0) : '85'}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2">
                    <div className="bg-emerald-500 h-2 rounded-full w-[85%]"></div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-2xl text-[11px] text-purple-300">
                ✨ <strong>Autonomous Lift</strong>: The agent recaptured ₹{(metrics?.revenue_recovered_by_ai || 0).toLocaleString('en-IN')} that would have otherwise been permanently abandoned.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: LIVE AGENT ACTIVITY FEED */}
      {activeTab === 'activity' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-400 uppercase tracking-wider text-[10px]">Filter Status:</span>
              <button
                onClick={() => setActivityFilter('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${activityFilter === 'all' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'}`}
              >
                All
              </button>
              <button
                onClick={() => setActivityFilter('recovered')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${activityFilter === 'recovered' ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'}`}
              >
                Recovered
              </button>
              <button
                onClick={() => setActivityFilter('active')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${activityFilter === 'active' ? 'bg-amber-600 text-white' : 'bg-slate-900 text-slate-400'}`}
              >
                Active Recovery
              </button>
              <button
                onClick={() => setActivityFilter('high')}
                className={`px-2.5 py-1 rounded-lg font-bold transition ${activityFilter === 'high' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400'}`}
              >
                High Intent (≥70%)
              </button>
            </div>
            <span className="text-slate-500 text-[11px]">
              Showing {filteredActivities.length} decision logs
            </span>
          </div>

          <AgentActivity
            activities={filteredActivities}
            onInspectDecision={(decision) => setInspectingDecision(decision)}
          />
        </div>
      )}

      {/* TAB 3: PRODUCT CATALOG & PICTURE MANAGER */}
      {activeTab === 'catalog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-950/80 border border-slate-800 rounded-2xl">
            <div>
              <h3 className="text-sm font-black text-white">Merchant Catalog & Image Library</h3>
              <p className="text-[11px] text-slate-400">Change product pictures on the fly, upload new photos, or adjust prices and stock.</p>
            </div>
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsUploadModalOpen(true);
              }}
              className="btn-primary text-xs py-2 px-3.5 font-bold flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Add New Product</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map(product => (
              <div
                key={product.id}
                className="glass-card p-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3 group hover:border-purple-500/40 transition"
              >
                <div className="relative h-44 rounded-xl overflow-hidden bg-slate-900">
                  <img
                    src={resolveImageUrl(product.image_url)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-extrabold text-purple-400 uppercase">
                    {product.category}
                  </div>
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setIsUploadModalOpen(true);
                    }}
                    className="absolute bottom-2 right-2 p-2 rounded-xl bg-slate-950/90 text-slate-200 border border-slate-700 hover:border-purple-500 hover:text-white transition shadow-lg flex items-center gap-1 text-[10px] font-bold"
                    title="Change Picture"
                  >
                    <Camera size={12} />
                    <span>Upload Picture</span>
                  </button>
                </div>

                <div>
                  <h4 className="font-bold text-xs text-white truncate">{product.name}</h4>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="font-black text-sm text-purple-400">₹{product.price.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-slate-400">Stock: <strong className="text-slate-200">{product.inventory}</strong></span>
                  </div>
                </div>

                <div className="flex gap-2 pt-1 border-t border-slate-900">
                  <button
                    onClick={() => {
                      setEditingProduct(product);
                      setIsUploadModalOpen(true);
                    }}
                    className="flex-1 btn-secondary text-[11px] py-1.5 font-bold"
                  >
                    Edit Details
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition"
                    title="Delete Product"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspect Agent Thoughts Modal */}
      <AgentThoughtModal
        isOpen={Boolean(inspectingDecision)}
        decision={inspectingDecision}
        onClose={() => setInspectingDecision(null)}
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
          loadCatalog();
          loadDashboard();
          showToast(editingProduct ? 'Product image updated!' : 'New product created!', 'success');
        }}
      />
    </div>
  );
}
