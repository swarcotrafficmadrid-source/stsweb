import { useState } from "react";
import { apiRequest } from "../lib/api.js";
import { useTranslatedMap } from "../lib/i18n.js";

export default function Register({ lang = "es" }) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copy = {
    es: {
      fullName: "Nombre completo",
      namePlaceholder: "Nombre y apellido",
      email: "Email",
      emailPlaceholder: "correo@empresa.com",
      password: "Contraseña",
      button: "Registrar",
      buttonLoading: "Creando cuenta...",
      successMail: "Usuario creado con éxito. En breve recibirás un correo con la activación de tu cuenta completada.",
      successNoMail: "Usuario creado con éxito, pero no se pudo enviar el correo de activación. Contacta soporte."
    },
    en: {
      fullName: "Full name",
      namePlaceholder: "Name and surname",
      email: "Email",
      emailPlaceholder: "email@company.com",
      password: "Password",
      button: "Create account",
      buttonLoading: "Creating account...",
      successMail: "Account created successfully. You will receive an activation email shortly.",
      successNoMail: "Account created, but the activation email could not be sent. Please contact support."
    },
    it: {
      fullName: "Nome completo",
      namePlaceholder: "Nome e cognome",
      email: "Email",
      emailPlaceholder: "email@azienda.com",
      password: "Password",
      button: "Registrati",
      buttonLoading: "Creazione account...",
      successMail: "Account creato con successo. Riceverai a breve un'email di attivazione.",
      successNoMail: "Account creato, ma l'email di attivazione non è stata inviata. Contatta il supporto."
    }
  };
  const t = useTranslatedMap({ base: copy, lang, cacheKey: "register" });

  async function handleSubmit(e) {
    e.preventDefault();
    setResult("");
    setIsSubmitting(true);
    try {
      const data = await apiRequest("/api/auth/register", "POST", {
        nombre,
        email,
        password
      });
      const okMail = data?.mailSent;
      setResult(
        okMail ? t.successMail : t.successNoMail
      );
    } catch (err) {
      setResult(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">{t.fullName}</label>
        <input
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
          placeholder={t.namePlaceholder}
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">{t.email}</label>
        <input
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">{t.password}</label>
        <input
          type="password"
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button
        className="w-full bg-swarcoBlue text-white py-2.5 rounded-lg font-semibold hover:bg-swarcoBlue/90 transition disabled:opacity-70"
        disabled={isSubmitting}
      >
        {isSubmitting ? t.buttonLoading : t.button}
      </button>
      {result && (
        <div className="text-sm text-slate-600 flex items-start gap-2">
          <span
            className={`mt-0.5 inline-flex h-2.5 w-2.5 rounded-full ${
              result.includes("no se pudo") ? "bg-amber-500" : "bg-emerald-500"
            }`}
          />
          <p>{result}</p>
        </div>
      )}
    </form>
  );
}
