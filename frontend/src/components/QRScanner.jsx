import { useState, useRef } from "react";
import { apiRequest } from "../lib/api.js";

export default function QRScanner({ onScanSuccess, onClose, token, lang = "es" }) {
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState("");
  const [error, setError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const copy = {
    es: {
      title: "Escanear Código QR",
      subtitle: "Escanea el QR del equipo para autocompletar datos",
      startScan: "Iniciar Escaneo",
      stopScan: "Detener",
      manualInput: "O ingresa el código manualmente:",
      placeholder: "SWARCO-FAILURE-abc123...",
      validate: "Validar",
      close: "Cerrar",
      instructions: "Coloca el código QR frente a la cámara",
      cameraError: "No se pudo acceder a la cámara",
      invalidQR: "Código QR inválido",
      success: "¡Código válido!"
    },
    en: {
      title: "Scan QR Code",
      subtitle: "Scan equipment QR to auto-fill data",
      startScan: "Start Scanning",
      stopScan: "Stop",
      manualInput: "Or enter code manually:",
      placeholder: "SWARCO-FAILURE-abc123...",
      validate: "Validate",
      close: "Close",
      instructions: "Place QR code in front of camera",
      cameraError: "Could not access camera",
      invalidQR: "Invalid QR code",
      success: "Valid code!"
    }
  };

  const t = copy[lang] || copy.es;

  async function startScanning() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setScanning(true);
        setError("");
        
        // Iniciar detección de QR
        detectQR();
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError(t.cameraError);
    }
  }

  function stopScanning() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setScanning(false);
  }

  function detectQR() {
    // Usar librería de detección QR (jsQR, html5-qrcode, etc.)
    // Por ahora, simulación básica - en producción usar librería real
    // TODO: Integrar con html5-qrcode o jsQR
    
    // Simulación de detección cada 500ms
    const interval = setInterval(() => {
      if (!scanning) {
        clearInterval(interval);
        return;
      }
      
      // Aquí iría la lógica de detección real
      // Por ahora, el usuario debe usar input manual
    }, 500);
  }

  async function handleValidate() {
    if (!manualInput.trim()) {
      setError("Ingresa un código QR");
      return;
    }

    try {
      setError("");
      const result = await apiRequest("/api/qr/scan", "POST", { qrCode: manualInput }, token);
      
      if (result.valid) {
        onScanSuccess(result);
        if (onClose) onClose();
      } else {
        setError(t.invalidQR);
      }
    } catch (err) {
      setError(err.message || t.invalidQR);
    }
  }

  function handleClose() {
    stopScanning();
    if (onClose) onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-swarcoBlue">{t.title}</h3>
            <p className="text-sm text-slate-600">{t.subtitle}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Video Preview */}
        {scanning && (
          <div className="mb-4 relative">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-64 bg-slate-900 rounded-lg object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-4 border-swarcoOrange rounded-lg shadow-lg" />
            </div>
            <p className="text-center text-sm text-slate-600 mt-2">{t.instructions}</p>
          </div>
        )}

        {/* Camera Controls */}
        <div className="mb-4">
          {!scanning ? (
            <button
              onClick={startScanning}
              className="w-full py-3 bg-swarcoBlue text-white rounded-lg hover:bg-swarcoBlue/90 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t.startScan}
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              {t.stopScan}
            </button>
          )}
        </div>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-slate-500">O</span>
          </div>
        </div>

        {/* Manual Input */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">
            {t.manualInput}
          </label>
          <input
            type="text"
            value={manualInput}
            onChange={(e) => setManualInput(e.target.value)}
            placeholder={t.placeholder}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono text-sm"
          />
          <button
            onClick={handleValidate}
            className="w-full py-2 bg-swarcoOrange text-white rounded-lg hover:bg-swarcoOrange/90"
          >
            {t.validate}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Info */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
          <strong>Formato esperado:</strong> SWARCO-[TIPO]-[CÓDIGO]
        </div>
      </div>
    </div>
  );
}
