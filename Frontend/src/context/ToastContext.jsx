import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    if (!message) return;
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Support object config or plain string
    const toastItem = typeof message === 'object'
      ? {
          id,
          message: message.message || message.text || '',
          type: message.type || type,
          duration: message.duration || duration,
        }
      : { id, message, type, duration };

    setToasts((prev) => [toastItem, ...prev].slice(0, 5)); // Keep max 5 visible

    if (toastItem.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toastItem.duration);
    }
  }, [removeToast]);

  // Convenience helper methods
  const toast = useCallback((msg, duration) => showToast(msg, 'info', duration), [showToast]);
  toast.success = (msg, duration) => showToast(msg, 'success', duration);
  toast.error = (msg, duration) => showToast(msg, 'error', duration);
  toast.warning = (msg, duration) => showToast(msg, 'warning', duration);
  toast.info = (msg, duration) => showToast(msg, 'info', duration);

  const getToastIcon = (type) => {
    switch (type) {
      case 'error':
        return <AlertCircle size={18} className="text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-amber-400 shrink-0" />;
      case 'info':
        return <Info size={18} className="text-sky-400 shrink-0" />;
      case 'success':
      default:
        return <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />;
    }
  };

  const getBorderColor = (type) => {
    switch (type) {
      case 'error':
        return 'border-rose-500/40 bg-slate-900/95';
      case 'warning':
        return 'border-amber-500/40 bg-slate-900/95';
      case 'info':
        return 'border-sky-500/40 bg-slate-900/95';
      case 'success':
      default:
        return 'border-emerald-500/40 bg-slate-900/95';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showNotification: showToast, toast, removeToast }}>
      {children}

      {/* Centralized Upper-Left Toast Container */}
      <div
        className="fixed top-5 left-5 z-[99999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl shadow-2xl border text-white backdrop-blur-md transition-all duration-200 transform translate-y-0 opacity-100 ${getBorderColor(
              t.type
            )}`}
            style={{ animation: 'slideInLeft 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className="pt-0.5">{getToastIcon(t.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold leading-relaxed text-slate-100 break-words">
                {t.message}
              </p>
            </div>
            <button
              type="button"
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors shrink-0 cursor-pointer"
              title="Dismiss notification"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export default ToastContext;
