type Progress = {
  total: number;
  todo: number;
  in_progress: number;
  in_review: number;
  done: number;
};

export default function ProgressBar({ progress }: { progress: Progress }) {
  if (!progress || progress.total === 0) {
    return (
      <div className="bg-white rounded-lg p-4 shadow text-sm text-gray-500">
        No tasks available
      </div>
    );
  }

  const items = [
    {
      label: "TODO",
      value: progress.todo,
      color: "bg-red-500",
    },
    {
      label: "IN PROGRESS",
      value: progress.in_progress,
      color: "bg-green-300",
    },
    {
      label: "IN REVIEW",
      value: progress.in_review,
      color: "bg-green-500",
    },
    {
      label: "DONE",
      value: progress.done,
      color: "bg-black",
    },
  ];
//    LOW: "bg-green-300 text-gray-700",
//     MEDIUM: "bg-orange-400 text-gray-800",
//     HIGH: "bg-red-500 text-white",
//     TODO: "bg-red-500 text-white",
//     IN_PROGRESS: "bg-green-300 text-gray-800",
//     IN_REVIEW: "bg-green-500 text-white",
//     DONE: "bg-black text-white",
//   };

  return (
    <div className="bg-white rounded-lg p-4 shadow mb-6">
      <div className="flex justify-between mb-2 text-sm font-medium text-gray-700">
        <span>Task Progress</span>
        <span>{progress.total} Tasks</span>
      </div>

      <div className="w-full h-3 rounded-full overflow-hidden flex bg-gray-200">
        {items.map((i) => (
          <div
            key={i.label}
            className={`${i.color} h-full`}
            style={{
              width: `${(i.value / progress.total) * 100}%`,
            }}
          />
        ))}
      </div>

      <div className="mt-3 grid grid-cols-4 gap-3 text-xs">
        {items.map((i) => (
          <div key={i.label} className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded ${i.color}`} />
            <span className="text-gray-600">
              {i.label}: <b>{i.value}</b>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
