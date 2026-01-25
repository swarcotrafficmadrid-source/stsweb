import { useState } from "react";
import { apiRequest } from "../lib/api.js";
import { useTranslatedMap } from "../lib/i18n.js";

export default function Login({ onSuccess, lang = "es" }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMsg, setResetMsg] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const copy = {
    es: {
      email: "Email",
      emailHint: "Usa el correo con el que te registraste.",
      password: "Contraseña",
      button: "Entrar",
      buttonLoading: "Entrando...",
      forgot: "¿Olvidaste tu contraseña?",
      resetTitle: "Recuperar contraseña",
      resetDesc: "Te enviaremos un enlace para restablecerla.",
      resetButton: "Enviar enlace",
      resetLoading: "Enviando...",
      resetOk: "Listo. Si el correo existe, recibirás un enlace.",
      backLogin: "Volver al login",
      showPassword: "Mostrar",
      hidePassword: "Ocultar"
    },
    en: {
      email: "Email",
      emailHint: "Use the email you registered with.",
      password: "Password",
      button: "Sign in",
      buttonLoading: "Signing in...",
      forgot: "Forgot your password?",
      resetTitle: "Reset password",
      resetDesc: "We will send you a reset link.",
      resetButton: "Send link",
      resetLoading: "Sending...",
      resetOk: "Done. If the email exists, you will receive a link.",
      backLogin: "Back to login",
      showPassword: "Show",
      hidePassword: "Hide"
    },
    it: {
      email: "Email",
      emailHint: "Usa l'email con cui ti sei registrato.",
      password: "Password",
      button: "Accedi",
      buttonLoading: "Accesso...",
      forgot: "Hai dimenticato la password?",
      resetTitle: "Recupera password",
      resetDesc: "Ti invieremo un link di ripristino.",
      resetButton: "Invia link",
      resetLoading: "Invio in corso...",
      resetOk: "Fatto. Se l'email esiste, riceverai un link.",
      backLogin: "Torna al login",
      showPassword: "Mostra",
      hidePassword: "Nascondi"
    }
  };
  const t = useTranslatedMap({ base: copy, lang, cacheKey: "login" });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const data = await apiRequest("/api/auth/login", "POST", { identifier, password });
      onSuccess(data.token);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleReset(e) {
    e.preventDefault();
    setResetMsg("");
    setResetLoading(true);
    try {
      await apiRequest("/api/auth/forgot", "POST", { email: resetEmail });
      setResetMsg(t.resetOk);
    } catch (err) {
      setResetMsg(err.message);
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!showReset && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{t.email}</label>
            <input
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
              placeholder="correo@empresa.com"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            <p className="text-xs text-slate-400">{t.emailHint}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">{t.password}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
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
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            className="w-full bg-swarcoBlue text-white py-2.5 rounded-full font-semibold hover:bg-swarcoBlue/90 transition disabled:opacity-70"
            disabled={isSubmitting}
          >
            {isSubmitting ? t.buttonLoading : t.button}
          </button>
        </>
      )}
      <button
        type="button"
        className="text-sm text-swarcoBlue hover:text-swarcoBlue/80"
        onClick={() => setShowReset((prev) => !prev)}
      >
        {showReset ? t.backLogin : t.forgot}
      </button>
      {showReset && (
        <div className="border border-slate-200 rounded-lg p-3 space-y-3">
          <div className="text-sm font-semibold text-slate-700">{t.resetTitle}</div>
          <div className="text-xs text-slate-500">{t.resetDesc}</div>
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
            placeholder="correo@empresa.com"
            value={resetEmail}
            onChange={(e) => setResetEmail(e.target.value)}
          />
          <button
            type="button"
            className="w-full bg-swarcoBlue text-white py-2 rounded-full font-semibold hover:bg-swarcoBlue/90 transition disabled:opacity-70"
            onClick={handleReset}
            disabled={resetLoading}
          >
            {resetLoading ? t.resetLoading : t.resetButton}
          </button>
          {resetMsg && <p className="text-xs text-slate-600">{resetMsg}</p>}
        </div>
      )}
    </form>
  );
}
