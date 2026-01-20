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
  const [page, setPage] = useState("dashboard");

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
              <div className="relative mb-8">
                <div className="h-12 bg-swarcoBlue swarco-slope w-4/5 shadow" />
                <img
                  src="/logo.png"
                  alt="SWARCO"
                  className="absolute top-3 left-4 h-6"
                />
              </div>
              <div className="md:hidden mb-6">
                <img src="/logo.png" alt="SWARCO" className="h-9" />
                <h1 className="text-2xl font-semibold text-swarcoBlue mt-3">Portal SWARCO Traffic Spain</h1>
                <p className="text-sm text-slate-500 mt-1">The better way, every day.</p>
              </div>
              <h2 className="text-xs uppercase tracking-[0.2em] text-slate-400 mb-2">
                {authView === "login" ? "Acceso" : "Registro"}
              </h2>
              <h3 className="text-2xl font-semibold text-slate-800 mb-2">
                {authView === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {authView === "login"
                  ? "Usa tu email corporativo para acceder."
                  : "Completa tus datos para registrarte."}
              </p>
              {authView === "login" && (
                <div className="mb-6">
                  <div className="h-1 w-12 rounded bg-swarcoOrange mb-3" />
                  <p className="text-sm text-slate-600">
                    Bienvenido al portal de soporte SWARCO Traffic Spain.
                  </p>
                </div>
              )}
          {authView === "login" ? (
            <>
              <Login onSuccess={(t) => { setToken(t); localStorage.setItem("token", t); }} />
              <div className="mt-6 text-center">
                <button
                  className="text-sm text-swarcoBlue hover:text-swarcoBlue/80"
                  onClick={() => setAuthView("register")}
                >
                  ¿No tienes cuenta? Regístrate
                </button>
              </div>
            </>
          ) : (
            <>
              <Register onSuccess={() => setAuthView("login")} />
              <div className="mt-6 text-center">
                <button
                  className="text-sm text-swarcoBlue hover:text-swarcoBlue/80"
                  onClick={() => setAuthView("login")}
                >
                  Ya tengo cuenta
                </button>
              </div>
            </>
          )}
              <div className="mt-8 text-xs text-slate-400 text-center">
                www.swarco.com
              </div>
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
