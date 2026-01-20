import { useState } from "react";
import { apiRequest } from "../lib/api.js";

export default function Register({ onSuccess }) {
  const [usuario, setUsuario] = useState("");
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setResult("");
    try {
      await apiRequest("/api/auth/register", "POST", {
        usuario,
        nombre,
        email,
        password
      });
      setResult("Usuario creado. Ya puedes iniciar sesión.");
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setResult(err.message);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input className="w-full border rounded px-3 py-2" placeholder="Usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
      <input className="w-full border rounded px-3 py-2" placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} />
      <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" className="w-full border rounded px-3 py-2" placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="w-full bg-swarcoBlue text-white py-2 rounded">Registrar</button>
      {result && <p className="text-sm text-gray-700">{result}</p>}
    </form>
  );
}
