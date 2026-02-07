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

type Option = {
  label: string;
  value: number;
  color?: string | null;
};

type Props = {
  storyUuid: string;
  field: "priority_id" | "status_id";
  value: number | null;
  options: Option[];
  displayLabel?: string;
};

export default function StoryInlineSelect({
  storyUuid,
  field,
  value,
  options,
  displayLabel,
}: Props) {
  const [editing, setEditing] = useState(false);

  // optimistic value (biar badge langsung berubah)
  const [optimistic, setOptimistic] = useState<number | null>(value);

  useEffect(() => {
    setOptimistic(value);
  }, [value]);

  const shownValue = optimistic;

  const shownMeta = useMemo(() => {
    return options.find((o) => o.value === shownValue) ?? null;
  }, [options, shownValue]);

  const shownLabel =
    shownMeta?.label ??
    displayLabel ??
    (shownValue == null ? "-" : String(shownValue));

  const shownColor = shownMeta?.color ?? null;

  function save(nextVal: number | null) {
    setEditing(false);

    // no-op
    if (nextVal === value) return;

    // optimistic update
    setOptimistic(nextVal);

    router.patch(
      route("stories.update", { story: storyUuid }),
      { [field]: nextVal },
      {
        preserveScroll: true,
        only: ["stories", "storyStatuses", "storyPriorities", "epic"],
        onError: () => {
          // rollback
          setOptimistic(value);
        },
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
      value={shownValue == null ? "" : String(shownValue)}
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
