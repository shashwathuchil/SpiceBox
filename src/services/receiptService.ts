import type { ReceiptItem } from "../types/receipt";
import { extractReceiptImage } from "./groqService";
import { validateReceiptResponse } from "../utils/validateAIResponse";

/**
 * Converts a File/Blob to a base64 string.
 */
export function fileToBase64(file: File | Blob): Promise<{
  base64: string;
  mimeType: string;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const mimeType = file.type || "image/jpeg";
      // Extract base64 from data URL
      const base64 = result.split(",")[1] || result;
      resolve({ base64, mimeType });
    };
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}

/**
 * Sends a receipt image to Groq vision and returns validated receipt items.
 */
export async function extractReceiptItems(
  imageBase64: string,
  mimeType: string
): Promise<ReceiptItem[]> {
  const rawText = await extractReceiptImage(imageBase64, mimeType);
  const items = validateReceiptResponse(rawText);

  if (items.length === 0) {
    throw new Error(
      "No grocery items could be extracted from this receipt. Please try a clearer photo or add ingredients manually."
    );
  }

  return items;
}
