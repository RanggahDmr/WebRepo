export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
  uuid: string;
  code?: string | null;

  title: string;
  description?: string | null;

  status: TaskStatus;
  priority: TaskPriority;

  story_uuid?: string;
  position?: number;

  created_by?: number;
  created_at?: string;
  updated_at?: string;

  creator?: {
    id: number;
    name: string;
  };

  assignee?: {
    id: number;
    name: string;
    role?: string;
  };

  // kalau kamu load relations:
  story?: any;
};
