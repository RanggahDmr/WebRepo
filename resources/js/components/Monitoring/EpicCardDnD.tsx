import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import Badge from "@/components/ui/Badge";

export default function EpicCardDnD({
  epic,
  canDrag,
  onOpen,
}: {
  epic: any;
  canDrag: boolean;
  onOpen: (e: any) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id: epic.uuid,
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
      onClick={() => onOpen(epic)}
      className={[
        "w-full text-left rounded-lg border bg-white p-3 shadow-sm hover:bg-gray-50",
        isDragging ? "opacity-70" : "",
      ].join(" ")}
      {...attributes}
      {...listeners}
    >
      <div className="text-xs font-medium text-gray-500">{epic.code}</div>
      <div className="mt-1 text-sm font-semibold text-gray-900 break-words">
        {epic.title}
      </div>

      <div className="mt-2 flex gap-2 flex-wrap">
        <Badge variant={epic.priority}>{epic.priority}</Badge>
        <Badge variant={epic.status}>{epic.status}</Badge>
      </div>
    </button>
  );
}
