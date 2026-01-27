import { humanizeActivity } from "@/lib/humanizeActivity";

export default function HistoryItem({ log }: any) {
  const h = humanizeActivity(log);
  const actor = log.user?.name ?? "System";

  const byLabel =
    h.title === "Created" ? "Created by" :
    h.title === "Deleted" ? "Deleted by" :
    "Updated by";

  return (
    <li className="ml-4">
      <div className="absolute -left-1.5 h-3 w-3 rounded-full bg-black" />

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-900">
            {byLabel}: {actor}
          </span>
          <span className="text-gray-400">
            {new Date(log.created_at).toLocaleString()}
          </span>
        </div>

        <div className="mt-1 text-sm text-gray-700">
          <strong>{h.title}</strong>
        </div>

        {!!h.lines?.length && (
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            {h.lines.map((line: string, idx: number) => (
              <div key={idx}>{line}</div>
            ))}
          </div>
        )}

        {!h.lines?.length && log.changes && (
          <pre className="mt-2 rounded bg-gray-50 p-2 text-xs text-gray-600">
            {JSON.stringify(log.changes, null, 2)}
          </pre>
        )}
      </div>
    </li>
  );
}
