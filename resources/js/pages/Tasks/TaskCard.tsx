import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  task: {
    id: number;
    title: string;
    type: "FE" | "BE" | "QA";
  };
  canDrag: boolean;
  onOpen?: (task: any) => void;
};

export default function TaskCard({ task, canDrag, onOpen }: Props) {
  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
  } = useSortable({
    id: task.id,
    disabled: !canDrag,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`
        rounded border bg-white p-3 text-sm shadow-sm
        transition
        hover:shadow
        ${canDrag ? "" : "opacity-50"}
      `}
    >
      {/* DRAG HANDLE */}
      {canDrag && (
        <div
          {...listeners}
          className="mb-1 cursor-grab text-xs text-gray-400 select-none"
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
        <div className="font-medium">
          [{task.type}] {task.title}
        </div>
      </div>
    </div>
  );
}
