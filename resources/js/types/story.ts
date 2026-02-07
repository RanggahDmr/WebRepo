import type { MasterPriority, MasterStatus } from "./board-master";

export type StoryPriorityLegacy = "LOW" | "MEDIUM" | "HIGH";
export type StoryStatusLegacy = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export type Story = {
  uuid: string;
  epic_uuid: string; //  sesuai backend (uuid)

  code: string;
  title: string;
  description?: string | null;

  // legacy
  priority?: StoryPriorityLegacy | string;
  status?: StoryStatusLegacy | string;

  // new
  priority_id?: number | null;
  status_id?: number | null;

  priorityMaster?: MasterPriority | null;
  statusMaster?: MasterStatus | null;

  created_by: number;
  created_at: string;
  updated_at: string;

  creator?: {
    id: number;
    name: string;
  };
};
