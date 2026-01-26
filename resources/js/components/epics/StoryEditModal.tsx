import { useForm } from "@inertiajs/react";
import { useEffect } from "react";
import route from "@/lib/route";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { Story } from "@/types/story";

type FormData = {
  code: string;
  title: string;
  description: string;
  priority: Story["priority"];
  status: Story["status"];
};

type Props = {
  story?: Story;
  onClose: () => void;
};

export default function StoryEditModal({ story, onClose }: Props) {
  
  const { data, setData, patch, processing, errors, reset } =
    useForm<FormData>({
      code: "",
      title: "",
      description: "",
      priority: "MEDIUM",
      status: "TODO",
    });

  
  useEffect(() => {
    if (story) {
      setData({
        code: story.code ?? "",
        title: story.title,
        description: story.description ?? "",
        priority: story.priority,
        status: story.status,
      });
    } else {
      reset();
    }
  }, [story]);

 
 

  function submit(e: React.FormEvent) {
    e.preventDefault();
     if (!story) return null;

    patch(route("stories.update", story.uuid), {
      onSuccess: onClose,
    });
  }

  return (
    <Modal open onClose={onClose} title="Edit Story">
      <form onSubmit={submit} className="space-y-4">
        <input
          className="w-full rounded-lg border px-3 py-2"
          placeholder="Code (optional)"
          value={data.code}
          onChange={(e) => setData("code", e.target.value)}
        />

        <div>
          <label className="text-sm font-medium text-gray-700">Title</label>
          <input
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={data.title}
            onChange={(e) => setData("title", e.target.value)}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">
            Description (optional)
          </label>
          <textarea
            rows={3}
            className="mt-1 w-full rounded-lg border px-3 py-2"
            value={data.description}
            onChange={(e) =>
              setData("description", e.target.value)
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={data.priority}
              onChange={(e) =>
                setData("priority", e.target.value as any)
              }
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2"
              value={data.status}
              onChange={(e) =>
                setData("status", e.target.value as any)
              }
            >
              <option value="TODO">TODO</option>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="DONE">DONE</option>
            </select>
          </div>
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
            {processing ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}