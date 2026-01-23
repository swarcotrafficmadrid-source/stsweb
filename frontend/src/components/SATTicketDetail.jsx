import { useState, useEffect } from "react";
import { apiRequest } from "../lib/api.js";

export default function SATTicketDetail({ token, lang, ticket: initialTicket, onBack }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusHistory, setStatusHistory] = useState([]);
  const [comments, setComments] = useState([]);
  const [newStatus, setNewStatus] = useState("");
  const [newComment, setNewComment] = useState("");
  const [statusComment, setStatusComment] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTicketDetails();
  }, [initialTicket]);

  async function loadTicketDetails() {
    setLoading(true);
    try {
      const data = await apiRequest(
        `/api/sat/ticket/${initialTicket.type}/${initialTicket.id}`,
        "GET",
        null,
        token
      );
      setTicket(data.ticket);
      setStatusHistory(data.statusHistory || []);
      setComments(data.comments || []);
    } catch (err) {
      console.error("Error loading ticket details:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(e) {
    e.preventDefault();
    if (!newStatus) return;

    setSubmitting(true);
    try {
      await apiRequest(
        `/api/sat/ticket/${ticket.type}/${ticket.id}/status`,
        "POST",
        { status: newStatus, comment: statusComment },
        token
      );
      await loadTicketDetails();
      setNewStatus("");
      setStatusComment("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await apiRequest(
        `/api/sat/ticket/${ticket.type}/${ticket.id}/comment`,
        "POST",
        { message: newComment.trim(), isInternal },
        token
      );
      await loadTicketDetails();
      setNewComment("");
      setIsInternal(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-swarcoBlue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const typeLabels = {
    failure: "Incidencia",
    spare: "Repuesto",
    purchase: "Compra",
    assistance: "Asistencia"
  };

  const statusLabels = {
    pending: { name: "Pendiente", color: "bg-yellow-100 text-yellow-700" },
    assigned: { name: "Asignado", color: "bg-blue-100 text-blue-700" },
    in_progress: { name: "En progreso", color: "bg-purple-100 text-purple-700" },
    waiting: { name: "Esperando", color: "bg-orange-100 text-swarcoOrange" },
    resolved: { name: "Resuelto", color: "bg-green-100 text-green-700" },
    closed: { name: "Cerrado", color: "bg-slate-100 text-slate-600" }
  };

  const currentStatus = statusHistory[statusHistory.length - 1];

  function getTicketNumber() {
    const prefixes = { failure: "INC", spare: "REP", purchase: "COM", assistance: "ASI" };
    return `${prefixes[ticket.type]}-${String(ticket.id).padStart(6, "0")}`;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-swarcoBlue">{getTicketNumber()}</h2>
          <p className="text-slate-600 text-sm">{typeLabels[ticket.type]}</p>
        </div>
        {currentStatus && (
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusLabels[currentStatus.status].color}`}>
            {statusLabels[currentStatus.status].name}
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Column 1: Detalles del Ticket */}
        <div className="lg:col-span-2 space-y-6">
          {/* Info del Cliente */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Cliente</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="text-sm text-slate-500">Nombre</p>
                <p className="font-medium">{ticket.User.nombre} {ticket.User.apellidos}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Empresa</p>
                <p className="font-medium">{ticket.User.empresa}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Email</p>
                <p className="font-medium text-swarcoBlue">{ticket.User.email}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500">Teléfono</p>
                <p className="font-medium">{ticket.User.telefono}</p>
              </div>
            </div>
          </div>

          {/* Detalles específicos del ticket */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Detalles</h3>
            {ticket.type === "failure" && ticket.failure_equipments && (
              <div className="space-y-4">
                {ticket.failure_equipments.map((eq, idx) => (
                  <div key={idx} className="border-l-4 border-swarcoOrange pl-4">
                    <p className="font-medium mb-2">Equipo {idx + 1}</p>
                    <div className="text-sm space-y-1">
                      <p><strong>Compañía:</strong> {eq.company}</p>
                      <p><strong>Ref:</strong> {eq.refCode}</p>
                      <p><strong>Serial:</strong> {eq.serial}</p>
                      {eq.description && <p><strong>Descripción:</strong> {eq.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {ticket.type === "spare" && ticket.spare_items && (
              <div className="space-y-4">
                {ticket.spare_items.map((item, idx) => (
                  <div key={idx} className="border-l-4 border-swarcoBlue pl-4">
                    <p className="font-medium mb-2">Repuesto {idx + 1}</p>
                    <div className="text-sm space-y-1">
                      <p><strong>Proyecto:</strong> {item.proyecto}</p>
                      <p><strong>País:</strong> {item.pais}</p>
                      <p><strong>Cantidad:</strong> {item.cantidad}</p>
                      {item.description && <p><strong>Descripción:</strong> {item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Timeline de Estados */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Timeline</h3>
            <div className="space-y-4">
              {statusHistory.map((status, idx) => (
                <div key={status.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full ${
                      idx === statusHistory.length - 1 ? "bg-swarcoOrange" : "bg-slate-300"
                    }`} />
                    {idx < statusHistory.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-200 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${statusLabels[status.status].color}`}>
                        {statusLabels[status.status].name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(status.createdAt).toLocaleString("es-ES")}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">
                      Por: {status.ChangedByUser?.nombre} {status.ChangedByUser?.apellidos}
                    </p>
                    {status.comment && (
                      <p className="text-sm text-slate-700 mt-2 bg-slate-50 p-2 rounded">
                        {status.comment}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Comentarios */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Comentarios</h3>
            <div className="space-y-4 mb-6">
              {comments.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No hay comentarios</p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-4 rounded-lg ${
                      comment.isInternal
                        ? "bg-yellow-50 border border-yellow-200"
                        : "bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-medium text-sm">
                          {comment.User.nombre} {comment.User.apellidos}
                          {comment.User.userRole !== "client" && (
                            <span className="ml-2 text-xs text-swarcoBlue">(SAT)</span>
                          )}
                        </p>
                        <p className="text-xs text-slate-400">
                          {new Date(comment.createdAt).toLocaleString("es-ES")}
                        </p>
                      </div>
                      {comment.isInternal && (
                        <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                          Interno
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.message}</p>
                  </div>
                ))
              )}
            </div>

            {/* Agregar comentario */}
            <form onSubmit={handleAddComment} className="space-y-3">
              <textarea
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                rows="3"
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="rounded accent-swarcoOrange"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                  />
                  <span className="text-slate-600">Nota interna (no visible para el cliente)</span>
                </label>
                <button
                  type="submit"
                  disabled={submitting || !newComment.trim()}
                  className="bg-swarcoBlue text-white px-4 py-2 rounded-lg hover:bg-swarcoBlue/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Agregar comentario
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Column 2: Acciones */}
        <div className="space-y-6">
          {/* Cambiar Estado */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Cambiar Estado</h3>
            <form onSubmit={handleStatusChange} className="space-y-4">
              <select
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
              >
                <option value="">Seleccionar estado</option>
                <option value="pending">Pendiente</option>
                <option value="assigned">Asignado</option>
                <option value="in_progress">En progreso</option>
                <option value="waiting">Esperando</option>
                <option value="resolved">Resuelto</option>
                <option value="closed">Cerrado</option>
              </select>
              <textarea
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                rows="3"
                placeholder="Comentario sobre el cambio (opcional)"
                value={statusComment}
                onChange={(e) => setStatusComment(e.target.value)}
              />
              <button
                type="submit"
                disabled={submitting || !newStatus}
                className="w-full bg-swarcoOrange text-white px-4 py-2 rounded-lg hover:bg-swarcoOrange/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Actualizar Estado
              </button>
            </form>
          </div>

          {/* Info del Ticket */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-700 mb-4">Información</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-500">Creado</p>
                <p className="font-medium">{new Date(ticket.createdAt).toLocaleString("es-ES")}</p>
              </div>
              <div>
                <p className="text-slate-500">Última actualización</p>
                <p className="font-medium">{new Date(ticket.updatedAt).toLocaleString("es-ES")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
