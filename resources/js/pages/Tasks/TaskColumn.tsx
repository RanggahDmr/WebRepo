import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import TaskCard from "./TaskCard";

export default function TaskColumn({ status, tasks, canDrag, onOpenTask }: any) {
  const { setNodeRef } = useDroppable({
    id: status,
    data: { type: "COLUMN", status },
  });

  return (
    <div ref={setNodeRef} className="flex flex-col gap-2 min-h-[80px]">
      <SortableContext
        id={status}
        items={tasks.map((t: any) => t.id)}
        strategy={verticalListSortingStrategy}
      >
        {tasks.map((task: any) => (
          <TaskCard
            key={task.id}
            task={task}
            canDrag={canDrag}
            onOpen={onOpenTask}
          />
        ))}
      </SortableContext>
    </div>
  );
}
