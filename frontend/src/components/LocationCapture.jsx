import { useState, useEffect } from "react";

export default function LocationCapture({ onLocationCaptured, lang = "es" }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const copy = {
    es: {
      capture: "Capturar Ubicación",
      capturing: "Obteniendo ubicación...",
      success: "Ubicación capturada",
      error: "No se pudo obtener ubicación",
      accuracy: "Precisión",
      meters: "metros",
      recapture: "Volver a Capturar"
    },
    en: {
      capture: "Capture Location",
      capturing: "Getting location...",
      success: "Location captured",
      error: "Could not get location",
      accuracy: "Accuracy",
      meters: "meters",
      recapture: "Recapture"
    }
  };

  const t = copy[lang] || copy.es;

  async function captureLocation() {
    if (!navigator.geolocation) {
      setError(t.error + ": Geolocalización no soportada");
      return;
    }

    setLoading(true);
    setError("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy)
        };
        
        setLocation(locationData);
        setLoading(false);
        
        if (onLocationCaptured) {
          onLocationCaptured(locationData);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        setError(t.error + ": " + err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }

  return (
    <div className="space-y-3">
      {!location ? (
        <button
          type="button"
          onClick={captureLocation}
          disabled={loading}
          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t.capturing}
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {t.capture}
            </>
          )}
        </button>
      ) : (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="font-medium text-green-700">{t.success}</span>
            </div>
            <div className="text-sm text-green-700 space-y-1">
              <p><strong>Lat:</strong> {location.latitude.toFixed(6)}</p>
              <p><strong>Lng:</strong> {location.longitude.toFixed(6)}</p>
              <p><strong>{t.accuracy}:</strong> ±{location.accuracy} {t.meters}</p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={captureLocation}
            className="w-full py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50"
          >
            {t.recapture}
          </button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}
