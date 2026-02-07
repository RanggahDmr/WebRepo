import type { MasterStatus, MasterPriority } from "./board-master";

export type TaskStatusLegacy = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriorityLegacy = "LOW" | "MEDIUM" | "HIGH";
export type TaskTypeLegacy = "FE" | "BE" | "QA";

export type Task = {
  uuid: string;

  // kadang ada, kadang engga (tapi kita butuh di UI)
  code?: string | null;

  type?: TaskTypeLegacy | string | null;

  title: string;
  description?: string | null;

  position: number;

  // legacy (kalau masih ada di DB)
  status?: TaskStatusLegacy | string;
  priority?: TaskPriorityLegacy | string;

  // new master per board
  status_id?: number | null;
  priority_id?: number | null;

  statusMaster?: MasterStatus | null;
  priorityMaster?: MasterPriority | null;

  created_at?: string | null;
  updated_at?: string | null;

  creator?: { id: number; name: string } | null;
  assignee?: { id: number; name: string; role?: string } | null;
};
