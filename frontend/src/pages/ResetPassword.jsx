import { useState } from "react";
import { apiRequest } from "../lib/api.js";
import { useTranslatedMap } from "../lib/i18n.js";

export default function ResetPassword({ token, lang = "es", onBack }) {
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const copy = {
    es: {
      title: "Restablecer contraseña",
      desc: "Introduce una nueva clave para tu cuenta.",
      pass: "Nueva contraseña",
      pass2: "Repite la contraseña",
      submit: "Guardar",
      loading: "Guardando...",
      mismatch: "Las contraseñas no coinciden.",
      done: "Contraseña actualizada. Ya puedes iniciar sesión.",
      back: "Volver a login"
    },
    en: {
      title: "Reset password",
      desc: "Enter a new password for your account.",
      pass: "New password",
      pass2: "Repeat password",
      submit: "Save",
      loading: "Saving...",
      mismatch: "Passwords do not match.",
      done: "Password updated. You can sign in now.",
      back: "Back to login"
    },
    it: {
      title: "Reimposta password",
      desc: "Inserisci una nuova password per il tuo account.",
      pass: "Nuova password",
      pass2: "Ripeti password",
      submit: "Salva",
      loading: "Salvataggio...",
      mismatch: "Le password non coincidono.",
      done: "Password aggiornata. Ora puoi accedere.",
      back: "Torna al login"
    }
  };
  const t = useTranslatedMap({ base: copy, lang, cacheKey: "reset" });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!password || password !== password2) {
      setError(t.mismatch);
      return;
    }
    setLoading(true);
    try {
      const data = await apiRequest("/api/auth/reset", "POST", { token, password });
      setMessage(data.message || t.done);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-2xl font-semibold text-slate-800">{t.title}</h3>
      <p className="text-sm text-slate-500">{t.desc}</p>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">{t.pass}</label>
        <input
          type="password"
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">{t.pass2}</label>
        <input
          type="password"
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
          placeholder="••••••••"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {message && <p className="text-sm text-emerald-600">{message}</p>}
      <button
        className="w-full bg-swarcoBlue text-white py-2.5 rounded-full font-semibold hover:bg-swarcoBlue/90 transition disabled:opacity-70"
        disabled={loading}
      >
        {loading ? t.loading : t.submit}
      </button>
      <button
        type="button"
        className="w-full border border-swarcoOrange text-swarcoOrange py-2 rounded-full font-semibold hover:bg-swarcoOrange hover:text-white transition"
        onClick={onBack}
      >
        {t.back}
      </button>
    </form>
  );
}
