export interface Ingredient {
  id: string;
  name: string;
  quantity: number | null;
  unit: string | null;
  price?: number | null;
  source: "receipt" | "manual";
  createdAt: string;
  updatedAt: string;
}
