import { useMemo, useState } from "react";
import { Epic } from "@/types/epic";

export function useEpicFilters(epics: Epic[]) {
  const [q, setQ] = useState("");
  const [priority, setPriority] = useState<"" | Epic["priority"]>("");
  const [status, setStatus] = useState<"" | Epic["status"]>("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return epics.filter((e) => {
      const okQuery =
        !query ||
        e.create_work.toLowerCase().includes(query) ||
        (e.code ?? "").toLowerCase().includes(query);

      return (
        okQuery &&
        (!priority || e.priority === priority) &&
        (!status || e.status === status)
      );
    });
  }, [epics, q, priority, status]);

  return {
    q,
    setQ,
    priority,
    setPriority,
    status,
    setStatus,
    filtered,
    reset: () => {
      setQ("");
      setPriority("");
      setStatus("");
    },
  };
}
