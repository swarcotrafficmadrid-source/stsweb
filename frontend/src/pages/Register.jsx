import { useState } from "react";
import { apiRequest } from "../lib/api.js";

export default function Register() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        okMail
          ? "Usuario creado con éxito. En breve recibirás un correo con la activación de tu cuenta completada."
          : "Usuario creado con éxito, pero no se pudo enviar el correo de activación. Contacta soporte."
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
        <label className="text-sm font-medium text-slate-700">Nombre completo</label>
        <input
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
          placeholder="Nombre y apellido"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Email</label>
        <input
          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-swarcoBlue/30 focus:border-swarcoBlue"
          placeholder="correo@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-700">Contraseña</label>
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
        {isSubmitting ? "Creando cuenta..." : "Registrar"}
      </button>
      {result && <p className="text-sm text-slate-600">{result}</p>}
    </form>
  );
}
