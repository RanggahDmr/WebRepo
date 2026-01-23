import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  task: {
    id: number;
    title: string;
    type: "FE" | "BE" | "QA";
    status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  };
  canDrag: boolean;
  onOpen?: (task: any) => void;
};

export default function TaskCard({ task, canDrag, onOpen }: Props) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: !canDrag,
    data: { type: "TASK", status: task.status }, // ⭐ penting
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        rounded border bg-white p-3 text-sm shadow-sm transition hover:shadow
        ${canDrag ? "" : "opacity-50"}
      `}
    >
      {/* DRAG HANDLE (only) */}
      {canDrag && (
        <div
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()} // klik handle ga buka sidebar
          className="mb-1 cursor-grab text-xs text-gray-400 select-none w-fit"
          style={{ touchAction: "none" }}
          title="Drag"
        >
          ⋮⋮
        </div>
      )}

      {/* CLICKABLE CONTENT */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onOpen?.(task);
        }}
        className="cursor-pointer"
      >
        <div className="font-medium">{task.title}</div>
      </div>
    </div>
  );
}
