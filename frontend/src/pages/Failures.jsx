import { useState } from "react";
import { apiRequest } from "../lib/api.js";

export default function Failures({ token, lang = "es" }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState("Media");
  const [message, setMessage] = useState("");
  const copy = {
    es: {
      title: "Reporte de Incidencia",
      labelTitle: "Título",
      labelDesc: "Descripción",
      labelPriority: "Prioridad",
      placeholderTitle: "Título",
      placeholderDesc: "Descripción",
      low: "Baja",
      medium: "Media",
      high: "Alta",
      send: "Enviar",
      ok: "Incidencia enviada."
    },
    en: {
      title: "Incident Report",
      labelTitle: "Title",
      labelDesc: "Description",
      labelPriority: "Priority",
      placeholderTitle: "Title",
      placeholderDesc: "Description",
      low: "Low",
      medium: "Medium",
      high: "High",
      send: "Send",
      ok: "Incident sent."
    },
    it: {
      title: "Segnalazione Incidente",
      labelTitle: "Titolo",
      labelDesc: "Descrizione",
      labelPriority: "Priorità",
      placeholderTitle: "Titolo",
      placeholderDesc: "Descrizione",
      low: "Bassa",
      medium: "Media",
      high: "Alta",
      send: "Invia",
      ok: "Incidente inviato."
    }
  };
  const t = copy[lang] || copy.en;

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      await apiRequest("/api/failures", "POST", { titulo, descripcion, prioridad }, token);
      setMessage(t.ok);
      setTitulo("");
      setDescripcion("");
      setPrioridad(t.medium);
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold text-swarcoBlue mb-4">{t.title}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full border rounded px-3 py-2" placeholder={t.placeholderTitle} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        <textarea className="w-full border rounded px-3 py-2" rows="4" placeholder={t.placeholderDesc} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <select className="w-full border rounded px-3 py-2" value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
          <option>{t.low}</option>
          <option>{t.medium}</option>
          <option>{t.high}</option>
        </select>
        <button className="bg-swarcoBlue text-white px-4 py-2 rounded">{t.send}</button>
        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
}
