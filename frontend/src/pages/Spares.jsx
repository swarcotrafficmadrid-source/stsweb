import { useState } from "react";
import { apiRequest } from "../lib/api.js";

export default function Spares({ token }) {
  const [repuesto, setRepuesto] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [descripcion, setDescripcion] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      await apiRequest("/api/spares", "POST", { repuesto, cantidad, descripcion }, token);
      setMessage("Solicitud enviada.");
      setRepuesto("");
      setCantidad(1);
      setDescripcion("");
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold text-swarcoBlue mb-4">Solicitud de Repuestos</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full border rounded px-3 py-2" placeholder="Repuesto" value={repuesto} onChange={(e) => setRepuesto(e.target.value)} />
        <input type="number" className="w-full border rounded px-3 py-2" min="1" value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} />
        <textarea className="w-full border rounded px-3 py-2" rows="3" placeholder="Detalles" value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <button className="bg-swarcoBlue text-white px-4 py-2 rounded">Enviar</button>
        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
}
