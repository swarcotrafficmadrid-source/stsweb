import { useEffect, useMemo, useState } from "react";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ActivateAccount from "./pages/ActivateAccount.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Failures from "./pages/Failures.jsx";
import Spares from "./pages/Spares.jsx";
import Purchases from "./pages/Purchases.jsx";
import Assistance from "./pages/Assistance.jsx";
import SATPanel from "./pages/SATPanel.jsx";
import { useTranslatedMap } from "./lib/i18n.js";

const pages = {
  dashboard: Dashboard,
  failures: Failures,
  spares: Spares,
  purchases: Purchases,
  assistance: Assistance,
  sat: SATPanel
};

function getBrowserLang() {
  if (typeof navigator === "undefined") {
    return "es";
  }
  const lang = navigator.language || "es";
  return lang.split("-")[0].toLowerCase();
}

const LANGUAGES = [
  { code: "es", name: "Español" },
  { code: "en", name: "English" },
  { code: "eu", name: "Euskara" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "nl", name: "Nederlands" },
  { code: "sv", name: "Svenska" },
  { code: "no", name: "Norsk" },
  { code: "da", name: "Dansk" },
  { code: "fi", name: "Suomi" },
  { code: "pl", name: "Polski" },
  { code: "cs", name: "Čeština" },
  { code: "sk", name: "Slovenčina" },
  { code: "hu", name: "Magyar" },
  { code: "ro", name: "Română" },
  { code: "bg", name: "Български" },
  { code: "el", name: "Ελληνικά" },
  { code: "ru", name: "Русский" },
  { code: "uk", name: "Українська" },
  { code: "tr", name: "Türkçe" },
  { code: "ar", name: "العربية" },
  { code: "he", name: "עברית" },
  { code: "hi", name: "हिन्दी" },
  { code: "bn", name: "বাংলা" },
  { code: "id", name: "Bahasa Indonesia" },
  { code: "ms", name: "Bahasa Melayu" },
  { code: "th", name: "ไทย" },
  { code: "vi", name: "Tiếng Việt" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
  { code: "ko", name: "한국어" }
];

export default function App() {
  const gateFlag = import.meta.env.VITE_STAGING_GATE_ENABLED;
  const gateEnabled = gateFlag
    ? gateFlag === "true"
    : typeof window !== "undefined" &&
      !["localhost", "127.0.0.1"].includes(window.location.hostname);
  const gateUser = import.meta.env.VITE_STAGING_USER || "sat";
  const gatePass = import.meta.env.VITE_STAGING_PASS || "swarco2026";
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authView, setAuthView] = useState("login");
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || getBrowserLang());
  const [langOpen, setLangOpen] = useState(false);
  const [langQuery, setLangQuery] = useState("");
  const [page, setPage] = useState("dashboard");
  const [dashboardTab, setDashboardTab] = useState(() => {
    if (typeof window === "undefined") return "home";
    const hash = window.location.hash.replace("#", "");
    const allowed = ["home", "incidents", "spares", "purchases", "assistance", "account"];
    return allowed.includes(hash) ? hash : "home";
  });
  const [resetToken, setResetToken] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || "";
  });
  const [activateToken, setActivateToken] = useState(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("token") || "";
  });
  const [gatePassed, setGatePassed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("staging_gate") === "1";
  });
  const [gateOpen, setGateOpen] = useState(false);
  const [gateUserInput, setGateUserInput] = useState("");
  const [gatePassInput, setGatePassInput] = useState("");
  const [gatePassVisible, setGatePassVisible] = useState(false);
  const [gateError, setGateError] = useState("");
  const isResetView = typeof window !== "undefined" && window.location.pathname.startsWith("/reset");
  const isActivateView = typeof window !== "undefined" && window.location.pathname.startsWith("/activate");

  const copy = useMemo(() => ({
    es: {
      portalTitle: "Portal SWARCO Traffic Spain",
      access: "Acceso",
      register: "Registro",
      loginTitle: "Iniciar sesión",
      registerTitle: "Crear cuenta",
      loginDesc: "Usa tu email corporativo para acceder.",
      registerDesc: "Completa tus datos para registrarte.",
      welcome: "¡Hola! Estamos listos para ayudarte.",
      sideIntro: "Acceso seguro para incidencias, repuestos y compras.",
      searchLang: "Buscar idioma",
      headerTitle: "Portal SWARCO Traffic Spain",
      logout: "Cerrar sesión",
      navDashboard: "Inicio",
      navFailures: "Incidencias",
      navSpares: "Repuestos",
      navPurchases: "Compras",
      navAccount: "Mi cuenta",
      noAccount: "¿No tienes cuenta? Regístrate",
      haveAccount: "Ya tengo cuenta",
      langLabel: "ES",
      maintenanceTitle: "Página en proceso",
      maintenanceBody: "Estamos terminando los últimos detalles. Si tienes acceso de prueba, entra con tu usuario y clave.",
      maintenanceButton: "Acceso de pruebas",
      maintenanceUser: "Usuario",
      maintenancePass: "Clave",
      maintenanceEnter: "Entrar",
      maintenanceError: "Usuario o clave incorrectos.",
      showPassword: "Mostrar",
      hidePassword: "Ocultar"
    },
    en: {
      portalTitle: "Portal SWARCO Traffic Spain",
      access: "Access",
      register: "Register",
      loginTitle: "Sign in",
      registerTitle: "Create account",
      loginDesc: "Use your corporate email to access.",
      registerDesc: "Complete your details to register.",
      welcome: "Hi! We are ready to help you.",
      sideIntro: "Secure access for incidents, spares, and purchases.",
      searchLang: "Search language",
      headerTitle: "SWARCO Traffic Spain Portal",
      logout: "Sign out",
      navDashboard: "Home",
      navFailures: "Incidents",
      navSpares: "Spares",
      navPurchases: "Purchases",
      navAccount: "My account",
      noAccount: "No account? Create one",
      haveAccount: "I already have an account",
      langLabel: "EN",
      maintenanceTitle: "Page in progress",
      maintenanceBody: "We are finishing the last details. If you have test access, sign in with your user and password.",
      maintenanceButton: "Test access",
      maintenanceUser: "User",
      maintenancePass: "Password",
      maintenanceEnter: "Enter",
      maintenanceError: "Wrong user or password.",
      showPassword: "Show",
      hidePassword: "Hide"
    },
    it: {
      portalTitle: "Portale SWARCO Traffic Spain",
      access: "Accesso",
      register: "Registrazione",
      loginTitle: "Accedi",
      registerTitle: "Crea account",
      loginDesc: "Usa la tua email aziendale per accedere.",
      registerDesc: "Completa i tuoi dati per registrarti.",
      welcome: "Ciao! Siamo pronti ad aiutarti.",
      sideIntro: "Accesso sicuro per incidenti, ricambi e acquisti.",
      searchLang: "Cerca lingua",
      headerTitle: "Portale SWARCO Traffic Spain",
      logout: "Esci",
      navDashboard: "Home",
      navFailures: "Incidenti",
      navSpares: "Ricambi",
      navPurchases: "Acquisti",
      navAccount: "Il mio account",
      noAccount: "Non hai un account? Registrati",
      haveAccount: "Ho già un account",
      langLabel: "IT",
      maintenanceTitle: "Pagina in lavorazione",
      maintenanceBody: "Stiamo completando gli ultimi dettagli. Se hai accesso di prova, entra con utente e password.",
      maintenanceButton: "Accesso di prova",
      maintenanceUser: "Utente",
      maintenancePass: "Password",
      maintenanceEnter: "Entra",
      maintenanceError: "Utente o password errati.",
      showPassword: "Mostra",
      hidePassword: "Nascondi"
    }
  }), []);
  const t = useTranslatedMap({ base: copy, lang, cacheKey: "app" });
  const filteredLanguages = LANGUAGES.filter((item) => {
    const q = langQuery.trim().toLowerCase();
    if (!q) return true;
    return item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
  });
  const applyLang = (code) => {
    setLang(code);
    localStorage.setItem("lang", code);
  };
  useEffect(() => {
    if (typeof window === "undefined") return;
    const onHash = () => {
      const hash = window.location.hash.replace("#", "");
      const allowed = ["home", "incidents", "spares", "purchases", "assistance", "account"];
      if (allowed.includes(hash)) {
        setPage("dashboard");
        setDashboardTab(hash);
      }
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const handleAuthError = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthView("login");
    setPage("dashboard");
    setDashboardTab("home");
  };
  const handleGateSubmit = (event) => {
    event.preventDefault();
    setGateError("");
    if (gateUserInput.trim() === gateUser && gatePassInput === gatePass) {
      localStorage.setItem("staging_gate", "1");
      setGatePassed(true);
      setGateOpen(false);
      setGateUserInput("");
      setGatePassInput("");
      return;
    }
    setGateError(t.maintenanceError);
  };

  if (gateEnabled && !gatePassed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
        <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div
              className="hidden md:flex flex-col justify-between p-10 text-white relative overflow-hidden"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(0,107,171,0.55) 0%, rgba(0,107,171,0.6) 100%), url('/hero.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              <div>
                <img src="/logo.png" alt="SWARCO" className="h-10 relative z-10" />
                <div className="mt-6 h-1 w-12 rounded bg-swarcoOrange relative z-10" />
                <h1 className="text-3xl font-semibold mt-4 relative z-10">{t.portalTitle}</h1>
                <p className="text-white/90 mt-3 relative z-10">The better way, every day.</p>
              </div>
              <div className="text-xs text-white/70 relative z-10">
                www.swarco.com
              </div>
            </div>
            <div className="p-8 md:p-10">
              <div className="md:hidden mb-6">
                <img src="/logo.png" alt="SWARCO" className="h-9" />
                <h1 className="text-2xl font-semibold text-swarcoBlue mt-3">{t.portalTitle}</h1>
                <p className="text-sm text-slate-500 mt-1">The better way, every day.</p>
              </div>
              <h2 className="text-3xl font-semibold text-swarcoOrange mb-3">{t.maintenanceTitle}</h2>
              <p className="text-sm text-slate-600 mb-6">{t.maintenanceBody}</p>
              {!gateOpen ? (
                <button
                  className="w-full bg-swarcoBlue text-white py-2.5 rounded-full font-semibold hover:bg-swarcoBlue/90 transition"
                  onClick={() => setGateOpen(true)}
                >
                  {t.maintenanceButton}
                </button>
              ) : (
                <form className="space-y-4" onSubmit={handleGateSubmit}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">{t.maintenanceUser}</label>
                    <input
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
                      value={gateUserInput}
                      onChange={(event) => setGateUserInput(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">{t.maintenancePass}</label>
                    <div className="relative">
                      <input
                        type={gatePassVisible ? "text" : "password"}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
                        value={gatePassInput}
                        onChange={(event) => setGatePassInput(event.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2.5 text-slate-500 hover:text-swarcoBlue"
                        onClick={() => setGatePassVisible((prev) => !prev)}
                        aria-label={gatePassVisible ? t.hidePassword : t.showPassword}
                      >
                        {gatePassVisible ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" stroke="currentColor" strokeWidth="1.5" />
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M9.88 5.06A10.47 10.47 0 0112 5c6.5 0 10 7 10 7a18.36 18.36 0 01-4.43 5.2" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M6.1 6.1A18.07 18.07 0 002 12s3.5 6 10 6a10.8 10.8 0 004.05-.76" stroke="currentColor" strokeWidth="1.5" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  {gateError && <p className="text-sm text-red-600">{gateError}</p>}
                  <button type="submit" className="w-full bg-swarcoBlue text-white py-2.5 rounded-full font-semibold hover:bg-swarcoBlue/90 transition">
                    {t.maintenanceEnter}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
        <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div
              className="hidden md:flex flex-col justify-between p-10 text-white relative overflow-hidden"
              style={{
                backgroundImage:
                  "linear-gradient(180deg, rgba(0,107,171,0.55) 0%, rgba(0,107,171,0.6) 100%), url('/hero.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center"
              }}
            >
              <div>
                <img src="/logo.png" alt="SWARCO" className="h-10 relative z-10" />
                <div className="mt-6 h-1 w-12 rounded bg-swarcoOrange relative z-10" />
                <h1 className="text-3xl font-semibold mt-4 relative z-10">{t.portalTitle}</h1>
                <p className="text-white/90 mt-3 relative z-10">The better way, every day.</p>
                <p className="text-white/80 mt-4 relative z-10">{t.sideIntro}</p>
              </div>
              <div className="text-xs text-white/70 relative z-10">
                www.swarco.com
              </div>
            </div>
            <div className="p-8 md:p-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-semibold text-swarcoOrange">
                  {authView === "login" ? t.access : t.register}
                </h2>
                <div className="relative">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-swarcoBlue"
                    aria-label="Cambiar idioma"
                    onClick={() => setLangOpen((prev) => !prev)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M12 2c3.5 3.5 3.5 16.5 0 20M12 2c-3.5 3.5-3.5 16.5 0 20" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    {lang.toUpperCase()}
                  </button>
                  {langOpen && (
                    <div className="absolute right-0 mt-3 w-64 rounded-xl border border-slate-200 bg-white shadow-xl p-3 z-20">
                      <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-2 py-1.5 mb-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-slate-400">
                          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" />
                        </svg>
                        <input
                          className="w-full text-sm outline-none"
                          placeholder={t.searchLang}
                          value={langQuery}
                          onChange={(e) => setLangQuery(e.target.value)}
                        />
                      </div>
                      <div className="max-h-56 overflow-auto">
                        {filteredLanguages.map((item) => (
                          <button
                            key={item.code}
                            type="button"
                            className={`w-full text-left text-sm px-2 py-1.5 rounded hover:bg-slate-100 ${
                              item.code === lang ? "text-swarcoBlue font-semibold" : "text-slate-700"
                            }`}
                            onClick={() => {
                              applyLang(item.code);
                              setLangOpen(false);
                              setLangQuery("");
                            }}
                          >
                            {item.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="md:hidden mb-6">
                <img src="/logo.png" alt="SWARCO" className="h-9" />
                <h1 className="text-2xl font-semibold text-swarcoBlue mt-3">{t.portalTitle}</h1>
                <p className="text-sm text-slate-500 mt-1">The better way, every day.</p>
              </div>
              {!isResetView && !isActivateView && (
                <>
                  <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                    {authView === "login" ? t.loginTitle : t.registerTitle}
                  </h3>
                  <p className="text-sm text-slate-500 mb-6">
                    {authView === "login"
                      ? t.loginDesc
                      : t.registerDesc}
                  </p>
                  {authView === "login" && (
                    <div className="mb-6">
                      <div className="h-1 w-12 rounded bg-swarcoOrange mb-3" />
                      <p className="text-sm text-swarcoBlue font-medium">
                        {t.welcome}
                      </p>
                    </div>
                  )}
                </>
              )}
              {isResetView ? (
                <ResetPassword
                  token={resetToken}
                  lang={lang}
                  onBack={() => {
                    window.history.pushState({}, "", "/");
                    setResetToken("");
                  }}
                />
              ) : isActivateView ? (
                <ActivateAccount
                  token={activateToken}
                  lang={lang}
                  onBack={() => {
                    window.history.pushState({}, "", "/");
                    setActivateToken("");
                  }}
                />
              ) : authView === "login" ? (
                <>
                  <Login
                    onSuccess={(tokenValue) => { setToken(tokenValue); localStorage.setItem("token", tokenValue); }}
                    lang={lang}
                  />
                  <div className="mt-6">
                    <button
                      className="w-full bg-swarcoOrange text-white py-2.5 rounded-full font-semibold hover:bg-swarcoOrange/90 transition"
                      onClick={() => setAuthView("register")}
                    >
                      {t.noAccount}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Register
                    lang={lang}
                    onRegistered={() => setAuthView("login")}
                  />
                  <div className="mt-6 text-center">
                    <button
                      className="text-sm text-swarcoBlue hover:text-swarcoBlue/80"
                      onClick={() => setAuthView("login")}
                    >
                      {t.haveAccount}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const PageComponent = pages[page] || Dashboard;

  return (
    <div className="min-h-screen bg-gray-50">
      <header
        className="relative border-b overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.9) 100%), url('/hero.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 grid grid-cols-3 items-center gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SWARCO" className="h-8" />
          </div>
          <div className="text-center">
            <h1 className="text-xl font-semibold text-swarcoBlue">{t.headerTitle}</h1>
            <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-swarcoOrange" />
          </div>
          <div className="flex items-center justify-end gap-6">
            <div className="relative">
              <button
                type="button"
                className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-swarcoBlue"
                aria-label="Cambiar idioma"
                onClick={() => setLangOpen((prev) => !prev)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M12 2c3.5 3.5 3.5 16.5 0 20M12 2c-3.5 3.5-3.5 16.5 0 20" stroke="currentColor" strokeWidth="1.5" />
                </svg>
                {lang.toUpperCase()}
              </button>
              {langOpen && (
                <div className="absolute right-0 mt-3 w-64 rounded-xl border border-slate-200 bg-white shadow-xl p-3 z-20">
                  <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-2 py-1.5 mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-slate-400">
                      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <input
                      className="w-full text-sm outline-none"
                      placeholder={t.searchLang}
                      value={langQuery}
                      onChange={(e) => setLangQuery(e.target.value)}
                    />
                  </div>
                  <div className="max-h-56 overflow-auto">
                    {filteredLanguages.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        className={`w-full text-left text-sm px-2 py-1.5 rounded hover:bg-slate-100 ${
                          item.code === lang ? "text-swarcoBlue font-semibold" : "text-slate-700"
                        }`}
                        onClick={() => {
                          applyLang(item.code);
                          setLangOpen(false);
                          setLangQuery("");
                        }}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <button
                className="text-sm text-gray-600"
                onClick={() => { localStorage.removeItem("token"); setToken(null); }}
              >
                {t.logout}
              </button>
              <div className="flex items-center gap-2">
                <button
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-swarcoBlue"
                  onClick={() => { setPage("dashboard"); setDashboardTab("home"); }}
                  aria-label={t.navDashboard}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M4 10.5L12 4l8 6.5V20a1 1 0 01-1 1h-5v-6H10v6H5a1 1 0 01-1-1v-9.5z" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
                <button
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:text-swarcoBlue"
                  onClick={() => { setPage("dashboard"); setDashboardTab("account"); }}
                  aria-label={t.navAccount}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M4 20c1.6-3.5 5-5 8-5s6.4 1.5 8 5" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pb-10">
        <PageComponent
          token={token}
          lang={lang}
          activeTab={dashboardTab}
          onTabChange={setDashboardTab}
          onNavigate={setPage}
          onAuthError={handleAuthError}
        />
      </main>
    </div>
  );
}
