import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

type ToastVariant = "default" | "success" | "error" | "warning" | "info";

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  toast: (props: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<{ toasts: Toast[]; toast: (props: Omit<Toast, "id">) => string; dismiss: (id: string) => void } | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = useCallback(({ title, description, variant = "default", duration = 5000 }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts(prev => [...prev, { id, title, description, variant, duration }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

const variantStyles: Record<string, string> = {
  default: "bg-obsidian-card border-white/10",
  success: "bg-emerald-900/30 border-emerald-800/50",
  error: "bg-rose-900/30 border-rose-800/50",
  warning: "bg-amber-900/30 border-amber-800/50",
  info: "bg-sky-900/30 border-sky-800/50",
};

const variantIcons: Record<string, React.ReactNode> = {
  default: <Info className="w-5 h-5 text-sky-400" />,
  success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
  error: <AlertCircle className="w-5 h-5 text-rose-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
  info: <Info className="w-5 h-5 text-sky-400" />,
};

function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const [progress, setProgress] = React.useState(100);

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const interval = setInterval(() => {
        setProgress(p => Math.max(0, p - (100 / (toast.duration! / 50))));
      }, 50);
      return () => clearInterval(interval);
    }
  }, [toast.duration]);

  return (
    <div
      className={`pointer-events-auto glass-card p-4 min-w-[300px] max-w-md animate-slide-in ${variantStyles[toast.variant]}`}
      style={{ "--progress": `${progress}%` }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">{variantIcons[toast.variant]}</div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-100">{toast.title}</p>
          {toast.description && (
            <p className="text-sm text-slate-400 mt-1">{toast.description}</p>
          )}
        </div>
        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 text-slate-400 hover:text-white transition-col
ors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      {toast.duration && toast.duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-white/10 rounded-b-lg overflow-hidden mt-4">
          <div
            className="h-full bg-white/20 transition-all duration-50 ease-linear origin-left"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
