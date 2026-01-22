import { useState } from "react";
import { apiRequest } from "../lib/api.js";
import { useTranslatedMap } from "../lib/i18n.js";

export default function Spares({ token, lang = "es" }) {
  const [repuesto, setRepuesto] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [descripcion, setDescripcion] = useState("");
  const [message, setMessage] = useState("");
  const copy = {
    es: {
      title: "Solicitud de Repuestos",
      newButton: "Nueva solicitud de repuestos",
      placeholderSpare: "Repuesto",
      placeholderDetails: "Detalles",
      send: "Enviar",
      ok: "Solicitud enviada."
    },
    en: {
      title: "Spare Request",
      newButton: "New spares request",
      placeholderSpare: "Spare part",
      placeholderDetails: "Details",
      send: "Send",
      ok: "Request sent."
    },
    it: {
      title: "Richiesta Ricambi",
      newButton: "Nuova richiesta ricambi",
      placeholderSpare: "Ricambio",
      placeholderDetails: "Dettagli",
      send: "Invia",
      ok: "Richiesta inviata."
    }
  };
  const t = useTranslatedMap({ base: copy, lang, cacheKey: "spares" });

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    try {
      await apiRequest("/api/spares", "POST", { repuesto, cantidad, descripcion }, token);
      setMessage(t.ok);
      setRepuesto("");
      setCantidad(1);
      setDescripcion("");
    } catch (err) {
      setMessage(err.message);
    }
  }

  function resetForm() {
    setMessage("");
    setRepuesto("");
    setCantidad(1);
    setDescripcion("");
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
        <input className="w-full border rounded px-3 py-2" placeholder={t.placeholderSpare} value={repuesto} onChange={(e) => setRepuesto(e.target.value)} />
        <input type="number" className="w-full border rounded px-3 py-2" min="1" value={cantidad} onChange={(e) => setCantidad(Number(e.target.value))} />
        <textarea className="w-full border rounded px-3 py-2" rows="3" placeholder={t.placeholderDetails} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        <button className="bg-swarcoBlue text-white px-4 py-2 rounded">{t.send}</button>
        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
}
