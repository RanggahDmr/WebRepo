import { ReactNode } from "react";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onClose,
  danger = false,
}: {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  danger?: boolean;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* backdrop */}
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/30"
        aria-label="Close modal"
      />

      {/* modal */}
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-8 shadow-xl">
        <div className="text-xl font-semibold text-gray-900">{title}</div>

        {description ? (
          <div className="mt-2 text-sm text-gray-500">{description}</div>
        ) : null}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-5 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={[
              "rounded-lg px-5 py-2 text-sm font-medium text-white",
              danger ? "bg-red-600 hover:bg-red-700" : "bg-black hover:bg-gray-900",
            ].join(" ")}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
