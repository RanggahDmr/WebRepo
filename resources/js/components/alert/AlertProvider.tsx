import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AlertOptions = {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm?: () => void | Promise<void>;
};

type ToastType = "info" | "success" | "error";

type ToastOptions = {
  message: string;
  type?: ToastType;
  duration?: number; // ms
};

type ToastItem = ToastOptions & {
  id: string;
  visible: boolean; // ✅ untuk animasi keluar
};

type AlertContextValue = {
  alert: (opts: AlertOptions) => void;
  confirm: (opts: AlertOptions) => void;
  close: () => void;

  toast: (opts: ToastOptions) => void;
};

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<AlertOptions | null>(null);
  const [busy, setBusy] = useState(false);

  // ✅ Toast state
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastTimers = useRef<Record<string, number>>({});
  const toastExitTimers = useRef<Record<string, number>>({});

  const removeToastNow = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));

    if (toastTimers.current[id]) window.clearTimeout(toastTimers.current[id]);
    if (toastExitTimers.current[id]) window.clearTimeout(toastExitTimers.current[id]);
    delete toastTimers.current[id];
    delete toastExitTimers.current[id];
  }, []);

  const dismissToast = useCallback(
    (id: string) => {
      // trigger exit animation
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, visible: false } : t))
      );

      // after animation, remove
      toastExitTimers.current[id] = window.setTimeout(() => {
        removeToastNow(id);
      }, 220); // harus sinkron dengan duration animasi
    },
    [removeToastNow]
  );

  const toast = useCallback(
    ({ message, type = "info", duration = 2400 }: ToastOptions) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const item: ToastItem = { id, message, type, duration, visible: true };

      setToasts((prev) => [item, ...prev].slice(0, 3));

      toastTimers.current[id] = window.setTimeout(() => {
        dismissToast(id);
      }, duration);
    },
    [dismissToast]
  );

  // ===== existing alert/confirm =====
  const close = useCallback(() => {
    if (busy) return;
    setOpen(false);
    setTimeout(() => setOpts(null), 150);
  }, [busy]);

  const show = useCallback((next: AlertOptions) => {
    setOpts({
      confirmText: "OK",
      ...next,
    });
    setOpen(true);
  }, []);

  const alert = useCallback(
    (next: AlertOptions) => {
      show({ ...next, cancelText: undefined });
    },
    [show]
  );

  const confirm = useCallback(
    (next: AlertOptions) => {
      show({ cancelText: "Cancel", ...next });
    },
    [show]
  );

  const onConfirm = useCallback(async () => {
    if (!opts?.onConfirm) return close();
    try {
      setBusy(true);
      await opts.onConfirm();
      close();
    } finally {
      setBusy(false);
    }
  }, [opts, close]);

  const value = useMemo(
    () => ({ alert, confirm, close, toast }),
    [alert, confirm, close, toast]
  );

  return (
    <AlertContext.Provider value={value}>
      {children}

      {/* ✅ Toast container (smooth) */}
      <div className="fixed right-4 top-4 z-[9999] flex w-[340px] flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "relative overflow-hidden rounded-xl border bg-white shadow-md",
              "transition-all duration-200 ease-out",
              t.visible
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-2",
              t.type === "success" ? "border-green-200" : "",
              t.type === "error" ? "border-red-200" : "",
              t.type === "info" ? "border-gray-200" : "",
            ].join(" ")}
          >
            {/* progress bar */}
            <div
              className="h-1 w-full bg-gray-100"
              aria-hidden="true"
            >
              <div
                className="h-full bg-gray-300"
                style={{
                  width: "100%",
                  animation: `toastProgress ${t.duration ?? 2400}ms linear forwards`,
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => dismissToast(t.id)}
              className="w-full px-4 py-3 text-left"
              aria-label="Dismiss notification"
              title="Click to dismiss"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">
                    {t.type === "success"
                      ? "Success"
                      : t.type === "error"
                      ? "Error"
                      : "Info"}
                  </div>
                  <div className="mt-0.5 text-sm text-gray-600">{t.message}</div>
                </div>

                <div className="text-gray-400 text-sm leading-none">×</div>
              </div>
            </button>
          </div>
        ))}

        {/* keyframes inline (Tailwind-friendly) */}
        <style>{`
          @keyframes toastProgress {
            from { transform: scaleX(1); transform-origin: left; }
            to   { transform: scaleX(0); transform-origin: left; }
          }
        `}</style>
      </div>

      {/* Existing AlertDialog */}
      <AlertDialog open={open} onOpenChange={(v) => !busy && setOpen(v)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{opts?.title}</AlertDialogTitle>
            {opts?.description ? (
              <AlertDialogDescription>{opts.description}</AlertDialogDescription>
            ) : null}
          </AlertDialogHeader>

          <AlertDialogFooter>
            {opts?.cancelText ? (
              <AlertDialogCancel disabled={busy} onClick={close}>
                {opts.cancelText}
              </AlertDialogCancel>
            ) : null}

            <AlertDialogAction disabled={busy} onClick={onConfirm}>
              {opts?.confirmText ?? "OK"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error("useAlert must be used within <AlertProvider />");
  return ctx;
}
