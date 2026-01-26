import { useState } from "react";
import { router } from "@inertiajs/react";
import route from "@/lib/route";
import Badge from "@/components/ui/Badge";

type Option = {
  label: string;
  value: string;
};

type Props = {
  epicUuid: string;
  value: string;
  options: Option[];
  field: "priority" | "status";
};

export default function EpicInlineSelect({
  epicUuid,
  value,
  options,
  field,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [current, setCurrent] = useState(value);

  function save(val: string) {
    setEditing(false);

    if (val === value) return;

    router.patch(
      route("epics.update", { epic: epicUuid }),
      { [field]: val },
      { preserveScroll: true }
    );
  }

  if (!editing) {
    return (
      <button className="block w-full text-left" onClick={() => setEditing(true)}>
        <Badge variant={value}>{value}</Badge>
      </button>
    );
  }

  return (
    <select
      autoFocus
      className="w-full rounded-md border px-2 py-1 text-sm max-w-full"
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
