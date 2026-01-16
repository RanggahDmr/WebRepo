import { useState } from "react";
import { router } from "@inertiajs/react";
import route from "@/lib/route";

type Props = {
  epicCode: string;
  value: string;
};

export default function EpicInlineTitle({ epicCode, value }: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);

  function save() {
    setEditing(false);

    if (!text.trim() || text === value) {
      setText(value);
      return;
    }

    router.patch(
      route("epics.update", { epic: epicCode }),
      { create_work: text },
      { preserveScroll: true }
    );
  }

  if (!editing) {
    return (
      <button
        className="text-left font-medium hover:underline"
        onClick={() => setEditing(true)}
      >
        {value}
      </button>
    );
  }

  return (
    <input
      autoFocus
      className="w-full max-w-full rounded-md border px-2 py-1 text-sm"
      value={text}
      onChange={(e) => setText(e.target.value)}
      onBlur={save}
      onKeyDown={(e) => {
        if (e.key === "Enter") save();
        if (e.key === "Escape") {
          setText(value);
          setEditing(false);
        }
      }}
    />
  );
}
