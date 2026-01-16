import TaskCard from "./TaskCard";

type Task = {
  id: number;
  title: string;
  status: string;
};

export default function TaskColumn({
  title,
  tasks,
}: {
  title: string;
  tasks: Task[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold">{title}</h3>

      <div className="flex flex-col gap-2">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
