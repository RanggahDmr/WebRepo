export function humanizeActivity(log: any) {
  const user = log.user?.name ?? "System";
  const changes = log.changes ?? {};
  const subject = log.subject_type?.split("\\").pop();

  switch (log.action) {
    case "task_created":
      return `${user} created a task`;

    case "task_status_changed":
      return `${user} changed task status from ${changes.from} → ${changes.to}`;

    case "story_status_changed":
      return `${user} changed story status from ${changes.from} → ${changes.to}`;

    case "epic_status_changed":
      return `${user} changed epic status from ${changes.from} → ${changes.to}`;

    case "auto_status_sync":
      return `System auto-updated status from ${changes.from} → ${changes.to}`;

    default:
      return `${user} did ${log.action}`;
  }
}
