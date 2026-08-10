export interface ReceiptItem {
  name: string;
  quantity: number | null;
  unit: string | null;
  price?: number | null;
}

export interface ReceiptExtractionResult {
  items: ReceiptItem[];
}
