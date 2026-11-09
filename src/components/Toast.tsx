import React, { useEffect } from 'react';
import { Info, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type?: 'info' | 'success' | 'warning';
  title?: string;
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="flex items-center gap-2.5 text-sm">
        {toast.type === 'success' ? (
          <CheckCircle2 className="w-4 h-4 text-[#00D09C] shrink-0" />
        ) : toast.type === 'warning' ? (
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
        ) : (
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
        )}
        <div className="leading-tight">
          {toast.title && <div className="font-semibold text-xs text-slate-300">{toast.title}</div>}
          <div className="text-white text-xs sm:text-sm font-medium">{toast.message}</div>
        </div>
      </div>
      <button
        onClick={onClose}
        aria-label="Close notification"
        className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
