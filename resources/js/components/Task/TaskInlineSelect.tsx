import { useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import route from "@/lib/route";
import Badge from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = { label: string; value: number; color?: string | null };

type Props = {
  taskUuid: string;
  field: "priority_id" | "status_id";
  value: number | null;
  options: Option[];
  displayLabel?: string;
};

export default function TaskInlineSelect({
  taskUuid,
  field,
  value,
  options,
  displayLabel,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [optimistic, setOptimistic] = useState<number | null>(value);

  useEffect(() => setOptimistic(value), [value]);

  const shownMeta = useMemo(
    () => options.find((o) => o.value === optimistic) ?? null,
    [options, optimistic]
  );

  const shownLabel =
    shownMeta?.label ?? displayLabel ?? (optimistic == null ? "-" : String(optimistic));

  const shownColor = shownMeta?.color ?? null;

  function save(nextVal: number | null) {
    setEditing(false);
    if (nextVal === value) return;

    setOptimistic(nextVal);

    router.patch(
      route("tasks.update", { task: taskUuid }),
      { [field]: nextVal },
      {
        preserveScroll: true,
        only: ["tasks", "taskStatuses", "taskPriorities", "story", "epic"],
        onError: () => setOptimistic(value),
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
        <Badge variant={shownLabel} color={shownColor}>
          {shownLabel}
        </Badge>
      </button>
    );
  }

  return (
    <Select
      value={optimistic == null ? "" : String(optimistic)}
      onValueChange={(v) => save(v === "" ? null : Number(v))}
    >
      <SelectTrigger autoFocus className="h-8 w-full max-w-full rounded-md text-sm">
        <SelectValue placeholder="Select..." />
      </SelectTrigger>

      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={String(o.value)}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
