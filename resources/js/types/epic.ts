export type EpicPriority = "LOW" | "MEDIUM" | "HIGH";
export type EpicStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type Epic = {
  id: number;
  code: string;
  create_work: string;
  priority: EpicPriority;
  status: EpicStatus;
  created_at: string;
  updated_at: string;
};
