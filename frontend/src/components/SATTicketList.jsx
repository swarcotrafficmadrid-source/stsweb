import { useState, useEffect } from "react";
import { apiRequest } from "../lib/api.js";

export default function SATTicketList({ token, lang, filter, setFilter, onTicketClick }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTickets();
  }, [filter]);

  async function loadTickets() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.type) params.append("type", filter.type);
      if (filter.status) params.append("status", filter.status);
      
      const data = await apiRequest(`/api/sat/tickets/all?${params}`, "GET", null, token);
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Error loading tickets:", err);
    } finally {
      setLoading(false);
    }
  }

  const typeLabels = {
    failure: { name: "Incidencia", color: "bg-red-100 text-red-700", icon: "⚠️" },
    spare: { name: "Repuesto", color: "bg-blue-100 text-blue-700", icon: "📦" },
    purchase: { name: "Compra", color: "bg-green-100 text-green-700", icon: "🛒" },
    assistance: { name: "Asistencia", color: "bg-purple-100 text-purple-700", icon: "🔧" }
  };

  const statusLabels = {
    pending: { name: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
    assigned: { name: "Asignado", color: "bg-blue-100 text-blue-700" },
    in_progress: { name: "En progreso", color: "bg-purple-100 text-purple-700" },
    waiting: { name: "Esperando", color: "bg-orange-100 text-swarcoOrange" },
    resolved: { name: "Resuelto", color: "bg-green-100 text-green-700" },
    closed: { name: "Cerrado", color: "bg-slate-100 text-slate-600" }
  };

  function getTicketNumber(ticket) {
    const prefixes = { failure: "INC", spare: "REP", purchase: "COM", assistance: "ASI" };
    return `${prefixes[ticket.type]}-${String(ticket.id).padStart(6, "0")}`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-swarcoBlue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-swarcoBlue">
          Tickets {filter.type ? `- ${typeLabels[filter.type].name}` : ""}
        </h2>
        <div className="flex flex-wrap gap-2">
          <select
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          >
            <option value="">Todos los tipos</option>
            <option value="failure">Incidencias</option>
            <option value="spare">Repuestos</option>
            <option value="purchase">Compras</option>
            <option value="assistance">Asistencias</option>
          </select>
          <select
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
            value={filter.status}
            onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="">Todos los estados</option>
            <option value="pending">Pendiente</option>
            <option value="assigned">Asignado</option>
            <option value="in_progress">En progreso</option>
            <option value="waiting">Esperando</option>
            <option value="resolved">Resuelto</option>
            <option value="closed">Cerrado</option>
          </select>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-slate-500">No hay tickets que coincidan con los filtros</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-200">
          {tickets.map((ticket) => {
            const typeStyle = typeLabels[ticket.type];
            const status = ticket.currentStatus?.status || "pending";
            const statusStyle = statusLabels[status];
            
            return (
              <button
                key={`${ticket.type}-${ticket.id}`}
                onClick={() => onTicketClick(ticket)}
                className="w-full p-4 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-lg font-bold text-swarcoBlue">
                        {getTicketNumber(ticket)}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${typeStyle.color}`}>
                        <span>{typeStyle.icon}</span>
                        {typeStyle.name}
                      </span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusStyle.color}`}>
                        {statusStyle.name}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">
                      <strong>Cliente:</strong> {ticket.User?.nombre} {ticket.User?.apellidos} ({ticket.User?.empresa})
                    </p>
                    <p className="text-xs text-slate-400">
                      Creado: {new Date(ticket.createdAt).toLocaleString("es-ES")}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const API_URL = import.meta.env.VITE_API_URL || "https://stsweb-backend-964379250608.europe-west1.run.app";
                        window.open(`${API_URL}/api/sat/ticket/${ticket.type}/${ticket.id}/pdf?token=${token}`, "_blank");
                      }}
                      className="p-2 hover:bg-swarcoOrange/10 rounded-lg transition-colors group"
                      title="Descargar PDF"
                    >
                      <svg className="w-5 h-5 text-swarcoOrange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>
                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <p className="text-sm text-slate-500 text-center">
        {tickets.length} ticket{tickets.length !== 1 ? "s" : ""} encontrado{tickets.length !== 1 ? "s" : ""}
      </p>
    </div>
  );
}
