import { useState, useRef, useEffect, useCallback } from "react";
import { BrowserMultiFormatReader, IScannerControls } from "@zxing/browser";
import { DecodeHintType, BarcodeFormat } from "@zxing/library";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onCancel: () => void;
  onSkip: () => void;
}

export function BarcodeScanner({ onDetected, onCancel, onSkip }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detected, setDetected] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | undefined>(
    undefined
  );

  const startScanner = useCallback(
    async (deviceId?: string) => {
      if (!videoRef.current) return;

      setError(null);

      try {
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [
          BarcodeFormat.EAN_13,
          BarcodeFormat.EAN_8,
          BarcodeFormat.UPC_A,
          BarcodeFormat.UPC_E,
          BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39,
          BarcodeFormat.QR_CODE,
          BarcodeFormat.DATA_MATRIX,
          BarcodeFormat.ITF,
        ]);

        const reader = new BrowserMultiFormatReader(hints);

        // List available cameras
        const allDevices = await BrowserMultiFormatReader.listVideoInputDevices();
        setDevices(allDevices);

        // Prefer back camera on mobile
        let targetDeviceId = deviceId;
        if (!targetDeviceId) {
          const backCam = allDevices.find((d) =>
            /back|rear|environment/i.test(d.label)
          );
          targetDeviceId = backCam?.deviceId || allDevices[0]?.deviceId;
        }
        setSelectedDeviceId(targetDeviceId);

        if (controlsRef.current) {
          controlsRef.current.stop();
        }

        const controls = await reader.decodeFromVideoDevice(
          targetDeviceId,
          videoRef.current,
          (result, err) => {
            if (result && !detected) {
              setDetected(true);
              const text = result.getText();
              // Stop scanning
              controlsRef.current?.stop();
              // Small delay for UX
              setTimeout(() => onDetected(text), 300);
            }
          }
        );

        controlsRef.current = controls;
      } catch (e) {
        const message =
          e instanceof Error ? e.message : "Failed to access camera.";
        if (/permission|denied|notallowed/i.test(message)) {
          setError(
            "Camera permission denied. Please allow camera access and try again."
          );
        } else {
          setError(message);
        }
      }
    },
    [detected, onDetected]
  );

  useEffect(() => {
    startScanner();
    return () => {
      controlsRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwitchCamera = () => {
    if (devices.length < 2) return;
    const currentIndex = devices.findIndex(
      (d) => d.deviceId === selectedDeviceId
    );
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];
    setSelectedDeviceId(nextDevice.deviceId);
    controlsRef.current?.stop();
    startScanner(nextDevice.deviceId);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/80">
        <button
          onClick={onCancel}
          className="text-white/80 hover:text-white text-sm font-medium px-3 py-2 rounded-lg"
        >
          ✕ Cancel
        </button>
        <h2 className="text-white font-semibold text-base">Scan Barcode</h2>
        <button
          onClick={handleSwitchCamera}
          className="text-white/80 hover:text-white text-sm font-medium px-3 py-2 rounded-lg"
          disabled={devices.length < 2}
        >
          🔄 Switch
        </button>
      </div>

      {/* Camera view */}
      <div className="flex-1 relative overflow-hidden">
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          playsInline
          muted
        />

        {/* Scan overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-64 h-40 border-2 border-white/60 rounded-xl relative">
            <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-pantry-400 rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-pantry-400 rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-pantry-400 rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-pantry-400 rounded-br-lg" />
            {!detected && (
              <div className="absolute left-2 right-2 h-0.5 bg-pantry-400 animate-pulse" />
            )}
          </div>
        </div>

        {detected && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="bg-pantry-600 text-white px-6 py-4 rounded-2xl shadow-2xl animate-scale-in">
              <p className="text-lg font-bold">✓ Barcode Detected!</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 text-center">
            <p className="text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={() => startScanner()}
              className="bg-pantry-600 text-white px-6 py-3 rounded-xl font-medium mb-3"
            >
              Try Again
            </button>
            <button
              onClick={onSkip}
              className="text-white/60 text-sm underline"
            >
              Skip to receipt capture
            </button>
          </div>
        )}
      </div>

      {/* Footer instructions */}
      <div className="p-4 bg-black/80 text-center">
        <p className="text-white/70 text-sm mb-3">
          Point the camera at the barcode on your receipt
        </p>
        <button
          onClick={onSkip}
          className="text-pantry-400 hover:text-pantry-300 text-sm font-medium"
        >
          Skip barcode → Capture receipt directly
        </button>
      </div>
    </div>
  );
}
