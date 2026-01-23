import { useState, useEffect } from "react";
import { apiRequest } from "../lib/api.js";

export default function WebhooksPanel({ token, lang = "es" }) {
  const [webhooks, setWebhooks] = useState([]);
  const [availableEvents, setAvailableEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    events: [],
    secret: ""
  });

  const copy = {
    es: {
      title: "Webhooks",
      subtitle: "Configurar integraciones con sistemas externos",
      addNew: "Nuevo Webhook",
      name: "Nombre",
      url: "URL",
      events: "Eventos",
      secret: "Secret (opcional)",
      active: "Activo",
      inactive: "Inactivo",
      save: "Guardar",
      cancel: "Cancelar",
      edit: "Editar",
      delete: "Eliminar",
      test: "Probar",
      testSuccess: "Webhook probado exitosamente",
      testFailed: "Error al probar webhook",
      lastTriggered: "Último disparo",
      never: "Nunca",
      failures: "Fallos",
      noWebhooks: "No hay webhooks configurados",
      namePlaceholder: "Ej: Integración con Jira",
      urlPlaceholder: "https://ejemplo.com/webhook",
      secretPlaceholder: "Dejar vacío para generar automáticamente"
    },
    en: {
      title: "Webhooks",
      subtitle: "Configure integrations with external systems",
      addNew: "New Webhook",
      name: "Name",
      url: "URL",
      events: "Events",
      secret: "Secret (optional)",
      active: "Active",
      inactive: "Inactive",
      save: "Save",
      cancel: "Cancel",
      edit: "Edit",
      delete: "Delete",
      test: "Test",
      testSuccess: "Webhook tested successfully",
      testFailed: "Failed to test webhook",
      lastTriggered: "Last triggered",
      never: "Never",
      failures: "Failures",
      noWebhooks: "No webhooks configured",
      namePlaceholder: "E.g: Jira Integration",
      urlPlaceholder: "https://example.com/webhook",
      secretPlaceholder: "Leave empty to auto-generate"
    }
  };

  const t = copy[lang] || copy.es;

  useEffect(() => {
    loadWebhooks();
    loadEvents();
  }, []);

  async function loadWebhooks() {
    setLoading(true);
    try {
      const data = await apiRequest("/api/webhooks", "GET", null, token);
      setWebhooks(data);
    } catch (err) {
      console.error("Error loading webhooks:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadEvents() {
    try {
      const data = await apiRequest("/api/webhooks/events", "GET", null, token);
      setAvailableEvents(data.events || []);
    } catch (err) {
      console.error("Error loading events:", err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      if (editingId) {
        await apiRequest(`/api/webhooks/${editingId}`, "PUT", formData, token);
      } else {
        await apiRequest("/api/webhooks", "POST", formData, token);
      }
      await loadWebhooks();
      resetForm();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleDelete(id) {
    if (!confirm("¿Eliminar este webhook?")) return;
    
    try {
      await apiRequest(`/api/webhooks/${id}`, "DELETE", null, token);
      await loadWebhooks();
    } catch (err) {
      alert(err.message);
    }
  }

  async function handleTest(id) {
    try {
      const result = await apiRequest(`/api/webhooks/${id}/test`, "POST", null, token);
      alert(result.success ? t.testSuccess : t.testFailed);
    } catch (err) {
      alert(t.testFailed + ": " + err.message);
    }
  }

  async function handleToggleActive(id, currentActive) {
    try {
      await apiRequest(`/api/webhooks/${id}`, "PUT", { active: !currentActive }, token);
      await loadWebhooks();
    } catch (err) {
      alert(err.message);
    }
  }

  function editWebhook(webhook) {
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret || ""
    });
    setEditingId(webhook.id);
    setShowForm(true);
  }

  function resetForm() {
    setFormData({ name: "", url: "", events: [], secret: "" });
    setEditingId(null);
    setShowForm(false);
  }

  function toggleEvent(eventValue) {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(eventValue)
        ? prev.events.filter(e => e !== eventValue)
        : [...prev.events, eventValue]
    }));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-4 border-swarcoBlue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-swarcoBlue">{t.title}</h2>
          <p className="text-slate-600 text-sm">{t.subtitle}</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-swarcoBlue text-white rounded-lg hover:bg-swarcoBlue/90"
          >
            + {t.addNew}
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.name}</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder={t.namePlaceholder}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.url}</label>
            <input
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder={t.urlPlaceholder}
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">{t.events}</label>
            <div className="grid grid-cols-2 gap-2">
              {availableEvents.map(event => (
                <label key={event.value} className="flex items-center gap-2 p-2 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={formData.events.includes(event.value)}
                    onChange={() => toggleEvent(event.value)}
                    className="w-4 h-4"
                  />
                  <span className="text-sm">{event.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.secret}</label>
            <input
              type="text"
              value={formData.secret}
              onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
              placeholder={t.secretPlaceholder}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 font-mono text-sm"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="px-4 py-2 bg-swarcoBlue text-white rounded-lg hover:bg-swarcoBlue/90"
            >
              {t.save}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50"
            >
              {t.cancel}
            </button>
          </div>
        </form>
      )}

      {/* Lista de Webhooks */}
      <div className="space-y-3">
        {webhooks.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p className="text-slate-500">{t.noWebhooks}</p>
          </div>
        ) : (
          webhooks.map(webhook => (
            <div key={webhook.id} className="bg-white rounded-xl border border-slate-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-slate-700">{webhook.name}</h4>
                    <button
                      onClick={() => handleToggleActive(webhook.id, webhook.active)}
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        webhook.active 
                          ? "bg-green-100 text-green-700" 
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {webhook.active ? t.active : t.inactive}
                    </button>
                    {webhook.failureCount > 0 && (
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                        {t.failures}: {webhook.failureCount}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 font-mono mb-2">{webhook.url}</p>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {webhook.events.map(event => (
                      <span key={event} className="px-2 py-1 bg-swarcoBlue/10 text-swarcoBlue rounded text-xs">
                        {event}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    {t.lastTriggered}: {webhook.lastTriggeredAt 
                      ? new Date(webhook.lastTriggeredAt).toLocaleString("es-ES")
                      : t.never
                    }
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleTest(webhook.id)}
                    className="p-2 text-swarcoBlue hover:bg-swarcoBlue/10 rounded-lg transition-colors"
                    title={t.test}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    onClick={() => editWebhook(webhook)}
                    className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title={t.edit}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(webhook.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t.delete}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Documentación rápida */}
      <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
        <h4 className="font-semibold text-blue-900 mb-2">Formato de Payload</h4>
        <pre className="text-xs bg-white p-3 rounded border border-blue-200 overflow-x-auto">
{`{
  "event": "ticket.created",
  "timestamp": "2026-01-23T10:30:00Z",
  "data": {
    "ticketId": 123,
    "ticketType": "failure",
    "ticketNumber": "INC-000123",
    "userId": 45,
    "createdAt": "2026-01-23T10:30:00Z"
  }
}`}
        </pre>
        <p className="text-sm text-blue-700 mt-3">
          <strong>Header de Firma:</strong> <code className="bg-white px-2 py-1 rounded">X-Webhook-Signature</code>
        </p>
      </div>
    </div>
  );
}
