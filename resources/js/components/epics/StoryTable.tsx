import { Link, usePage } from "@inertiajs/react";
import route from "@/lib/route";
import formatDateTime from "@/lib/date";
import { Story } from "@/types/story";
import StoryInlineSelect from "./StoryInlineSelect";
import StoryInlineTitle from "./StoryInlineTitle";
import Badge from "@/components/ui/Badge";
import { useRole } from "@/lib/useRole";
import { useState } from "react";
import StoryDetailModal from "./StoryDetailModal";



export default function StoryTable({ stories }: { stories: Story[] }) {
  const { auth }: any = usePage().props;
  const { canCreateStory } = useRole();
  const [open, setOpen] = useState(false)
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);


  if (!stories.length) {
    return (
      <div className="py-10 text-center text-sm text-gray-500">
        No results.
      </div>
    );
  }

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
          {stories.map((s) => (
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
                {canCreateStory ? (
                  <StoryInlineTitle
                    storyUuid={s.uuid}
                    value={s.title}
                  />
                ) : (
                  s.title
                )}

                {/* {s.description ? (
                  <div className="mt-1 text-xs text-gray-500 line-clamp-1">
                    {s.description}
                  </div>
                ) : (
                  <div className="mt-1 text-xs text-gray-400">
                    No description
                  </div>
                )} */}
              </td>

              {/* PRIORITY */}
              <td className="px-4 py-3">
                {canCreateStory ? (
                  <StoryInlineSelect
                    storyUuid={s.uuid}
                    field="priority"
                    value={s.priority}
                    options={[
                      { label: "LOW", value: "LOW" },
                      { label: "MEDIUM", value: "MEDIUM" },
                      { label: "HIGH", value: "HIGH" },
                    ]}
                  />
                ) : (
                  <Badge variant={s.priority}>{s.priority}</Badge>
                )}
              </td>

              {/* STATUS */}
              <td className="px-4 py-3">
                {canCreateStory ? (
                  <StoryInlineSelect
                    storyUuid={s.uuid}
                    field="status"
                    value={s.status}
                    options={[
                      { label: "TODO", value: "TODO" },
                      { label: "IN_PROGRESS", value: "IN_PROGRESS" },
                      { label: "IN_REVIEW", value: "IN_REVIEW" },
                      { label: "DONE", value: "DONE" },
                    ]}
                  />
                ) : (
                  <Badge variant={s.status}>{s.status}</Badge>
                )}
              </td>

              {/* UPDATED */}
              <td className="px-4 py-3 text-gray-700">
                {s.updated_at ? formatDateTime(s.updated_at) : "-"}
              </td>

             {/* CREATED */}
              <td className="px-4 py-3 text-gray-700">
                {formatDateTime(s.created_at)}
              </td>

              {/* CREATED BY */}
              <td className="px-4 py-3 text-gray-700">
                {s.creator?.name ?? "-"}
              </td>

              {/* ACTION */}
              <td className="px-4 py-3 text-right">
                <div className="inline-flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      window.location.href = route("tasks.index", { story: s.uuid })
                    }
                    className="rounded-md border px-3 py-1.5 text-sm font-medium text-white bg-black hover:bg-gray-800 " 
                  >
                    View
                  </button>

                  {/* delete nanti di sini */}
                </div>
              </td>
            </tr>
          ))}
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
