import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Check, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  useEffect(() => {
    const onApiError = (event) => {
      const id = ++counter.current;
      setToasts((list) => [...list, { id, message: event.detail || 'The request failed.', loading: false, error: true }]);
      window.setTimeout(() => dismiss(id), 4500);
    };
    window.addEventListener('stisidore-api-error', onApiError);
    return () => window.removeEventListener('stisidore-api-error', onApiError);
  }, [dismiss]);

  // toast('Saved') or toast('Saving', { loading: true }) for the short spinner variant.
  const toast = useCallback((message, { loading = false } = {}) => {
    const id = ++counter.current;
    setToasts((list) => [...list, { id, message, loading }]);
    window.setTimeout(() => dismiss(id), loading ? 1400 : 2800);
    return id;
  }, [dismiss]);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-24 z-[70] flex flex-col items-center gap-2 md:bottom-8"
        role="status"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div key={t.id} className={`pointer-events-auto flex max-w-[90%] animate-pop items-center gap-2.5 rounded-[10px] px-4 py-[11px] text-white shadow-toast ${t.error ? 'bg-bad' : 'bg-wine-9'}`}>
            {t.loading ? <span className="spinner" aria-hidden="true" /> : t.error ? <X size={17} aria-hidden="true" /> : <Check size={17} aria-hidden="true" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx.toast;
};
