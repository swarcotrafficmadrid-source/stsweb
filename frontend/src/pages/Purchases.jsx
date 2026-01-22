import { useState } from "react";
import { apiRequest } from "../lib/api.js";
import { useTranslatedMap } from "../lib/i18n.js";

export default function Purchases({ token, lang = "es" }) {
  const [equipo, setEquipo] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [descripcion, setDescripcion] = useState("");
  const [message, setMessage] = useState("");
  const copy = {
    es: {
      title: "Solicitud de Compras",
      building: "Página en creación.",
      placeholderEquipment: "Equipo",
      placeholderDetails: "Detalles",
      send: "Enviar",
      ok: "Solicitud enviada."
    },
    en: {
      title: "Purchase Request",
      building: "Page under construction.",
      placeholderEquipment: "Equipment",
      placeholderDetails: "Details",
      send: "Send",
      ok: "Request sent."
    },
    it: {
      title: "Richiesta Acquisto",
      building: "Pagina in creazione.",
      placeholderEquipment: "Attrezzatura",
      placeholderDetails: "Dettagli",
      send: "Invia",
      ok: "Richiesta inviata."
    }
  };
  const t = useTranslatedMap({ base: copy, lang, cacheKey: "purchases" });

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      await apiRequest("/api/purchases", "POST", { equipo, cantidad, descripcion }, token);
      setMessage(t.ok);
      setEquipo("");
      setCantidad(1);
      setDescripcion("");
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h2 className="text-lg font-semibold text-swarcoBlue">{t.title}</h2>
      <p className="text-sm text-slate-500 mt-1 mb-4">{t.building}</p>
      <form onSubmit={handleSubmit} className="space-y-4 opacity-60 pointer-events-none">
        <input className="w-full border rounded px-3 py-2" placeholder={t.placeholderEquipment} value={equipo} onChange={(e) => setEquipo(e.target.value)} />
        <input type="number" className="w-full border rounded px-3 py-2" min="1" value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} />
        <textarea className="w-full border rounded px-3 py-2" rows="3" placeholder={t.placeholderDetails} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <button className="bg-swarcoBlue text-white px-4 py-2 rounded">{t.send}</button>
        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
}
