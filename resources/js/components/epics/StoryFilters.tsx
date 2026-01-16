import { Story } from "@/types/story";

type Props = {
  q: string;
  setQ: (v: string) => void;
  priority: "" | Story["priority"];
  setPriority: (v: any) => void;
  status: "" | Story["status"];
  setStatus: (v: any) => void;
  total: number;
  filtered: number;
  onClear: () => void;
};

export default function StoryFilters(props: Props) {
  const {
    q, setQ,
    priority, setPriority,
    status, setStatus,
    total, filtered,
    onClear,
  } = props;

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3">
      <div className="flex-1 min-w-55">
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

      <div className="min-w-40">
        <label className="text-xs font-semibold text-gray-500 uppercase">
          Priority
        </label>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </div>

      <div className="min-w-45">
        <label className="text-xs font-semibold text-gray-500 uppercase">
          Status
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
        >
          <option value="">All</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="DONE">DONE</option>
        </select>
      </div>

      <button
        type="button"
        onClick={onClear}
        className="rounded-lg border px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
      >
        Clear
      </button>

      <div className="text-sm text-gray-500">
        {filtered} / {total}
      </div>
    </div>
  );
}
