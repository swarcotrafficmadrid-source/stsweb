import { useState } from "react";
import { apiRequest } from "../lib/api.js";

export default function Failures({ token }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState("Media");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      await apiRequest("/api/failures", "POST", { titulo, descripcion, prioridad }, token);
      setMessage("Incidencia enviada.");
      setTitulo("");
      setDescripcion("");
      setPrioridad("Media");
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold text-swarcoBlue mb-4">Reporte de Incidencia</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full border rounded px-3 py-2" placeholder="Título" value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <textarea className="w-full border rounded px-3 py-2" rows="4" placeholder="Descripción" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <select className="w-full border rounded px-3 py-2" value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
          <option>Baja</option>
          <option>Media</option>
          <option>Alta</option>
        </select>
        <button className="bg-swarcoBlue text-white px-4 py-2 rounded">Enviar</button>
        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
}
