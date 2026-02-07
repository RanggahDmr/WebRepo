import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MasterItem = {
  id: number;
  name: string;
  key?: string;
  is_default?: boolean;
};

type Props = {
  q: string;
  setQ: (v: string) => void;

  statusId: number | null;
  setStatusId: (v: number | null) => void;

  priorityId: number | null;
  setPriorityId: (v: number | null) => void;

  statuses: MasterItem[];
  priorities: MasterItem[];

  total: number;
  filtered: number;
  onClear: () => void;
};

export default function StoryFilters({
  q,
  setQ,
  statusId,
  setStatusId,
  priorityId,
  setPriorityId,
  statuses,
  priorities,
  total,
  filtered,
  onClear,
}: Props) {
  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-[220px]">
        <label className="text-xs font-semibold text-gray-500 uppercase">
          Search
        </label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search title, description, code..."
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-black"
        />
      </div>

      <div className="min-w-[220px]">
        <label className="text-xs font-semibold text-gray-500 uppercase">
          Priority
        </label>

        <Select
          value={priorityId == null ? "ALL" : String(priorityId)}
          onValueChange={(v) => setPriorityId(v === "ALL" ? null : Number(v))}
        >
          <SelectTrigger className="mt-1 h-10 w-full rounded-lg text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>

          <SelectContent className="max-h-72">
            <SelectItem value="ALL">All</SelectItem>
            {(priorities ?? []).map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[240px]">
        <label className="text-xs font-semibold text-gray-500 uppercase">
          Status
        </label>

        <Select
          value={statusId == null ? "ALL" : String(statusId)}
          onValueChange={(v) => setStatusId(v === "ALL" ? null : Number(v))}
        >
          <SelectTrigger className="mt-1 h-10 w-full rounded-lg text-sm">
            <SelectValue placeholder="All" />
          </SelectTrigger>

          <SelectContent className="max-h-72">
            <SelectItem value="ALL">All</SelectItem>
            {(statuses ?? []).map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="h-10 rounded-lg border px-4 text-sm text-gray-700 hover:bg-gray-50"
      >
        Clear
      </button>

      <div className="pb-2 text-sm text-gray-500">
        {filtered} / {total}
      </div>
    </div>
  );
}
