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
      const res = await fetch("http://localhost:5000/api/password/forgot-password", {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-green-700 to-green-900 p-6">
      <NavBar />
      
      <motion.div
        className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md p-8 ring-1 ring-white/20"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mt-3">Recuperar Contraseña</h2>
          <p className="text-green-100 text-sm mt-2">
            Te enviaremos un enlace a tu correo para restablecer tu contraseña.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@dominio.com"
              className="w-full rounded-xl border border-green-300 bg-white/90 px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-300"
              required
            />
          </div>

          {/* Mensajes */}
          {mensaje && (
            <div className="bg-green-50 border border-green-300 text-green-700 text-sm px-4 py-3 rounded-xl">
              {mensaje}
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Botón */}
          <Button 
            color="white" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar enlace de recuperación"}
          </Button>
        </form>

        {/* Enlace de regreso */}
        <div className="text-center mt-6">
          <Link
            to="/login"
            className="text-green-200 hover:text-white transition text-sm"
          >
            ← Volver al inicio de sesión
          </Link>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-xs text-green-200">
          © 2025 Sistema de Gestión de Canchas — Proyecto académico
        </footer>
      </motion.div>
    </div>
  );
}

export default ForgotPasswordPage;