import { useForm } from "@inertiajs/react";
import { useEffect } from "react";
import route from "@/lib/route";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Epic } from "@/types/epic";

type FormData = {
  code: string;
  create_work: string;
  priority: Epic["priority"];
  status: Epic["status"];
};

type Props = {
  epic?: Epic;
  onClose: () => void;
};

export default function EpicEditModal({ epic, onClose }: Props) {
  const { data, setData, put, processing, errors, reset } = useForm<FormData>({
    code: "",
    create_work: "",
    priority: "MEDIUM",
    status: "TODO",
  });

 
  useEffect(() => {
    if (epic) {
      setData({
        code: epic.code ?? "",
        create_work: epic.create_work,
        priority: epic.priority,
        status: epic.status,
      });
    } else {
      reset();
    }
  }, [epic]);

  if (!epic) return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!epic) return;
    put(route("epics.update", epic.id), {
      onSuccess: onClose,
    });
  }

  return (
    <Modal open onClose={onClose} title="Edit Epic">
      <form onSubmit={submit} className="space-y-4">
        <input
          className="w-full rounded-lg border px-3 py-2"
          value={data.code}
          onChange={(e) => setData("code", e.target.value)}
        />

        <input
          className="w-full rounded-lg border px-3 py-2"
          value={data.create_work}
          onChange={(e) => setData("create_work", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
          <select
            value={data.priority}
            onChange={(e) =>
              setData("priority", e.target.value as Epic["priority"])
            }
          >
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
          </select>

          <select
            value={data.status}
            onChange={(e) =>
              setData("status", e.target.value as Epic["status"])
            }
          >
            <option value="TODO">TODO</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="DONE">DONE</option>
          </select>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button disabled={processing}>
            Save
          </Button>
        </div>
      </form>
    </Modal>
  );
}
