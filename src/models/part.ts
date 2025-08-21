//shape of any given part table
export interface Part {
  id: number;
  data: string;

  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type NewPart = Omit<Part, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdatePart = {
  data?: string;
};
