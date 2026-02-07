import { useForm } from "@inertiajs/react";
import { useEffect } from "react";
import route from "@/lib/route";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Epic } from "@/types/epic";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


type FormData = {
  code: string;
  title: string;
  description?: string;
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
    title: "",
    description: "",
    priority: "MEDIUM",
    status: "TODO",
  });

  useEffect(() => {
    if (epic) {
      setData({
        code: epic.code ?? "",
        title: epic.title ?? "",
        description: epic.description ?? "",
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

  put(route("epics.update", epic.uuid), {
    onSuccess: onClose,
  });
}


  return (
    <Modal open onClose={onClose} title="Edit Epic">
      <form onSubmit={submit} className="space-y-4">
        {errors.code && <p className="text-sm text-red-600">{errors.code}</p>}
        {errors.title && <p className="text-sm text-red-600">{errors.title}</p>}

        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Code"
          value={data.code}
          onChange={(e) => setData("code", e.target.value)}
        />

        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Title"
          value={data.title}
          onChange={(e) => setData("title", e.target.value)}
        />

        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Description"
          value={data.description ?? ""}
          onChange={(e) => setData("description", e.target.value)}
        />

        <div className="grid grid-cols-2 gap-4">
  <Select
    value={data.priority}
    onValueChange={(v) => setData("priority", v as Epic["priority"])}
  >
    <SelectTrigger className="h-10 rounded-lg">
      <SelectValue placeholder="Priority" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="LOW">LOW</SelectItem>
      <SelectItem value="MEDIUM">MEDIUM</SelectItem>
      <SelectItem value="HIGH">HIGH</SelectItem>
    </SelectContent>
  </Select>

  <Select
    value={data.status}
    onValueChange={(v) => setData("status", v as Epic["status"])}
  >
    <SelectTrigger className="h-10 rounded-lg">
      <SelectValue placeholder="Status" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="TODO">TODO</SelectItem>
      <SelectItem value="IN_PROGRESS">IN_PROGRESS</SelectItem>
      <SelectItem value="DONE">DONE</SelectItem>
    </SelectContent>
  </Select>
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
