import { Link, usePage } from "@inertiajs/react";
import route from "@/lib/route";
import formatDateTime from "@/lib/date";
import { Epic } from "@/types/epic";
import EpicInlineSelect from "./EpicInlineSelect";
import EpicInlineTitle from "./EpicInlineTitle";
import Badge from "@/components/ui/Badge";

export default function EpicTable({ epics }: { epics: Epic[] }) {
  const { auth }: any = usePage().props;
  const isPM = auth?.user?.role === "PM";

  if (!epics.length) {
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
            <th className="px-4 py-3 w-[20%]">Code</th>
            <th className="px-4 py w-[40%]">Work</th>
            <th className="px-4 py-3 w-[15%]">Priority</th>
            <th className="px-4 py-3 w-[15%]">Status</th>
            <th className="px-4 py-3 w-[20%]">Created</th>
            <th className="px-4 py-3 w-[20%] text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {epics
          .filter(e => e.code)
          .map((e) => (
            <tr
              key={e.id}
              className="border-b last:border-0 hover:bg-gray-50 transition"
            ><td className="px-4 py-3 font-medium text-blue-600">
              <Link
                href={route("epics.show", { epic: e.code })}
                className="hover:underline"
              >
                {e.code}
              </Link>
            </td>
            
              <td className="px-4 py-3 font-medium text-gray-900">
                {isPM ? (
                  <EpicInlineTitle
                    epicCode={e.code}
                    value={e.create_work}
                  />
                ) : (
                  e.create_work
                )}
              </td>

              {/* PRIORITY (INLINE SELECT) */}
              <td className="px-4 py-3">
                {isPM ? (
                  <EpicInlineSelect
                    epicCode={e.code}
                    field="priority"
                    value={e.priority}
                    options={[
                      { label: "LOW", value: "LOW" },
                      { label: "MEDIUM", value: "MEDIUM" },
                      { label: "HIGH", value: "HIGH" },
                    ]}
                  />
                ) : (
                  <Badge variant={e.priority}>{e.priority}</Badge>
                )}
              </td>

              {/* STATUS (INLINE SELECT) */}
              <td className="px-4 py-3">
                {isPM ? (
                  <EpicInlineSelect
                    epicCode={e.code}
                    field="status"
                    value={e.status}
                    options={[
                      { label: "TODO", value: "TODO" },
                      { label: "IN_PROGRESS", value: "IN_PROGRESS" },
                      { label: "DONE", value: "DONE" },
                    ]}
                  />
                ) : (
                  <Badge variant={e.status}>{e.status}</Badge>
                )}
              </td>

              {/* CREATED */}
              <td className="px-4 py-3 text-gray-700">
                {formatDateTime(e.created_at)}
              </td>

              {/* ACTION */}
              <td className="px-4 py-3 text-right space-x-3">
                <Link
                  href={route("epics.show",{epic: e.code })}
                  className="font-medium text-black hover:underline"
                >
                  View
                </Link>

                {isPM && (
                  <span className="text-sm text-gray-400">
                    Inline Edit
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
