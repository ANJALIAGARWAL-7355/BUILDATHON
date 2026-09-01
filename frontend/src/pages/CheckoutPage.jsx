import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Zap,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Terminal,
  Copy,
  QrCode,
  MessageSquare,
  Check,
  Sparkles,
  ArrowRight,
  RefreshCw,
  CreditCard,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { agentService, paymentService, resolveImageUrl } from '../services/api';
import ConfettiEffect from '../components/ConfettiEffect';
import ToastNotification from '../components/ToastNotification';

export default function CheckoutPage({ onNavigate }) {
  const { cart, currentCustomer, clearCart } = useCart();
  const [step, setStep] = useState(1); // 1: Confirm, 2: AI Diagnostic, 3: Razorpay Recovery
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentLink, setPaymentLink] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ isOpen: true, message, type });
  };

  useEffect(() => {
    if (cart && cart.items && cart.items.length === 0 && paymentStatus !== 'success') {
      onNavigate('cart');
    }
  }, [cart, onNavigate, paymentStatus]);

  if (!cart || !cart.items || cart.items.length === 0) {
    if (paymentStatus === 'success') {
      return (
        <div className="min-h-[80vh] flex items-center justify-center py-8">
          <ConfettiEffect active={showConfetti} />
          <div className="glass-card p-8 text-center space-y-4 max-w-md border border-emerald-500/30 rounded-3xl animate-fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-black text-white">Order Recovered & Paid!</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Payment was captured via autonomous recovery link. The merchant telemetry dashboard has been updated in real-time.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="btn-primary text-xs py-3 font-bold flex items-center justify-center gap-2"
              >
                <span>View Live Dashboard Metrics</span>
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => onNavigate('home')}
                className="btn-secondary text-xs py-2.5 font-bold"
              >
                Back to Store
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-[80vh] flex items-center justify-center py-8">
        <div className="glass-card p-8 text-center space-y-4 max-w-sm border border-slate-800 rounded-3xl">
          <p className="text-slate-400 text-xs font-semibold">Your cart is empty. Please add items before checking out.</p>
          <button
            onClick={() => onNavigate('home')}
            className="btn-primary text-xs font-bold"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  const items = cart.items || [];
  const total = items.reduce((sum, item) => sum + item.price_at_time * item.quantity, 0);

  const handleAnalyzeAndProceed = async () => {
    if (!currentCustomer) {
      setError('Sandbox Error: Please choose a test customer profile first on the Store homepage.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await agentService.recover(currentCustomer);
      setAnalysis(response.data.analysis);
      setStep(2);

      if (response.data.execution?.payment_link) {
        setPaymentLink(response.data.execution.payment_link);
      }
      showToast('AI Intent Analysis complete!', 'info');
    } catch (err) {
      setError(err.response?.data?.detail || 'The AI Agent analysis request failed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePaymentLink = async () => {
    if (!currentCustomer) {
      setError('Sandbox Error: Please select a test customer profile first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await paymentService.createLink(currentCustomer, total, cart.id);
      setPaymentLink(response.data);
      setWhatsappSent(false);
      setStep(3);
      showToast('Razorpay recovery link generated!', 'success');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate payment recovery link.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const linkUrl = paymentLink?.payment_link_url || `https://rzp.io/i/mock_rec_${currentCustomer}_${cart.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(linkUrl);
    setCopied(true);
    showToast('Payment link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const paymentQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(linkUrl)}`;

  const whatsappMessage = `Hi Anjali! Your cart is reserved for 15 mins. Complete your order instantly with 1-click checkout: ${linkUrl} (Item total: ₹${total.toLocaleString('en-IN')}).`;

  const handleSendWhatsappRecovery = () => {
    const phone = currentCustomer === 1 ? '919876543210' : '919876543211';
    const encodedMessage = encodeURIComponent(whatsappMessage);
    window.open(`https://wa.me/${phone}?text=${encodedMessage}`, '_blank', 'noopener,noreferrer');
    setWhatsappSent(true);
    showToast('WhatsApp recovery message dispatched!', 'success');
  };

  const handleMockPaymentSuccess = async () => {
    const linkId = paymentLink?.razorpay_payment_link_id || paymentLink?.payment_link_id || `plink_mock_${currentCustomer}`;

    setLoading(true);
    setError(null);

    try {
      await paymentService.mockSuccess(linkId);
      setPaymentStatus('success');
      setShowConfetti(true);
      clearCart();
      showToast('Payment successful! ₹' + total.toLocaleString('en-IN') + ' recovered!', 'success');

      setTimeout(() => {
        onNavigate('dashboard');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Mock payment capture failed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Intent score calculations
  const score = analysis?.intent_score || 88;
  const observations = analysis?.observations || [
    'Viewed Black Evening Dress 4 times',
    'Added product to bag (Qty: 1)',
    'Initiated checkout session',
    'Cart abandoned during payment step',
  ];

  return (
    <div className="py-8 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <ConfettiEffect active={showConfetti} />

      <ToastNotification
        isOpen={toast.isOpen}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(prev => ({ ...prev, isOpen: false }))}
      />

      <button
        onClick={() => onNavigate('cart')}
        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 font-bold text-xs transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back to Cart</span>
      </button>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-300 flex items-start gap-2.5 text-xs">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Step Wizard Header */}
      <div className="flex items-center justify-between p-4 bg-slate-950/80 border border-slate-800 rounded-3xl shadow-lg">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
          <Sparkles size={14} className="text-purple-400" />
          <span>Agentic Recovery Flow</span>
        </div>

        <div className="flex items-center gap-3 sm:gap-6 text-xs font-extrabold">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-purple-400' : 'text-slate-600'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 1 ? 'bg-purple-600 text-white' : 'bg-slate-900 border border-slate-800'}`}>1</span>
            <span className="hidden sm:inline">Order Verify</span>
          </div>
          <span className="text-slate-700">→</span>
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-purple-400' : 'text-slate-600'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 2 ? 'bg-purple-600 text-white' : 'bg-slate-900 border border-slate-800'}`}>2</span>
            <span className="hidden sm:inline">AI Diagnostic</span>
          </div>
          <span className="text-slate-700">→</span>
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-purple-400' : 'text-slate-600'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step >= 3 ? 'bg-purple-600 text-white' : 'bg-slate-900 border border-slate-800'}`}>3</span>
            <span className="hidden sm:inline">Razorpay Link</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Workflow Stages */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: ORDER CONFIRMATION */}
          <div className={`glass-card p-6 bg-slate-950/80 border rounded-3xl transition-all ${
            step === 1 ? 'border-purple-500/40 ring-1 ring-purple-500/20' : 'border-slate-800/80 opacity-75'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xs font-black">
                  1
                </span>
                <span>Review Customer Session & Abandoned Cart</span>
              </h3>
              {step > 1 && (
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                  <Check size={12} />
                  <span>Verified</span>
                </span>
              )}
            </div>

            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-3 p-2.5 bg-slate-900/60 rounded-2xl border border-slate-800/60">
                  <img
                    src={resolveImageUrl(item.product?.image_url)}
                    alt={item.product?.name}
                    className="w-14 h-14 rounded-xl object-cover border border-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{item.product?.name}</h4>
                    <p className="text-[10px] text-slate-400">Qty: {item.quantity} × ₹{item.price_at_time.toLocaleString('en-IN')}</p>
                  </div>
                  <span className="text-xs font-black text-white">
                    ₹{(item.price_at_time * item.quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            {step === 1 && (
              <div className="mt-5 pt-4 border-t border-slate-900 flex justify-end">
                <button
                  onClick={handleAnalyzeAndProceed}
                  disabled={loading}
                  className="btn-primary text-xs py-2.5 px-6 font-bold flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Analyzing Intent...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={14} />
                      <span>Trigger AI Intent Diagnostic</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* STEP 2: AI AGENT BEHAVIORAL DIAGNOSTIC */}
          {step >= 2 && (
            <div className={`glass-card p-6 bg-slate-950/80 border rounded-3xl transition-all ${
              step === 2 ? 'border-purple-500/40 ring-1 ring-purple-500/20' : 'border-slate-800/80'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-900 mb-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center text-xs font-black">
                    2
                  </span>
                  <span>Autonomous AI Agent Diagnostic Result</span>
                </h3>
                <span className="text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  Score: {score.toFixed(0)}%
                </span>
              </div>

              {/* Radial Intent Meter & Reasoning */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-purple-950/20 border border-purple-500/20 rounded-2xl">
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <div className="w-16 h-16 rounded-full border-4 border-purple-500 flex items-center justify-center text-lg font-black text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                    {score.toFixed(0)}%
                  </div>
                  <span className="text-[10px] font-extrabold uppercase text-purple-400 mt-2">
                    {analysis?.intent_level || 'HIGH INTENT'}
                  </span>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <Terminal size={12} className="text-purple-400" />
                    <span>Observed Signals & Reasoning</span>
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
                    {observations.map((obs, idx) => (
                      <li key={idx} className="truncate">{obs}</li>
                    ))}
                  </ul>
                  <p className="text-[11px] text-purple-300 pt-1">
                    <strong>Recommendation</strong>: Dispatched high-priority 1-click Razorpay recovery payment link.
                  </p>
                </div>
              </div>

              {step === 2 && (
                <div className="mt-5 pt-4 border-t border-slate-900 flex justify-end gap-3">
                  <button
                    onClick={handleCreatePaymentLink}
                    disabled={loading}
                    className="btn-primary text-xs py-2.5 px-6 font-bold flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Generating Link...</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink size={14} />
                        <span>Generate Razorpay Recovery Link</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 3: OMNICHANNEL RECOVERY & MOCK PAYMENT */}
          {step >= 3 && (
            <div className="glass-card p-6 bg-slate-950/80 border border-purple-500/40 rounded-3xl space-y-6 shadow-2xl ring-1 ring-purple-500/20">
              <div className="flex items-center justify-between pb-3 border-b border-slate-900">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs font-black">
                    3
                  </span>
                  <span>Omnichannel Razorpay Recovery Dispatch</span>
                </h3>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 animate-pulse">
                  Active Link Live
                </span>
              </div>

              {/* Payment Link Copy Box */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Secure Razorpay Payment Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={linkUrl}
                    className="w-full input-field text-xs font-mono text-purple-300 py-2"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="btn-secondary text-xs px-4 py-2 font-bold flex items-center gap-1.5 flex-shrink-0"
                  >
                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Omnichannel Dispatch: WhatsApp & QR Code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* WhatsApp Dispatch */}
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                      <MessageSquare size={16} />
                      <span>WhatsApp Recovery Message</span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-mono bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80">
                      "{whatsappMessage}"
                    </p>
                  </div>
                  <button
                    onClick={handleSendWhatsappRecovery}
                    className="w-full py-2.5 rounded-xl bg-emerald-600/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/25 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <MessageSquare size={14} />
                    <span>{whatsappSent ? 'Resend WhatsApp Nudge' : 'Dispatch WhatsApp Link'}</span>
                  </button>
                </div>

                {/* QR Code */}
                <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                  <img
                    src={paymentQrUrl}
                    alt="Payment QR Code"
                    className="w-28 h-28 rounded-xl border border-purple-500/30 bg-white p-1 shadow-md"
                  />
                  <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                    <QrCode size={13} className="text-purple-400" />
                    <span>Instant UPI / QR Checkout</span>
                  </span>
                </div>
              </div>

              {/* Mock Payment Trigger Button */}
              <div className="pt-4 border-t border-slate-900 space-y-3">
                <button
                  onClick={handleMockPaymentSuccess}
                  disabled={loading}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 hover:brightness-110 transition-all"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      <span>Processing Capture...</span>
                    </>
                  ) : (
                    <>
                      <CreditCard size={18} />
                      <span>Simulate Customer Payment Success (₹{total.toLocaleString('en-IN')})</span>
                    </>
                  )}
                </button>
                <p className="text-[11px] text-center text-slate-500">
                  Clicking this simulates customer completing the Razorpay payment, recovering ₹{total.toLocaleString('en-IN')} revenue in real-time.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Summary Sidebar */}
        <div className="lg:col-span-1 space-y-4">
          <div className="glass-card p-6 bg-slate-950/80 border border-slate-800 rounded-3xl space-y-4 sticky top-24">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-900 pb-3">
              Live Recovery Value
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Cart Items</span>
                <span className="text-slate-200 font-bold">{items.length} items</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Customer</span>
                <span className="text-slate-200 font-bold">Anjali Agarwal</span>
              </div>
              <div className="flex justify-between text-slate-400 pb-3 border-b border-slate-900">
                <span>Assigned Agent</span>
                <span className="text-purple-400 font-bold">RazorGrowth Core AI</span>
              </div>

              <div className="flex justify-between items-baseline pt-2">
                <span className="text-sm font-black text-white">Amount at Risk</span>
                <span className="text-2xl font-black text-purple-400">
                  ₹{total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-2xl text-[11px] text-purple-300 leading-relaxed flex items-start gap-2">
              <ShieldCheck size={16} className="flex-shrink-0 mt-0.5 text-purple-400" />
              <span>RazorGrowth autonomously generates, signs, and dispatches recovery links within seconds of intent loss.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
