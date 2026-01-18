import { DragEndEvent } from "@dnd-kit/core";

export function useTaskDnD(
  tasks: any[],
  onMove: (taskId: number, status: string, position: number) => void
) {
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = Number(active.id);
    const toStatus = over.data.current?.status;

    if (!toStatus) return;

    const sameStatusTasks = tasks.filter(
      (t) => t.status === toStatus && t.id !== taskId
    );

    onMove(taskId, toStatus, sameStatusTasks.length);
  }

  return { handleDragEnd };
}
