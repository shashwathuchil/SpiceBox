import { useState, useRef, useCallback } from "react";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Failed to access camera.";
      if (/permission|denied|notallowed/i.test(message)) {
        setError(
          "Camera permission denied. Please allow camera access or upload a photo instead."
        );
      } else {
        setError(message);
      }
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  }, []);

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        stopCamera();
        await processImage(blob);
      },
      "image/jpeg",
      0.92
    );
  }, [stopCamera]);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      stopCamera();
      await processImage(file);
    },
    [stopCamera]
  );

  const processImage = async (file: File | Blob) => {
    setProcessing(true);
    setError(null);

    // Show preview
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
    stopCamera();
    onCancel();
  };

  const handleBack = () => {
    stopCamera();
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
        {cameraActive ? (
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
          />
        ) : (
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
        )}
      </div>

      {/* Controls */}
      <div className="p-4 bg-black/80 space-y-3">
        {!cameraActive ? (
          <>
            <button
              onClick={startCamera}
              className="w-full bg-pantry-600 hover:bg-pantry-700 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              📷 Take Photo
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              🖼️ Upload Receipt
            </button>
          </>
        ) : (
          <button
            onClick={capturePhoto}
            className="w-full bg-pantry-600 hover:bg-pantry-700 text-white font-semibold py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-lg"
          >
            📸 Capture
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
}
