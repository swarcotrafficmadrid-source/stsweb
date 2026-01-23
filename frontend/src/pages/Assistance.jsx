import { useState } from "react";
import { apiRequest } from "../lib/api.js";
import { useTranslatedMap } from "../lib/i18n.js";

export default function Assistance({ token, lang = "es" }) {
  const [assistanceType, setAssistanceType] = useState("remota");
  const [fecha, setFecha] = useState("");
  const [hora, setHora] = useState("");
  const [lugar, setLugar] = useState("");
  const [descripcionFalla, setDescripcionFalla] = useState("");
  const [createdRequest, setCreatedRequest] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const copy = {
    es: {
      title: "Solicitud de Asistencia",
      subtitle: "Selecciona el tipo de asistencia que necesitas.",
      typeLabel: "Tipo de asistencia",
      typeRemota: "Remota",
      typeTelefonica: "Telefónica",
      typeVisita: "Visita",
      fechaLabel: "Fecha",
      horaLabel: "Hora",
      lugarLabel: "Lugar de la visita",
      descripcionLabel: "Descripción de la falla",
      descripcionHelp: "Explica qué necesitas que revisemos",
      placeholderDesc: "Describe la falla o problema",
      placeholderLugar: "Dirección o ubicación",
      send: "Enviar",
      ok: "Solicitud enviada.",
      requestCreatedTitle: "Solicitud creada",
      requestNumberLabel: "Número de solicitud",
      summaryTitle: "Resumen",
      backHome: "Volver al inicio",
      createAnother: "Crear otra solicitud",
      newButton: "Nueva solicitud",
      reviewTitle: "Revisión de la solicitud",
      reviewDesc: "Verifica los datos antes de enviar.",
      reviewButton: "Aceptar",
      sendRequest: "Enviar solicitud",
      editRequest: "Editar",
      required: "Campo obligatorio",
      validationError: "Revisa los campos marcados.",
      horaHelp: "Horario: 8:00 - 15:00 (cada 30 min)",
      selectHora: "Selecciona hora",
      selectFecha: "Selecciona fecha"
    },
    en: {
      title: "Assistance Request",
      subtitle: "Select the type of assistance you need.",
      typeLabel: "Assistance type",
      typeRemota: "Remote",
      typeTelefonica: "Phone",
      typeVisita: "On-site visit",
      fechaLabel: "Date",
      horaLabel: "Time",
      lugarLabel: "Visit location",
      descripcionLabel: "Issue description",
      descripcionHelp: "Explain what needs to be reviewed",
      placeholderDesc: "Describe the issue or problem",
      placeholderLugar: "Address or location",
      send: "Send",
      ok: "Request sent.",
      requestCreatedTitle: "Request created",
      requestNumberLabel: "Request number",
      summaryTitle: "Summary",
      backHome: "Back to home",
      createAnother: "Create another request",
      newButton: "New request",
      reviewTitle: "Request review",
      reviewDesc: "Check the details before sending.",
      reviewButton: "Accept",
      sendRequest: "Send request",
      editRequest: "Edit",
      required: "Required field",
      validationError: "Check the highlighted fields.",
      horaHelp: "Schedule: 8:00 - 15:00 (every 30 min)",
      selectHora: "Select time",
      selectFecha: "Select date"
    }
  };
  const t = useTranslatedMap({ base: copy, lang, cacheKey: "assistance" });

  // Horarios cada 30 minutos de 8:00 a 15:00
  const horarios = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00"
  ];

  function validateForm() {
    const nextErrors = {};
    if (!descripcionFalla.trim()) nextErrors.descripcionFalla = t.required;
    
    if (assistanceType === "remota" || assistanceType === "telefonica") {
      if (!fecha) nextErrors.fecha = t.required;
      if (!hora) nextErrors.hora = t.required;
    }
    
    if (assistanceType === "visita") {
      if (!lugar.trim()) nextErrors.lugar = t.required;
      if (!fecha) nextErrors.fecha = t.required;
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    if (!validateForm()) {
      setMessage(t.validationError);
      return;
    }
    try {
      const data = await apiRequest(
        "/api/assistance",
        "POST",
        {
          tipo: assistanceType,
          fecha: fecha || null,
          hora: hora || null,
          lugar: lugar.trim() || null,
          descripcionFalla: descripcionFalla.trim()
        },
        token
      );
      setMessage(t.ok);
      setCreatedRequest({
        number: data.requestNumber || `ASI-${String(data.id || "").padStart(6, "0")}`,
        tipo: assistanceType,
        fecha: fecha || null,
        hora: hora || null,
        lugar: lugar || null,
        descripcionFalla: descripcionFalla.trim()
      });
      setAssistanceType("remota");
      setFecha("");
      setHora("");
      setLugar("");
      setDescripcionFalla("");
      setErrors({});
      setReviewing(false);
    } catch (err) {
      setMessage(err.message);
    }
  }

  function resetForm() {
    setMessage("");
    setCreatedRequest(null);
    setAssistanceType("remota");
    setFecha("");
    setHora("");
    setLugar("");
    setDescripcionFalla("");
    setErrors({});
    setReviewing(false);
  }

  if (createdRequest) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-swarcoBlue">{t.requestCreatedTitle}</h2>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">{t.requestNumberLabel}</p>
          <p className="text-2xl font-semibold text-swarcoBlue">{createdRequest.number}</p>
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-600">{t.summaryTitle}</h3>
          <div className="mt-2 space-y-1 text-sm text-slate-600">
            <div><strong>{t.typeLabel}:</strong> {
              createdRequest.tipo === "remota" ? t.typeRemota :
              createdRequest.tipo === "telefonica" ? t.typeTelefonica :
              t.typeVisita
            }</div>
            {createdRequest.fecha && <div><strong>{t.fechaLabel}:</strong> {createdRequest.fecha}</div>}
            {createdRequest.hora && <div><strong>{t.horaLabel}:</strong> {createdRequest.hora}</div>}
            {createdRequest.lugar && <div><strong>{t.lugarLabel}:</strong> {createdRequest.lugar}</div>}
            <div><strong>{t.descripcionLabel}:</strong> {createdRequest.descripcionFalla}</div>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="bg-swarcoBlue text-white px-5 py-2.5 rounded-full"
            onClick={resetForm}
          >
            {t.createAnother}
          </button>
          <button
            type="button"
            className="border border-slate-300 text-slate-700 px-5 py-2.5 rounded-full hover:border-swarcoOrange/60"
            onClick={() => { window.location.href = "/"; }}
          >
            {t.backHome}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-swarcoBlue">{t.title}</h2>
          <div className="mt-2 h-1 w-10 rounded-full bg-swarcoOrange" />
        </div>
        <button
          type="button"
          className="border border-slate-300 text-slate-700 px-4 py-2 rounded-full hover:border-swarcoOrange/60"
          onClick={resetForm}
        >
          {t.newButton}
        </button>
      </div>
      <p className="text-sm text-slate-500 mt-3 mb-4">{t.subtitle}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-slate-600">{t.typeLabel}</label>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="assistanceType"
                className="accent-swarcoBlue"
                checked={assistanceType === "remota"}
                onChange={() => setAssistanceType("remota")}
              />
              <span className="text-sm text-slate-700">{t.typeRemota}</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="assistanceType"
                className="accent-swarcoBlue"
                checked={assistanceType === "telefonica"}
                onChange={() => setAssistanceType("telefonica")}
              />
              <span className="text-sm text-slate-700">{t.typeTelefonica}</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="assistanceType"
                className="accent-swarcoBlue"
                checked={assistanceType === "visita"}
                onChange={() => setAssistanceType("visita")}
              />
              <span className="text-sm text-slate-700">{t.typeVisita}</span>
            </label>
          </div>
        </div>

        {(assistanceType === "remota" || assistanceType === "telefonica") && (
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm text-slate-600">{t.fechaLabel}</label>
              <input
                type="date"
                className={`w-full border rounded-lg px-3 py-2.5 ${errors.fecha ? "border-swarcoOrange" : "border-slate-300"}`}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className={`text-xs ${errors.fecha ? "text-swarcoOrange" : "text-slate-400"}`}>
                {errors.fecha || t.selectFecha}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-600">{t.horaLabel}</label>
              <select
                className={`w-full border rounded-lg px-3 py-2.5 ${errors.hora ? "border-swarcoOrange" : "border-slate-300"}`}
                value={hora}
                onChange={(e) => setHora(e.target.value)}
              >
                <option value="">{t.selectHora}</option>
                {horarios.map((h) => (
                  <option key={h} value={h}>{h}</option>
                ))}
              </select>
              <p className={`text-xs ${errors.hora ? "text-swarcoOrange" : "text-slate-400"}`}>
                {errors.hora || t.horaHelp}
              </p>
            </div>
          </div>
        )}

        {assistanceType === "visita" && (
          <>
            <div className="space-y-2">
              <label className="text-sm text-slate-600">{t.lugarLabel}</label>
              <input
                className={`w-full border rounded-lg px-3 py-2.5 ${errors.lugar ? "border-swarcoOrange" : "border-slate-300"}`}
                placeholder={t.placeholderLugar}
                value={lugar}
                onChange={(e) => setLugar(e.target.value)}
              />
              <p className={`text-xs ${errors.lugar ? "text-swarcoOrange" : "text-slate-400"}`}>
                {errors.lugar || t.required}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-slate-600">{t.fechaLabel}</label>
              <input
                type="date"
                className={`w-full border rounded-lg px-3 py-2.5 ${errors.fecha ? "border-swarcoOrange" : "border-slate-300"}`}
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
              <p className={`text-xs ${errors.fecha ? "text-swarcoOrange" : "text-slate-400"}`}>
                {errors.fecha || t.selectFecha}
              </p>
            </div>
          </>
        )}

        <div className="space-y-2">
          <label className="text-sm text-slate-600">{t.descripcionLabel}</label>
          <textarea
            className={`w-full border rounded-lg px-3 py-2.5 ${errors.descripcionFalla ? "border-swarcoOrange" : "border-slate-300"}`}
            rows="4"
            placeholder={t.placeholderDesc}
            value={descripcionFalla}
            onChange={(e) => setDescripcionFalla(e.target.value)}
          />
          <p className={`text-xs ${errors.descripcionFalla ? "text-swarcoOrange" : "text-slate-400"}`}>
            {errors.descripcionFalla || t.descripcionHelp}
          </p>
        </div>

        {reviewing && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">{t.reviewTitle}</h3>
            <p className="text-xs text-slate-500 mt-1">{t.reviewDesc}</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div><strong>{t.typeLabel}:</strong> {
                assistanceType === "remota" ? t.typeRemota :
                assistanceType === "telefonica" ? t.typeTelefonica :
                t.typeVisita
              }</div>
              {fecha && <div><strong>{t.fechaLabel}:</strong> {fecha}</div>}
              {hora && <div><strong>{t.horaLabel}:</strong> {hora}</div>}
              {lugar && <div><strong>{t.lugarLabel}:</strong> {lugar}</div>}
              <div><strong>{t.descripcionLabel}:</strong> {descripcionFalla || "-"}</div>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          {!reviewing ? (
            <button
              type="button"
              className="bg-swarcoOrange text-white px-4 py-2 rounded-full hover:bg-swarcoOrange/90"
              onClick={() => {
                setMessage("");
                if (validateForm()) {
                  setReviewing(true);
                } else {
                  setMessage(t.validationError);
                }
              }}
            >
              {t.reviewButton}
            </button>
          ) : (
            <>
              <button className="bg-swarcoBlue text-white px-4 py-2 rounded-full" type="submit">
                {t.sendRequest}
              </button>
              <button
                type="button"
                className="border border-slate-300 text-slate-700 px-4 py-2 rounded-full hover:border-swarcoOrange/60"
                onClick={() => setReviewing(false)}
              >
                {t.editRequest}
              </button>
            </>
          )}
        </div>
        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
}
