import AuthenticatedLayout from "@/layouts/authenticated-layout";

type Task = {
  id: number;
  title: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
};

type Story = {
  id: number;
  code: string;
};

const STATUSES = [
  { key: "TODO", label: "TODO" },
  { key: "IN_PROGRESS", label: "IN PROGRESS" },
  { key: "IN_REVIEW", label: "IN REVIEW" },
  { key: "DONE", label: "DONE" },
] as const;

function TaskBoard({
  story,
  tasks,
}: {
  story: Story;
  tasks: Task[];
}) {
  const grouped = STATUSES.reduce(
    (acc, s) => {
      acc[s.key] = tasks.filter((t) => t.status === s.key);
      return acc;
    },
    {} as Record<Task["status"], Task[]>
  );

 return (
  <div className="h-full flex flex-col gap-5">
    {/* PAGE TITLE */}
    <div className="flex items-center justify-between">
      <h1 className="text-xl font-semibold text-black">
        Tasks
        <span className="ml-2 text-sm font-normal text-gray-500">
          {story.code}
        </span>
      </h1>
    </div>

    {/* KANBAN */}
    <div className="grid grid-cols-4 gap-5 flex-1">
      {STATUSES.map((s) => (
        <div
          key={s.key}
          className="
            flex flex-col
            rounded-xl
            bg-gray-50
            border
            border-gray-200
            p-3
          "
        >
          {/* COLUMN HEADER */}
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold tracking-wide text-gray-600">
              {s.label}
            </h3>

            <span className="text-xs text-gray-400">
              {grouped[s.key].length}
            </span>
          </div>

          {/* CARD LIST */}
          <div className="flex-1 space-y-2 overflow-y-auto">
            {grouped[s.key].length === 0 && (
              <div className="rounded-md border border-dashed border-gray-300 py-4 text-center text-xs text-gray-400">
                No tasks
              </div>
            )}

            {grouped[s.key].map((task) => (
              <div
                key={task.id}
                className="
                  group
                  rounded-lg
                  border
                  border-gray-200
                  bg-white
                  p-3
                  text-sm
                  shadow-sm
                  transition
                  hover:shadow
                  hover:border-gray-300
                "
              >
                <div className="font-medium text-gray-900">
                  {task.title}
                </div>

                <div className="mt-1 text-xs text-gray-400">
                  #{task.id}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  </div>
);

}

/**
 * 👇 INI KUNCINYA
 */
TaskBoard.layout = (page: React.ReactNode) => (
  <AuthenticatedLayout
    header={
      <div className="text-sm text-gray-600">
        {page}
      </div>
    }
  >
    {page}
  </AuthenticatedLayout>
);

export default TaskBoard;
