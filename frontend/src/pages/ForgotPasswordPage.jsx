import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import NavBar from "../components/NavBar";
import Button from "../components/Button";

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMensaje("");

    try {
  const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/password/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje(data.mensaje);
        setEmail("");
      } else {
        setError(data.error || "Ocurrió un error.");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex items-center justify-center p-6">
      {/* estilos locales para look minimalista; no afectan la funcionalidad */}
      <style>{`
        .fp-card { max-width:420px; width:100%; border-radius:16px; background: #ffffff; box-shadow: 0 10px 30px rgba(2,6,23,0.06); border: 1px solid rgba(2,6,23,0.04); }
        .fp-legend { color: #065f46; }
        .fp-input { background: #ffffff; border: 1px solid rgba(15,23,42,0.06); padding: 12px 14px; border-radius: 12px; }
        .fp-note { color: #6b7280; font-size:0.9rem; }
        footer.fp { color: #9ca3af; font-size: 0.8rem; }
      `}</style>

      <NavBar />

      <motion.div
        className="fp-card p-8 ring-0"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold fp-legend mb-1">Recuperar contraseña</h2>
          <p className="fp-note">
            Te enviaremos un enlace a tu correo para restablecer tu contraseña.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@dominio.com"
              className="w-full fp-input text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-200"
              required
              aria-required="true"
            />
          </div>

          {/* Mensajes */}
          {mensaje && (
            <div 
              className="bg-green-50 border border-green-200 text-green-800 text-sm px-4 py-3 rounded-lg"
              role="alert"
              aria-live="polite"
            >
              {mensaje}
            </div>
          )}

          {error && (
            <div 
              className="bg-red-50 border border-red-200 text-red-800 text-sm px-4 py-3 rounded-lg"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          {/* Botón */}
          <Button 
            color="green" 
            className="w-full py-3 rounded-lg"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar enlace de recuperación"}
          </Button>
        </form>

        {/* Enlace de regreso */}
        <div className="text-center mt-5">
          <Link
            to="/login"
            className="text-green-600 hover:underline fp-note"
          >
            ← Volver al inicio de sesión
          </Link>
        </div>

        {/* Footer */}
        <footer className="text-center mt-6 fp">
          © 2025 Sistema de Gestión de Canchas — Proyecto académico
        </footer>
      </motion.div>
    </div>
  );
}

export default ForgotPasswordPage;