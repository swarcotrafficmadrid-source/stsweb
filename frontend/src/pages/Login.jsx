import { useState } from "react";
import { apiRequest } from "../lib/api.js";

export default function Login({ onSuccess, lang = "es" }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const copy = {
    es: {
      email: "Email",
      emailHint: "Usa el correo con el que te registraste.",
      password: "Contraseña",
      button: "Entrar",
      buttonLoading: "Entrando..."
    },
    en: {
      email: "Email",
      emailHint: "Use the email you registered with.",
      password: "Password",
      button: "Sign in",
      buttonLoading: "Signing in..."
    },
    it: {
      email: "Email",
      emailHint: "Usa l'email con cui ti sei registrato.",
      password: "Password",
      button: "Accedi",
      buttonLoading: "Accesso..."
    }
  };
  const t = copy[lang] || copy.es;

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <input
          type="password"
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        className="w-full bg-swarcoBlue text-white py-2.5 rounded-full font-semibold hover:bg-swarcoBlue/90 transition disabled:opacity-70"
        disabled={isSubmitting}
      >
        {isSubmitting ? t.buttonLoading : t.button}
      </button>
    </form>
  );
}
