import { router } from "@inertiajs/react";
import { DragEndEvent } from "@dnd-kit/core";

export function useTaskDnD(role: string) {
  function canMoveTo(toStatus: string) {
    if (role === "PROGRAMMER") {
      return ["IN_PROGRESS", "IN_REVIEW"].includes(toStatus);
    }
    if (["PM", "SAD"].includes(role)) return true;
    return false;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = Number(active.id);
    const toStatus = over.id as string;

    if (!canMoveTo(toStatus)) return;

    router.patch(`/tasks/${taskId}`, {
      status: toStatus,
      position: 0,
    });
  }

  return { handleDragEnd };
}
