import { useState } from "react";
import { router } from "@inertiajs/react";
import route from "@/lib/route";

type Props = {
  storyCode: string;
  value: string;
};

export default function StoryInlineTitle({ storyCode, value }: Props) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value);

  function save() {
    setEditing(false);

    if (!text.trim() || text === value) {
      setText(value);
      return;
    }

    router.patch(
      route("stories.update", {story: storyCode}),
      { title: text },
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
