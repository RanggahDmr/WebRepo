export type Story = {
  id: number;
  epic_id: number;
  code: string;
  title: string;
  description: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "DONE";
  updated_at: string;
};
