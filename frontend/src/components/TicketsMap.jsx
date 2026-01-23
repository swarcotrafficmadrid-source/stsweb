import { useState, useEffect } from "react";

export default function TicketsMap({ tickets = [], onTicketClick, lang = "es" }) {
  const [selectedTicket, setSelectedTicket] = useState(null);

  const copy = {
    es: {
      title: "Mapa de Tickets",
      noLocation: "Sin ubicación GPS",
      totalWithLocation: "tickets con ubicación",
      viewDetails: "Ver Detalles"
    },
    en: {
      title: "Tickets Map",
      noLocation: "No GPS location",
      totalWithLocation: "tickets with location",
      viewDetails: "View Details"
    }
  };

  const t = copy[lang] || copy.es;

  // Filtrar tickets que tienen ubicación
  const ticketsWithLocation = tickets.filter(t => t.latitude && t.longitude);

  // Calcular centro del mapa
  const centerLat = ticketsWithLocation.length > 0
    ? ticketsWithLocation.reduce((sum, t) => sum + parseFloat(t.latitude), 0) / ticketsWithLocation.length
    : 40.4168; // Madrid por defecto

  const centerLng = ticketsWithLocation.length > 0
    ? ticketsWithLocation.reduce((sum, t) => sum + parseFloat(t.longitude), 0) / ticketsWithLocation.length
    : -3.7038;

  function handleMarkerClick(ticket) {
    setSelectedTicket(ticket);
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <h3 className="text-lg font-semibold text-swarcoBlue">{t.title}</h3>
        <p className="text-sm text-slate-600">
          {ticketsWithLocation.length} {t.totalWithLocation}
        </p>
      </div>

      {/* Map Container */}
      <div className="relative h-[500px] bg-slate-100">
        {ticketsWithLocation.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              <p className="text-slate-500">{t.noLocation}</p>
            </div>
          </div>
        ) : (
          <iframe
            title="Tickets Map"
            width="100%"
            height="100%"
            frameBorder="0"
            src={`https://www.google.com/maps/embed/v1/view?key=AIzaSyBFw0Qyda5XUrriSA1CqC7cWdDacm0E1TE&center=${centerLat},${centerLng}&zoom=10`}
            allowFullScreen
          />
        )}

        {/* Markers List (Overlay) */}
        {ticketsWithLocation.length > 0 && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-xs max-h-96 overflow-y-auto">
            <h4 className="font-semibold text-slate-700 mb-3">Tickets</h4>
            <div className="space-y-2">
              {ticketsWithLocation.map((ticket, idx) => (
                <button
                  key={ticket.id}
                  onClick={() => onTicketClick && onTicketClick(ticket)}
                  className="w-full text-left p-2 rounded hover:bg-slate-50 border border-slate-200"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-swarcoOrange text-white text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {ticket.titulo || ticket.tipo || `#${ticket.id}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        {parseFloat(ticket.latitude).toFixed(4)}, {parseFloat(ticket.longitude).toFixed(4)}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Selected Ticket Details */}
      {selectedTicket && (
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="font-semibold text-slate-900">
                {selectedTicket.titulo || selectedTicket.tipo}
              </h4>
              <p className="text-sm text-slate-600 mt-1">
                GPS: {parseFloat(selectedTicket.latitude).toFixed(6)}, {parseFloat(selectedTicket.longitude).toFixed(6)}
              </p>
              {selectedTicket.locationAccuracy && (
                <p className="text-xs text-slate-500">
                  Precisión: ±{selectedTicket.locationAccuracy}m
                </p>
              )}
            </div>
            <button
              onClick={() => onTicketClick && onTicketClick(selectedTicket)}
              className="px-3 py-1 bg-swarcoBlue text-white rounded text-sm hover:bg-swarcoBlue/90"
            >
              {t.viewDetails}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
