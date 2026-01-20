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
                <div className="text-xs uppercase tracking-[0.2em] text-white/70">SWARCO</div>
                <h1 className="text-3xl font-semibold mt-3">Ops Portal</h1>
                <p className="text-white/80 mt-4">
                  Acceso seguro para solicitudes de repuestos, fallas y compras.
                </p>
              </div>
              <div className="text-xs text-white/70">
                Soporte interno • Madrid • 2026
              </div>
            </div>
            <div className="p-8 md:p-10">
              <div className="md:hidden mb-6">
                <div className="text-xs uppercase tracking-[0.2em] text-swarcoBlue/70">SWARCO</div>
                <h1 className="text-2xl font-semibold text-swarcoBlue mt-2">Ops Portal</h1>
              </div>
              <h2 className="text-xl font-semibold text-slate-800 mb-2">
                {authView === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                {authView === "login"
                  ? "Usa tu usuario o email para acceder."
                  : "Completa tus datos para registrarte."}
              </p>
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
        <button onClick={() => setPage("failures")} className="text-swarcoBlue">Fallas</button>
        <button onClick={() => setPage("spares")} className="text-swarcoBlue">Repuestos</button>
        <button onClick={() => setPage("purchases")} className="text-swarcoBlue">Compras</button>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pb-10">
        <PageComponent token={token} />
      </main>
    </div>
  );
}
