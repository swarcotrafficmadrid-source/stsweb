import { useState } from "react";
import { apiRequest } from "../lib/api.js";

export default function Login({ onSuccess }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const data = await apiRequest("/api/auth/login", "POST", { identifier, password });
      onSuccess(data.token);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        className="w-full border rounded px-3 py-2"
        placeholder="Usuario o Email"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
      />
      <input
        type="password"
        className="w-full border rounded px-3 py-2"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="w-full bg-swarcoBlue text-white py-2 rounded">Entrar</button>
    </form>
  );
}
