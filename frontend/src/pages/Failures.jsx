import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api.js";
import { useTranslatedMap } from "../lib/i18n.js";
import FileUploader from "../components/FileUploader.jsx";

export default function Failures({ token, lang = "es" }) {
  const [prioridad, setPrioridad] = useState("Media");
  const [message, setMessage] = useState("");
  const [incidentTitle, setIncidentTitle] = useState("");
  const [incidentGeneralDesc, setIncidentGeneralDesc] = useState("");
  const [equipments, setEquipments] = useState([
    {
      company: { dsta: false, lacroix: false, swarco: false },
      description: "",
      refCode: "",
      serial: "",
      locationType: "trafico",
      locationVia: "",
      locationSentido: "",
      locationPk: "",
      locationProvince: "",
      locationStation: "",
      uploadedPhotos: [],
      uploadedVideo: null
    }
  ]);
  const [createdTicket, setCreatedTicket] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const copy = {
    es: {
      title: "Reporte de Incidencia",
      subtitle: "Completa los datos del equipo para generar el ticket.",
      stickerLabel: "Foto de la pegatina",
      stickerHint: "Referencia visual para el cliente",
      companiesLabel: "Compañía",
      companyDsta: "DSTA",
      companyLacroix: "Lacroix",
      companySwarco: "Swarco",
      equipmentTitle: "Equipo",
      addEquipment: "Agregar otro equipo",
      removeEquipment: "Quitar equipo",
      refLabel: "Referencia (REF / PN / MM)",
      serialLabel: "Nº de serie",
      refHelp: "Ejemplo: PN123A · MM456B · REF789C",
      serialHelp: "6 dígitos numéricos",
      photosLabel: "Fotos de la falla",
      photosHelp: "Máximo 4 fotos",
      photosTooMany: "Máximo 4 fotos",
      videoLabel: "Video de la falla",
      videoHelp: "Máximo 1 minuto",
      videoTooLong: "El video debe durar máximo 1 minuto",
      labelTitle: "Pequeña descripción de la incidencia",
      labelTitleHelp: "Encabezado del correo",
      labelDesc: "Descripción de la incidencia",
      locationTitle: "Ubicación del panel",
      locationTraffic: "Tráfico",
      locationTransport: "Transporte",
      locationVia: "Vía / carretera",
      locationSentido: "Sentido",
      locationPk: "Punto kilométrico",
      locationProvince: "Provincia / Estado",
      locationStation: "Nombre de estación",
      locationHelpTraffic: "Ejemplo: A-1 · Madrid → Burgos · PK 24+600",
      locationHelpTransport: "Ejemplo: Madrid · Estación Sol",
      labelPriority: "Prioridad",
      placeholderTitle: "Título",
      placeholderDesc: "Descripción",
      low: "Baja",
      medium: "Media",
      high: "Alta",
      send: "Enviar",
      ok: "Incidencia enviada.",
      ticketCreatedTitle: "Ticket creado",
      ticketNumberLabel: "Número de ticket",
      summaryTitle: "Resumen",
      backHome: "Volver al inicio",
      createAnother: "Crear otra incidencia",
      newButton: "Ir a incidencias",
      reviewTitle: "Revisión del ticket",
      reviewDesc: "Verifica los datos antes de enviar.",
      reviewButton: "Aceptar",
      sendTicket: "Enviar ticket",
      editTicket: "Editar",
      incidentTitleLabel: "Pequeña descripción de la incidencia",
      incidentTitleHelp: "Encabezado del correo",
      incidentGeneralLabel: "Descripción general de la incidencia",
      required: "Campo obligatorio",
      refInvalid: "Formato inválido (PN/MM/REF + 3 dígitos + letra)",
      serialInvalid: "El serial debe tener 6 dígitos",
      validationError: "Revisa los campos marcados."
    },
    en: {
      title: "Incident Report",
      subtitle: "Complete the device details to create the ticket.",
      stickerLabel: "Sticker photo",
      stickerHint: "Visual reference for the customer",
      companiesLabel: "Company",
      companyDsta: "DSTA",
      companyLacroix: "Lacroix",
      companySwarco: "Swarco",
      equipmentTitle: "Equipment",
      addEquipment: "Add another equipment",
      removeEquipment: "Remove equipment",
      refLabel: "Reference (REF / PN / MM)",
      serialLabel: "Serial number",
      refHelp: "Example: PN123A · MM456B · REF789C",
      serialHelp: "6 numeric digits",
      photosLabel: "Fault photos",
      photosHelp: "Up to 4 photos",
      photosTooMany: "Maximum 4 photos",
      videoLabel: "Fault video",
      videoHelp: "Up to 1 minute",
      videoTooLong: "Video must be 1 minute or less",
      labelTitle: "Short incident description",
      labelTitleHelp: "Email subject",
      labelDesc: "Incident description",
      locationTitle: "Panel location",
      locationTraffic: "Traffic",
      locationTransport: "Transport",
      locationVia: "Road / route",
      locationSentido: "Direction",
      locationPk: "Kilometer point",
      locationProvince: "Province / State",
      locationStation: "Station name",
      locationHelpTraffic: "Example: A-1 · Madrid → Burgos · PK 24+600",
      locationHelpTransport: "Example: Madrid · Sol Station",
      labelPriority: "Priority",
      placeholderTitle: "Title",
      placeholderDesc: "Description",
      low: "Low",
      medium: "Medium",
      high: "High",
      send: "Send",
      ok: "Incident sent.",
      ticketCreatedTitle: "Ticket created",
      ticketNumberLabel: "Ticket number",
      summaryTitle: "Summary",
      backHome: "Back to home",
      createAnother: "Create another incident",
      newButton: "Go to incidents",
      reviewTitle: "Ticket review",
      reviewDesc: "Check the details before sending.",
      reviewButton: "Accept",
      sendTicket: "Send ticket",
      editTicket: "Edit",
      incidentTitleLabel: "Short incident description",
      incidentTitleHelp: "Email subject",
      incidentGeneralLabel: "General incident description",
      required: "Required field",
      refInvalid: "Invalid format (PN/MM/REF + 3 digits + letter)",
      serialInvalid: "Serial must be 6 digits",
      validationError: "Check the highlighted fields."
    },
    it: {
      title: "Segnalazione Incidente",
      subtitle: "Completa i dati del dispositivo per creare il ticket.",
      stickerLabel: "Foto dell'etichetta",
      stickerHint: "Riferimento visivo per il cliente",
      companiesLabel: "Azienda",
      companyDsta: "DSTA",
      companyLacroix: "Lacroix",
      companySwarco: "Swarco",
      equipmentTitle: "Attrezzatura",
      addEquipment: "Aggiungi altro",
      removeEquipment: "Rimuovi",
      refLabel: "Riferimento (REF / PN / MM)",
      serialLabel: "Numero di serie",
      refHelp: "Esempio: PN123A · MM456B · REF789C",
      serialHelp: "6 cifre numeriche",
      photosLabel: "Foto del guasto",
      photosHelp: "Massimo 4 foto",
      photosTooMany: "Massimo 4 foto",
      videoLabel: "Video del guasto",
      videoHelp: "Massimo 1 minuto",
      videoTooLong: "Il video deve durare al massimo 1 minuto",
      labelTitle: "Breve descrizione dell'incidente",
      labelTitleHelp: "Oggetto dell'email",
      labelDesc: "Descrizione dell'incidente",
      locationTitle: "Ubicazione del pannello",
      locationTraffic: "Traffico",
      locationTransport: "Trasporto",
      locationVia: "Via / strada",
      locationSentido: "Direzione",
      locationPk: "Punto chilometrico",
      locationProvince: "Provincia / Stato",
      locationStation: "Nome stazione",
      locationHelpTraffic: "Esempio: A-1 · Madrid → Burgos · PK 24+600",
      locationHelpTransport: "Esempio: Madrid · Stazione Sol",
      labelPriority: "Priorità",
      placeholderTitle: "Titolo",
      placeholderDesc: "Descrizione",
      low: "Bassa",
      medium: "Media",
      high: "Alta",
      send: "Invia",
      ok: "Incidente inviato.",
      ticketCreatedTitle: "Ticket creato",
      ticketNumberLabel: "Numero ticket",
      summaryTitle: "Riepilogo",
      backHome: "Torna all'inizio",
      createAnother: "Crea un'altra segnalazione",
      newButton: "Vai alle segnalazioni",
      reviewTitle: "Revisione ticket",
      reviewDesc: "Controlla i dati prima di inviare.",
      reviewButton: "Accetta",
      sendTicket: "Invia ticket",
      editTicket: "Modifica",
      incidentTitleLabel: "Breve descrizione dell'incidente",
      incidentTitleHelp: "Oggetto dell'email",
      incidentGeneralLabel: "Descrizione generale dell'incidente",
      required: "Campo obbligatorio",
      refInvalid: "Formato non valido (PN/MM/REF + 3 cifre + lettera)",
      serialInvalid: "Il seriale deve avere 6 cifre",
      validationError: "Controlla i campi evidenziati."
    }
  };
  const t = useTranslatedMap({ base: copy, lang, cacheKey: "failures" });


  function handleEquipmentPhotosUploaded(index, files) {
    setEquipments((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, uploadedPhotos: files } : item))
    );
  }

  function handleEquipmentVideoUploaded(index, files) {
    setEquipments((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, uploadedVideo: files[0] || null } : item))
    );
  }

  function validateForm() {
    const nextErrors = {};
    equipments.forEach((eq, index) => {
      const refValue = eq.refCode.trim();
      const serialValue = eq.serial.trim();
      const refOk = /^(PN|MM|REF)\d{3}[A-Z]$/i.test(refValue);
      const serialOk = /^\d{6}$/.test(serialValue);
      if (refValue && !refOk) nextErrors[`equipment-${index}-ref`] = t.refInvalid;
      if (!serialValue) nextErrors[`equipment-${index}-serial`] = t.required;
      else if (!serialOk) nextErrors[`equipment-${index}-serial`] = t.serialInvalid;
      if (!eq.description?.trim()) nextErrors[`equipment-${index}-desc`] = t.required;
    });
    if (!incidentTitle.trim()) nextErrors.incidentTitle = t.required;
    if (!incidentGeneralDesc.trim()) nextErrors.incidentGeneral = t.required;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return; // Prevenir doble envío
    if (!validateForm()) {
      return;
    }
    setSubmitting(true);
    try {
      const toCompanyString = (company) => {
        const list = Object.entries(company)
          .filter(([, value]) => value)
          .map(([key]) => (key === "dsta" ? "DSTA" : key === "lacroix" ? "Lacroix" : "Swarco"));
        return list.length ? list.join(", ") : null;
      };
      const payloadEquipments = equipments.map((eq) => ({
        title: incidentTitle.trim(),
        description: eq.description?.trim() || "",
        generalDescription: incidentGeneralDesc.trim(),
        company: toCompanyString(eq.company),
        refCode: eq.refCode.trim(),
        serial: eq.serial.trim(),
        locationType: eq.locationType,
        locationVia: eq.locationType === "trafico" ? eq.locationVia.trim() : "",
        locationSentido: eq.locationType === "trafico" ? eq.locationSentido.trim() : "",
        locationPk: eq.locationType === "trafico" ? eq.locationPk.trim() : "",
        locationProvince: eq.locationType === "transporte" ? eq.locationProvince.trim() : "",
        locationStation: eq.locationType === "transporte" ? eq.locationStation.trim() : "",
        photosCount: (eq.uploadedPhotos || []).length,
        photoUrls: (eq.uploadedPhotos || []).map(f => f.url),
        videoUrl: eq.uploadedVideo ? eq.uploadedVideo.url : null,
        videoName: eq.uploadedVideo ? eq.uploadedVideo.originalName : null
      }));
      const reportTitle = incidentTitle.trim();
      const reportDescription = payloadEquipments
        .map((eq, idx) => `Equipo ${idx + 1}: ${eq.description}\n\n${incidentGeneralDesc.trim()}`)
        .join("\n\n");
      const data = await apiRequest(
        "/api/failures",
        "POST",
        {
          titulo: reportTitle,
          descripcion: reportDescription,
          prioridad,
          equipments: payloadEquipments,
          photosCount: payloadEquipments.reduce((sum, eq) => sum + (eq.photosCount || 0), 0),
          videoName: payloadEquipments.find((eq) => eq.videoName)?.videoName || null
        },
        token
      );
      setMessage(t.ok);
      const firstEq = payloadEquipments[0] || {};
      setCreatedTicket({
        number: data.ticketNumber || `INC-${String(data.id || "").padStart(6, "0")}`,
        titulo: reportTitle,
        prioridad,
        companies: firstEq.company ? firstEq.company.split(", ").filter(Boolean) : [],
        location:
          firstEq.locationType === "trafico"
            ? `${firstEq.locationVia || "-"} | ${firstEq.locationSentido || "-"} | ${firstEq.locationPk || "-"}`
            : `${firstEq.locationProvince || "-"} | ${firstEq.locationStation || "-"}`,
        ref: firstEq.refCode || "",
        serial: firstEq.serial || "",
        equipmentCount: payloadEquipments.length,
        generalDescription: incidentGeneralDesc.trim()
      });
      setPrioridad(t.medium);
      setEquipments([
        {
          company: { dsta: false, lacroix: false, swarco: false },
          description: "",
          refCode: "",
          serial: "",
          locationType: "trafico",
          locationVia: "",
          locationSentido: "",
          locationPk: "",
          locationProvince: "",
          locationStation: "",
          uploadedPhotos: [],
          uploadedVideo: null
        }
      ]);
      setIncidentTitle("");
      setIncidentGeneralDesc("");
      setErrors({});
      setReviewing(false);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setMessage("");
    setCreatedTicket(null);
    setPrioridad(t.medium);
    setEquipments([
      {
        company: { dsta: false, lacroix: false, swarco: false },
        description: "",
        refCode: "",
        serial: "",
        locationType: "trafico",
        locationVia: "",
        locationSentido: "",
        locationPk: "",
        locationProvince: "",
        locationStation: "",
        uploadedPhotos: [],
        uploadedVideo: null
      }
    ]);
    setIncidentTitle("");
    setIncidentGeneralDesc("");
    setErrors({});
    setReviewing(false);
  }

  if (createdTicket) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h2 className="text-lg font-semibold text-swarcoBlue">{t.ticketCreatedTitle}</h2>
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-500">{t.ticketNumberLabel}</p>
          <p className="text-2xl font-semibold text-swarcoBlue">{createdTicket.number}</p>
        </div>
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-600">{t.summaryTitle}</h3>
          <div className="mt-2 space-y-1 text-sm text-slate-600">
            <div><strong>{t.labelTitle}:</strong> {createdTicket.titulo}</div>
            <div><strong>{t.labelPriority}:</strong> {createdTicket.prioridad}</div>
            <div><strong>{t.companiesLabel}:</strong> {createdTicket.companies.length ? createdTicket.companies.join(", ") : "-"}</div>
            <div><strong>{t.locationTitle}:</strong> {createdTicket.location}</div>
            <div><strong>{t.refLabel}:</strong> {createdTicket.ref}</div>
            <div><strong>{t.serialLabel}:</strong> {createdTicket.serial}</div>
            {createdTicket.equipmentCount ? (
              <div><strong>{t.equipmentTitle}:</strong> {createdTicket.equipmentCount}</div>
            ) : null}
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
          onClick={() => { window.location.hash = "incidents"; window.scrollTo(0, 0); }}
        >
          {t.newButton}
        </button>
      </div>
      <p className="text-sm text-slate-500 mt-3 mb-4">{t.subtitle}</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-slate-600">{t.stickerLabel}</label>
          <div className="flex flex-col items-center gap-2">
            <img
              src="/etiqueta.jpeg"
              alt="Pegatina"
              className="h-44 w-full max-w-xl rounded-lg border border-slate-200 bg-white object-contain"
            />
            <p className="text-xs text-slate-400 text-center">{t.stickerHint}</p>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-600">{t.incidentTitleLabel}</label>
          <input
            className={`w-full border rounded-lg px-3 py-2.5 ${errors.incidentTitle ? "border-swarcoOrange" : "border-slate-300"}`}
            placeholder={t.placeholderTitle}
            value={incidentTitle}
            onChange={(e) => setIncidentTitle(e.target.value)}
          />
          <p className={`text-xs ${errors.incidentTitle ? "text-swarcoOrange" : "text-slate-400"}`}>
            {errors.incidentTitle || t.incidentTitleHelp}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-600">{t.incidentGeneralLabel}</label>
          <textarea
            className={`w-full border rounded-lg px-3 py-2.5 ${errors.incidentGeneral ? "border-swarcoOrange" : "border-slate-300"}`}
            rows="3"
            placeholder={t.placeholderDesc}
            value={incidentGeneralDesc}
            onChange={(e) => setIncidentGeneralDesc(e.target.value)}
          />
          <p className={`text-xs ${errors.incidentGeneral ? "text-swarcoOrange" : "text-slate-400"}`}>
            {errors.incidentGeneral || t.incidentTitleHelp}
          </p>
        </div>
        {equipments.map((eq, index) => (
          <div key={`equipment-${index}`} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h3 className="text-sm font-semibold text-slate-700">
                {t.equipmentTitle} {index + 1}
              </h3>
              {equipments.length > 1 && (
                <button
                  type="button"
                  className="text-sm text-slate-500 hover:text-swarcoOrange"
                  onClick={() => {
                    setEquipments((prev) => prev.filter((_, idx) => idx !== index));
                  }}
                >
                  {t.removeEquipment}
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm text-slate-600">{t.labelDesc}</label>
                <textarea
                  className={`w-full border rounded-lg px-3 py-2.5 ${
                    errors[`equipment-${index}-desc`] ? "border-swarcoOrange" : "border-slate-300"
                  }`}
                  rows="3"
                  placeholder={t.placeholderDesc}
                  value={eq.description || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEquipments((prev) => prev.map((item, idx) => (idx === index ? { ...item, description: value } : item)));
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-600">{t.companiesLabel}</label>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="accent-swarcoBlue"
                      checked={eq.company.dsta || eq.company.lacroix}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEquipments((prev) => prev.map((item, idx) =>
                          idx === index ? { ...item, company: { ...item.company, dsta: checked, lacroix: checked } } : item
                        ));
                      }}
                    />
                    {`${t.companyDsta}/${t.companyLacroix}`}
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="accent-swarcoBlue"
                      checked={eq.company.swarco}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setEquipments((prev) => prev.map((item, idx) =>
                          idx === index ? { ...item, company: { ...item.company, swarco: checked } } : item
                        ));
                      }}
                    />
                    {t.companySwarco}
                  </label>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-slate-600">{t.refLabel}</label>
                  <input
                    className={`w-full border rounded-lg px-3 py-2.5 ${
                      errors[`equipment-${index}-ref`] ? "border-swarcoOrange" : "border-slate-300"
                    }`}
                    placeholder={t.refHelp}
                    value={eq.refCode}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      setEquipments((prev) => prev.map((item, idx) => (idx === index ? { ...item, refCode: value } : item)));
                    }}
                  />
                  <p className={`text-xs ${errors[`equipment-${index}-ref`] ? "text-swarcoOrange" : "text-slate-400"}`}>
                    {errors[`equipment-${index}-ref`] || t.refHelp}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-600">{t.serialLabel}</label>
                  <input
                    className={`w-full border rounded-lg px-3 py-2.5 ${
                      errors[`equipment-${index}-serial`] ? "border-swarcoOrange" : "border-slate-300"
                    }`}
                    placeholder={t.serialHelp}
                    value={eq.serial}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setEquipments((prev) => prev.map((item, idx) => (idx === index ? { ...item, serial: value } : item)));
                    }}
                  />
                  <p className={`text-xs ${errors[`equipment-${index}-serial`] ? "text-swarcoOrange" : "text-slate-400"}`}>
                    {errors[`equipment-${index}-serial`] || t.serialHelp}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-600">{t.locationTitle}</label>
                <div className="flex flex-wrap gap-4 text-sm text-slate-600 mb-3">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name={`locationType-${index}`}
                      className="accent-swarcoBlue"
                      checked={eq.locationType === "trafico"}
                      onChange={() => setEquipments((prev) => prev.map((item, idx) => (idx === index ? { ...item, locationType: "trafico" } : item)))}
                    />
                    {t.locationTraffic}
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      name={`locationType-${index}`}
                      className="accent-swarcoBlue"
                      checked={eq.locationType === "transporte"}
                      onChange={() => setEquipments((prev) => prev.map((item, idx) => (idx === index ? { ...item, locationType: "transporte" } : item)))}
                    />
                    {t.locationTransport}
                  </label>
                </div>
                {eq.locationType === "trafico" ? (
                  <>
                    <div className="grid gap-3 md:grid-cols-3">
                      <input
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5"
                        placeholder={t.locationVia}
                        value={eq.locationVia}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEquipments((prev) => prev.map((item, idx) => (idx === index ? { ...item, locationVia: value } : item)));
                        }}
                      />
                      <input
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5"
                        placeholder={t.locationSentido}
                        value={eq.locationSentido}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEquipments((prev) => prev.map((item, idx) => (idx === index ? { ...item, locationSentido: value } : item)));
                        }}
                      />
                      <input
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5"
                        placeholder={t.locationPk}
                        value={eq.locationPk}
                        onChange={(e) => {
                          const value = e.target.value;
                          setEquipments((prev) => prev.map((item, idx) => (idx === index ? { ...item, locationPk: value } : item)));
                        }}
                      />
                    </div>
                    <p className="text-xs text-slate-400">{t.locationHelpTraffic}</p>
                  </>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5"
                      placeholder={t.locationProvince}
                      value={eq.locationProvince}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEquipments((prev) => prev.map((item, idx) => (idx === index ? { ...item, locationProvince: value } : item)));
                      }}
                    />
                    <input
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5"
                      placeholder={t.locationStation}
                      value={eq.locationStation}
                      onChange={(e) => {
                        const value = e.target.value;
                        setEquipments((prev) => prev.map((item, idx) => (idx === index ? { ...item, locationStation: value } : item)));
                      }}
                    />
                    <p className="md:col-span-2 text-xs text-slate-400">{t.locationHelpTransport}</p>
                  </div>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-slate-600 flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-swarcoBlue">
                      <path d="M4 6h16v12H4z" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 14l3-3 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="9" cy="9" r="1.5" fill="currentColor" />
                    </svg>
                    {t.photosLabel}
                  </label>
                  <FileUploader
                    token={token}
                    folder="failures"
                    acceptedTypes="image/*"
                    maxFiles={4}
                    maxSize={5}
                    onUploadComplete={(files) => handleEquipmentPhotosUploaded(index, files)}
                    onUploadError={(error) => setMessage(error)}
                    lang={lang}
                  />
                  <p className="text-xs text-slate-400">{t.photosHelp}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-600 flex items-center gap-2">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="text-swarcoBlue">
                      <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M10 9l5 3-5 3V9z" fill="currentColor" />
                    </svg>
                    {t.videoLabel}
                  </label>
                  <FileUploader
                    token={token}
                    folder="failures"
                    acceptedTypes="video/*"
                    maxFiles={1}
                    maxSize={50}
                    onUploadComplete={(files) => handleEquipmentVideoUploaded(index, files)}
                    onUploadError={(error) => setMessage(error)}
                    lang={lang}
                  />
                  <p className="text-xs text-slate-400">{t.videoHelp}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
        {reviewing && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">{t.reviewTitle}</h3>
            <p className="text-xs text-slate-500 mt-1">{t.reviewDesc}</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div><strong>{t.incidentTitleLabel}:</strong> {incidentTitle || "-"}</div>
              <div><strong>{t.labelPriority}:</strong> {prioridad}</div>
              <div><strong>{t.incidentGeneralLabel}:</strong> {incidentGeneralDesc || "-"}</div>
              {equipments.map((eq, index) => (
                <div key={`review-${index}`} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="text-xs text-slate-500 mb-1">{t.equipmentTitle} {index + 1}</div>
                  <div><strong>{t.companiesLabel}:</strong> {Object.values(eq.company).some(Boolean) ? (
                    [
                      eq.company.dsta && eq.company.lacroix ? `${t.companyDsta}/${t.companyLacroix}` : null,
                      eq.company.swarco ? t.companySwarco : null
                    ].filter(Boolean).join(", ")
                  ) : "-"}</div>
                  <div><strong>{t.refLabel}:</strong> {eq.refCode || "-"}</div>
                  <div><strong>{t.serialLabel}:</strong> {eq.serial || "-"}</div>
                  <div><strong>{t.locationTitle}:</strong> {eq.locationType === "trafico"
                    ? `${eq.locationVia || "-"} | ${eq.locationSentido || "-"} | ${eq.locationPk || "-"}`
                    : `${eq.locationProvince || "-"} | ${eq.locationStation || "-"}`
                  }</div>
                </div>
              ))}
            </div>
          </div>
        )}
        <select className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white" value={prioridad} onChange={(e) => setPrioridad(e.target.value)}>
          <option>{t.low}</option>
          <option>{t.medium}</option>
          <option>{t.high}</option>
        </select>
        <div className="flex flex-wrap items-center gap-3">
          {!reviewing ? (
            <>
              <button
                type="button"
                className="border border-slate-300 text-slate-700 px-4 py-2 rounded-full hover:border-swarcoOrange/60"
                onClick={() => {
      setEquipments((prev) => ([
                    ...prev,
                    {
                      company: { dsta: false, lacroix: false, swarco: false },
                      description: "",
                      refCode: "",
                      serial: "",
                      locationType: "trafico",
                      locationVia: "",
                      locationSentido: "",
                      locationPk: "",
                      locationProvince: "",
                      locationStation: "",
                      uploadedPhotos: [],
                      uploadedVideo: null
                    }
                  ]));
                }}
              >
                {t.addEquipment}
              </button>
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
            </>
          ) : (
            <>
              <button 
                className="bg-swarcoBlue text-white px-4 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed" 
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Enviando..." : t.sendTicket}
              </button>
              <button
                type="button"
                className="border border-slate-300 text-slate-700 px-4 py-2 rounded-full hover:border-swarcoOrange/60"
                onClick={() => setReviewing(false)}
              >
                {t.editTicket}
              </button>
            </>
          )}
        </div>
        {message && <p className="text-sm text-gray-700">{message}</p>}
      </form>
    </div>
  );
}
