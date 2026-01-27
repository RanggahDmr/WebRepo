import { router } from "@inertiajs/react";
import route from "@/lib/route";
import { DragEndEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";

type Opts = {
  routeName: string; // ex: "epics.update" | "stories.update" | "tasks.update"
  canDrag: boolean;
  optimisticUpdate: (uuid: string, toStatus: string) => void;
  rollback: () => void;
};

export function useStatusDnD(opts: Opts) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    if (!opts.canDrag) return;

    const activeId = String(event.active.id ?? "");
    const overId = event.over?.id ? String(event.over.id) : "";

    if (!activeId || !overId) return;
    if (activeId === overId) return;

    const taskUuid = activeId;
    const toStatus = overId; // kolom id = status

    opts.optimisticUpdate(taskUuid, toStatus);

    router.patch(
      route(opts.routeName, { [opts.routeName.startsWith("epics.") ? "epic" : opts.routeName.startsWith("stories.") ? "story" : "task"]: taskUuid }),
      { status: toStatus },
      {
        preserveScroll: true,
        onError: () => opts.rollback(),
      }
    );
  };

  return { sensors, handleDragEnd };
}
