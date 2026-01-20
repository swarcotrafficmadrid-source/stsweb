import { useTranslatedMap } from "../lib/i18n.js";

export default function Dashboard({ lang = "es" }) {
  const copy = {
    es: {
      title: "Bienvenido",
      body: "Usa el menú superior para crear una incidencia o solicitar repuestos y compras."
    },
    en: {
      title: "Welcome",
      body: "Use the top menu to create an incident or request spares and purchases."
    },
    it: {
      title: "Benvenuto",
      body: "Usa il menu in alto per creare un incidente o richiedere ricambi e acquisti."
    }
  };
  const t = useTranslatedMap({ base: copy, lang, cacheKey: "dashboard" });

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-lg font-semibold text-swarcoBlue mb-2">{t.title}</h2>
      <p className="text-sm text-slate-600">{t.body}</p>
    </div>
  );
}
