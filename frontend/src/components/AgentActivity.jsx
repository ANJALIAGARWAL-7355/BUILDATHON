import React from 'react';
import { Zap, CheckCircle, AlertTriangle, Clock, Eye, ShoppingCart, Terminal, Bot } from 'lucide-react';

export default function AgentActivity({ activities = [], onInspectDecision }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-extrabold uppercase tracking-wider">
            <CheckCircle size={13} />
            <span>Recovered</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] bg-amber-500/15 border border-amber-500/30 text-amber-400 font-extrabold uppercase tracking-wider">
            <Clock size={13} className="animate-spin" />
            <span>Active Recovery</span>
          </div>
        );
      case 'failed':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] bg-rose-500/15 border border-rose-500/30 text-rose-400 font-extrabold uppercase tracking-wider">
            <AlertTriangle size={13} />
            <span>Ignored</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] bg-purple-500/15 border border-purple-500/30 text-purple-400 font-extrabold uppercase tracking-wider">
            <Zap size={13} />
            <span>Engaged</span>
          </div>
        );
    }
  };

  const getDecisionBadge = (decision) => {
    const decLabels = {
      'CREATE_PAYMENT_LINK': { text: 'Payment Link Created', style: 'bg-rose-500/15 text-rose-300 border border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.1)]' },
      'SEND_REMINDER': { text: 'Friendly Reminder Sent', style: 'bg-blue-500/15 text-blue-300 border border-blue-500/30' },
      'SEND_RECOMMENDATION': { text: 'Personalized Offer Sent', style: 'bg-amber-500/15 text-amber-300 border border-amber-500/30' },
      'DO_NOTHING': { text: 'Monitor Behaviour', style: 'bg-slate-800 text-slate-400 border border-slate-700/50' },
    };
    const info = decLabels[decision] || { text: decision, style: 'bg-slate-800 text-slate-400 border border-slate-700' };
    return <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-xl uppercase tracking-wider ${info.style}`}>{info.text}</span>;
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="glass-card p-12 text-center text-slate-500 flex flex-col items-center justify-center gap-3 rounded-3xl">
        <Terminal size={36} className="text-slate-600 animate-pulse" />
        <p className="text-sm font-semibold">No AI activities recorded in telemetry log.</p>
        <p className="text-xs text-slate-600">Simulate customer abandonment on the storefront to trigger recovery steps.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {activities.map((activity, idx) => (
        <div 
          key={idx} 
          className="glass-card p-5 border-l-4 border-purple-500 rounded-2xl relative overflow-hidden bg-gradient-to-r from-slate-950/90 to-slate-900/50 hover:border-purple-400 transition-all shadow-md"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 space-y-2.5">
              {/* Header: Customer and Status */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-black text-sm text-slate-100 hover:text-purple-400 transition">
                  {activity.customer_name}
                </span>
                <span className="text-[10px] font-extrabold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-lg">
                  Customer #{activity.customer_id}
                </span>
                <div className="ml-0 md:ml-auto">
                  {getStatusIcon(activity.status)}
                </div>
              </div>

              {/* Product and Value */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <ShoppingCart size={13} className="text-slate-500" />
                <span>
                  Interested in <strong className="text-slate-100">{activity.product_name}</strong>
                </span>
                <span className="text-slate-700">•</span>
                <span>
                  Cart Value: <strong className="text-purple-400">₹{activity.cart_value.toLocaleString('en-IN')}</strong>
                </span>
              </div>

              {/* Telemetry and Scoring */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* Intent score pill */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-black bg-slate-900 border border-slate-800">
                  <span className={`w-2 h-2 rounded-full ${activity.intent_score >= 70 ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-amber-500'}`}></span>
                  <span>Intent Score: {activity.intent_score}%</span>
                </div>

                {/* Decision Badge */}
                {getDecisionBadge(activity.decision)}

                {/* Inspect Agent Thoughts Button */}
                {onInspectDecision && (
                  <button
                    onClick={() => onInspectDecision({
                      ...activity,
                      observations: [
                        `Observed interest in ${activity.product_name}`,
                        `Cart value: Rs. ${activity.cart_value}`,
                        `Intent evaluated at ${activity.intent_score}%`,
                      ],
                      reason: activity.action_taken || 'Autonomous recovery action triggered.',
                    })}
                    className="ml-auto text-[11px] font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1 bg-purple-950/40 border border-purple-500/25 px-2.5 py-1 rounded-xl hover:bg-purple-900/40 transition"
                  >
                    <Bot size={13} />
                    <span>Inspect AI Logic</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
