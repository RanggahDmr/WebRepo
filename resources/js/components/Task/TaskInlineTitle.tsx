import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import route from "@/lib/route";

export default function TaskInlineTitle({
  taskUuid,
  value,
}: {
  taskUuid: string;
  value: string;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);

  useEffect(() => setText(value), [value]);

  function save() {
    setEditing(false);
    if (text.trim() === value.trim()) return;

    router.patch(
      route("tasks.update", { task: taskUuid }),
      { title: text.trim() },
      { preserveScroll: true }
    );
  }

  if (!editing) {
    return (
      <button type="button" className="text-left w-full" onClick={() => setEditing(true)}>
        {value}
      </button>
    );
  }

  return (
    <input
      autoFocus
      className="w-full rounded border px-2 py-1 text-sm"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") { setText(value); setEditing(false); }
      }}
    />
  );
}
