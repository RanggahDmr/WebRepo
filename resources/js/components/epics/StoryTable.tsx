import { Link, usePage } from "@inertiajs/react";
import route from "@/lib/route";
import formatDateTime from "@/lib/date";
import { Story } from "@/types/story";
import StoryInlineSelect from "./StoryInlineSelect";
import StoryInlineTitle from "./StoryInlineTitle";
import Badge from "@/components/ui/Badge";

export default function StoryTable({ stories }: { stories: Story[] }) {
  const { auth }: any = usePage().props;
  const isPM = auth?.user?.role === "PM";

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
            <th className="px-4 py-3 w-[10%] text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {stories.map((s) => (
            <tr
              key={s.id}
              className="border-b last:border-0 hover:bg-gray-50 transition align-top"
            >
              {/* ID / CODE */}
              <td className="px-4 py-3 font-mono text-xs text-gray-500">
                {s.code}
              </td>

              {/* TITLE */}
              <td className="px-4 py-3 font-medium text-gray-900">
                {isPM ? (
                  <StoryInlineTitle
                    storyCode={s.code}
                    value={s.title}
                  />
                ) : (
                  s.title
                )}

                {s.description ? (
                  <div className="mt-1 text-xs text-gray-500 line-clamp-1">
                    {s.description}
                  </div>
                ) : (
                  <div className="mt-1 text-xs text-gray-400">
                    No description
                  </div>
                )}
              </td>

              {/* PRIORITY */}
              <td className="px-4 py-3">
                {isPM ? (
                  <StoryInlineSelect
                    storyCode={s.code}
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
                {isPM ? (
                  <StoryInlineSelect
                    storyCode={s.code}
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

              {/* ACTION */}
              <td className="px-4 py-3 text-right">
                <Link
                  href={route("tasks.index", { story: s.code })}
                  className="font-medium text-black hover:underline"
                >
                  View
                </Link>
                
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
