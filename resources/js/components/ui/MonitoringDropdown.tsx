import { Link, usePage } from "@inertiajs/react";
import route from "@/lib/route";
import { useEffect, useMemo, useRef, useState } from "react";

type Key = "tasks" | "stories" | "epics";

export function MonitoringDropdown({
  current,
  carry = ["board"], // filter yang dibawa antar tab
}: {
  current: Key;
  carry?: Array<"board" | "epic">;
}) {
  const { props }: any = usePage();
  const filters = props?.filters ?? {};
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const items = useMemo(
    () => [
      { key: "tasks" as const, label: "Tasks" },
      { key: "stories" as const, label: "Stories" },
      { key: "epics" as const, label: "Epics" },
    ],
    []
  );

  // query minimal yang ikut kebawa
  const base: any = {};
  for (const k of carry) {
    if (filters?.[k]) base[k] = filters[k];
  }

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const currentLabel = items.find((i) => i.key === current)?.label ?? "Tasks";

  return (
    <div className="relative mb-4" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm shadow border border-gray-200 hover:border-gray-300"
      >
        <span className="text-gray-500">Monitoring:</span>
        <span className="font-medium text-gray-900">{currentLabel}</span>
        <span className="text-gray-400">▾</span>
      </button>

      {open && (
        <div className="absolute left-0 z-50 mt-2 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
          {items.map((it) => {
            const active = it.key === current;

            return (
              <Link
                key={it.key}
                href={route("monitoring.index")} 
                data={{
                  ...base,
                  tab: it.key, 
                }}
                onClick={() => setOpen(false)}
                preserveScroll
                replace
                className={`block px-3 py-2 text-sm ${
                  active
                    ? "bg-gray-50 font-medium text-gray-900"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {it.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
