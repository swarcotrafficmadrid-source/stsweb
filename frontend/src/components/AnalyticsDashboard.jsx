import { useState, useEffect } from "react";
import { apiRequest } from "../lib/api.js";

export default function AnalyticsDashboard({ token, lang = "es" }) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [resolutionTime, setResolutionTime] = useState(null);
  const [dateRange, setDateRange] = useState("7days");

  const copy = {
    es: {
      title: "Analytics",
      subtitle: "Métricas y estadísticas del sistema",
      summary: "Resumen General",
      totalTickets: "Total Tickets",
      failures: "Incidencias",
      spares: "Repuestos",
      purchases: "Compras",
      assistance: "Asistencias",
      users: "Usuarios",
      byStatus: "Por Estado",
      byType: "Por Tipo",
      activity: "Actividad (Últimos 7 Días)",
      topUsers: "Usuarios Más Activos",
      resolutionTitle: "Tiempo de Resolución",
      avgResolution: "Promedio de Resolución",
      hours: "horas",
      totalResolved: "Tickets Resueltos",
      dateRange7: "Últimos 7 días",
      dateRange30: "Últimos 30 días",
      dateRange90: "Últimos 90 días",
      dateRangeAll: "Todo",
      export: "Exportar CSV",
      refresh: "Actualizar"
    },
    en: {
      title: "Analytics",
      subtitle: "System metrics and statistics",
      summary: "Summary",
      totalTickets: "Total Tickets",
      failures: "Failures",
      spares: "Spares",
      purchases: "Purchases",
      assistance: "Assistance",
      users: "Users",
      byStatus: "By Status",
      byType: "By Type",
      activity: "Activity (Last 7 Days)",
      topUsers: "Most Active Users",
      resolutionTitle: "Resolution Time",
      avgResolution: "Average Resolution",
      hours: "hours",
      totalResolved: "Resolved Tickets",
      dateRange7: "Last 7 days",
      dateRange30: "Last 30 days",
      dateRange90: "Last 90 days",
      dateRangeAll: "All time",
      export: "Export CSV",
      refresh: "Refresh"
    }
  };

  const t = copy[lang] || copy.es;

  useEffect(() => {
    loadMetrics();
  }, [dateRange]);

  async function loadMetrics() {
    setLoading(true);
    try {
      const [dashboardData, resolutionData] = await Promise.all([
        apiRequest("/api/analytics/dashboard", "GET", null, token),
        apiRequest("/api/analytics/resolution-time", "GET", null, token)
      ]);
      setMetrics(dashboardData);
      setResolutionTime(resolutionData);
    } catch (err) {
      console.error("Error loading analytics:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport(type) {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://stsweb-backend-964379250608.europe-west1.run.app";
      window.open(`${API_URL}/api/analytics/export?type=${type}&token=${token}`, "_blank");
    } catch (err) {
      console.error("Error exporting:", err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-swarcoBlue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!metrics) {
    return <div className="text-slate-500">Error al cargar métricas</div>;
  }

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    assigned: "bg-blue-100 text-blue-700",
    in_progress: "bg-purple-100 text-purple-700",
    waiting: "bg-orange-100 text-swarcoOrange",
    resolved: "bg-green-100 text-green-700",
    closed: "bg-slate-100 text-slate-600"
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-swarcoBlue">{t.title}</h2>
          <p className="text-slate-600 text-sm">{t.subtitle}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadMetrics}
            className="px-4 py-2 bg-swarcoBlue text-white rounded-lg hover:bg-swarcoBlue/90 flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M4 4v5h5M20 20v-5h-5M4 9a9 9 0 0113-8M20 15a9 9 0 01-13 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t.refresh}
          </button>
        </div>
      </div>

      {/* Resumen General - Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm text-slate-500">{t.totalTickets}</div>
          <div className="text-3xl font-bold text-swarcoBlue mt-1">{metrics.summary.totalTickets}</div>
        </div>
        <div className="bg-white rounded-xl border border-swarcoOrange/20 p-4">
          <div className="text-sm text-slate-500">{t.failures}</div>
          <div className="text-3xl font-bold text-swarcoOrange mt-1">{metrics.summary.totalFailures}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm text-slate-500">{t.spares}</div>
          <div className="text-3xl font-bold text-swarcoBlue mt-1">{metrics.summary.totalSpares}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm text-slate-500">{t.purchases}</div>
          <div className="text-3xl font-bold text-green-600 mt-1">{metrics.summary.totalPurchases}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm text-slate-500">{t.assistance}</div>
          <div className="text-3xl font-bold text-purple-600 mt-1">{metrics.summary.totalAssistance}</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="text-sm text-slate-500">{t.users}</div>
          <div className="text-3xl font-bold text-slate-700 mt-1">{metrics.summary.totalUsers}</div>
        </div>
      </div>

      {/* Gráficos y Detalles */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tickets por Estado */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-700 mb-4">{t.byStatus}</h3>
          <div className="space-y-3">
            {metrics.ticketsByStatus.map((item) => (
              <div key={item.status} className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-sm ${statusColors[item.status] || "bg-slate-100"}`}>
                  {item.status}
                </span>
                <span className="text-2xl font-bold text-slate-700">{item.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tiempo de Resolución */}
        {resolutionTime && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">{t.resolutionTitle}</h3>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-5xl font-bold text-swarcoBlue">{resolutionTime.averageResolutionTime}</div>
                <div className="text-slate-500 mt-1">{t.hours}</div>
              </div>
              <div className="text-center text-sm text-slate-600">
                {t.totalResolved}: <strong>{resolutionTime.totalResolved}</strong>
              </div>
            </div>
          </div>
        )}

        {/* Actividad por Día */}
        {metrics.activityByDay && metrics.activityByDay.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">{t.activity}</h3>
            <div className="space-y-2">
              {metrics.activityByDay.map((day) => (
                <div key={day.date} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    {new Date(day.date).toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" })}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 bg-swarcoBlue rounded-full" style={{ width: `${day.count * 10}px` }} />
                    <span className="text-sm font-medium text-slate-700 w-8 text-right">{day.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top Usuarios */}
        {metrics.topUsers && metrics.topUsers.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">{t.topUsers}</h3>
            <div className="space-y-3">
              {metrics.topUsers.slice(0, 5).map((user, idx) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-swarcoBlue text-white flex items-center justify-center text-sm font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-700">
                        {user.nombre} {user.apellidos}
                      </div>
                      <div className="text-xs text-slate-500">{user.empresa}</div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-swarcoOrange">{user.ticketCount}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Exportar Reportes */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">{t.export}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => handleExport("failures")}
            className="px-4 py-3 border border-swarcoOrange text-swarcoOrange rounded-lg hover:bg-swarcoOrange hover:text-white transition-colors"
          >
            {t.failures}
          </button>
          <button
            onClick={() => handleExport("spares")}
            className="px-4 py-3 border border-swarcoBlue text-swarcoBlue rounded-lg hover:bg-swarcoBlue hover:text-white transition-colors"
          >
            {t.spares}
          </button>
          <button
            onClick={() => handleExport("purchases")}
            className="px-4 py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-colors"
          >
            {t.purchases}
          </button>
          <button
            onClick={() => handleExport("assistance")}
            className="px-4 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-600 hover:text-white transition-colors"
          >
            {t.assistance}
          </button>
        </div>
      </div>
    </div>
  );
}
