import { router } from "@inertiajs/react";
import route from "@/lib/route";
import { DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";

type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

function isStatus(v: any): v is TaskStatus {
  return typeof v === "string" && (STATUSES as string[]).includes(v);
}

export function useTaskDnD(
  role: string,
  opts?: {
    optimisticUpdate?: (taskUuid: string, to: TaskStatus) => void;
    rollback?: () => void;
  }
) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  function canMoveTo(toStatus: TaskStatus) {
    if (role === "PROGRAMMER") return ["IN_PROGRESS", "IN_REVIEW"].includes(toStatus);
    if (["PM", "SAD"].includes(role)) return true;
    return false;
  }

  function getToStatus(event: DragEndEvent): TaskStatus | null {
    const { over } = event;
    if (!over) return null;

    if (isStatus(over.id)) return over.id;

    const containerId = over.data.current?.sortable?.containerId;
    if (isStatus(containerId)) return containerId;

    const status = over.data.current?.status;
    if (isStatus(status)) return status;

    return null;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event;

    if (Math.abs(delta.x) + Math.abs(delta.y) < 3) return;

    const taskUuid = String(active.id);
    const fromStatus = active.data.current?.sortable?.containerId;
    const toStatus = getToStatus(event);

    if (!isStatus(fromStatus) || !toStatus) return;
    if (fromStatus === toStatus) return;
    if (!canMoveTo(toStatus)) return;

    opts?.optimisticUpdate?.(taskUuid, toStatus);

    router.patch(
      route("tasks.update", { task: taskUuid }),
      { status: toStatus },
      {
        preserveScroll: true,
        preserveState: true,
        onError: () => opts?.rollback?.(),
      }
    );
  }

  return { sensors, handleDragEnd };
}
