import React from 'react';
import { X, Bot, Zap, CheckCircle, AlertTriangle, ShieldCheck, Terminal, Cpu } from 'lucide-react';

export default function AgentThoughtModal({ decision, isOpen, onClose }) {
  if (!isOpen || !decision) return null;

  const observations = Array.isArray(decision.observations)
    ? decision.observations
    : typeof decision.observations === 'string'
    ? JSON.parse(decision.observations || '[]')
    : [];

  const score = decision.intent_score || 0;
  const isHighIntent = score >= 70;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="glass-card max-w-2xl w-full bg-slate-900 border border-purple-500/25 shadow-2xl rounded-3xl overflow-hidden my-6">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-600/15 text-purple-400 border border-purple-500/30">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">AI Agent Decision Inspector</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  Decision #{decision.id || 'LIVE'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Autonomous intent analysis, reasoning chain, and omnichannel execution trace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Intent Meter Card */}
          <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl border ${
                isHighIntent 
                  ? 'bg-purple-600/15 text-purple-400 border-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
                  : 'bg-amber-600/15 text-amber-400 border-amber-500/30'
              }`}>
                {score.toFixed(0)}%
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                  Evaluated Intent Level
                </span>
                <p className="text-base font-extrabold text-white flex items-center gap-2">
                  <span>{decision.intent_level || (isHighIntent ? 'HIGH INTENT' : 'MEDIUM INTENT')}</span>
                  {isHighIntent ? (
                    <Zap size={14} className="text-purple-400" />
                  ) : (
                    <AlertTriangle size={14} className="text-amber-400" />
                  )}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                Financial Outcome
              </span>
              <p className="text-base font-extrabold text-emerald-400 flex items-center gap-1 sm:justify-end">
                <CheckCircle size={15} />
                <span>
                  {decision.result_outcome === 'success'
                    ? `₹${(decision.revenue_impact || 0).toLocaleString('en-IN')} Recovered`
                    : 'Dispatched & Monitored'}
                </span>
              </p>
            </div>
          </div>

          {/* Behavior Signals Observed */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Terminal size={14} className="text-purple-400" />
              <span>Observed Session Behavior Signals</span>
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {observations.map((obs, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div>
                  <span>{obs}</span>
                </div>
              ))}
              {observations.length === 0 && (
                <p className="text-xs text-slate-500">No direct signals logged for this event.</p>
              )}
            </div>
          </div>

          {/* Reason & Decision Matrix */}
          <div className="space-y-4">
            <div className="p-4 bg-purple-950/20 border border-purple-500/20 rounded-2xl space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-400 flex items-center gap-1">
                <Cpu size={12} />
                <span>Agent Decision Reasoning</span>
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">
                {decision.reason || 'Decision synthesized via real-time purchase intent heuristic.'}
              </p>
            </div>

            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Action Taken & Omnichannel Execution
              </span>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {decision.action_taken || 'Created recovery payment link and dispatched omnichannel nudge.'}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Timestamp: {new Date(decision.created_at || Date.now()).toLocaleString()}
          </span>
          <button
            onClick={onClose}
            className="btn-secondary text-xs py-1.5 px-4"
          >
            Close Trace
          </button>
        </div>
      </div>
    </div>
  );
}
