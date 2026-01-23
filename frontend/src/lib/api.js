const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://stsweb-backend-964379250608.europe-west1.run.app";

export async function apiRequest(path, method = "GET", body, token, options = {}) {
  const timeout = options.timeout || 30000; // 30 segundos por defecto
  const maxRetries = options.maxRetries || 2;
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const res = await fetch(`${API_URL}${path}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        
        // Si es error de rate limit (429), mostrar mensaje específico
        if (res.status === 429) {
          throw new Error(data.error || "Demasiadas solicitudes. Por favor, espera un momento.");
        }
        
        // Si es error de autenticación (401), redirigir a login
        if (res.status === 401) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.");
        }
        
        throw new Error(data.error || `Error del servidor (${res.status})`);
      }
      
      return res.json();
    } catch (err) {
      lastError = err;
      
      // Si es el último intento o es un error que no debe reintentar, lanzar error
      if (
        attempt === maxRetries ||
        err.name === "AbortError" ||
        err.message.includes("401") ||
        err.message.includes("429")
      ) {
        if (err.name === "AbortError") {
          throw new Error("La solicitud tardó demasiado. Por favor, verifica tu conexión.");
        }
        throw err;
      }
      
      // Esperar antes de reintentar (backoff exponencial)
      await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 5000)));
    }
  }

  throw lastError;
}
