export type TaskType = "FE" | "BE" | "QA";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";

export type Task = {
  id: number;
  type: TaskType;
  title: string;
  description?: string | null;
  status: TaskStatus;
};
