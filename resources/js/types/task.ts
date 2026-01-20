export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

export type Task = {
  id: number;

  
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;

  
  story_id?: number;
  position?: number;

  created_by?: number;
  created_at?: string;
  updated_at?: string;

  creator?: {
    id: number;
    name: string;
  };
};
