import { humanizeActivity } from "@/lib/humanizeActivity";

export default function HistoryItem({ log }: any) {
  return (
    <li className="ml-4">
      <div className="absolute -left-1.5 h-3 w-3 rounded-full bg-black" />

      <div className="rounded-lg border bg-white p-4 shadow-sm">
        <div className="flex justify-between text-sm">
          <span className="font-medium text-gray-900">
            {log.user?.name ?? "System"}
          </span>
          <span className="text-gray-400">
            {new Date(log.created_at).toLocaleString()}
          </span>
        </div>

        <div className="mt-1 text-sm text-gray-600">
          <strong>{log.action}</strong>
      </div>

        {log.changes && (
          <pre className="mt-2 rounded bg-gray-50 p-2 text-xs text-gray-600">
            {JSON.stringify(log.changes, null, 2)}
          </pre>
        )}
      </div>
    </li>
  );
}
