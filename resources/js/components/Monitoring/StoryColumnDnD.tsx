import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import StoryCardDnD from "./StoryCardDnD";

export default function StoryColumnDnD({
  status,
  stories,
  canDrag,
  onOpenStory,
}: {
  status: string;
  stories: any[];
  canDrag: boolean;
  onOpenStory: (s: any) => void;
}) {
  return (
    <SortableContext
      items={stories.map((s) => s.uuid)}
      strategy={verticalListSortingStrategy}
    >
      <div className="flex flex-col gap-3">
        {stories.map((s) => (
          <StoryCardDnD key={s.uuid} story={s} canDrag={canDrag} onOpen={onOpenStory} />
        ))}
      </div>
    </SortableContext>
  );
}
