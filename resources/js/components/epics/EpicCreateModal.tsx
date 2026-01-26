import { useForm } from "@inertiajs/react";
import route from "@/lib/route";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { EpicPriority, EpicStatus } from "@/types/epic";

type Props = {
  open: boolean;
  onClose: () => void;
  board: { uuid: string }; 
};

export default function EpicCreateModal({ open, onClose, board }: Props) {
  const { data, setData, post, processing, errors, reset } = useForm({
    title: "",
    code: "",
    
    description: "",
    priority: "MEDIUM" as EpicPriority,
    status: "TODO" as EpicStatus,
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();

    post(route("epics.store", { board: board.uuid }), {
      onSuccess: () => {
        reset();
        onClose();
      },
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Epic">
      <form onSubmit={submit} className="space-y-4">
        <input
          placeholder="Title"
          className="w-full rounded-lg border px-3 py-2"
          value={data.title}
          onChange={(e) => setData("title", e.target.value)}
        />
        {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}

      
       

        <input
          placeholder="Description"
          className="w-full rounded-lg border px-3 py-2"
          value={data.description}
          onChange={(e) => setData("description", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            className="rounded-lg border px-3 py-2"
            value={data.priority}
            onChange={(e) => setData("priority", e.target.value as any)}
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>

          <select
            className="rounded-lg border px-3 py-2"
            value={data.status}
            onChange={(e) => setData("status", e.target.value as any)}
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={processing}>
            {processing ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
