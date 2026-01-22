import { useMemo, useState } from "react";
import { apiRequest } from "../lib/api.js";
import { useTranslatedMap } from "../lib/i18n.js";

const COUNTRIES = [
  { code: "ES", name: "España", nameEs: "España", dial: "+34" },
  { code: "FR", name: "France", nameEs: "Francia", dial: "+33" },
  { code: "DE", name: "Deutschland", nameEs: "Alemania", dial: "+49" },
  { code: "IT", name: "Italia", nameEs: "Italia", dial: "+39" },
  { code: "PT", name: "Portugal", nameEs: "Portugal", dial: "+351" },
  { code: "GB", name: "United Kingdom", nameEs: "Reino Unido", dial: "+44" },
  { code: "US", name: "United States", nameEs: "Estados Unidos", dial: "+1" },
  { code: "MX", name: "México", nameEs: "México", dial: "+52" },
  { code: "AR", name: "Argentina", nameEs: "Argentina", dial: "+54" },
  { code: "CO", name: "Colombia", nameEs: "Colombia", dial: "+57" },
  { code: "CL", name: "Chile", nameEs: "Chile", dial: "+56" },
  { code: "PE", name: "Perú", nameEs: "Perú", dial: "+51" }
];

function getPasswordScore(value) {
  let score = 0;
  if (value.length >= 8) score += 1;
  if (/[a-z]/.test(value)) score += 1;
  if (/[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value)) score += 1;
  return score;
}

export default function Register({ lang = "es", onRegistered }) {
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [email, setEmail] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [pais, setPais] = useState("ES");
  const [telefono, setTelefono] = useState("");
  const [cargo, setCargo] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [legalAccepted, setLegalAccepted] = useState(false);
  const [result, setResult] = useState("");
  const [resultOk, setResultOk] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [successNotice, setSuccessNotice] = useState("");

  const country = useMemo(
    () => COUNTRIES.find((item) => item.code === pais) || COUNTRIES[0],
    [pais]
  );
  const passwordScore = getPasswordScore(password);

  const copy = {
    es: {
      sectionPersonal: "Datos personales",
      sectionWork: "Datos del trabajo",
      sectionAccess: "Clave de acceso",
      sectionLegal: "Legal",
      nombre: "Nombre",
      apellidos: "Apellidos",
      email: "Email de trabajo",
      emailPlaceholder: "correo@empresa.com",
      empresa: "Empresa",
      pais: "País",
      telefono: "Teléfono",
      cargo: "Cargo",
      cargoOptions: ["Técnico", "Encargado", "Otro"],
      password: "Contraseña",
      password2: "Repite la contraseña",
      passwordMismatch: "Las contraseñas no coinciden.",
      emailInvalid: "Email inválido",
      missingField: "Falta completar:",
      legalRequired: "Debes aceptar la política de protección de datos.",
      passwordHint: "Debe incluir mayúscula, minúscula, número y carácter especial.",
      showPassword: "Mostrar",
      hidePassword: "Ocultar",
      strengthLabel: "Seguridad",
      strength: ["Muy débil", "Débil", "Media", "Fuerte", "Muy fuerte", "Excelente"],
      legalText: "He leído y acepto la política de protección de datos.",
      legalLink: "Ver política",
      button: "Registrar",
      buttonLoading: "Creando cuenta...",
      successMail: "Usuario creado con éxito. En breve recibirás un correo con la activación de tu cuenta completada.",
      successNoMail: "Usuario creado con éxito, pero no se pudo enviar el correo de activación. Contacta soporte.",
      activationNotice: "IMPORTANTE: hasta que no actives tu cuenta desde el correo, no podrás entrar. Revisa tu email.",
      activationTitle: "Usuario creado con éxito",
      activationCta: "Revisa tu correo para continuar con el registro.",
      closeModal: "Entendido",
      mailReasonConnection: "Motivo: problema de conexión.",
      mailReasonEmail: "Motivo: error en el correo.",
      mailReasonDefault: "Motivo: error al enviar."
    },
    en: {
      sectionPersonal: "Personal data",
      sectionWork: "Work details",
      sectionAccess: "Access password",
      sectionLegal: "Legal",
      nombre: "Name",
      apellidos: "Surname",
      email: "Work email",
      emailPlaceholder: "email@company.com",
      empresa: "Company",
      pais: "Country",
      telefono: "Phone",
      cargo: "Role",
      cargoOptions: ["Technician", "Supervisor", "Other"],
      password: "Password",
      password2: "Repeat password",
      passwordMismatch: "Passwords do not match.",
      emailInvalid: "Invalid email",
      missingField: "Missing:",
      legalRequired: "You must accept the data protection policy.",
      passwordHint: "Must include uppercase, lowercase, number, and special character.",
      showPassword: "Show",
      hidePassword: "Hide",
      strengthLabel: "Strength",
      strength: ["Very weak", "Weak", "Medium", "Strong", "Very strong", "Excellent"],
      legalText: "I have read and accept the data protection policy.",
      legalLink: "View policy",
      button: "Create account",
      buttonLoading: "Creating account...",
      successMail: "Account created successfully. You will receive an activation email shortly.",
      successNoMail: "Account created, but the activation email could not be sent. Please contact support.",
      activationNotice: "IMPORTANT: you cannot sign in until you activate your account from the email. Check your inbox.",
      activationTitle: "Account created successfully",
      activationCta: "Check your email to continue the registration.",
      closeModal: "Got it",
      mailReasonConnection: "Reason: connection problem.",
      mailReasonEmail: "Reason: email error.",
      mailReasonDefault: "Reason: sending failed."
    },
    it: {
      sectionPersonal: "Dati personali",
      sectionWork: "Dati di lavoro",
      sectionAccess: "Password di accesso",
      sectionLegal: "Legale",
      nombre: "Nome",
      apellidos: "Cognome",
      email: "Email di lavoro",
      emailPlaceholder: "email@azienda.com",
      empresa: "Azienda",
      pais: "Paese",
      telefono: "Telefono",
      cargo: "Ruolo",
      cargoOptions: ["Tecnico", "Responsabile", "Altro"],
      password: "Password",
      password2: "Ripeti password",
      passwordMismatch: "Le password non coincidono.",
      emailInvalid: "Email non valida",
      missingField: "Manca:",
      legalRequired: "Devi accettare la policy di protezione dei dati.",
      passwordHint: "Deve includere maiuscola, minuscola, numero e carattere speciale.",
      showPassword: "Mostra",
      hidePassword: "Nascondi",
      strengthLabel: "Sicurezza",
      strength: ["Molto debole", "Debole", "Media", "Forte", "Molto forte", "Eccellente"],
      legalText: "Ho letto e accetto la politica di protezione dei dati.",
      legalLink: "Vedi policy",
      button: "Registrati",
      buttonLoading: "Creazione account...",
      successMail: "Account creato con successo. Riceverai a breve un'email di attivazione.",
      successNoMail: "Account creato, ma l'email di attivazione non è stata inviata. Contatta il supporto.",
      activationNotice: "IMPORTANTE: non puoi accedere finché non attivi l'account dall'email. Controlla la posta.",
      activationTitle: "Account creato con successo",
      activationCta: "Controlla l'email per continuare la registrazione.",
      closeModal: "Capito",
      mailReasonConnection: "Motivo: problema di connessione.",
      mailReasonEmail: "Motivo: errore email.",
      mailReasonDefault: "Motivo: invio fallito."
    }
  };
  const t = useTranslatedMap({ base: copy, lang, cacheKey: "register" });
  const mismatch = password && password2 && password !== password2;

  async function handleSubmit(e) {
    e.preventDefault();
    setResult("");
    setSuccessNotice("");
    const missing = [];
    const emailOk = /.+@.+\..+/.test(email.trim());
    if (!nombre.trim()) missing.push(t.nombre);
    if (!apellidos.trim()) missing.push(t.apellidos);
    if (!empresa.trim()) missing.push(t.empresa);
    if (!cargo) missing.push(t.cargo);
    if (!email.trim() || !emailOk) missing.push(t.email);
    if (!telefono.trim()) missing.push(t.telefono);
    if (!password) missing.push(t.password);
    if (!password2) missing.push(t.password2);
    if (!legalAccepted) missing.push(t.sectionLegal);
    setMissingFields(missing);
    if (missing.length || mismatch) {
      return;
    }
    setIsSubmitting(true);
    try {
      const data = await apiRequest("/api/auth/register", "POST", {
        nombre,
        apellidos,
        email,
        empresa,
        pais: country.nameEs,
        telefono: `${country.dial} ${telefono}`.trim(),
        cargo: cargo === "Technician" ? "Técnico" : cargo === "Supervisor" ? "Encargado" : cargo === "Other" ? "Otro" : cargo,
        password
      });
      const okMail = data?.mailSent;
      const reason = data?.mailReason;
      let reasonText = "";
      if (!okMail) {
        if (reason === "conexion") reasonText = t.mailReasonConnection;
        else if (reason === "correo") reasonText = t.mailReasonEmail;
        else reasonText = t.mailReasonDefault;
      }
      setResult(okMail ? t.successMail : `${t.successNoMail} ${reasonText}`);
      setResultOk(Boolean(okMail));
      setSuccessNotice(t.activationNotice);
      setNombre("");
      setApellidos("");
      setEmail("");
      setEmpresa("");
      setPais("ES");
      setTelefono("");
      setCargo("");
      setPassword("");
      setPassword2("");
      setLegalAccepted(false);
      setMissingFields([]);
    } catch (err) {
      setResult(err.message);
      setResultOk(false);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {successNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-xl">
            <h3 className="text-2xl font-semibold text-swarcoBlue">{t.activationTitle}</h3>
            <p className="mt-3 text-sm text-slate-600">{t.activationCta}</p>
            <p className="mt-2 text-sm text-swarcoOrange font-semibold">{successNotice}</p>
            <button
              type="button"
              className="mt-6 w-full bg-swarcoBlue text-white py-2.5 rounded-full font-semibold hover:bg-swarcoBlue/90 transition"
              onClick={() => {
                setSuccessNotice("");
                if (onRegistered) onRegistered();
              }}
            >
              {t.closeModal}
            </button>
          </div>
        </div>
      )}
      {missingFields.length > 0 && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-700">
          {t.missingField} {missingFields.join(", ")}
        </div>
      )}
      <section className="border border-slate-200 rounded-xl p-4 space-y-3">
        <div>
          <h4 className="text-base font-semibold text-slate-700">{t.sectionPersonal}</h4>
          <div className="mt-1 h-0.5 w-16 bg-swarcoOrange" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{t.nombre}</label>
            <input
              className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 ${
                missingFields.includes(t.nombre) ? "border-swarcoOrange" : "border-slate-300"
              }`}
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{t.apellidos}</label>
            <input
              className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 ${
                missingFields.includes(t.apellidos) ? "border-swarcoOrange" : "border-slate-300"
              }`}
              value={apellidos}
              onChange={(e) => setApellidos(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section className="border border-slate-200 rounded-xl p-4 space-y-3">
        <div>
          <h4 className="text-base font-semibold text-slate-700">{t.sectionWork}</h4>
          <div className="mt-1 h-0.5 w-16 bg-swarcoOrange" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{t.empresa}</label>
            <input
              className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 ${
                missingFields.includes(t.empresa) ? "border-swarcoOrange" : "border-slate-300"
              }`}
              value={empresa}
              onChange={(e) => setEmpresa(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{t.cargo}</label>
            <select
              className={`w-full border rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 ${
                missingFields.includes(t.cargo) ? "border-swarcoOrange" : "border-slate-300"
              }`}
              value={cargo}
              onChange={(e) => setCargo(e.target.value)}
            >
              <option value="">{t.cargo}</option>
              {t.cargoOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">{t.email}</label>
            <input
              className={`w-full border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 ${
                missingFields.includes(t.email) ? "border-swarcoOrange" : "border-slate-300"
              }`}
              placeholder={t.emailPlaceholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {email && !/.+@.+\..+/.test(email.trim()) && (
              <p className="text-xs text-amber-600">{t.emailInvalid}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{t.pais}</label>
            <select
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
              value={pais}
              onChange={(e) => setPais(e.target.value)}
            >
              {COUNTRIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-medium text-slate-700">{t.telefono}</label>
            <div className="flex gap-2">
              <input
                className="w-24 border border-slate-300 rounded-lg px-2 py-2.5 text-sm bg-slate-100"
                value={country.dial}
                readOnly
              />
              <input
                className={`flex-1 border rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 ${
                  missingFields.includes(t.telefono) ? "border-swarcoOrange" : "border-slate-300"
                }`}
                placeholder="600 000 000"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ""))}
                inputMode="numeric"
                pattern="[0-9]*"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border border-slate-200 rounded-xl p-4 space-y-3">
        <div>
          <h4 className="text-base font-semibold text-slate-700">{t.sectionAccess}</h4>
          <div className="mt-1 h-0.5 w-16 bg-swarcoOrange" />
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{t.password}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full border rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 ${
                  missingFields.includes(t.password) ? "border-swarcoOrange" : "border-slate-300"
                }`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-slate-500 hover:text-swarcoBlue"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? t.hidePassword : t.showPassword}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M9.88 5.06A10.47 10.47 0 0112 5c6.5 0 10 7 10 7a18.36 18.36 0 01-4.43 5.2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6.1 6.1A18.07 18.07 0 002 12s3.5 6 10 6a10.8 10.8 0 004.05-.76" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500">{t.passwordHint}</p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{t.strengthLabel}:</span>
              <span className="font-medium text-slate-700">
                {t.strength[Math.min(passwordScore, t.strength.length - 1)]}
              </span>
            </div>
            <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-swarcoOrange transition-all"
                style={{ width: `${Math.min(passwordScore, 5) * 20}%` }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{t.password2}</label>
            <div className="relative">
              <input
                type={showPassword2 ? "text" : "password"}
                className={`w-full border rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 ${
                  missingFields.includes(t.password2) || mismatch ? "border-swarcoOrange" : "border-slate-300"
                }`}
                placeholder="••••••••"
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-slate-500 hover:text-swarcoBlue"
                onClick={() => setShowPassword2((prev) => !prev)}
                aria-label={showPassword2 ? t.hidePassword : t.showPassword}
              >
                {showPassword2 ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6z" stroke="currentColor" strokeWidth="1.5" />
                    <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M10.58 10.58A3 3 0 0012 15a3 3 0 002.42-4.42" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M9.88 5.06A10.47 10.47 0 0112 5c6.5 0 10 7 10 7a18.36 18.36 0 01-4.43 5.2" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M6.1 6.1A18.07 18.07 0 002 12s3.5 6 10 6a10.8 10.8 0 004.05-.76" stroke="currentColor" strokeWidth="1.5" />
                  </svg>
                )}
              </button>
            </div>
            {mismatch && <p className="text-xs text-red-600">{t.passwordMismatch}</p>}
          </div>
        </div>
      </section>

      <section className="border border-slate-200 rounded-xl p-4 space-y-3">
        <div>
          <h4 className="text-base font-semibold text-slate-700">{t.sectionLegal}</h4>
          <div className="mt-1 h-0.5 w-16 bg-swarcoOrange" />
        </div>
        <label className="flex items-start gap-2 text-sm text-slate-600">
          <input
            type="checkbox"
            className="mt-1"
            checked={legalAccepted}
            onChange={(e) => setLegalAccepted(e.target.checked)}
          />
          <span>
            {t.legalText}{" "}
            <a
              className="text-swarcoBlue hover:underline"
              href="https://www.swarco.com/privacy-policy"
              target="_blank"
              rel="noreferrer"
            >
              {t.legalLink}
            </a>
          </span>
        </label>
        {!legalAccepted && missingFields.includes(t.sectionLegal) && (
          <p className="text-xs text-amber-600">{t.legalRequired}</p>
        )}
      </section>

      <button
        className="w-full bg-swarcoBlue text-white py-2.5 rounded-lg font-semibold hover:bg-swarcoBlue/90 transition disabled:opacity-70"
        disabled={isSubmitting || mismatch || !legalAccepted}
      >
        {isSubmitting ? t.buttonLoading : t.button}
      </button>
      {result && (
        <div className="text-sm text-slate-600 flex items-start gap-2">
          <span
            className={`mt-0.5 inline-flex h-2.5 w-2.5 rounded-full ${
              resultOk ? "bg-emerald-500" : "bg-amber-500"
            }`}
          />
          <p>{result}</p>
        </div>
      )}
    </form>
  );
}
