import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  task: {
    uuid: string;
    title: string;
    type?: "FE" | "BE" | "QA" | null;
    status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
    code?: string | null;
    priority?: "LOW" | "MEDIUM" | "HIGH";
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
    id: task.uuid, 
    disabled: !canDrag,
    data: { type: "TASK", status: task.status }, // tetap
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const code = task.code ?? `TSK-${task.uuid.slice(0, 8).toUpperCase()}`;

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
      <div
        onClick={(e) => {
          e.stopPropagation();
          onOpen?.(task);
        }}
        className="cursor-pointer"
      >
        <div className="text-[11px] text-gray-500">{code}</div>
        <div className="font-medium">{task.title}</div>
      </div>
    </div>
  );
}
