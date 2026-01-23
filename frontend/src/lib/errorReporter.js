// Sistema de reporte de errores del frontend
const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://stsweb-backend-964379250608.europe-west1.run.app";

export async function reportError(error, context = {}) {
  try {
    // Preparar información del error
    const errorInfo = {
      message: error.message || "Error desconocido",
      stack: error.stack || "",
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      context
    };

    // Enviar al backend para que este lo envíe a soporte
    await fetch(`${API_URL}/api/error-report`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(errorInfo)
    });
  } catch (reportErr) {
    console.error("Error reporting failed:", reportErr);
  }
}

// Capturar errores no manejados
window.addEventListener("error", (event) => {
  reportError(event.error || new Error(event.message), {
    type: "unhandled_error",
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

// Capturar promesas rechazadas no manejadas
window.addEventListener("unhandledrejection", (event) => {
  reportError(
    event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
    {
      type: "unhandled_promise_rejection"
    }
  );
});
