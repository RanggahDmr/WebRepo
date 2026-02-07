import { useForm, usePage } from "@inertiajs/react";
import route from "@/lib/route";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { pickDefaultId } from "@/lib/master";

type MasterItem = { id: number; name: string; key?: string; is_default?: boolean };

type Props = {
  open: boolean;
  onClose: () => void;
  board: { uuid: string };
};

export default function EpicCreateModal({ open, onClose, board }: Props) {
  const { epicPriorities = [], epicStatuses = [] }: any = usePage().props;

  const defaultPriorityId = pickDefaultId(epicPriorities);
  const defaultStatusId = pickDefaultId(epicStatuses, "backlog");

  const { data, setData, post, processing, errors, reset } = useForm<{
    title: string;
    description: string;
    priority_id: number | null;
    status_id: number | null;
  }>({
    title: "",
    description: "",
    priority_id: defaultPriorityId,
    status_id: defaultStatusId,
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

        <textarea
          placeholder="Description"
          className="w-full rounded-lg border px-3 py-2"
          rows={4}
          value={data.description}
          onChange={(e) => setData("description", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            className="h-10 rounded-lg border px-3 text-sm"
            value={data.priority_id ?? ""}
            onChange={(e) =>
              setData("priority_id", e.target.value ? Number(e.target.value) : null)
            }
            required
          >
            <option value="" disabled>
              Priority
            </option>
            {epicPriorities.map((p : any) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            className="h-10 rounded-lg border px-3 text-sm"
            value={data.status_id ?? ""}
            onChange={(e) =>
              setData("status_id", e.target.value ? Number(e.target.value) : null)
            }
            required
          >
            <option value="" disabled>
              Status
            </option>
            {epicStatuses.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={processing}>{processing ? "Saving..." : "Save"}</Button>
        </div>
      </form>
    </Modal>
  );
}
