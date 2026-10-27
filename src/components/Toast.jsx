import { useCallback, useEffect, useState } from "react";

const DURATION = 3000; // ms, anything between 2000 and 5000 works well

// Shows one toast at a time. A new toast instantly replaces the one on
// screen (and restarts the timer), so rapid actions never pile up.
export function useToasts() {
  const [toast, setToast] = useState(null);

  // type: "success" (green) | "danger" (red) | "info" (grey)
  const showToast = useCallback(
    (message, type = "success", duration = DURATION) => {
      setToast({ id: crypto.randomUUID(), message, type, duration });
    },
    []
  );

  const dismissToast = useCallback((id) => {
    setToast((prev) => (id && prev?.id !== id ? prev : null));
  }, []);

  // Each new toast starts its own timer; the cleanup cancels the old one
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => dismissToast(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  return {
    toasts: toast ? [toast] : [],
    showToast,
    dismissToast,
  };
}

const dotColor = {
  success: "bg-emerald-400",
  danger: "bg-rose-400",
  info: "bg-neutral-400",
};

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed right-3 top-3 z-50 flex flex-col items-end"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex max-w-[calc(100vw-1.5rem)] items-center gap-2.5 rounded-xl bg-neutral-800 px-3 py-2 text-sm sm:max-w-sm font-semibold text-white shadow-lg motion-safe:animate-[toast-in_0.2s_ease-out]"
        >
          <span className={`h-2 w-2 flex-none rounded-full ${dotColor[t.type] ?? dotColor.info}`} />
          <span className="wrap-anywhere">{t.message}</span>
          <button
            type="button"
            onClick={() => onDismiss(t.id)}
            aria-label="Dismiss"
            className="-mr-1 ml-1 grid h-5 w-5 flex-none place-items-center rounded-md text-neutral-400 hover:bg-white/10 hover:text-white"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}