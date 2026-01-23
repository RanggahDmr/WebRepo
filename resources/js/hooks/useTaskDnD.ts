import { router } from "@inertiajs/react";
import {
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
const STATUSES: TaskStatus[] = ["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"];

function isStatus(v: any): v is TaskStatus {
  return typeof v === "string" && (STATUSES as string[]).includes(v);
}

export function useTaskDnD(
  role: string,
  opts?: {
    optimisticUpdate?: (taskId: number, to: TaskStatus) => void;
    rollback?: () => void;
  }
) {
  // ✅ biar klik biasa ga dianggap drag
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

    // 1) drop langsung ke kolom (droppable kolom id = status)
    if (isStatus(over.id)) return over.id;

    // 2) drop ke atas task lain → ambil containerId dari sortable
    const containerId = over.data.current?.sortable?.containerId;
    if (isStatus(containerId)) return containerId;

    // 3) fallback dari data
    const status = over.data.current?.status;
    if (isStatus(status)) return status;

    return null;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event;

    // ✅ kalau cuma “klik” / movement kecil, jangan mutate
    if (Math.abs(delta.x) + Math.abs(delta.y) < 3) return;

    const taskId = Number(active.id);
    const fromStatus = active.data.current?.sortable?.containerId;
    const toStatus = getToStatus(event);

    if (!isStatus(fromStatus) || !toStatus) return;
    if (fromStatus === toStatus) return;
    if (!canMoveTo(toStatus)) return;

    opts?.optimisticUpdate?.(taskId, toStatus);

    router.patch(
      `/tasks/${taskId}`,
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
