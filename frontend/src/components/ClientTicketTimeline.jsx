import { useState, useEffect } from "react";
import { apiRequest } from "../lib/api.js";

export default function ClientTicketTimeline({ token, ticketId, ticketType, lang = "es" }) {
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTimeline();
  }, [ticketId, ticketType]);

  async function loadTimeline() {
    setLoading(true);
    try {
      const data = await apiRequest(
        `/api/client/ticket/${ticketType}/${ticketId}/timeline`,
        "GET",
        null,
        token
      );
      setTimeline(data.statusHistory || []);
      setComments(data.comments || []);
    } catch (err) {
      console.error("Error loading timeline:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      await apiRequest(
        `/api/client/ticket/${ticketType}/${ticketId}/comment`,
        "POST",
        { message: newComment.trim() },
        token
      );
      await loadTimeline();
      setNewComment("");
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const statusLabels = {
    pending: { name: "Pendiente", color: "bg-yellow-100 text-yellow-700", icon: "⏳" },
    assigned: { name: "Asignado", color: "bg-blue-100 text-blue-700", icon: "👤" },
    in_progress: { name: "En progreso", color: "bg-purple-100 text-purple-700", icon: "🔄" },
    waiting: { name: "Esperando", color: "bg-orange-100 text-swarcoOrange", icon: "⏸️" },
    resolved: { name: "Resuelto", color: "bg-green-100 text-green-700", icon: "✅" },
    closed: { name: "Cerrado", color: "bg-slate-100 text-slate-600", icon: "🔒" }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-3 border-swarcoBlue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentStatus = timeline[timeline.length - 1];

  return (
    <div className="space-y-6">
      {/* Estado actual destacado */}
      {currentStatus && (
        <div className={`rounded-xl p-6 border-2 ${statusLabels[currentStatus.status].color.replace("100", "200")}`}>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{statusLabels[currentStatus.status].icon}</span>
            <div className="flex-1">
              <p className="text-sm font-medium opacity-75">Estado actual</p>
              <p className="text-xl font-bold">{statusLabels[currentStatus.status].name}</p>
            </div>
          </div>
          {currentStatus.comment && (
            <p className="mt-3 text-sm">{currentStatus.comment}</p>
          )}
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Historial</h3>
        <div className="space-y-4">
          {timeline.map((status, idx) => (
            <div key={status.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  idx === timeline.length - 1
                    ? "bg-swarcoOrange text-white"
                    : "bg-slate-100 text-slate-400"
                }`}>
                  {statusLabels[status.status]?.icon || "📌"}
                </div>
                {idx < timeline.length - 1 && (
                  <div className="w-0.5 h-full bg-slate-200 my-1" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusLabels[status.status]?.color}`}>
                    {statusLabels[status.status]?.name || status.status}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(status.createdAt).toLocaleString("es-ES")}
                  </span>
                </div>
                {status.comment && (
                  <p className="text-sm text-slate-600 mt-2 bg-slate-50 p-3 rounded-lg">
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
        <h3 className="text-lg font-semibold text-slate-700 mb-4">Mensajes</h3>
        
        {/* Lista de comentarios */}
        <div className="space-y-3 mb-6">
          {comments.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No hay mensajes aún</p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-4 rounded-lg ${
                  comment.User.userRole === "client"
                    ? "bg-blue-50 ml-8"
                    : "bg-slate-50 mr-8"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <p className="font-medium text-sm">
                      {comment.User.userRole === "client" ? "Tú" : "Equipo SWARCO"}
                    </p>
                    <p className="text-xs text-slate-400">
                      {new Date(comment.createdAt).toLocaleString("es-ES")}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.message}</p>
              </div>
            ))
          )}
        </div>

        {/* Agregar nuevo comentario */}
        <form onSubmit={handleAddComment} className="space-y-3">
          <textarea
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-swarcoBlue/50"
            rows="3"
            placeholder="Escribe un mensaje..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="bg-swarcoBlue text-white px-4 py-2 rounded-lg hover:bg-swarcoBlue/90 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {submitting ? "Enviando..." : "Enviar mensaje"}
          </button>
        </form>
      </div>
    </div>
  );
}
