import HistoryItem from "./HistoryItem";

export default function HistoryTimeline({ activities }: any) {
  if (!activities.length) {
    return (
      <div className="text-sm text-gray-500">
        No activity yet.
      </div>
    );
  }

  return (
    <ol className="relative border-l border-gray-200 space-y-6">
      {activities.map((log: any) => (
        <HistoryItem key={log.id} log={log} />
      ))}
    </ol>
  );
}
