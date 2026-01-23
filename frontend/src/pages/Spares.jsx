import { useEffect, useState } from "react";
import { apiRequest } from "../lib/api.js";
import { useTranslatedMap } from "../lib/i18n.js";
import FileUploader from "../components/FileUploader.jsx";

export default function Spares({ token, lang = "es" }) {
  const [requestTitle, setRequestTitle] = useState("");
  const [requestGeneralDesc, setRequestGeneralDesc] = useState("");
  const [spares, setSpares] = useState([
    {
      company: { dsta: false, lacroix: false, swarco: false },
      proyecto: "",
      pais: "",
      provincia: "",
      refCode: "",
      serial: "",
      cantidad: 1,
      description: "",
      uploadedPhotos: []
    }
  ]);
  const [createdRequest, setCreatedRequest] = useState(null);
  const [reviewing, setReviewing] = useState(false);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");

  const copy = {
    es: {
      title: "Solicitud de Repuestos",
      subtitle: "Completa los datos de los repuestos que necesitas.",
      stickerLabel: "Foto de la pegatina",
      stickerHint: "Referencia visual para el cliente",
      companiesLabel: "Compañía",
      companyDsta: "DSTA",
      companyLacroix: "Lacroix",
      companySwarco: "Swarco",
      spareTitle: "Repuesto",
      addSpare: "Agregar otro repuesto",
      removeSpare: "Quitar repuesto",
      proyectoLabel: "Proyecto",
      paisLabel: "País",
      provinciaLabel: "Provincia",
      refLabel: "Referencia (REF / PN / MM)",
      serialLabel: "Nº de serie",
      cantidadLabel: "Cantidad",
      refHelp: "Ejemplo: PN123A · MM456B · REF789C",
      serialHelp: "6 dígitos numéricos",
      photosLabel: "Fotos del repuesto",
      photosHelp: "Máximo 4 fotos",
      photosTooMany: "Máximo 4 fotos",
      labelTitle: "Pequeña descripción de la solicitud",
      labelTitleHelp: "Encabezado del correo",
      labelDesc: "Descripción del repuesto",
      labelGeneralDesc: "Descripción general de la solicitud",
      placeholderTitle: "Título",
      placeholderDesc: "Descripción",
      send: "Enviar",
      ok: "Solicitud enviada.",
      requestCreatedTitle: "Solicitud creada",
      requestNumberLabel: "Número de solicitud",
      summaryTitle: "Resumen",
      backHome: "Volver al inicio",
      createAnother: "Crear otra solicitud",
      newButton: "Ir a solicitudes",
      reviewTitle: "Revisión de la solicitud",
      reviewDesc: "Verifica los datos antes de enviar.",
      reviewButton: "Aceptar",
      sendRequest: "Enviar solicitud",
      editRequest: "Editar",
      requestTitleLabel: "Pequeña descripción de la solicitud",
      requestTitleHelp: "Encabezado del correo",
      requestGeneralLabel: "Descripción general de la solicitud",
      required: "Campo obligatorio",
      refInvalid: "Formato inválido (PN/MM/REF + 3 dígitos + letra)",
      serialInvalid: "El serial debe tener 6 dígitos",
      validationError: "Revisa los campos marcados."
    },
    en: {
      title: "Spare Parts Request",
      subtitle: "Complete the details of the spare parts you need.",
      stickerLabel: "Sticker photo",
      stickerHint: "Visual reference for the customer",
      companiesLabel: "Company",
      companyDsta: "DSTA",
      companyLacroix: "Lacroix",
      companySwarco: "Swarco",
      spareTitle: "Spare Part",
      addSpare: "Add another spare part",
      removeSpare: "Remove spare part",
      proyectoLabel: "Project",
      paisLabel: "Country",
      provinciaLabel: "Province",
      refLabel: "Reference (REF / PN / MM)",
      serialLabel: "Serial number",
      cantidadLabel: "Quantity",
      refHelp: "Example: PN123A · MM456B · REF789C",
      serialHelp: "6 numeric digits",
      photosLabel: "Spare part photos",
      photosHelp: "Up to 4 photos",
      photosTooMany: "Maximum 4 photos",
      labelTitle: "Short request description",
      labelTitleHelp: "Email subject",
      labelDesc: "Spare part description",
      labelGeneralDesc: "General request description",
      placeholderTitle: "Title",
      placeholderDesc: "Description",
      send: "Send",
      ok: "Request sent.",
      requestCreatedTitle: "Request created",
      requestNumberLabel: "Request number",
      summaryTitle: "Summary",
      backHome: "Back to home",
      createAnother: "Create another request",
      newButton: "Go to requests",
      reviewTitle: "Request review",
      reviewDesc: "Check the details before sending.",
      reviewButton: "Accept",
      sendRequest: "Send request",
      editRequest: "Edit",
      requestTitleLabel: "Short request description",
      requestTitleHelp: "Email subject",
      requestGeneralLabel: "General request description",
      required: "Required field",
      refInvalid: "Invalid format (PN/MM/REF + 3 digits + letter)",
      serialInvalid: "Serial must be 6 digits",
      validationError: "Check the highlighted fields."
    }
  };
  const t = useTranslatedMap({ base: copy, lang, cacheKey: "spares" });

  function validateForm() {
    const nextErrors = {};
    spares.forEach((spare, index) => {
      const refValue = spare.refCode.trim();
      const serialValue = spare.serial.trim();
      const refOk = /^(PN|MM|REF)\d{3}[A-Z]$/i.test(refValue);
      const serialOk = /^\d{6}$/.test(serialValue);
      if (refValue && !refOk) nextErrors[`spare-${index}-ref`] = t.refInvalid;
      if (!serialValue) nextErrors[`spare-${index}-serial`] = t.required;
      else if (!serialOk) nextErrors[`spare-${index}-serial`] = t.serialInvalid;
      if (!spare.description?.trim()) nextErrors[`spare-${index}-desc`] = t.required;
      if (!spare.proyecto?.trim()) nextErrors[`spare-${index}-proyecto`] = t.required;
      if (!spare.pais?.trim()) nextErrors[`spare-${index}-pais`] = t.required;
      if (!spare.provincia?.trim()) nextErrors[`spare-${index}-provincia`] = t.required;
    });
    if (!requestTitle.trim()) nextErrors.requestTitle = t.required;
    if (!requestGeneralDesc.trim()) nextErrors.requestGeneral = t.required;

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function handleSparePhotosUploaded(index, files) {
    setSpares((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, uploadedPhotos: files } : item))
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage("");
    if (!validateForm()) {
      setMessage(t.validationError);
      return;
    }
    try {
      const toCompanyString = (company) => {
        const list = Object.entries(company)
          .filter(([, value]) => value)
          .map(([key]) => (key === "dsta" ? "DSTA" : key === "lacroix" ? "Lacroix" : "Swarco"));
        return list.length ? list.join(", ") : null;
      };
      const payloadSpares = spares.map((spare) => ({
        title: requestTitle.trim(),
        description: spare.description?.trim() || "",
        generalDescription: requestGeneralDesc.trim(),
        company: toCompanyString(spare.company),
        proyecto: spare.proyecto.trim(),
        pais: spare.pais.trim(),
        provincia: spare.provincia.trim(),
        refCode: spare.refCode.trim(),
        serial: spare.serial.trim(),
        cantidad: spare.cantidad || 1,
        photosCount: (spare.uploadedPhotos || []).length,
        photoUrls: (spare.uploadedPhotos || []).map(f => f.url)
      }));
      const data = await apiRequest(
        "/api/spares",
        "POST",
        {
          titulo: requestTitle.trim(),
          descripcion: requestGeneralDesc.trim(),
          spares: payloadSpares
        },
        token
      );
      setMessage(t.ok);
      const firstSpare = payloadSpares[0] || {};
      setCreatedRequest({
        number: data.requestNumber || `REP-${String(data.id || "").padStart(6, "0")}`,
        titulo: requestTitle.trim(),
        companies: firstSpare.company ? firstSpare.company.split(", ").filter(Boolean) : [],
        proyecto: firstSpare.proyecto || "",
        pais: firstSpare.pais || "",
        provincia: firstSpare.provincia || "",
        ref: firstSpare.refCode || "",
        serial: firstSpare.serial || "",
        cantidad: firstSpare.cantidad || 1,
        spareCount: payloadSpares.length,
        generalDescription: requestGeneralDesc.trim()
      });
      setSpares([
        {
          company: { dsta: false, lacroix: false, swarco: false },
          proyecto: "",
          pais: "",
          provincia: "",
          refCode: "",
          serial: "",
          cantidad: 1,
          description: "",
          uploadedPhotos: []
        }
      ]);
      setRequestTitle("");
      setRequestGeneralDesc("");
      setErrors({});
      setReviewing(false);
    } catch (err) {
      setMessage(err.message);
    }
  }

  function resetForm() {
    setMessage("");
    setCreatedRequest(null);
    setSpares([
      {
        company: { dsta: false, lacroix: false, swarco: false },
        proyecto: "",
        pais: "",
        provincia: "",
        refCode: "",
        serial: "",
        cantidad: 1,
        description: "",
        uploadedPhotos: []
      }
    ]);
    setRequestTitle("");
    setRequestGeneralDesc("");
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
            <div><strong>{t.companiesLabel}:</strong> {createdRequest.companies.length ? createdRequest.companies.join(", ") : "-"}</div>
            <div><strong>{t.proyectoLabel}:</strong> {createdRequest.proyecto}</div>
            <div><strong>{t.paisLabel}:</strong> {createdRequest.pais}</div>
            <div><strong>{t.provinciaLabel}:</strong> {createdRequest.provincia}</div>
            <div><strong>{t.refLabel}:</strong> {createdRequest.ref}</div>
            <div><strong>{t.serialLabel}:</strong> {createdRequest.serial}</div>
            <div><strong>{t.cantidadLabel}:</strong> {createdRequest.cantidad}</div>
            {createdRequest.spareCount > 1 ? (
              <div><strong>{t.spareTitle}:</strong> {createdRequest.spareCount}</div>
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
          onClick={() => { window.location.hash = "spares"; window.scrollTo(0, 0); }}
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
          <label className="text-sm text-slate-600">{t.requestTitleLabel}</label>
          <input
            className={`w-full border rounded-lg px-3 py-2.5 ${errors.requestTitle ? "border-swarcoOrange" : "border-slate-300"}`}
            placeholder={t.placeholderTitle}
            value={requestTitle}
            onChange={(e) => setRequestTitle(e.target.value)}
          />
          <p className={`text-xs ${errors.requestTitle ? "text-swarcoOrange" : "text-slate-400"}`}>
            {errors.requestTitle || t.requestTitleHelp}
          </p>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate-600">{t.requestGeneralLabel}</label>
          <textarea
            className={`w-full border rounded-lg px-3 py-2.5 ${errors.requestGeneral ? "border-swarcoOrange" : "border-slate-300"}`}
            rows="3"
            placeholder={t.placeholderDesc}
            value={requestGeneralDesc}
            onChange={(e) => setRequestGeneralDesc(e.target.value)}
          />
          <p className={`text-xs ${errors.requestGeneral ? "text-swarcoOrange" : "text-slate-400"}`}>
            {errors.requestGeneral || t.requestTitleHelp}
          </p>
        </div>
        {spares.map((spare, index) => (
          <div key={`spare-${index}`} className="rounded-xl border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <h3 className="text-sm font-semibold text-slate-700">
                {t.spareTitle} {index + 1}
              </h3>
              {spares.length > 1 && (
                <button
                  type="button"
                  className="text-sm text-slate-500 hover:text-swarcoOrange"
                  onClick={() => {
                    setSpares((prev) => prev.filter((_, idx) => idx !== index));
                  }}
                >
                  {t.removeSpare}
                </button>
              )}
            </div>
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-sm text-slate-600">{t.labelDesc}</label>
                <textarea
                  className={`w-full border rounded-lg px-3 py-2.5 ${
                    errors[`spare-${index}-desc`] ? "border-swarcoOrange" : "border-slate-300"
                  }`}
                  rows="3"
                  placeholder={t.placeholderDesc}
                  value={spare.description || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSpares((prev) => prev.map((item, idx) => (idx === index ? { ...item, description: value } : item)));
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
                      checked={spare.company.dsta && spare.company.lacroix}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSpares((prev) => prev.map((item, idx) =>
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
                      checked={spare.company.swarco}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSpares((prev) => prev.map((item, idx) =>
                          idx === index ? { ...item, company: { ...item.company, swarco: checked } } : item
                        ));
                      }}
                    />
                    {t.companySwarco}
                  </label>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm text-slate-600">{t.proyectoLabel}</label>
                  <input
                    className={`w-full border rounded-lg px-3 py-2.5 ${
                      errors[`spare-${index}-proyecto`] ? "border-swarcoOrange" : "border-slate-300"
                    }`}
                    placeholder={t.proyectoLabel}
                    value={spare.proyecto}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSpares((prev) => prev.map((item, idx) => (idx === index ? { ...item, proyecto: value } : item)));
                    }}
                  />
                  <p className={`text-xs ${errors[`spare-${index}-proyecto`] ? "text-swarcoOrange" : "text-slate-400"}`}>
                    {errors[`spare-${index}-proyecto`] || t.required}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-600">{t.paisLabel}</label>
                  <input
                    className={`w-full border rounded-lg px-3 py-2.5 ${
                      errors[`spare-${index}-pais`] ? "border-swarcoOrange" : "border-slate-300"
                    }`}
                    placeholder={t.paisLabel}
                    value={spare.pais}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSpares((prev) => prev.map((item, idx) => (idx === index ? { ...item, pais: value } : item)));
                    }}
                  />
                  <p className={`text-xs ${errors[`spare-${index}-pais`] ? "text-swarcoOrange" : "text-slate-400"}`}>
                    {errors[`spare-${index}-pais`] || t.required}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-600">{t.provinciaLabel}</label>
                  <input
                    className={`w-full border rounded-lg px-3 py-2.5 ${
                      errors[`spare-${index}-provincia`] ? "border-swarcoOrange" : "border-slate-300"
                    }`}
                    placeholder={t.provinciaLabel}
                    value={spare.provincia}
                    onChange={(e) => {
                      const value = e.target.value;
                      setSpares((prev) => prev.map((item, idx) => (idx === index ? { ...item, provincia: value } : item)));
                    }}
                  />
                  <p className={`text-xs ${errors[`spare-${index}-provincia`] ? "text-swarcoOrange" : "text-slate-400"}`}>
                    {errors[`spare-${index}-provincia`] || t.required}
                  </p>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="space-y-2">
                  <label className="text-sm text-slate-600">{t.refLabel}</label>
                  <input
                    className={`w-full border rounded-lg px-3 py-2.5 ${
                      errors[`spare-${index}-ref`] ? "border-swarcoOrange" : "border-slate-300"
                    }`}
                    placeholder={t.refHelp}
                    value={spare.refCode}
                    onChange={(e) => {
                      const value = e.target.value.toUpperCase();
                      setSpares((prev) => prev.map((item, idx) => (idx === index ? { ...item, refCode: value } : item)));
                    }}
                  />
                  <p className={`text-xs ${errors[`spare-${index}-ref`] ? "text-swarcoOrange" : "text-slate-400"}`}>
                    {errors[`spare-${index}-ref`] || t.refHelp}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-600">{t.serialLabel}</label>
                  <input
                    className={`w-full border rounded-lg px-3 py-2.5 ${
                      errors[`spare-${index}-serial`] ? "border-swarcoOrange" : "border-slate-300"
                    }`}
                    placeholder={t.serialHelp}
                    value={spare.serial}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setSpares((prev) => prev.map((item, idx) => (idx === index ? { ...item, serial: value } : item)));
                    }}
                  />
                  <p className={`text-xs ${errors[`spare-${index}-serial`] ? "text-swarcoOrange" : "text-slate-400"}`}>
                    {errors[`spare-${index}-serial`] || t.serialHelp}
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-slate-600">{t.cantidadLabel}</label>
                  <input
                    type="number"
                    min="1"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5"
                    value={spare.cantidad}
                    onChange={(e) => {
                      const value = Number(e.target.value) || 1;
                      setSpares((prev) => prev.map((item, idx) => (idx === index ? { ...item, cantidad: value } : item)));
                    }}
                  />
                </div>
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
                  folder="spares"
                  acceptedTypes="image/*"
                  maxFiles={4}
                  maxSize={5}
                  onUploadComplete={(files) => handleSparePhotosUploaded(index, files)}
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
              <div><strong>{t.requestTitleLabel}:</strong> {requestTitle || "-"}</div>
              <div><strong>{t.requestGeneralLabel}:</strong> {requestGeneralDesc || "-"}</div>
              {spares.map((spare, index) => (
                <div key={`review-${index}`} className="rounded-lg border border-slate-200 bg-white p-3">
                  <div className="text-xs text-slate-500 mb-1">{t.spareTitle} {index + 1}</div>
                  <div><strong>{t.companiesLabel}:</strong> {Object.values(spare.company).some(Boolean) ? (
                    [
                      spare.company.dsta && spare.company.lacroix ? `${t.companyDsta}/${t.companyLacroix}` : null,
                      spare.company.swarco ? t.companySwarco : null
                    ].filter(Boolean).join(", ")
                  ) : "-"}</div>
                  <div><strong>{t.proyectoLabel}:</strong> {spare.proyecto || "-"}</div>
                  <div><strong>{t.paisLabel}:</strong> {spare.pais || "-"}</div>
                  <div><strong>{t.provinciaLabel}:</strong> {spare.provincia || "-"}</div>
                  <div><strong>{t.refLabel}:</strong> {spare.refCode || "-"}</div>
                  <div><strong>{t.serialLabel}:</strong> {spare.serial || "-"}</div>
                  <div><strong>{t.cantidadLabel}:</strong> {spare.cantidad || 1}</div>
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
                  setSpares((prev) => ([
                    ...prev,
                    {
                      company: { dsta: false, lacroix: false, swarco: false },
                      proyecto: "",
                      pais: "",
                      provincia: "",
                      refCode: "",
                      serial: "",
                      cantidad: 1,
                      description: "",
                      uploadedPhotos: []
                    }
                  ]));
                }}
              >
                {t.addSpare}
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
