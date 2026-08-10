import { useState, useCallback } from "react";
import { fileToBase64, extractReceiptItems } from "../services/receiptService";
import type { ReceiptItem } from "../types/receipt";

interface ReceiptCaptureProps {
  barcode: string | null;
  onExtracted: (items: ReceiptItem[]) => void;
  onCancel: () => void;
  onBack: () => void;
}

export function ReceiptCapture({
  barcode,
  onExtracted,
  onCancel,
  onBack,
}: ReceiptCaptureProps) {
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      // Allow re-selecting the same file after a failure.
      e.target.value = "";
      await processImage(file);
    },
    []
  );

  const processImage = async (file: File | Blob) => {
    setProcessing(true);
    setError(null);

    const url = URL.createObjectURL(file);
    setPreviewImage(url);

    try {
      const { base64, mimeType } = await fileToBase64(file);
      const items = await extractReceiptItems(base64, mimeType);
      onExtracted(items);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to process receipt image.";
      setError(message);
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleBack = () => {
    onBack();
  };

  if (processing) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6">
        {previewImage && (
          <img
            src={previewImage}
            alt="Receipt"
            className="max-h-[50vh] max-w-full object-contain rounded-xl mb-6 opacity-60"
          />
        )}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-pantry-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-white text-lg font-semibold">
            🍳 Analyzing your receipt...
          </p>
          <p className="text-white/60 text-sm text-center max-w-xs">
            Extracting grocery items from the image using AI. This may take a
            few seconds.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80">
        <button
          onClick={handleBack}
          className="text-white/80 hover:text-white text-sm font-medium px-3 py-2 rounded-lg"
        >
          ← Back
        </button>
        <h2 className="text-white font-semibold text-base">Capture Receipt</h2>
        <button
          onClick={handleCancel}
          className="text-white/80 hover:text-white text-sm font-medium px-3 py-2 rounded-lg"
        >
          ✕
        </button>
      </div>

      {barcode && (
        <div className="bg-pantry-600/20 border border-pantry-600/30 px-4 py-2 text-center">
          <p className="text-pantry-300 text-sm">
            ✓ Barcode detected: <span className="font-mono font-bold">{barcode}</span>
          </p>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 relative overflow-hidden">
        <div className="flex flex-col items-center justify-center h-full p-6 text-center gap-6">
          <div>
            <p className="text-white text-lg font-semibold mb-2">
              Now capture the receipt image
            </p>
            <p className="text-white/60 text-sm max-w-xs">
              Take a clear photo of your receipt or upload an existing image.
              Make sure all items are visible.
            </p>
          </div>

          {error && (
            <div className="bg-red-900/40 border border-red-700/50 rounded-xl px-4 py-3 max-w-sm">
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          {previewImage && error && (
            <img
              src={previewImage}
              alt="Receipt preview"
              className="max-h-40 rounded-lg opacity-50"
            />
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-black/80 space-y-3">
        <label
          htmlFor="receipt-camera"
          className="w-full bg-pantry-600 hover:bg-pantry-700 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          📷 Take Photo
        </label>
        <label
          htmlFor="receipt-gallery"
          className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          🖼️ Upload Receipt
        </label>

        <input
          id="receipt-camera"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          id="receipt-gallery"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  );
}
