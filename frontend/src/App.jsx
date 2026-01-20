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
  const [page, setPage] = useState("dashboard");

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-full max-w-md border rounded-lg p-8 shadow">
          <h1 className="text-2xl font-bold text-swarcoBlue mb-6">SWARCO Ops</h1>
          <Login onSuccess={(t) => { setToken(t); localStorage.setItem("token", t); }} />
          <div className="my-6 border-t" />
          <Register />
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
