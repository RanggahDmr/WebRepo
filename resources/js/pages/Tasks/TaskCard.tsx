type Task = {
  id: number;
  title: string;
  status: string;
};

export default function TaskCard({ task }: { task: Task }) {
  return (
    <div className="rounded border bg-white p-2 text-sm">
      {task.title}
    </div>
  );
}
