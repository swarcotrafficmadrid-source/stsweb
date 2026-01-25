import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api.js";
import { useTranslatedMap } from "../lib/i18n.js";
import FileUploader from "../components/FileUploader.jsx";

export default function Purchases({ token, lang = "es" }) {
  const [requestTitle, setRequestTitle] = useState("");
  const [proyecto, setProyecto] = useState("");
  const [pais, setPais] = useState("");
  const [equipments, setEquipments] = useState([{ nombre: "", cantidad: 1, descripcion: "", uploadedPhotos: [] }]);
  const [createdRequest, setCreatedRequest] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const copy = {
    es: {
      title: "Solicitud de Compra",
      subtitle: "Completa los datos de los equipos que deseas comprar.",
      equipmentTitle: "Equipo",
      addEquipment: "Agregar otro equipo",
      removeEquipment: "Quitar equipo",
      nombreLabel: "Nombre del equipo",
      cantidadLabel: "Cantidad",
      descripcionLabel: "Descripción",
      photosLabel: "Fotos del equipo",
      photosHelp: "Máximo 4 fotos",
      photosTooMany: "Máximo 4 fotos",
      proyectoLabel: "Proyecto",
      paisLabel: "País",
      labelTitle: "Pequeña descripción de la solicitud",
      labelTitleHelp: "Encabezado del correo",
      placeholderTitle: "Título",
      placeholderDesc: "Descripción",
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
      validationError: "Revisa los campos marcados."
    },
    en: {
      title: "Purchase Request",
      subtitle: "Complete the details of the equipment you want to purchase.",
      equipmentTitle: "Equipment",
      addEquipment: "Add another equipment",
      removeEquipment: "Remove equipment",
      nombreLabel: "Equipment name",
      cantidadLabel: "Quantity",
      descripcionLabel: "Description",
      photosLabel: "Equipment photos",
      photosHelp: "Up to 4 photos",
      photosTooMany: "Maximum 4 photos",
      proyectoLabel: "Project",
      paisLabel: "Country",
      labelTitle: "Short request description",
      labelTitleHelp: "Email subject",
      placeholderTitle: "Title",
      placeholderDesc: "Description",
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
      validationError: "Check the highlighted fields."
    },
    it: {
      title: "Richiesta di Acquisto",
      subtitle: "Completa i dati dell'attrezzatura che desideri acquistare.",
      equipmentTitle: "Attrezzatura",
      addEquipment: "Aggiungi altra attrezzatura",
      removeEquipment: "Rimuovi attrezzatura",
      nombreLabel: "Nome dell'attrezzatura",
      cantidadLabel: "Quantità",
      descripcionLabel: "Descrizione",
      photosLabel: "Foto dell'attrezzatura",
      photosHelp: "Massimo 4 foto",
      photosTooMany: "Massimo 4 foto",
      proyectoLabel: "Progetto",
      paisLabel: "Paese",
      labelTitle: "Breve descrizione della richiesta",
      labelTitleHelp: "Oggetto dell'email",
      placeholderTitle: "Titolo",
      placeholderDesc: "Descrizione",
      send: "Invia",
      ok: "Richiesta inviata.",
      requestCreatedTitle: "Richiesta creata",
      requestNumberLabel: "Numero richiesta",
      summaryTitle: "Riepilogo",
      backHome: "Torna all'inizio",
      createAnother: "Crea un'altra richiesta",
      newButton: "Nuova richiesta",
      reviewTitle: "Revisione della richiesta",
      reviewDesc: "Verifica i dati prima di inviare.",
      reviewButton: "Accetta",
      sendRequest: "Invia richiesta",
      editRequest: "Modifica",
      required: "Campo obbligatorio",
      validationError: "Controlla i campi evidenziati."
    }
  };
  const t = useTranslatedMap({ base: copy, lang, cacheKey: "purchases" });

  function validateForm() {
    const nextErrors = {};
    equipments.forEach((eq, index) => {
      if (!eq.nombre?.trim()) nextErrors[`equipment-${index}-nombre`] = t.required;
      if (!eq.cantidad || eq.cantidad < 1) nextErrors[`equipment-${index}-cantidad`] = t.required;
    });
    if (!requestTitle.trim()) nextErrors.requestTitle = t.required;
    if (!proyecto.trim()) nextErrors.proyecto = t.required;
    if (!pais.trim()) nextErrors.pais = t.required;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleEquipmentPhotosUploaded(index, files) {
    setEquipments((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, uploadedPhotos: files } : item))
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (submitting) return; // Prevenir doble envío
    setMessage("");
    if (!validateForm()) {
      setMessage(t.validationError);
      return;
    }
    setSubmitting(true);
    try {
      const data = await apiRequest(
        "/api/purchases",
        "POST",
        {
          titulo: requestTitle.trim(),
          proyecto: proyecto.trim(),
          pais: pais.trim(),
          equipments: equipments.map(eq => ({
            nombre: eq.nombre.trim(),
            cantidad: eq.cantidad || 1,
            descripcion: eq.descripcion?.trim() || "",
            photosCount: (eq.uploadedPhotos || []).length,
            photoUrls: (eq.uploadedPhotos || []).map(f => f.url)
          }))
        },
        token
      );
      setMessage(t.ok);
      setCreatedRequest({
        number: data.requestNumber || `COM-${String(data.id || "").padStart(6, "0")}`,
        titulo: requestTitle.trim(),
        proyecto: proyecto.trim(),
        pais: pais.trim(),
        equipmentCount: equipments.length
      });
      setRequestTitle("");
      setProyecto("");
      setPais("");
      setEquipments([{ nombre: "", cantidad: 1, descripcion: "", uploadedPhotos: [] }]);
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
    setCreatedRequest(null);
    setRequestTitle("");
    setProyecto("");
    setPais("");
    setEquipments([{ nombre: "", cantidad: 1, descripcion: "", uploadedPhotos: [] }]);
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
            <div><strong>{t.labelTitle}:</strong> {createdRequest.titulo}</div>
            <div><strong>{t.proyectoLabel}:</strong> {createdRequest.proyecto}</div>
            <div><strong>{t.paisLabel}:</strong> {createdRequest.pais}</div>
            <div><strong>{t.equipmentTitle}:</strong> {createdRequest.equipmentCount}</div>
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
          <label className="text-sm text-slate-600">{t.labelTitle}</label>
          <input
            className={`w-full border rounded-lg px-3 py-2.5 ${errors.requestTitle ? "border-swarcoOrange" : "border-slate-300"}`}
            placeholder={t.placeholderTitle}
            value={requestTitle}
            onChange={(e) => setRequestTitle(e.target.value)}
          />
          <p className={`text-xs ${errors.requestTitle ? "text-swarcoOrange" : "text-slate-400"}`}>
            {errors.requestTitle || t.labelTitleHelp}
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm text-slate-600">{t.proyectoLabel}</label>
            <input
              className={`w-full border rounded-lg px-3 py-2.5 ${errors.proyecto ? "border-swarcoOrange" : "border-slate-300"}`}
              placeholder={t.proyectoLabel}
              value={proyecto}
              onChange={(e) => setProyecto(e.target.value)}
            />
            <p className={`text-xs ${errors.proyecto ? "text-swarcoOrange" : "text-slate-400"}`}>
              {errors.proyecto || t.required}
            </p>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate-600">{t.paisLabel}</label>
            <input
              className={`w-full border rounded-lg px-3 py-2.5 ${errors.pais ? "border-swarcoOrange" : "border-slate-300"}`}
              placeholder={t.paisLabel}
              value={pais}
              onChange={(e) => setPais(e.target.value)}
            />
            <p className={`text-xs ${errors.pais ? "text-swarcoOrange" : "text-slate-400"}`}>
              {errors.pais || t.required}
            </p>
          </div>
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
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm text-slate-600">{t.nombreLabel}</label>
                  <input
                    className={`w-full border rounded-lg px-3 py-2.5 ${
                      errors[`equipment-${index}-nombre`] ? "border-swarcoOrange" : "border-slate-300"
                    }`}
                    placeholder={t.nombreLabel}
                    value={eq.nombre}
                    onChange={(e) => {
                      const value = e.target.value;
                      setEquipments((prev) => prev.map((item, idx) => (idx === index ? { ...item, nombre: value } : item)));
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-600">{t.cantidadLabel}</label>
                  <input
                    type="number"
                    min="1"
                    className={`w-full border rounded-lg px-3 py-2.5 ${
                      errors[`equipment-${index}-cantidad`] ? "border-swarcoOrange" : "border-slate-300"
                    }`}
                    value={eq.cantidad}
                    onChange={(e) => {
                      const value = Number(e.target.value) || 1;
                      setEquipments((prev) => prev.map((item, idx) => (idx === index ? { ...item, cantidad: value } : item)));
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-slate-600">{t.descripcionLabel}</label>
                <textarea
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5"
                  rows="2"
                  placeholder={t.placeholderDesc}
                  value={eq.descripcion || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEquipments((prev) => prev.map((item, idx) => (idx === index ? { ...item, descripcion: value } : item)));
                  }}
                />
              </div>
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
                  folder="purchases"
                  acceptedTypes="image/*"
                  maxFiles={4}
                  maxSize={5}
                  onUploadComplete={(files) => handleEquipmentPhotosUploaded(index, files)}
                  onUploadError={(error) => setMessage(error)}
                  lang={lang}
                />
                <p className="text-xs text-slate-400">{t.photosHelp}</p>
              </div>
            </div>
          </div>
        ))}
        {reviewing && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h3 className="text-sm font-semibold text-slate-700">{t.reviewTitle}</h3>
            <p className="text-xs text-slate-500 mt-1">{t.reviewDesc}</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <div><strong>{t.labelTitle}:</strong> {requestTitle || "-"}</div>
              <div><strong>{t.proyectoLabel}:</strong> {proyecto || "-"}</div>
              <div><strong>{t.paisLabel}:</strong> {pais || "-"}</div>
              {equipments.map((eq, index) => (
                <div key={`review-${index}`} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="text-xs text-slate-500 mb-1">{t.equipmentTitle} {index + 1}</div>
                  <div><strong>{t.nombreLabel}:</strong> {eq.nombre || "-"}</div>
                  <div><strong>{t.cantidadLabel}:</strong> {eq.cantidad || 1}</div>
                  {eq.descripcion && <div><strong>{t.descripcionLabel}:</strong> {eq.descripcion}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3">
          {!reviewing ? (
            <>
              <button
                type="button"
                className="border border-slate-300 text-slate-700 px-4 py-2 rounded-full hover:border-swarcoOrange/60"
                onClick={() => {
                  setEquipments((prev) => ([...prev, { nombre: "", cantidad: 1, descripcion: "", uploadedPhotos: [] }]));
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
                {submitting ? "Enviando..." : t.sendRequest}
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
