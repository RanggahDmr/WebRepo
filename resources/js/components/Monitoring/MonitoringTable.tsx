import Badge from "@/components/ui/Badge";
import formatDateTime from "@/lib/date";

type BaseProps = {
  // selection highlight (optional)
  selectedUuid?: string | null;
};

type TaskProps = BaseProps & {
  tasks: any[];
  onSelectTask?: (task: any) => void;
  stories?: never;
  epics?: never;
  onSelectStory?: never;
  onSelectEpic?: never;
};

type StoryProps = BaseProps & {
  stories: any[];
  onSelectStory?: (story: any) => void;
  tasks?: never;
  epics?: never;
  onSelectTask?: never;
  onSelectEpic?: never;
};

type EpicProps = BaseProps & {
  epics: any[];
  onSelectEpic?: (epic: any) => void;
  tasks?: never;
  stories?: never;
  onSelectTask?: never;
  onSelectStory?: never;
};

type Props = TaskProps | StoryProps | EpicProps;

function shortUuid(u?: string) {
  if (!u) return "-";
  return u.slice(0, 8).toUpperCase();
}

function masterLabel(item: any, kind: "status" | "priority") {
  if (kind === "status") return item?.statusMaster?.name ?? item?.status ?? "-";
  return item?.priorityMaster?.name ?? item?.priority ?? "-";
}

// NOTE: Badge variant kamu masih legacy-based.
// Biar aman, kita tetap pakai variant legacy kalau ada, fallback ke master key.
function badgeVariant(item: any, kind: "status" | "priority") {
  if (kind === "status") return item?.status ?? item?.statusMaster?.key;
  return item?.priority ?? item?.priorityMaster?.key;
}

export default function MonitoringTable(props: Props) {
  const selectedUuid = props.selectedUuid ?? null;

const mode: "tasks" | "stories" | "epics" =
  "tasks" in props ? "tasks" : "stories" in props ? "stories" : "epics";

const rows: any[] =
  mode === "tasks"
    ? (props as TaskProps).tasks ?? []
    : mode === "stories"
    ? (props as StoryProps).stories ?? []
    : (props as EpicProps).epics ?? [];


  const onClick =
    mode === "tasks"
      ? props.onSelectTask
      : mode === "stories"
      ? props.onSelectStory
      : props.onSelectEpic;

  const titleLabel = mode === "tasks" ? "Task" : mode === "stories" ? "Story" : "Epic";

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm table-fixed">
          <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3 w-[14%]">Code</th>
              <th className="px-4 py-3 w-[36%]">{titleLabel}</th>

              {mode === "tasks" ? (
                <th className="px-4 py-3 w-[18%]">Context</th>
              ) : mode === "stories" ? (
                <th className="px-4 py-3 w-[18%]">Epic</th>
              ) : (
                <th className="px-4 py-3 w-[18%]">Board</th>
              )}

              <th className="px-4 py-3 w-[10%]">Priority</th>
              <th className="px-4 py-3 w-[10%]">Status</th>
              <th className="px-4 py-3 w-[12%]">Updated</th>
              <th className="px-4 py-3 w-[12%]">Created By</th>
            </tr>
          </thead>

          <tbody>
            {rows
              .filter((r) => r?.uuid)
              .map((r) => {
                const isSelected = selectedUuid === r.uuid;

                const code =
                  r.code ??
                  (mode === "tasks"
                    ? `TSK-${shortUuid(r.uuid)}`
                    : mode === "stories"
                    ? `STR-${shortUuid(r.uuid)}`
                    : `EPC-${shortUuid(r.uuid)}`);

                const statusM = r.statusMaster ?? r.status_master ?? null;
const priorityM = r.priorityMaster ?? r.priority_master ?? null;

const priorityLabel = priorityM?.name ?? "-";
const statusLabel = statusM?.name ?? "-";

const priorityVar = priorityM?.key ?? "DEFAULT";
const statusVar = statusM?.key ?? "DEFAULT";

const priorityColor = priorityM?.color ?? null;
const statusColor = statusM?.color ?? null;


                const context =
                  mode === "tasks"
                    ? `${r.story?.code ?? "-"} / ${r.story?.epic?.code ?? "-"}`
                    : mode === "stories"
                    ? `${r.epic?.code ?? "-"}`
                    : `${r.board?.title ?? "-"} (${r.board?.squad_code ?? "-"})`;

                return (
                  <tr
                    key={r.uuid}
                    role={onClick ? "button" : undefined}
                    tabIndex={onClick ? 0 : -1}
                    onClick={() => onClick?.(r)}
                    onKeyDown={(e) => {
                      if (!onClick) return;
                      if (e.key === "Enter" || e.key === " ") onClick(r);
                    }}
                    className={[
                      "border-b last:border-0 transition",
                      onClick ? "cursor-pointer" : "",
                      isSelected ? "bg-gray-100" : "hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <td className="px-4 py-3 font-medium text-blue-600">{code}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 truncate">
                      {r.title ?? "-"}
                    </td>

                    <td className="px-4 py-3 text-gray-700 truncate">{context}</td>

                    <td className="px-4 py-3">
                      <Badge variant={priorityVar} color={priorityColor}>{priorityLabel}</Badge>
                    </td>

                    <td className="px-4 py-3">
                      <Badge variant={statusVar} color={statusColor}>{statusLabel}</Badge>
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {formatDateTime(r.updated_at)}
                    </td>

                    <td className="px-4 py-3 text-gray-700">
                      {r.creator?.name ?? "-"}
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
