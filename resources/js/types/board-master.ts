export type MasterStatus = {
  id: number;
  key: string;
  name: string;
  color?: string | null;
  is_done: boolean;
  is_default: boolean;
};

export type MasterPriority = {
  id: number;
  key: string;
  name: string;
  color?: string | null;
  is_default: boolean;
};
