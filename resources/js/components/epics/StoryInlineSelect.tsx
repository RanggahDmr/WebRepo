import { useState } from "react";
import { router } from "@inertiajs/react";
import route from "@/lib/route";
import Badge from "@/components/ui/Badge";

type Option = {
  label: string;
  value: string;
};

type Props = {
  storyCode: string;
  field: "priority" | "status";
  value: string;
  options: Option[];
};

export default function StoryInlineSelect({
  storyCode,
  field,
  value,
  options,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value);

  function save(val: string) {
    setEditing(false);

    if (val === value) return;

    router.patch(
      route("stories.update", { story: storyCode }),
      { [field]: val },
      {
        preserveScroll: true,
        preserveState: true,
      }
    );
  }

  
  if (!editing) {
    return (
      <button
        type="button"
        className="block w-full text-left"
        onClick={() => setEditing(true)}
      >
        <Badge variant={value}>{value}</Badge>
      </button>
    );
  }


  return (
    <select
      autoFocus
      className="w-full max-w-full rounded-md border px-2 py-1 text-sm"
      value={current}
      onChange={(e) => {
        setCurrent(e.target.value);
        save(e.target.value);
      }}
      onBlur={() => save(current)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
