export type EpicPriority = "LOW" | "MEDIUM" | "HIGH";
export type EpicStatus = "TODO" | "IN_PROGRESS" | "DONE";

export type Epic = {
  uuid: string;
  board_uuid: string;

  code: string;
  title: string;
  description: string | null;

  priority: EpicPriority;
  status: EpicStatus;

  created_at: string;
  updated_at: string;
  created_by: number;

  creator?: {
    id: number;
    name: string;
  };
};
