import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
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
  cancelText?: string; // kalau diisi => mode confirm (punya Cancel)
  destructive?: boolean;
  onConfirm?: () => void | Promise<void>;
};

type AlertContextValue = {
  alert: (opts: AlertOptions) => void;
  confirm: (opts: AlertOptions) => void;
  close: () => void;
};

const AlertContext = createContext<AlertContextValue | null>(null);

export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<AlertOptions | null>(null);
  const [busy, setBusy] = useState(false);

  const close = useCallback(() => {
    if (busy) return;
    setOpen(false);
    // biar animasi close kelar
    setTimeout(() => setOpts(null), 150);
  }, [busy]);

  const show = useCallback((next: AlertOptions) => {
    setOpts({
      confirmText: "OK",
      ...next,
    });
    setOpen(true);
  }, []);

  const alert = useCallback((next: AlertOptions) => {
    show({ ...next, cancelText: undefined }); // mode info: no cancel
  }, [show]);

  const confirm = useCallback((next: AlertOptions) => {
    show({ cancelText: "Cancel", ...next }); // mode confirm
  }, [show]);

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

  const value = useMemo(() => ({ alert, confirm, close }), [alert, confirm, close]);

  return (
    <AlertContext.Provider value={value}>
      {children}

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
