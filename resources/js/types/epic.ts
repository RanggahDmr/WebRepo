import type { MasterPriority, MasterStatus } from "./board-master";

export type EpicPriorityLegacy = "LOW" | "MEDIUM" | "HIGH";
export type EpicStatusLegacy = "TODO" | "IN_PROGRESS" | "DONE";

export type Epic = {
  uuid: string;
  board_uuid: string;

  code: string;
  title: string;
  description: string | null;

  // legacy (masih ada di DB)
  priority?: EpicPriorityLegacy | string;
  status?: EpicStatusLegacy | string;

  // new (master per board)
  priority_id?: number | null;
  status_id?: number | null;

  priorityMaster?: MasterPriority | null;
  statusMaster?: MasterStatus | null;

  created_at: string;
  updated_at: string;
  created_by: number;

  creator?: {
    id: number;
    name: string;
  };
};
