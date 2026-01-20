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

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authView, setAuthView] = useState("login");
  const [lang, setLang] = useState("es");
  const [page, setPage] = useState("dashboard");

  const copy = {
    es: {
      access: "Acceso",
      register: "Registro",
      loginTitle: "Iniciar sesión",
      registerTitle: "Crear cuenta",
      loginDesc: "Usa tu email corporativo para acceder.",
      registerDesc: "Completa tus datos para registrarte.",
      welcome: "Bienvenido al portal de soporte SWARCO Traffic Spain.",
      noAccount: "¿No tienes cuenta? Regístrate",
      haveAccount: "Ya tengo cuenta",
      langLabel: "ES"
    },
    en: {
      access: "Access",
      register: "Register",
      loginTitle: "Sign in",
      registerTitle: "Create account",
      loginDesc: "Use your corporate email to access.",
      registerDesc: "Complete your details to register.",
      welcome: "Welcome to the SWARCO Traffic Spain support portal.",
      noAccount: "No account? Create one",
      haveAccount: "I already have an account",
      langLabel: "EN"
    }
  };
  const t = copy[lang] || copy.es;

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
        <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden">
          <div className="grid md:grid-cols-2">
            <div className="hidden md:flex flex-col justify-between p-10 bg-swarcoBlue text-white">
              <div>
                <img src="/logo.png" alt="SWARCO" className="h-10" />
                <div className="mt-6 h-1 w-12 rounded bg-swarcoOrange" />
                <h1 className="text-3xl font-semibold mt-4">Portal SWARCO Traffic Spain</h1>
                <p className="text-white/90 mt-3">The better way, every day.</p>
                <p className="text-white/80 mt-4">
                  Acceso seguro para incidencias, repuestos y compras.
                </p>
              </div>
              <div className="text-xs text-white/70">
                www.swarco.com
              </div>
            </div>
            <div className="p-8 md:p-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold text-swarcoOrange">
                  {authView === "login" ? t.access : t.register}
                </h2>
                <div className="relative">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-swarcoBlue"
                    aria-label="Cambiar idioma"
                    onClick={() => setLang((prev) => (prev === "es" ? "en" : "es"))}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    {t.langLabel}
                  </button>
                </div>
              </div>
              <div className="md:hidden mb-6">
                <img src="/logo.png" alt="SWARCO" className="h-9" />
                <h1 className="text-2xl font-semibold text-swarcoBlue mt-3">Portal SWARCO Traffic Spain</h1>
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
                  <p className="text-sm text-slate-600">
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
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between">
          <h1 className="text-xl font-semibold text-swarcoBlue">SWARCO Ops Portal</h1>
          <button
            className="text-sm text-gray-600"
            onClick={() => { localStorage.removeItem("token"); setToken(null); }}
          >
            Cerrar sesión
          </button>
        </div>
      </header>

      <nav className="max-w-6xl mx-auto px-6 py-4 flex gap-4 text-sm">
        <button onClick={() => setPage("dashboard")} className="text-swarcoBlue">Inicio</button>
        <button onClick={() => setPage("failures")} className="text-swarcoBlue">Incidencias</button>
        <button onClick={() => setPage("spares")} className="text-swarcoBlue">Repuestos</button>
        <button onClick={() => setPage("purchases")} className="text-swarcoBlue">Compras</button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pb-10">
        <PageComponent token={token} />
      </main>
    </div>
  );
}
