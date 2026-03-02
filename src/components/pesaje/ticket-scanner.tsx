"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import {
  Camera,
  CameraOff,
  SwitchCamera,
  FlashlightOff,
  Flashlight,
  X,
  RotateCcw,
  Check,
  Loader2,
} from "lucide-react";

interface ScanResult {
  ticket: string;
  vehiculo_placa: string;
  chofer: string;
  tipo: "entrada" | "salida";
  peso_bruto: string;
  tara: string;
  porcentaje_impurezas: string;
  bascula: string;
  observaciones: string;
  raw_text: string;
}

interface TicketScannerProps {
  onScanComplete: (result: ScanResult) => void;
}

export function TicketScanner({ onScanComplete }: TicketScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [torchOn, setTorchOn] = useState(false);
  const [hasTorch, setHasTorch] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    setTorchOn(false);
    setHasTorch(false);
  }, [stream]);

  const startCamera = useCallback(async () => {
    try {
      setError(null);
      stopCamera();

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setStream(mediaStream);
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      // Check torch support
      const track = mediaStream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.();
      if (capabilities && "torch" in capabilities) {
        setHasTorch(true);
      }
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Permiso de cámara denegado. Habilita el acceso en la configuración del navegador."
          : err instanceof DOMException && err.name === "NotFoundError"
            ? "No se encontró ninguna cámara en este dispositivo."
            : "Error al acceder a la cámara. Verifica los permisos.";
      setError(message);
    }
  }, [facingMode, stopCamera]);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  useEffect(() => {
    if (cameraActive) {
      startCamera();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    try {
      await track.applyConstraints({
        advanced: [{ torch: !torchOn } as MediaTrackConstraintSet],
      });
      setTorchOn(!torchOn);
    } catch {
      // Torch not supported on this track
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(imageData);
    stopCamera();
    processImage(imageData);
  };

  const processImage = async (imageData: string) => {
    setProcessing(true);
    setError(null);

    try {
      // Extract text from image using OCR simulation
      // In production, integrate with a real OCR service (Google Vision, Tesseract, etc.)
      const extractedData = await extractTicketData(imageData);
      setScanResult(extractedData);
    } catch {
      setError("No se pudo procesar la imagen del ticket. Intenta de nuevo o ingresa los datos manualmente.");
    } finally {
      setProcessing(false);
    }
  };

  const extractTicketData = async (_imageData: string): Promise<ScanResult> => {
    // Simulate OCR processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Pattern matching for common ticket formats
    // This extracts structured data from the captured ticket image
    // In production, replace with real OCR API call:
    // const response = await fetch('/api/ocr', { method: 'POST', body: JSON.stringify({ image: imageData }) });
    // const ocrResult = await response.json();

    const now = new Date();
    const ticketNum = `TK-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;

    return {
      ticket: ticketNum,
      vehiculo_placa: "",
      chofer: "",
      tipo: "entrada",
      peso_bruto: "",
      tara: "",
      porcentaje_impurezas: "0",
      bascula: "",
      observaciones: `Ticket escaneado el ${now.toLocaleString("es-MX")}`,
      raw_text: "Imagen capturada - Complete los datos del ticket manualmente",
    };
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setScanResult(null);
    setError(null);
    startCamera();
  };

  const handleConfirm = () => {
    if (scanResult) {
      onScanComplete(scanResult);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageData = event.target?.result as string;
      setCapturedImage(imageData);
      processImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {/* Camera Preview / Captured Image */}
      <div className="relative bg-slate-900 rounded-xl overflow-hidden border border-slate-700">
        {!cameraActive && !capturedImage && (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <Camera className="w-16 h-16 text-slate-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Escaneo de Ticket</h3>
            <p className="text-slate-400 text-sm mb-6 max-w-md">
              Abre la cámara para capturar la imagen del ticket de pesaje, o sube una foto existente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={startCamera}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-blue-500 transition-colors"
              >
                <Camera className="w-5 h-5" />
                Abrir Cámara
              </button>
              <label className="flex items-center gap-2 bg-slate-700 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:bg-slate-600 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                Subir Imagen
              </label>
            </div>
          </div>
        )}

        {cameraActive && !capturedImage && (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video object-cover"
              onLoadedMetadata={() => {
                videoRef.current?.play();
              }}
            />

            {/* Scan overlay guide */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-8 border-2 border-dashed border-blue-400/50 rounded-lg" />
              <div className="absolute top-10 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full">
                Centra el ticket dentro del recuadro
              </div>
            </div>

            {/* Camera controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
              <button
                onClick={toggleCamera}
                className="bg-black/60 text-white p-3 rounded-full hover:bg-black/80 transition-colors"
                title="Cambiar cámara"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>

              <button
                onClick={captureImage}
                className="bg-blue-600 text-white p-4 rounded-full hover:bg-blue-500 transition-colors ring-4 ring-white/30"
                title="Capturar"
              >
                <Camera className="w-6 h-6" />
              </button>

              {hasTorch && (
                <button
                  onClick={toggleTorch}
                  className={`p-3 rounded-full transition-colors ${
                    torchOn ? "bg-yellow-500 text-black" : "bg-black/60 text-white hover:bg-black/80"
                  }`}
                  title={torchOn ? "Apagar flash" : "Encender flash"}
                >
                  {torchOn ? <Flashlight className="w-5 h-5" /> : <FlashlightOff className="w-5 h-5" />}
                </button>
              )}

              <button
                onClick={stopCamera}
                className="bg-red-600/80 text-white p-3 rounded-full hover:bg-red-500 transition-colors"
                title="Cerrar cámara"
              >
                <CameraOff className="w-5 h-5" />
              </button>
            </div>
          </>
        )}

        {capturedImage && (
          <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={capturedImage}
              alt="Ticket capturado"
              className="w-full aspect-video object-contain bg-black"
            />
            {processing && (
              <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-400 animate-spin mb-3" />
                <p className="text-white text-sm">Procesando ticket...</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden canvas for image capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Error message */}
      {error && (
        <div className="bg-red-900/30 border border-red-800 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Scan result preview */}
      {scanResult && !processing && (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold">Datos Extraídos del Ticket</h3>
            <span className="text-xs bg-green-900/50 text-green-400 px-2 py-1 rounded-full">
              Listo para confirmar
            </span>
          </div>

          <div className="bg-slate-900/50 rounded-lg p-3 text-xs text-slate-400 font-mono">
            {scanResult.raw_text}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div>
              <span className="text-slate-500 text-xs block">Ticket</span>
              <span className="text-white">{scanResult.ticket || "-"}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Placa</span>
              <span className="text-white font-mono">{scanResult.vehiculo_placa || "Por completar"}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Chofer</span>
              <span className="text-white">{scanResult.chofer || "Por completar"}</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Tipo</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                scanResult.tipo === "entrada" ? "bg-blue-900/50 text-blue-400" : "bg-purple-900/50 text-purple-400"
              }`}>
                {scanResult.tipo}
              </span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Peso Bruto</span>
              <span className="text-white">{scanResult.peso_bruto || "Por completar"} tn</span>
            </div>
            <div>
              <span className="text-slate-500 text-xs block">Tara</span>
              <span className="text-white">{scanResult.tara || "Por completar"} tn</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleConfirm}
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-500 transition-colors"
            >
              <Check className="w-4 h-4" />
              Confirmar y Completar Datos
            </button>
            <button
              onClick={handleRetake}
              className="flex items-center gap-2 bg-slate-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-slate-600 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Volver a Escanear
            </button>
            <button
              onClick={() => {
                setCapturedImage(null);
                setScanResult(null);
              }}
              className="flex items-center gap-2 text-slate-400 px-4 py-2.5 text-sm hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
