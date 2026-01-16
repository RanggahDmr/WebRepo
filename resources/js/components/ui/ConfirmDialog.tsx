import Modal from "./Modal";
import Button from "./Button";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onConfirm: () => void;
  loading?: boolean;
};

export default function ConfirmDialog({
  open,
  onClose,
  title = "Are you sure?",
  description,
  onConfirm,
  loading,
}: Props) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}

      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm} disabled={loading}>
          {loading ? "Processing..." : "Confirm"}
        </Button>
      </div>
    </Modal>
  );
}
