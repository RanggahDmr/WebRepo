export type Story = {
  id: number;
  epic_id: number;
  code: string;
  title: string;
  description?: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  created_by: number;
  created_at: string;
  updated_at: string;

  creator?: {
    id: number;
    name: string;
  };
};
