const API_URL =
  import.meta.env.VITE_API_URL ||
  "https://stsweb-backend-964379250608.europe-west1.run.app";

export async function apiRequest(path, method = "GET", body, token) {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Error de servidor");
  }
  return res.json();
}
