import { useEffect, useMemo, useState } from "react";
import { apiRequest } from "../lib/api.js";
import { useTranslatedMap } from "../lib/i18n.js";
import ClientTicketTimeline from "../components/ClientTicketTimeline.jsx";

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

export default function Dashboard({ token, lang = "es", activeTab = "home", onTabChange, onAuthError, onNavigate }) {
  const [tab, setTab] = useState(activeTab);
  const [profile, setProfile] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [spares, setSpares] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [showIncidents, setShowIncidents] = useState(true);
  const [showSpares, setShowSpares] = useState(false);
  const [showPurchases, setShowPurchases] = useState(false);
  const [incidentQuery, setIncidentQuery] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assistance, setAssistance] = useState([]);

  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [pais, setPais] = useState("ES");
  const [telefono, setTelefono] = useState("");
  const [cargo, setCargo] = useState("");

  const copy = {
    es: {
      welcome: "Bienvenido",
      intro: "Acceso seguro para incidencias, repuestos y compras.",
      homeTab: "Inicio",
      accountTab: "Mi cuenta",
      profileTitle: "Mis datos",
      requestsTitle: "Mis solicitudes",
      accountTitle: "Mi cuenta",
      accountSubtitle: "Gestiona tus datos y el estado de tus solicitudes.",
      quickActionsTitle: "Accesos rápidos",
      ctaIncidents: "Registrar nueva incidencia",
      ctaSpares: "Nueva solicitud de repuestos",
      ctaPurchases: "Nueva solicitud de compra",
      ctaAssistance: "Nueva asistencia",
      detailsToggle: "Ver mis datos",
      detailsHide: "Ocultar mis datos",
      emailLabel: "Email",
      nombre: "Nombre",
      apellidos: "Apellidos",
      empresa: "Empresa",
      pais: "País",
      telefono: "Teléfono",
      cargo: "Cargo",
      cargoOptions: ["Técnico", "Encargado", "Otro"],
      save: "Guardar cambios",
      saved: "Datos actualizados.",
      incidentsTitle: "Incidencias",
      assistanceTitle: "Asistencia",
      sparesTitle: "Repuestos",
      purchasesTitle: "Compras",
      ticketLabel: "Ticket",
      searchPlaceholder: "Buscar por ticket, título o estado",
      assistanceEmpty: "Sin solicitudes de asistencia todavía.",
      ticketStatusTitle: "Estado del ticket",
      ticketStatusHint: "Aquí podrás ver el progreso del ticket cuando esté disponible.",
      ticketSelectHint: "Selecciona un ticket para ver su progreso.",
      backToList: "Volver a la lista",
      titleLabel: "Título",
      spareLabel: "Repuesto",
      equipmentLabel: "Equipo",
      status: "Estado",
      createdAt: "Fecha",
      empty: "Sin registros todavía.",
      active: "Activas",
      history: "Historial",
      requested: "Solicitados",
      delivered: "Entregados",
      show: "Ver detalles",
      hide: "Ocultar detalles",
      total: "Total",
      backToList: "Volver a la lista"
    },
    en: {
      welcome: "Welcome",
      intro: "Secure access for incidents, spares, and purchases.",
      homeTab: "Home",
      accountTab: "My account",
      profileTitle: "My details",
      requestsTitle: "My requests",
      accountTitle: "My account",
      accountSubtitle: "Manage your details and request status.",
      quickActionsTitle: "Quick actions",
      ctaIncidents: "Register new incident",
      ctaSpares: "New spares request",
      ctaPurchases: "New purchase request",
      ctaAssistance: "New assistance",
      detailsToggle: "View my details",
      detailsHide: "Hide my details",
      emailLabel: "Email",
      nombre: "Name",
      apellidos: "Surname",
      empresa: "Company",
      pais: "Country",
      telefono: "Phone",
      cargo: "Role",
      cargoOptions: ["Technician", "Supervisor", "Other"],
      save: "Save changes",
      saved: "Details updated.",
      incidentsTitle: "Incidents",
      assistanceTitle: "Assistance",
      sparesTitle: "Spares",
      purchasesTitle: "Purchases",
      ticketLabel: "Ticket",
      searchPlaceholder: "Search by ticket, title, or status",
      assistanceEmpty: "No assistance requests yet.",
      ticketStatusTitle: "Ticket status",
      ticketStatusHint: "You will see the ticket progress here when it is available.",
      ticketSelectHint: "Select a ticket to view its progress.",
      titleLabel: "Title",
      spareLabel: "Spare",
      equipmentLabel: "Equipment",
      status: "Status",
      createdAt: "Date",
      empty: "No records yet.",
      active: "Active",
      history: "History",
      requested: "Requested",
      delivered: "Delivered",
      show: "Show details",
      hide: "Hide details",
      total: "Total"
    },
    it: {
      welcome: "Benvenuto",
      intro: "Accesso sicuro per incidenti, ricambi e acquisti.",
      homeTab: "Home",
      accountTab: "Il mio account",
      profileTitle: "I miei dati",
      requestsTitle: "Le mie richieste",
      accountTitle: "Il mio account",
      accountSubtitle: "Gestisci i tuoi dati e lo stato delle richieste.",
      quickActionsTitle: "Azioni rapide",
      ctaIncidents: "Registra nuova segnalazione",
      ctaSpares: "Nuova richiesta ricambi",
      ctaPurchases: "Nuova richiesta acquisto",
      ctaAssistance: "Nuova assistenza",
      detailsToggle: "Mostra i miei dati",
      detailsHide: "Nascondi i miei dati",
      emailLabel: "Email",
      nombre: "Nome",
      apellidos: "Cognome",
      empresa: "Azienda",
      pais: "Paese",
      telefono: "Telefono",
      cargo: "Ruolo",
      cargoOptions: ["Tecnico", "Responsabile", "Altro"],
      save: "Salva modifiche",
      saved: "Dati aggiornati.",
      incidentsTitle: "Incidenti",
      assistanceTitle: "Assistenza",
      sparesTitle: "Ricambi",
      purchasesTitle: "Acquisti",
      ticketLabel: "Ticket",
      searchPlaceholder: "Cerca per ticket, titolo o stato",
      assistanceEmpty: "Nessuna richiesta di assistenza.",
      ticketStatusTitle: "Stato del ticket",
      ticketStatusHint: "Qui potrai vedere l'avanzamento del ticket quando sarà disponibile.",
      ticketSelectHint: "Seleziona un ticket per vedere l'avanzamento.",
      titleLabel: "Titolo",
      spareLabel: "Ricambio",
      equipmentLabel: "Attrezzatura",
      status: "Stato",
      createdAt: "Data",
      empty: "Nessun record.",
      active: "Attive",
      history: "Storico",
      requested: "Richiesti",
      delivered: "Consegnati",
      show: "Mostra dettagli",
      hide: "Nascondi dettagli",
      total: "Totale"
    }
  };
  const t = useTranslatedMap({ base: copy, lang, cacheKey: "dashboard" });
  const baseCopy = copy[lang] || copy.es;
  const cargoOptions = Array.isArray(t.cargoOptions) ? t.cargoOptions : baseCopy.cargoOptions;

  useEffect(() => {
    setTab(activeTab);
  }, [activeTab]);

  const country = useMemo(
    () => COUNTRIES.find((item) => item.code === pais) || COUNTRIES[0],
    [pais]
  );

  useEffect(() => {
    async function load() {
      try {
        const me = await apiRequest("/api/auth/me", "GET", null, token);
        setProfile(me);
        setNombre(me.nombre || "");
        setApellidos(me.apellidos || "");
        setEmpresa(me.empresa || "");
        const current = findCountryByEs(me.pais || "España");
        setPais(current.code);
        const tel = (me.telefono || "").replace(/^\+\d+\s*/, "");
        setTelefono(tel);
        setCargo(me.cargo || "");
        const [inc, rep, pur, ass] = await Promise.all([
          apiRequest("/api/failures", "GET", null, token),
          apiRequest("/api/spares", "GET", null, token),
          apiRequest("/api/purchases", "GET", null, token),
          apiRequest("/api/assistance", "GET", null, token)
        ]);
        setIncidents(inc || []);
        setSpares(rep || []);
        setPurchases(pur || []);
        setAssistance(ass || []);
        setLoadError("");
      } catch (err) {
        const msg = err?.message || "";
        setLoadError(msg || "Error");
        if (msg.toLowerCase().includes("token") && onAuthError) {
          onAuthError();
        }
      }
    }
    if (token) {
      load();
    }
  }, [token]);

  async function handleSave(e) {
    e.preventDefault();
    setMessage("");
    setSaving(true);
    try {
      const payload = {
        nombre,
        apellidos,
        empresa,
        pais: country.nameEs,
        telefono: `${country.dial} ${telefono}`.trim(),
        cargo: cargo === "Technician" ? "Técnico" : cargo === "Supervisor" ? "Encargado" : cargo === "Other" ? "Otro" : cargo
      };
      const data = await apiRequest("/api/auth/me", "PUT", payload, token);
      setProfile(data.user);
      setMessage(t.saved);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  const welcomeName = profile?.nombre ? `${profile.nombre}` : "";
  const incidentsActive = incidents.filter((item) => (item.estado || "Abierto") !== "Cerrado");
  const incidentsHistory = incidents.filter((item) => (item.estado || "Abierto") === "Cerrado");
  const sparesRequested = spares.filter((item) => (item.estado || "Pendiente") !== "Entregado");
  const sparesDelivered = spares.filter((item) => (item.estado || "Pendiente") === "Entregado");
  const purchasesRequested = purchases.filter((item) => (item.estado || "Pendiente") !== "Entregado");
  const purchasesDelivered = purchases.filter((item) => (item.estado || "Pendiente") === "Entregado");
  const filteredIncidents = incidents.filter((item) => {
    const q = incidentQuery.trim().toLowerCase();
    if (!q) return true;
    const ticket = `inc-${String(item.id).padStart(6, "0")}`;
    const title = (item.titulo || "").toLowerCase();
    const status = (item.estado || "").toLowerCase();
    return ticket.includes(q) || title.includes(q) || status.includes(q);
  });

  function getTicketNumber(id) {
    return `INC-${String(id).padStart(6, "0")}`;
  }

  function handleTab(value) {
    setTab(value);
    if (onTabChange) onTabChange(value);
  }

  return (
    <div className="space-y-6">
      {loadError && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {loadError}
        </div>
      )}
      <div
        className="rounded-2xl overflow-hidden border border-slate-200"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(0,107,171,0.55) 0%, rgba(0,107,171,0.6) 100%), url('/hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="p-8 text-white">
          <h2 className="text-2xl font-semibold">
            {t.welcome}{welcomeName ? `, ${welcomeName}` : ""}
          </h2>
          <div className="mt-3 h-1 w-12 rounded-full bg-swarcoOrange" />
          <p className="text-white/90 mt-2">{t.intro}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            tab === "home"
              ? "bg-swarcoBlue text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:border-swarcoOrange/60"
          }`}
          onClick={() => handleTab("home")}
        >
          {t.homeTab}
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            tab === "incidents"
              ? "bg-swarcoBlue text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:border-swarcoOrange/60"
          }`}
          onClick={() => handleTab("incidents")}
        >
          {t.incidentsTitle}
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            tab === "spares"
              ? "bg-swarcoBlue text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:border-swarcoOrange/60"
          }`}
          onClick={() => handleTab("spares")}
        >
          {t.sparesTitle}
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            tab === "assistance"
              ? "bg-swarcoBlue text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:border-swarcoOrange/60"
          }`}
          onClick={() => handleTab("assistance")}
        >
          {t.assistanceTitle}
        </button>
        <button
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            tab === "purchases"
              ? "bg-swarcoBlue text-white shadow-sm"
              : "bg-white border border-slate-200 text-slate-600 hover:border-swarcoOrange/60"
          }`}
          onClick={() => handleTab("purchases")}
        >
          {t.purchasesTitle}
        </button>
      </div>

      {tab === "home" ? (
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-swarcoBlue">{t.profileTitle}</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div><strong>{t.empresa}:</strong> {profile?.empresa || "-"}</div>
                <div><strong>{t.telefono}:</strong> {profile?.telefono || "-"}</div>
                <div><strong>{t.cargo}:</strong> {profile?.cargo || "-"}</div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-swarcoBlue">{t.requestsTitle}</h3>
              <p className="text-sm text-slate-500 mt-2">
                {t.incidentsTitle}: {incidents.length} · {t.sparesTitle}: {spares.length} · {t.purchasesTitle}: {purchases.length}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-swarcoBlue mb-4">{t.quickActionsTitle}</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <button
                type="button"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left hover:border-swarcoOrange/60 hover:shadow-sm"
                onClick={() => onNavigate && onNavigate("failures")}
              >
                <div>
                  <p className="text-sm text-slate-500">{t.incidentsTitle}</p>
                  <p className="text-base font-semibold text-slate-800">{t.ctaIncidents}</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-swarcoBlue border border-slate-200 group-hover:border-swarcoOrange/50">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 3v6m0 6v6M3 12h6m6 0h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              <button
                type="button"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left hover:border-swarcoOrange/60 hover:shadow-sm"
                onClick={() => onNavigate && onNavigate("spares")}
              >
                <div>
                  <p className="text-sm text-slate-500">{t.sparesTitle}</p>
                  <p className="text-base font-semibold text-slate-800">{t.ctaSpares}</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-swarcoBlue border border-slate-200 group-hover:border-swarcoOrange/50">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M4 7h16M6 7v10a2 2 0 002 2h8a2 2 0 002-2V7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M9 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              <button
                type="button"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-5 py-4 text-left hover:border-swarcoOrange/60 hover:shadow-sm"
                onClick={() => onNavigate && onNavigate("purchases")}
              >
                <div>
                  <p className="text-sm text-slate-500">{t.purchasesTitle}</p>
                  <p className="text-base font-semibold text-slate-800">{t.ctaPurchases}</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-swarcoBlue border border-slate-200 group-hover:border-swarcoOrange/50">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M6 7h12l-1 12H7L6 7z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M9 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
              <button
                type="button"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-left hover:border-swarcoOrange/60 hover:shadow-sm"
                onClick={() => onNavigate && onNavigate("assistance")}
              >
                <div>
                  <p className="text-sm text-slate-500">{t.assistanceTitle}</p>
                  <p className="text-base font-semibold text-slate-800">{t.ctaAssistance}</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white text-swarcoBlue border border-slate-200 group-hover:border-swarcoOrange/50">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M12 6a3 3 0 00-3 3v4a3 3 0 006 0V9a3 3 0 00-3-3z" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 13a4 4 0 008 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M12 17v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : tab === "account" ? (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-2xl font-semibold text-swarcoBlue">{t.accountTitle}</h2>
            <p className="text-sm text-slate-500 mt-1">{t.accountSubtitle}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-swarcoBlue">{t.profileTitle}</h3>
              <button
                type="button"
                className="text-sm text-swarcoBlue hover:text-swarcoBlue/80"
                onClick={() => setShowProfile((prev) => !prev)}
              >
                {showProfile ? t.detailsHide : t.detailsToggle}
              </button>
            </div>
            {showProfile && (
              <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm text-slate-600">{t.nombre}</label>
                <input className="w-full border border-slate-300 rounded-lg px-3 py-2.5" value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-600">{t.apellidos}</label>
                <input className="w-full border border-slate-300 rounded-lg px-3 py-2.5" value={apellidos} onChange={(e) => setApellidos(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-600">{t.empresa}</label>
                <input className="w-full border border-slate-300 rounded-lg px-3 py-2.5" value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-600">{t.cargo}</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white" value={cargo} onChange={(e) => setCargo(e.target.value)}>
                  <option value="">{t.cargo}</option>
                  {cargoOptions.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-600">{t.pais}</label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white" value={pais} onChange={(e) => setPais(e.target.value)}>
                  {COUNTRIES.map((item) => (
                    <option key={item.code} value={item.code}>{item.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-600">{t.telefono}</label>
                <div className="flex gap-2">
                  <input className="w-24 border border-slate-300 rounded-lg px-2 py-2.5 bg-slate-100" value={country.dial} readOnly />
                  <input className="flex-1 border border-slate-300 rounded-lg px-3 py-2.5" value={telefono} onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))} inputMode="numeric" />
                </div>
              </div>
              <div className="md:col-span-2">
                <button className="bg-swarcoBlue text-white px-6 py-2.5 rounded-full font-semibold" disabled={saving}>
                  {t.save}
                </button>
                {message && <span className="ml-4 text-sm text-slate-500">{message}</span>}
              </div>
              </form>
            )}
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-swarcoBlue mb-4">{t.requestsTitle}</h3>
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-slate-700">{t.incidentsTitle}</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      {t.active}: {incidentsActive.length} · {t.history}: {incidentsHistory.length} · {t.total}: {incidents.length}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-swarcoBlue hover:text-swarcoBlue/80"
                    onClick={() => setShowIncidents((prev) => !prev)}
                  >
                    {showIncidents ? t.hide : t.show}
                  </button>
                </div>
                {showIncidents && (
                  <div className="mt-4 space-y-6">
                    <div>
                      <h5 className="text-sm font-semibold text-slate-600 mb-2">{t.active}</h5>
                      {incidentsActive.length === 0 ? (
                        <p className="text-sm text-slate-500">{t.empty}</p>
                      ) : (
                        <div className="overflow-auto">
                          <table className="w-full text-sm">
                            <thead className="text-slate-500">
                              <tr>
                          <th className="text-left py-2">{t.ticketLabel}</th>
                                <th className="text-left py-2">{t.titleLabel}</th>
                                <th className="text-left py-2">{t.status}</th>
                                <th className="text-left py-2">{t.createdAt}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {incidentsActive.map((item) => (
                                <tr key={item.id} className="border-t border-slate-100">
                            <td className="py-2">{getTicketNumber(item.id)}</td>
                                  <td className="py-2">{item.titulo}</td>
                                  <td className="py-2">{item.estado || "Abierto"}</td>
                                  <td className="py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-slate-600 mb-2">{t.history}</h5>
                      {incidentsHistory.length === 0 ? (
                        <p className="text-sm text-slate-500">{t.empty}</p>
                      ) : (
                        <div className="overflow-auto">
                          <table className="w-full text-sm">
                            <thead className="text-slate-500">
                              <tr>
                          <th className="text-left py-2">{t.ticketLabel}</th>
                                <th className="text-left py-2">{t.titleLabel}</th>
                                <th className="text-left py-2">{t.status}</th>
                                <th className="text-left py-2">{t.createdAt}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {incidentsHistory.map((item) => (
                                <tr key={item.id} className="border-t border-slate-100">
                            <td className="py-2">{getTicketNumber(item.id)}</td>
                                  <td className="py-2">{item.titulo}</td>
                                  <td className="py-2">{item.estado || "Cerrado"}</td>
                                  <td className="py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-slate-700">{t.sparesTitle}</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      {t.requested}: {sparesRequested.length} · {t.delivered}: {sparesDelivered.length} · {t.total}: {spares.length}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-swarcoBlue hover:text-swarcoBlue/80"
                    onClick={() => setShowSpares((prev) => !prev)}
                  >
                    {showSpares ? t.hide : t.show}
                  </button>
                </div>
                {showSpares && (
                  <div className="mt-4 space-y-6">
                    <div>
                      <h5 className="text-sm font-semibold text-slate-600 mb-2">{t.requested}</h5>
                      {sparesRequested.length === 0 ? (
                        <p className="text-sm text-slate-500">{t.empty}</p>
                      ) : (
                        <div className="overflow-auto">
                          <table className="w-full text-sm">
                            <thead className="text-slate-500">
                              <tr>
                                <th className="text-left py-2">#</th>
                                <th className="text-left py-2">{t.spareLabel}</th>
                                <th className="text-left py-2">{t.status}</th>
                                <th className="text-left py-2">{t.createdAt}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sparesRequested.map((item) => (
                                <tr key={item.id} className="border-t border-slate-100">
                                  <td className="py-2">{item.id}</td>
                                  <td className="py-2">{item.repuesto}</td>
                                  <td className="py-2">{item.estado || "Pendiente"}</td>
                                  <td className="py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-slate-600 mb-2">{t.delivered}</h5>
                      {sparesDelivered.length === 0 ? (
                        <p className="text-sm text-slate-500">{t.empty}</p>
                      ) : (
                        <div className="overflow-auto">
                          <table className="w-full text-sm">
                            <thead className="text-slate-500">
                              <tr>
                                <th className="text-left py-2">#</th>
                                <th className="text-left py-2">{t.spareLabel}</th>
                                <th className="text-left py-2">{t.status}</th>
                                <th className="text-left py-2">{t.createdAt}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {sparesDelivered.map((item) => (
                                <tr key={item.id} className="border-t border-slate-100">
                                  <td className="py-2">{item.id}</td>
                                  <td className="py-2">{item.repuesto}</td>
                                  <td className="py-2">{item.estado || "Entregado"}</td>
                                  <td className="py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-base font-semibold text-slate-700">{t.purchasesTitle}</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      {t.requested}: {purchasesRequested.length} · {t.delivered}: {purchasesDelivered.length} · {t.total}: {purchases.length}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-sm text-swarcoBlue hover:text-swarcoBlue/80"
                    onClick={() => setShowPurchases((prev) => !prev)}
                  >
                    {showPurchases ? t.hide : t.show}
                  </button>
                </div>
                {showPurchases && (
                  <div className="mt-4 space-y-6">
                    <div>
                      <h5 className="text-sm font-semibold text-slate-600 mb-2">{t.requested}</h5>
                      {purchasesRequested.length === 0 ? (
                        <p className="text-sm text-slate-500">{t.empty}</p>
                      ) : (
                        <div className="overflow-auto">
                          <table className="w-full text-sm">
                            <thead className="text-slate-500">
                              <tr>
                                <th className="text-left py-2">#</th>
                                <th className="text-left py-2">{t.equipmentLabel}</th>
                                <th className="text-left py-2">{t.status}</th>
                                <th className="text-left py-2">{t.createdAt}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {purchasesRequested.map((item) => (
                                <tr 
                                  key={item.id} 
                                  className="border-t border-slate-100 cursor-pointer hover:bg-slate-50"
                                  onClick={() => setSelectedTicket({ ...item, type: "purchase" })}
                                >
                                  <td className="py-2">COM-{String(item.id).padStart(6, "0")}</td>
                                  <td className="py-2">{item.equipo}</td>
                                  <td className="py-2">{item.estado || "Pendiente"}</td>
                                  <td className="py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                    <div>
                      <h5 className="text-sm font-semibold text-slate-600 mb-2">{t.delivered}</h5>
                      {purchasesDelivered.length === 0 ? (
                        <p className="text-sm text-slate-500">{t.empty}</p>
                      ) : (
                        <div className="overflow-auto">
                          <table className="w-full text-sm">
                            <thead className="text-slate-500">
                              <tr>
                                <th className="text-left py-2">#</th>
                                <th className="text-left py-2">{t.equipmentLabel}</th>
                                <th className="text-left py-2">{t.status}</th>
                                <th className="text-left py-2">{t.createdAt}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {purchasesDelivered.map((item) => (
                                <tr key={item.id} className="border-t border-slate-100">
                                  <td className="py-2">{item.id}</td>
                                  <td className="py-2">{item.equipo}</td>
                                  <td className="py-2">{item.estado || "Entregado"}</td>
                                  <td className="py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Timeline para purchases */}
              {selectedTicket && selectedTicket.type === "purchase" && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <button
                    onClick={() => setSelectedTicket(null)}
                    className="mb-4 text-sm text-swarcoBlue hover:text-swarcoBlue/80 flex items-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {t.backToList}
                  </button>
                  <ClientTicketTimeline
                    token={token}
                    ticketId={selectedTicket.id}
                    ticketType="purchase"
                    lang={lang}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : tab === "incidents" ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-swarcoBlue">{t.incidentsTitle}</h3>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="border border-slate-300 text-slate-700 px-4 py-2 rounded-full hover:border-swarcoOrange/60"
                onClick={() => onNavigate && onNavigate("failures")}
              >
                {t.ctaIncidents}
              </button>
              <input
                className="w-full md:w-72 border border-slate-300 rounded-full px-4 py-2 text-sm"
                placeholder={t.searchPlaceholder}
                value={incidentQuery}
                onChange={(e) => setIncidentQuery(e.target.value)}
              />
            </div>
          </div>
          {filteredIncidents.length === 0 ? (
            <p className="text-sm text-slate-500">{t.empty}</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="text-left py-2">{t.ticketLabel}</th>
                    <th className="text-left py-2">{t.titleLabel}</th>
                    <th className="text-left py-2">{t.status}</th>
                    <th className="text-left py-2">{t.createdAt}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIncidents.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-100 cursor-pointer hover:bg-slate-50"
                      onClick={() => setSelectedTicket(item)}
                    >
                      <td className="py-2">{getTicketNumber(item.id)}</td>
                      <td className="py-2">{item.titulo}</td>
                      <td className="py-2">{item.estado || "Abierto"}</td>
                      <td className="py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {selectedTicket ? (
            <div className="mt-4">
              <button
                onClick={() => setSelectedTicket(null)}
                className="mb-4 text-sm text-swarcoBlue hover:text-swarcoBlue/80 flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t.backToList}
              </button>
              <ClientTicketTimeline
                token={token}
                ticketId={selectedTicket.id}
                ticketType="failure"
                lang={lang}
              />
            </div>
          ) : (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <h4 className="text-sm font-semibold text-slate-700">{t.ticketStatusTitle}</h4>
              <p className="text-sm text-slate-500 mt-1">{t.ticketSelectHint}</p>
              <p className="text-xs text-slate-400 mt-2">{t.ticketStatusHint}</p>
            </div>
          )}
        </div>
      ) : tab === "assistance" ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-swarcoBlue">{t.assistanceTitle}</h3>
            <button
              type="button"
              className="border border-slate-300 text-slate-700 px-4 py-2 rounded-full hover:border-swarcoOrange/60"
              onClick={() => onNavigate && onNavigate("assistance")}
            >
              {t.ctaAssistance}
            </button>
          </div>
          {assistance.length === 0 ? (
            <p className="text-sm text-slate-500">{t.assistanceEmpty}</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="text-left py-2">{t.ticketLabel}</th>
                    <th className="text-left py-2">{t.titleLabel}</th>
                    <th className="text-left py-2">{t.status}</th>
                    <th className="text-left py-2">{t.createdAt}</th>
                  </tr>
                </thead>
                <tbody>
                  {assistance.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-slate-100 cursor-pointer hover:bg-slate-50"
                      onClick={() => setSelectedTicket({ ...item, type: "assistance" })}
                    >
                      <td className="py-2">ASI-{String(item.id).padStart(6, "0")}</td>
                      <td className="py-2">{item.tipo}</td>
                      <td className="py-2">Pendiente</td>
                      <td className="py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {selectedTicket && selectedTicket.type === "assistance" && (
            <div className="mt-4">
              <button
                onClick={() => setSelectedTicket(null)}
                className="mb-4 text-sm text-swarcoBlue hover:text-swarcoBlue/80 flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {t.backToList}
              </button>
              <ClientTicketTimeline
                token={token}
                ticketId={selectedTicket.id}
                ticketType="assistance"
                lang={lang}
              />
            </div>
          )}
        </div>
      ) : tab === "spares" ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-swarcoBlue">{t.sparesTitle}</h3>
            <button
              type="button"
              className="border border-slate-300 text-slate-700 px-4 py-2 rounded-full hover:border-swarcoOrange/60"
              onClick={() => onNavigate && onNavigate("spares")}
            >
              {t.ctaSpares}
            </button>
          </div>
          {spares.length === 0 ? (
            <p className="text-sm text-slate-500">{t.empty}</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="text-left py-2">#</th>
                    <th className="text-left py-2">{t.spareLabel}</th>
                    <th className="text-left py-2">{t.status}</th>
                    <th className="text-left py-2">{t.createdAt}</th>
                  </tr>
                </thead>
                <tbody>
                  {spares.map((item) => (
                    <tr 
                      key={item.id} 
                      className="border-t border-slate-100 cursor-pointer hover:bg-slate-50"
                      onClick={() => setSelectedTicket({ ...item, type: "spare" })}
                    >
                      <td className="py-2">REP-{String(item.id).padStart(6, "0")}</td>
                      <td className="py-2">{item.titulo || "-"}</td>
                      <td className="py-2">{item.estado || "Pendiente"}</td>
                      <td className="py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-swarcoBlue">{t.purchasesTitle}</h3>
            <button
              type="button"
              className="border border-slate-300 text-slate-700 px-4 py-2 rounded-full hover:border-swarcoOrange/60"
              onClick={() => onNavigate && onNavigate("purchases")}
            >
              {t.ctaPurchases}
            </button>
          </div>
          {purchases.length === 0 ? (
            <p className="text-sm text-slate-500">{t.empty}</p>
          ) : (
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="text-slate-500">
                  <tr>
                    <th className="text-left py-2">#</th>
                    <th className="text-left py-2">{t.spareLabel}</th>
                    <th className="text-left py-2">{t.status}</th>
                    <th className="text-left py-2">{t.createdAt}</th>
                  </tr>
                </thead>
                <tbody>
                  {purchases.map((item) => (
                    <tr key={item.id} className="border-t border-slate-100">
                      <td className="py-2">{item.id}</td>
                      <td className="py-2">{item.equipo}</td>
                      <td className="py-2">{item.estado || "Pendiente"}</td>
                      <td className="py-2">{new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
