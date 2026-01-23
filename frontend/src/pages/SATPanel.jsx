import { useState, useEffect } from "react";
import { apiRequest } from "../lib/api.js";
import { useTranslatedMap } from "../lib/i18n.js";
import SATTicketList from "../components/SATTicketList.jsx";
import SATTicketDetail from "../components/SATTicketDetail.jsx";
import SATDashboard from "../components/SATDashboard.jsx";
import AnalyticsDashboard from "../components/AnalyticsDashboard.jsx";
import WebhooksPanel from "../components/WebhooksPanel.jsx";
import QRGenerator from "../components/QRGenerator.jsx";
import TicketsMap from "../components/TicketsMap.jsx";

export default function SATPanel({ token, user, lang = "es" }) {
  const [view, setView] = useState("dashboard"); // dashboard, tickets, ticket-detail, analytics, webhooks, qr, map
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filter, setFilter] = useState({ type: "", status: "" });
  const [tickets, setTickets] = useState([]);

  const copy = {
    es: {
      title: "Panel SAT - SWARCO Traffic Spain",
      dashboard: "Dashboard",
      allTickets: "Todos los Tickets",
      analytics: "Analytics",
      webhooks: "Webhooks",
      qrGenerator: "Códigos QR",
      ticketsMap: "Mapa",
      apiDocs: "API REST",
      failures: "Incidencias",
      spares: "Repuestos",
      purchases: "Compras",
      assistance: "Asistencias",
      logout: "Cerrar sesión"
    },
    en: {
      title: "SAT Panel - SWARCO Traffic Spain",
      dashboard: "Dashboard",
      allTickets: "All Tickets",
      analytics: "Analytics",
      webhooks: "Webhooks",
      qrGenerator: "QR Codes",
      ticketsMap: "Map",
      apiDocs: "REST API",
      failures: "Failures",
      spares: "Spares",
      purchases: "Purchases",
      assistance: "Assistance",
      logout: "Logout"
    }
  };
  const t = useTranslatedMap({ base: copy, lang, cacheKey: "sat-panel" });

  // Verificar que el usuario tenga rol SAT
  if (user?.userRole !== "sat_admin" && user?.userRole !== "sat_technician") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-8 max-w-md w-full text-center">
          <svg className="w-16 h-16 text-swarcoOrange mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-xl font-semibold text-swarcoBlue mb-2">Acceso Restringido</h2>
          <p className="text-slate-600">Solo el personal SAT puede acceder a este panel.</p>
        </div>
      </div>
    );
  }

  function viewTicketDetail(ticket) {
    setSelectedTicket(ticket);
    setView("ticket-detail");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-swarcoBlue rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-swarcoBlue">{t.title}</h1>
                <p className="text-xs text-slate-500">{user.nombre} {user.apellidos}</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-2">
              <button
                onClick={() => { setView("dashboard"); setFilter({ type: "", status: "" }); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === "dashboard"
                    ? "bg-swarcoBlue text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {t.dashboard}
              </button>
              <button
                onClick={() => { setView("tickets"); setFilter({ type: "", status: "" }); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === "tickets"
                    ? "bg-swarcoBlue text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {t.allTickets}
              </button>
              <button
                onClick={() => setView("analytics")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === "analytics"
                    ? "bg-swarcoBlue text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {t.analytics}
              </button>
              <button
                onClick={() => setView("webhooks")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === "webhooks"
                    ? "bg-swarcoBlue text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {t.webhooks}
              </button>
              <button
                onClick={() => setView("qr")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === "qr"
                    ? "bg-swarcoBlue text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {t.qrGenerator}
              </button>
              <button
                onClick={() => setView("map")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  view === "map"
                    ? "bg-swarcoBlue text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {t.ticketsMap}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === "dashboard" && (
          <SATDashboard 
            token={token} 
            lang={lang} 
            onViewTickets={(type) => {
              setFilter({ type, status: "" });
              setView("tickets");
            }}
          />
        )}
        
        {view === "tickets" && (
          <SATTicketList 
            token={token} 
            lang={lang}
            filter={filter}
            setFilter={setFilter}
            onTicketClick={viewTicketDetail}
          />
        )}

        {view === "ticket-detail" && selectedTicket && (
          <SATTicketDetail
            token={token}
            lang={lang}
            ticket={selectedTicket}
            onBack={() => setView("tickets")}
          />
        )}

        {view === "analytics" && (
          <AnalyticsDashboard token={token} lang={lang} />
        )}

        {view === "webhooks" && (
          <WebhooksPanel token={token} lang={lang} />
        )}

        {view === "qr" && (
          <QRGenerator token={token} lang={lang} />
        )}

        {view === "map" && (
          <TicketsMap 
            tickets={tickets} 
            onTicketClick={viewTicketDetail}
            lang={lang} 
          />
        )}
      </main>
    </div>
  );
}
