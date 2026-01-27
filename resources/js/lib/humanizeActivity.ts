// resources/js/lib/humanizeActivity.ts

type Humanized = {
  title: string;
  lines: string[];
};

const LABELS: Record<string, string> = {
  status: "Status",
  title: "Title",
  description: "Description",
  priority: "Priority",
  type: "Type",
  assignee_id: "Assignee",
  position: "Position",
  code: "Code",
};

function titleCase(input: string) {
  return input
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmtValue(v: any) {
  if (v === null || v === undefined || v === "") return "-";
  if (typeof v === "string") return titleCase(v);
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return JSON.stringify(v);
}

function buildDiffLines(before: any, after: any) {
  const keys = new Set<string>([
    ...Object.keys(before ?? {}),
    ...Object.keys(after ?? {}),
  ]);

  const ignore = new Set(["updated_at", "created_at", "id", "uuid"]);

  const lines: string[] = [];
  for (const key of keys) {
    if (ignore.has(key)) continue;

    const b = before?.[key];
    const a = after?.[key];

    // hanya tampilkan yang berubah
    if (JSON.stringify(b) === JSON.stringify(a)) continue;

    const label = LABELS[key] ?? titleCase(key);
    lines.push(`${label}: ${fmtValue(b)} → ${fmtValue(a)}`);
  }
  return lines;
}

/**
 * Support bentuk changes:
 * - { from: "TODO", to: "IN_PROGRESS" } (status change)
 * - { before: {...}, after: {...} } (generic update)
 * - { after: {...} } (created)
 */
export function humanizeActivity(log: any): Humanized {
  const actionRaw = String(log?.action ?? "updated");
  const action = actionRaw.toLowerCase();

  const changes = log?.changes ?? null;

  // 1) status change sederhana
  if (changes && "from" in changes && "to" in changes) {
    const from = fmtValue(changes.from);
    const to = fmtValue(changes.to);
    return {
      title: "Status changed",
      lines: [`Status: ${from} → ${to}`],
    };
  }

  // 2) created: biasanya hanya ada "after"
  if (changes && changes.after && !changes.before) {
    const after = changes.after;

    const lines: string[] = [];
    if (after.code) lines.push(`Code: ${fmtValue(after.code)}`);
    if (after.type) lines.push(`Type: ${fmtValue(after.type)}`);
    if (after.title) lines.push(`Title: ${fmtValue(after.title)}`);
    if (after.status) lines.push(`Status: ${fmtValue(after.status)}`);
    if (after.priority) lines.push(`Priority: ${fmtValue(after.priority)}`);

    return {
      title: "Created",
      lines: lines.length ? lines : ["Item created"],
    };
  }

  // 3) updated: before/after diff
  if (changes && changes.before && changes.after) {
    const lines = buildDiffLines(changes.before, changes.after);
    return {
      title: "Updated",
      lines: lines.length ? lines : ["Updated (no visible fields changed)"],
    };
  }

  // 4) fallback: action string doang
  const fallbackTitle =
    action.includes("create") ? "Created" :
    action.includes("delete") ? "Deleted" :
    action.includes("update") ? "Updated" :
    titleCase(actionRaw);

  return { title: fallbackTitle, lines: [] };
}
