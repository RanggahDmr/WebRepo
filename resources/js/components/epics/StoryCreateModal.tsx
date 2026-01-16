import { useForm } from "@inertiajs/react";
import route from "@/lib/route";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function StoryCreateModal({
  epicCode,
  open,
  onClose,
}: {
  epicCode: string;
  open: boolean;
  onClose: () => void;
}) {
  const { data, setData, post, processing } = useForm({
    code: "",
    title: "",
    description: "",
    priority: "MEDIUM",
    status: "TODO",
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    post(route("stories.store", epicCode), {
      onSuccess: onClose,
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="Create Story">
      <form onSubmit={submit} className="space-y-4">
        <input
          placeholder="Title"
          className="w-full rounded-lg border px-3 py-2"
          value={data.title}
          onChange={(e) => setData("title", e.target.value)}
        />

        <textarea
          placeholder="Description"
          className="w-full rounded-lg border px-3 py-2"
          value={data.description}
          onChange={(e) => setData("description", e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button disabled={processing}>Save</Button>
        </div>
      </form>
    </Modal>
  );
}
