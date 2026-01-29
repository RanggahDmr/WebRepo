import { router } from "@inertiajs/react";
import route from "@/lib/route";
import { useAlert } from "@/components/alert/AlertProvider";
import { Eye, Trash2 } from "lucide-react";

type Props = {
  viewHref: string;
  destroyRouteName: string;
  destroyParam: Record<string, any>;
  confirmTitle?: string;
  confirmText?: string;
  onDeleted?: () => void;
};
function TrashIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M3 6h18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M8 6V4h8v2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M6 6l1 16h10l1-16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M10 11v6M14 11v6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}


export default function RowActions({
  viewHref,
  destroyRouteName,
  destroyParam,
  confirmTitle = "Hapus data?",
  confirmText = "Data yang sudah dihapus tidak bisa dikembalikan.",
  onDeleted,
}: Props) {
  const alert = useAlert();
  const showView = viewHref && viewHref !== "#";

  const onDelete = () => {
    alert.confirm?.({
      title: confirmTitle,
      // message: confirmText, // aktifkan kalau helper confirm kamu support
      confirmText: "Hapus",
      cancelText: "Batal",
      onConfirm: () => {
        router.delete(route(destroyRouteName, destroyParam), {
          preserveScroll: true,
          onSuccess: () => onDeleted?.(),
        });
      },
    });
  };

  const baseBtn =
    "inline-flex items-center justify-center rounded-lg border bg-white p-2 shadow-sm " +
    "hover:bg-gray-50 active:scale-[0.98] transition";

  return (
    <div className="flex items-center gap-2">
      {showView && (
        <a
          href={viewHref}
          className={`${baseBtn} text-blue-600`}
          title="View"
          aria-label="View"
        >
          <Eye className="h-4 w-4" />
        </a>
      )}

      <button
        type="button"
        onClick={onDelete}
        className={`${baseBtn} text-red-600`}
        title="Delete"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
