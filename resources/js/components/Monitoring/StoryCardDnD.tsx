import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Badge from "@/components/ui/Badge";

export default function StoryCardDnD({
  story,
  canDrag,
  onOpen,
}: {
  story: any;
  canDrag: boolean;
  onOpen: (s: any) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: story.uuid,
      disabled: !canDrag,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      onClick={() => onOpen(story)}
      className={[
        "w-full text-left rounded-lg border bg-white p-3 shadow-sm hover:bg-gray-50",
        isDragging ? "opacity-70" : "",
      ].join(" ")}
      {...attributes}
      {...listeners}
    >
      <div className="text-xs font-medium text-gray-500">{story.code}</div>
      <div className="mt-1 text-sm font-semibold text-gray-900 break-words">
        {story.title}
      </div>

      <div className="mt-2 flex gap-2 flex-wrap">
        <Badge variant={story.priority}>{story.priority}</Badge>
        <Badge variant={story.status}>{story.status}</Badge>
      </div>
    </button>
  );
}
