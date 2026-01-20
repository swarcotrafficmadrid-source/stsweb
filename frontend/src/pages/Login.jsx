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
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Usuario o Email</label>
        <input
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
          placeholder="usuario@empresa.com"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Contraseña</label>
        <input
          type="password"
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button className="w-full bg-swarcoBlue text-white py-2.5 rounded-lg font-semibold hover:bg-swarcoBlue/90 transition">
        Entrar
      </button>
    </form>
  );
}
