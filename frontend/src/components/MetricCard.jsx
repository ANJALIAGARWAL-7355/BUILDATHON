import React from 'react';

export default function MetricCard({ title, value, unit = '', icon: Icon, trend = null, color = 'purple' }) {
  // Border glow and text colors for status
  const cardStyles = {
    purple: 'border-purple-500/20 shadow-purple-500/5 hover:border-purple-500/40 text-purple-400 bg-purple-500/10',
    green: 'border-emerald-500/20 shadow-emerald-500/5 hover:border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    blue: 'border-blue-500/20 shadow-blue-500/5 hover:border-blue-500/40 text-blue-400 bg-blue-500/10',
    red: 'border-rose-500/20 shadow-rose-500/5 hover:border-rose-500/40 text-rose-400 bg-rose-500/10',
    yellow: 'border-amber-500/20 shadow-amber-500/5 hover:border-amber-500/40 text-amber-400 bg-amber-500/10',
  };

  const trendColors = trend > 0 ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10';

  return (
    <div className={`glass-card p-6 border-l-4 ${cardStyles[color].split(' ')[0]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-xs font-bold tracking-wider uppercase mb-1">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-extrabold text-white">
              {unit === '₹' ? '₹' : ''}
              {typeof value === 'number' 
                ? (value % 1 === 0 ? value.toLocaleString('en-IN') : value.toFixed(1)) 
                : value}
              {unit !== '₹' ? unit : ''}
            </span>
          </div>
          
          {trend && (
            <div className={`inline-flex items-center gap-1 mt-2.5 px-2 py-0.5 rounded-lg text-xs font-semibold ${trendColors}`}>
              <span>{trend > 0 ? '↑' : '↓'}</span>
              <span>{Math.abs(trend)}% vs last week</span>
            </div>
          )}
        </div>
        
        {Icon && (
          <div className={`p-3 rounded-xl ${cardStyles[color].split(' ').slice(3).join(' ')} ${cardStyles[color].split(' ')[2]}`}>
            <Icon size={22} />
          </div>
        )}
      </div>
    </div>
  );
}
