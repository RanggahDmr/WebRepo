import { router } from "@inertiajs/react";
import route from "@/lib/route";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ProgressCard({ progress }: { progress: any }) {
  const total = Number(progress?.total ?? 0);
  const done = Number(progress?.done ?? 0);
  const open = Number(progress?.open ?? 0);
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-900">Progress</div>
        <div className="text-sm text-gray-500">{pct}%</div>
      </div>

      <div className="mt-3 h-2 w-full rounded bg-gray-100">
        <div className="h-2 rounded bg-black" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-3 flex gap-4 text-xs text-gray-600">
        <span>
          Total: <b className="text-gray-900">{total}</b>
        </span>
        <span>
          Done: <b className="text-gray-900">{done}</b>
        </span>
        <span>
          Open: <b className="text-gray-900">{open}</b>
        </span>
      </div>
    </div>
  );
}

export function applyMonitoringFilter(
  tab: "tasks" | "stories" | "epics",
  filters: any,
  next: any
) {
  router.get(
    route("monitoring.index"),
    { ...filters, ...next, tab },
    { preserveScroll: true, preserveState: true, replace: true }
  );
}

/**  Clean Select: Boards */
export function BoardSelect({
  tab,
  filters,
  boards,
  resetKeysOnChange = {},
  widthClass = "w-[240px]",
}: {
  tab: "tasks" | "stories" | "epics";
  filters: any;
  boards: any[] | null;
  resetKeysOnChange?: Record<string, any>;
  widthClass?: string;
}) {
  return (
    <Select
      value={filters.board ? String(filters.board) : "ALL"}
      onValueChange={(v) =>
        applyMonitoringFilter(tab, filters, {
          board: v === "ALL" ? "" : v,
          ...resetKeysOnChange,
        })
      }
    >
      <SelectTrigger className={`h-9 ${widthClass} rounded-md text-sm`}>
        <SelectValue placeholder="All Boards" />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectItem value="ALL">All Boards</SelectItem>
        {(boards ?? []).map((b: any) => (
          <SelectItem key={b.uuid} value={String(b.uuid)}>
            {b.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**  Clean Select: Epics (tasks/stories only) */
export function EpicSelect({
  tab,
  filters,
  epicsOptions,
  disabled,
  widthClass = "w-[260px]",
}: {
  tab: "tasks" | "stories" | "epics";
  filters: any;
  epicsOptions: any[] | null;
  disabled?: boolean;
  widthClass?: string;
}) {
  return (
    <Select
      value={filters.epic ? String(filters.epic) : "ALL"}
      onValueChange={(v) =>
        applyMonitoringFilter(tab, filters, { epic: v === "ALL" ? "" : v })
      }
      disabled={!!disabled}
    >
      <SelectTrigger className={`h-9 ${widthClass} rounded-md text-sm`}>
        <SelectValue placeholder={disabled ? "Select board first" : "All Epics"} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        <SelectItem value="ALL">All Epics</SelectItem>
        {(epicsOptions ?? []).map((e: any) => (
          <SelectItem key={e.uuid} value={String(e.uuid)}>
            {e.code} — {e.title}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function MasterStatusSelect({
  tab,
  filters,
  statuses,
}: {
  tab: "tasks" | "stories" | "epics";
  filters: any;
  statuses: any[] | null;
}) {
  return (
    <Select
      value={filters.status_id ? String(filters.status_id) : "ALL"}
      onValueChange={(v) =>
        applyMonitoringFilter(tab, filters, { status_id: v === "ALL" ? "" : v })
      }
      disabled={!filters.board || !statuses || statuses.length === 0}
    >
      <SelectTrigger className="h-9 w-[220px] rounded-md text-sm">
        <SelectValue placeholder={filters.board ? "All Status" : "Select board first"} />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        <SelectItem value="ALL">All Status</SelectItem>
        {(statuses ?? []).map((s: any) => (
          <SelectItem key={s.id} value={String(s.id)}>
            {s.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function MasterPrioritySelect({
  tab,
  filters,
  priorities,
}: {
  tab: "tasks" | "stories" | "epics";
  filters: any;
  priorities: any[] | null;
}) {
  return (
    <Select
      value={filters.priority_id ? String(filters.priority_id) : "ALL"}
      onValueChange={(v) =>
        applyMonitoringFilter(tab, filters, { priority_id: v === "ALL" ? "" : v })
      }
      disabled={!filters.board || !priorities || priorities.length === 0}
    >
      <SelectTrigger className="h-9 w-[220px] rounded-md text-sm">
        <SelectValue placeholder={filters.board ? "All Priority" : "Select board first"} />
      </SelectTrigger>
      <SelectContent className="max-h-64">
        <SelectItem value="ALL">All Priority</SelectItem>
        {(priorities ?? []).map((p: any) => (
          <SelectItem key={p.id} value={String(p.id)}>
            {p.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function SortSelect({
  tab,
  filters,
}: {
  tab: "tasks" | "stories" | "epics";
  filters: any;
}) {
  return (
    <Select
      value={filters.sort || "updated_at"}
      onValueChange={(v) => applyMonitoringFilter(tab, filters, { sort: v })}
    >
      <SelectTrigger className="h-9 w-[220px] rounded-md text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="updated_at">Updated</SelectItem>
        <SelectItem value="created_at">Created</SelectItem>
        <SelectItem value="status_pos">Status (Master Order)</SelectItem>
        <SelectItem value="priority_pos">Priority (Master Order)</SelectItem>
      </SelectContent>
    </Select>
  );
}

export function DirectionSelect({
  tab,
  filters,
}: {
  tab: "tasks" | "stories" | "epics";
  filters: any;
}) {
  return (
    <Select
      value={filters.direction || "desc"}
      onValueChange={(v) => applyMonitoringFilter(tab, filters, { direction: v })}
    >
      <SelectTrigger className="h-9 w-[160px] rounded-md text-sm">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="desc">Desc</SelectItem>
        <SelectItem value="asc">Asc</SelectItem>
      </SelectContent>
    </Select>
  );
}
