import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function ToastNotification({
  message,
  type = 'success',
  isOpen,
  onClose,
  duration = 3000,
}) {
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [isOpen, duration, onClose]);

  if (!isOpen || !message) return null;

  const icons = {
    success: <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />,
    error: <AlertCircle size={16} className="text-rose-400 flex-shrink-0" />,
    info: <Info size={16} className="text-purple-400 flex-shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-500/30 bg-slate-900/95 text-emerald-200',
    error: 'border-rose-500/30 bg-slate-900/95 text-rose-200',
    info: 'border-purple-500/30 bg-slate-900/95 text-purple-200',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur-md text-xs font-semibold ${borders[type] || borders.info}`}>
        {icons[type] || icons.info}
        <span className="pr-2">{message}</span>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-lg transition"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
