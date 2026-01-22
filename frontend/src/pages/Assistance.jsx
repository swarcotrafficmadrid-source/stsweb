import { useState } from "react";
import { apiRequest } from "../lib/api.js";
import { useTranslatedMap } from "../lib/i18n.js";

export default function Assistance({ token, lang = "es" }) {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [prioridad, setPrioridad] = useState("Media");
  const [message, setMessage] = useState("");
  const copy = {
    es: {
      title: "Solicitud de asistencia",
      newButton: "Nueva asistencia",
      labelTitle: "Título",
      labelDesc: "Descripción",
      labelPriority: "Prioridad",
      placeholderTitle: "Título",
      placeholderDesc: "Descripción",
      low: "Baja",
      medium: "Media",
      high: "Alta",
      send: "Enviar",
      ok: "Solicitud enviada."
    },
    en: {
      title: "Assistance request",
      newButton: "New assistance",
      labelTitle: "Title",
      labelDesc: "Description",
      labelPriority: "Priority",
      placeholderTitle: "Title",
      placeholderDesc: "Description",
      low: "Low",
      medium: "Medium",
      high: "High",
      send: "Send",
      ok: "Request sent."
    },
    it: {
      title: "Richiesta di assistenza",
      newButton: "Nuova assistenza",
      labelTitle: "Titolo",
      labelDesc: "Descrizione",
      labelPriority: "Priorità",
      placeholderTitle: "Titolo",
      placeholderDesc: "Descrizione",
      low: "Bassa",
      medium: "Media",
      high: "Alta",
      send: "Invia",
      ok: "Richiesta inviata."
    }
  };
  const t = useTranslatedMap({ base: copy, lang, cacheKey: "assistance" });

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

  function resetForm() {
    setMessage("");
    setTitulo("");
    setDescripcion("");
    setPrioridad(t.medium);
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h2 className="text-lg font-semibold text-swarcoBlue">{t.title}</h2>
        <button
          type="button"
          className="border border-slate-300 text-slate-700 px-4 py-2 rounded-full hover:border-swarcoOrange/60"
          onClick={resetForm}
        >
          {t.newButton}
        </button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border rounded px-3 py-2"
          placeholder={t.placeholderTitle}
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
        />
        <textarea
          className="w-full border rounded px-3 py-2"
          rows="4"
          placeholder={t.placeholderDesc}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
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
