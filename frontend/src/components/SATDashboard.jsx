import { useState, useEffect } from "react";
import { apiRequest } from "../lib/api.js";

export default function SATDashboard({ token, lang, onViewTickets }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await apiRequest("/api/sat/stats", "GET", null, token);
      setStats(data);
    } catch (err) {
      console.error("Error loading stats:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-swarcoBlue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statusColors = {
    pending: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", name: "Pendiente" },
    assigned: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", name: "Asignado" },
    in_progress: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", name: "En progreso" },
    waiting: { bg: "bg-orange-50", border: "border-swarcoOrange/30", text: "text-swarcoOrange", name: "Esperando" },
    resolved: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700", name: "Resuelto" },
    closed: { bg: "bg-slate-50", border: "border-slate-200", text: "text-slate-500", name: "Cerrado" }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-swarcoBlue mb-2">Dashboard SAT</h2>
        <p className="text-slate-600">Resumen general de solicitudes y estado actual</p>
      </div>

      {/* Total */}
      <div className="bg-gradient-to-br from-swarcoBlue to-swarcoBlue/80 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium mb-2">Total de Tickets</p>
            <p className="text-5xl font-bold">{stats?.totalTickets || 0}</p>
          </div>
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Por Tipo */}
      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Por Tipo de Solicitud</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <button
            onClick={() => onViewTickets("failure")}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:border-swarcoOrange/60 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-swarcoBlue">{stats?.byType?.failures || 0}</span>
            </div>
            <p className="text-slate-600 font-medium">Incidencias</p>
          </button>

          <button
            onClick={() => onViewTickets("spare")}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:border-swarcoOrange/60 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-swarcoBlue">{stats?.byType?.spares || 0}</span>
            </div>
            <p className="text-slate-600 font-medium">Repuestos</p>
          </button>

          <button
            onClick={() => onViewTickets("purchase")}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:border-swarcoOrange/60 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-swarcoBlue">{stats?.byType?.purchases || 0}</span>
            </div>
            <p className="text-slate-600 font-medium">Compras</p>
          </button>

          <button
            onClick={() => onViewTickets("assistance")}
            className="bg-white rounded-xl border border-slate-200 p-6 hover:border-swarcoOrange/60 hover:shadow-md transition-all text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <span className="text-3xl font-bold text-swarcoBlue">{stats?.byType?.assistance || 0}</span>
            </div>
            <p className="text-slate-600 font-medium">Asistencias</p>
          </button>
        </div>
      </div>

      {/* Por Estado */}
      <div>
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Por Estado</h3>
        <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Object.entries(stats?.byStatus || {}).map(([status, count]) => {
            const style = statusColors[status];
            return (
              <div
                key={status}
                className={`${style.bg} border ${style.border} rounded-xl p-4`}
              >
                <p className="text-2xl font-bold ${style.text} mb-1">{count}</p>
                <p className={`text-sm ${style.text} font-medium`}>{style.name}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
