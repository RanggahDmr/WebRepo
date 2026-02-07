import { router } from "@inertiajs/react";
import route from "@/lib/route";
import { useAlert } from "@/components/alert/AlertProvider";
import { Eye, Trash2 } from "lucide-react";

type Props = {
  viewHref: string;
  destroyRouteName: string;
  destroyParam: Record<string, any>;

  canView?: boolean;
  canDelete?: boolean;

  confirmTitle?: string;
  confirmText?: string;
  onDeleted?: () => void;

  noPermissionText?: string;
};

export default function RowActions({
  viewHref,
  destroyRouteName,
  destroyParam,
  canView = true,
  canDelete = true,
  confirmTitle = "Hapus data?",
  confirmText = "Data yang sudah dihapus tidak bisa dikembalikan.",
  onDeleted,
  noPermissionText = "You don’t have permission for this action.",
}: Props) {
  const alert = useAlert();
  const showView = viewHref && viewHref !== "#";

  const baseBtn =
    "inline-flex items-center justify-center rounded-lg border p-2 shadow-sm transition active:scale-[0.98]";
  const enabled = "bg-white hover:bg-gray-50 cursor-pointer";
  const disabled =
    "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed shadow-none active:scale-100";

  const notifyNoPermission = () => {
    alert.toast({ type: "error", message: noPermissionText, duration: 2200 });
  };

  const onClickView = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!canView) {
      e.preventDefault();
      notifyNoPermission();
    }
  };

  const onClickDelete = () => {
    if (!canDelete) return notifyNoPermission();

    alert.confirm({
      title: confirmTitle,
      description: confirmText, //  kamu punya description, jadi ini aman
      confirmText: "Hapus",
      cancelText: "Batal",
      destructive: true,
      onConfirm: () => {
        router.delete(route(destroyRouteName, destroyParam), {
          preserveScroll: true,
          onSuccess: () => onDeleted?.(),
        });
      },
    });
  };

  return (
    <div className="flex items-center gap-2">
      {showView && (
        <a
          href={viewHref}
          onClick={onClickView}
          className={`${baseBtn} ${canView ? `${enabled} text-blue-600` : disabled}`}
          title={canView ? "View" : "No permission"}
          aria-disabled={!canView}
        >
          <Eye className="h-4 w-4" />
        </a>
      )}

      <button
        type="button"
        onClick={onClickDelete}
        className={`${baseBtn} ${canDelete ? `${enabled} text-red-600` : disabled}`}
        title={canDelete ? "Delete" : "No permission"}
        aria-disabled={!canDelete}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
