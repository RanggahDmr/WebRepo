import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import EpicCardDnD from "./EpicCardDnD";

export default function EpicColumnDnD({
  status,
  epics,
  canDrag,
  onOpenEpic,
}: {
  status: string;
  epics: any[];
  canDrag: boolean;
  onOpenEpic: (e: any) => void;
}) {
  return (
    <SortableContext
      items={epics.map((e) => e.uuid)}
      strategy={verticalListSortingStrategy}
    >
      <div className="flex flex-col gap-3">
        {epics.map((e) => (
          <EpicCardDnD key={e.uuid} epic={e} canDrag={canDrag} onOpen={onOpenEpic} />
        ))}
      </div>
    </SortableContext>
  );
}
