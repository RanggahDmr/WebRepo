import { usePage } from "@inertiajs/react";
import route from "@/lib/route";
import formatDateTime from "@/lib/date";
import { Story } from "@/types/story";
import StoryInlineSelect from "./StoryInlineSelect";
import StoryInlineTitle from "./StoryInlineTitle";
import Badge from "@/components/ui/Badge";
import { useMemo, useState } from "react";
import StoryDetailModal from "./StoryDetailModal";
import { can } from "@/lib/can";
import RowActions from "../RowActions";

export default function StoryTable({ stories }: { stories: Story[] }) {
  const { auth, storyStatuses = [], storyPriorities = [] }: any = usePage().props;

  const canUpdateStory = can(auth, "update_story");
  const canDeleteStory = can(auth, "delete_story") || canUpdateStory;

  const [open, setOpen] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  

  if (!stories.length) {
    return <div className="py-10 text-center text-sm text-gray-500">No results.</div>;
  }

 const priorityOptions = useMemo(
  () =>
    (storyPriorities ?? []).map((p: any) => ({
      label: p.name,
      value: p.id,
      color: p.color,
    })),
  [storyPriorities]
);

const statusOptions = useMemo(
  () =>
    (storyStatuses ?? []).map((s: any) => ({
      label: s.name,
      value: s.id,
      color: s.color,
    })),
  [storyStatuses]
);



  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm table-fixed">
        <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3 w-[10%]">ID</th>
            <th className="px-4 py-3 w-[35%]">Title</th>
            <th className="px-4 py-3 w-[15%]">Priority</th>
            <th className="px-4 py-3 w-[15%]">Status</th>
            <th className="px-4 py-3 w-[15%]">Updated</th>
            <th className="px-4 py-3 w-[15%]">Created</th>
            <th className="px-4 py-3 w-[15%]">CreatedBy</th>
            <th className="px-4 py-3 w-[10%] text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {stories.map((s: any) => {
            const priorityLabel = s.priorityMaster?.name ?? s.priority ?? "-";
            const statusLabel = s.statusMaster?.name ?? s.status ?? "-";

            const priorityValue = s.priority_id ?? s.priorityMaster?.id ?? null;
            const statusValue = s.status_id ?? s.statusMaster?.id ?? null;
            
            return (
              <tr
                key={s.uuid}
                className="border-b last:border-0 hover:bg-gray-50 transition align-top"
              >
                {/* ID / CODE */}
                <td className="px-4 py-3 font-medium text-blue-600">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStory(s);
                      setOpen(true);
                    }}
                    className="hover:underline"
                  >
                    {s.code}
                  </button>
                </td>

                {/* TITLE */}
                <td className="px-4 py-3 font-medium text-gray-900">
                  {canUpdateStory ? (
                    <StoryInlineTitle storyUuid={s.uuid} value={s.title} />
                  ) : (
                    s.title
                  )}
                </td>

                {/* PRIORITY */}
                <td className="px-4 py-3">
                  {canUpdateStory ? (
                    <StoryInlineSelect
                     storyUuid={s.uuid}
                      field="priority_id"
                      value={s.priority_id ?? s.priorityMaster?.id ?? null}
                      options={priorityOptions}
                      displayLabel={s.priorityMaster?.name ?? s.priority ?? "-"}
                    />
                  ) : (
                    <Badge variant={priorityLabel as any} color={shown}>{priorityLabel}</Badge>
                  )}
                </td>

                {/* STATUS */}
                <td className="px-4 py-3">
                  {canUpdateStory ? (
                    <StoryInlineSelect
                     storyUuid={s.uuid}
                      field="status_id"
                      value={s.status_id ?? s.statusMaster?.id ?? null}
                      options={statusOptions}
                      displayLabel={s.statusMaster?.name ?? s.status ?? "-"}
                    />
                  ) : (
                    <Badge variant={statusLabel as any}>{statusLabel}</Badge>
                  )}
                </td>

                {/* UPDATED */}
                <td className="px-4 py-3 text-gray-700">
                  {s.updated_at ? formatDateTime(s.updated_at) : "-"}
                </td>

                {/* CREATED */}
                <td className="px-4 py-3 text-gray-700">{formatDateTime(s.created_at)}</td>

                {/* CREATED BY */}
                <td className="px-4 py-3 text-gray-700">{s.creator?.name ?? "-"}</td>

                {/* ACTION */}
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end">
                    <RowActions
                      viewHref={route("tasks.index", { story: s.uuid })}
                      destroyRouteName="stories.destroy"
                      destroyParam={{ story: s.uuid }}
                      canView={true}
                      confirmTitle="Delete story?"
                      confirmText={`Story "${s.title}" will be deleted permanent.`}
                      canDelete={canDeleteStory}
                      noPermissionText="You don't have permission for this"
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <StoryDetailModal
        open={open}
        story={selectedStory}
        onClose={() => {
          setOpen(false);
          setSelectedStory(null);
        }}
      />
    </div>
  );
}
