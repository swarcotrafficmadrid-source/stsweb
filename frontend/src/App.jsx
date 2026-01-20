import { useState } from "react";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Failures from "./pages/Failures.jsx";
import Spares from "./pages/Spares.jsx";
import Purchases from "./pages/Purchases.jsx";

const pages = {
  dashboard: Dashboard,
  failures: Failures,
  spares: Spares,
  purchases: Purchases
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
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authView, setAuthView] = useState("login");
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || getBrowserLang());
  const [langOpen, setLangOpen] = useState(false);
  const [langQuery, setLangQuery] = useState("");
  const [page, setPage] = useState("dashboard");

  const copy = {
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
      noAccount: "¿No tienes cuenta? Regístrate",
      haveAccount: "Ya tengo cuenta",
      langLabel: "ES"
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
      noAccount: "No account? Create one",
      haveAccount: "I already have an account",
      langLabel: "EN"
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
      noAccount: "Non hai un account? Registrati",
      haveAccount: "Ho già un account",
      langLabel: "IT"
    }
  };
  const t = copy[lang] || copy.en;
  const filteredLanguages = LANGUAGES.filter((item) => {
    const q = langQuery.trim().toLowerCase();
    if (!q) return true;
    return item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
  });
  const applyLang = (code) => {
    setLang(code);
    localStorage.setItem("lang", code);
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
        <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="hidden md:flex flex-col justify-between p-10 bg-swarcoBlue text-white relative overflow-hidden">
              <div
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(135deg, rgba(255,255,255,0.18) 0, rgba(255,255,255,0.18) 1px, transparent 1px, transparent 16px)"
                }}
              />
              <div className="absolute inset-0 opacity-10">
                <svg viewBox="0 0 800 600" className="w-full h-full">
                  <g fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1">
                    <path d="M40 420h720M80 360h640M120 300h560M160 240h480M200 180h400" />
                    <path d="M120 460c80-140 180-210 300-210 120 0 220 70 300 210" />
                    <circle cx="620" cy="180" r="40" />
                  </g>
                  <g fill="rgba(255,255,255,0.12)">
                    <rect x="60" y="280" width="90" height="140" rx="6" />
                    <rect x="170" y="240" width="120" height="180" rx="6" />
                    <rect x="310" y="260" width="110" height="160" rx="6" />
                    <rect x="440" y="220" width="130" height="200" rx="6" />
                  </g>
                </svg>
              </div>
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
          {authView === "login" ? (
            <>
              <Login
                onSuccess={(tokenValue) => { setToken(tokenValue); localStorage.setItem("token", tokenValue); }}
                lang={lang}
              />
              <div className="mt-6 text-center">
                <button
                  className="text-sm text-swarcoBlue hover:text-swarcoBlue/80"
                  onClick={() => setAuthView("register")}
                >
                  {t.noAccount}
                </button>
              </div>
            </>
          ) : (
            <>
              <Register lang={lang} />
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
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-swarcoBlue">{t.headerTitle}</h1>
          <div className="flex items-center gap-4">
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
            <button
              className="text-sm text-gray-600"
              onClick={() => { localStorage.removeItem("token"); setToken(null); }}
            >
              {t.logout}
            </button>
          </div>
        </div>
      </header>

      <nav className="max-w-6xl mx-auto px-6 py-4 flex gap-4 text-sm">
        <button onClick={() => setPage("dashboard")} className="text-swarcoBlue">{t.navDashboard}</button>
        <button onClick={() => setPage("failures")} className="text-swarcoBlue">{t.navFailures}</button>
        <button onClick={() => setPage("spares")} className="text-swarcoBlue">{t.navSpares}</button>
        <button onClick={() => setPage("purchases")} className="text-swarcoBlue">{t.navPurchases}</button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pb-10">
        <PageComponent token={token} lang={lang} />
      </main>
    </div>
  );
}
