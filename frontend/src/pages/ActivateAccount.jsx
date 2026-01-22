import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api.js";
import { useTranslatedMap } from "../lib/i18n.js";

const COUNTRIES = [
  { code: "ES", name: "España", nameEs: "España", dial: "+34" },
  { code: "FR", name: "France", nameEs: "Francia", dial: "+33" },
  { code: "DE", name: "Deutschland", nameEs: "Alemania", dial: "+49" },
  { code: "IT", name: "Italia", nameEs: "Italia", dial: "+39" },
  { code: "PT", name: "Portugal", nameEs: "Portugal", dial: "+351" },
  { code: "GB", name: "United Kingdom", nameEs: "Reino Unido", dial: "+44" },
  { code: "US", name: "United States", nameEs: "Estados Unidos", dial: "+1" },
  { code: "MX", name: "México", nameEs: "México", dial: "+52" },
  { code: "AR", name: "Argentina", nameEs: "Argentina", dial: "+54" },
  { code: "CO", name: "Colombia", nameEs: "Colombia", dial: "+57" },
  { code: "CL", name: "Chile", nameEs: "Chile", dial: "+56" },
  { code: "PE", name: "Perú", nameEs: "Perú", dial: "+51" }
];

function findCountryByEs(nameEs) {
  return COUNTRIES.find((item) => item.nameEs === nameEs) || COUNTRIES[0];
}

export default function ActivateAccount({ token, lang = "es", onBack }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [pais, setPais] = useState("ES");
  const [telefono, setTelefono] = useState("");
  const [cargo, setCargo] = useState("");
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const copy = {
    es: {
      title: "Revisa tus datos",
      desc: "Confirma que la información es correcta antes de activar tu cuenta.",
      nombre: "Nombre",
      apellidos: "Apellidos",
      email: "Email de trabajo",
      empresa: "Empresa",
      pais: "País",
      telefono: "Teléfono",
      cargo: "Cargo",
      cargoOptions: ["Técnico", "Encargado", "Otro"],
      legalText: "He leído y acepto la política de protección de datos.",
      legalLink: "Ver política",
      legalRequired: "Debes aceptar la política para activar la cuenta.",
      invalidToken: "Enlace inválido o expirado.",
      confirm: "Confirmar y activar",
      loading: "Cargando datos...",
      success: "Cuenta activada. Ya puedes iniciar sesión.",
      back: "Ir a login"
    },
    en: {
      title: "Review your data",
      desc: "Confirm your information before activating your account.",
      nombre: "Name",
      apellidos: "Surname",
      email: "Work email",
      empresa: "Company",
      pais: "Country",
      telefono: "Phone",
      cargo: "Role",
      cargoOptions: ["Technician", "Supervisor", "Other"],
      legalText: "I have read and accept the data protection policy.",
      legalLink: "View policy",
      legalRequired: "You must accept the policy to activate the account.",
      invalidToken: "Invalid or expired link.",
      confirm: "Confirm & activate",
      loading: "Loading data...",
      success: "Account activated. You can sign in now.",
      back: "Go to login"
    },
    it: {
      title: "Verifica i tuoi dati",
      desc: "Conferma le informazioni prima di attivare l'account.",
      nombre: "Nome",
      apellidos: "Cognome",
      email: "Email di lavoro",
      empresa: "Azienda",
      pais: "Paese",
      telefono: "Telefono",
      cargo: "Ruolo",
      cargoOptions: ["Tecnico", "Responsabile", "Altro"],
      legalText: "Ho letto e accetto la politica di protezione dei dati.",
      legalLink: "Vedi policy",
      legalRequired: "Devi accettare la policy per attivare l'account.",
      invalidToken: "Link non valido o scaduto.",
      confirm: "Conferma e attiva",
      loading: "Caricamento dati...",
      success: "Account attivato. Ora puoi accedere.",
      back: "Vai al login"
    }
  };
  const t = useTranslatedMap({ base: copy, lang, cacheKey: "activate" });

  const country = useMemo(
    () => COUNTRIES.find((item) => item.code === pais) || COUNTRIES[0],
    [pais]
  );

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const data = await apiRequest(`/api/auth/verify-info?token=${encodeURIComponent(token)}`);
        if (!isMounted) return;
        setNombre(data.nombre || "");
        setApellidos(data.apellidos || "");
        setEmail(data.email || "");
        setEmpresa(data.empresa || "");
        const current = findCountryByEs(data.pais || "España");
        setPais(current.code);
        const tel = (data.telefono || "").replace(/^\+\d+\s*/, "");
        setTelefono(tel);
        setCargo(data.cargo || "");
      } catch (err) {
        if (!isMounted) return;
        setError(err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    if (token) {
      load();
    } else {
      setError("Token inválido");
      setLoading(false);
    }
    return () => {
      isMounted = false;
    };
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!legalAccepted) {
      setError(t.legalRequired);
      return;
    }
    setSaving(true);
    try {
      await apiRequest("/api/auth/verify-confirm", "POST", {
        token,
        nombre,
        apellidos,
        empresa,
        pais: country.nameEs,
        telefono: `${country.dial} ${telefono}`.trim(),
        cargo: cargo === "Technician" ? "Técnico" : cargo === "Supervisor" ? "Encargado" : cargo === "Other" ? "Otro" : cargo
      });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-500">{t.loading}</p>;
  }

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-red-600">{t.invalidToken}</p>
        <button
          type="button"
          className="w-full bg-swarcoOrange text-white py-2.5 rounded-full font-semibold hover:bg-swarcoOrange/90 transition"
          onClick={onBack}
        >
          {t.back}
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-lg font-semibold text-swarcoBlue">{t.success}</p>
        <button
          type="button"
          className="w-full bg-swarcoOrange text-white py-2.5 rounded-full font-semibold hover:bg-swarcoOrange/90 transition"
          onClick={onBack}
        >
          {t.back}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-2xl font-semibold text-slate-800">{t.title}</h3>
        <p className="text-sm text-slate-500">{t.desc}</p>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t.nombre}</label>
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t.apellidos}</label>
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">{t.email}</label>
          <input
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 bg-slate-50"
            value={email}
            readOnly
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t.empresa}</label>
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
            value={empresa}
            onChange={(e) => setEmpresa(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t.cargo}</label>
          <select
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
            value={cargo}
            onChange={(e) => setCargo(e.target.value)}
          >
            <option value="">{t.cargo}</option>
            {t.cargoOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">{t.pais}</label>
          <select
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
            value={pais}
            onChange={(e) => setPais(e.target.value)}
          >
            {COUNTRIES.map((item) => (
              <option key={item.code} value={item.code}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-700">{t.telefono}</label>
          <div className="flex gap-2">
            <input
              className="w-24 border border-slate-300 rounded-lg px-2 py-2.5 text-sm bg-slate-100"
              value={country.dial}
              readOnly
            />
            <input
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
        </div>
      </div>
      <label className="flex items-start gap-2 text-sm text-slate-600">
        <input
          type="checkbox"
          className="mt-1"
          checked={legalAccepted}
          onChange={(e) => setLegalAccepted(e.target.checked)}
        />
        <span>
          {t.legalText}{" "}
          <a
            className="text-swarcoBlue hover:underline"
            href="https://www.swarco.com/privacy-policy"
            target="_blank"
            rel="noreferrer"
          >
            {t.legalLink}
          </a>
        </span>
      </label>
      <button
        className="w-full bg-swarcoBlue text-white py-2.5 rounded-full font-semibold hover:bg-swarcoBlue/90 transition disabled:opacity-70"
        disabled={saving}
      >
        {saving ? t.loading : t.confirm}
      </button>
    </form>
  );
}
