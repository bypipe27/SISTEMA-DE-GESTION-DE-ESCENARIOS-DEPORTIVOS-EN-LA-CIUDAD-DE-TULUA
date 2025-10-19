import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import NavBar from "../components/NavBar";
import Button from "../components/Button";

function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [formData, setFormData] = useState({
    nuevaContrasena: "",
    confirmarContrasena: "",
  });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValido, setTokenValido] = useState(false);
  const [verificando, setVerificando] = useState(true);

  // Verificar token al cargar la página
  useEffect(() => {
    const verificarToken = async () => {
      if (!token || !email) {
        setError("Enlace inválido o expirado.");
        setVerificando(false);
        return;
      }

      try {
        const res = await fetch("http://localhost:5000/api/password/verify-reset-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, email }),
        });

        const data = await res.json();

        if (res.ok && data.valido) {
          setTokenValido(true);
        } else {
          setError(data.error || "El enlace ha expirado o es inválido.");
        }
      } catch (err) {
        setError("Error al verificar el enlace.");
      } finally {
        setVerificando(false);
      }
    };

    verificarToken();
  }, [token, email]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.nuevaContrasena !== formData.confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    if (formData.nuevaContrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/password/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          email,
          nueva_contrasena: formData.nuevaContrasena,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje(data.mensaje);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.error || "Ocurrió un error al restablecer la contraseña.");
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  if (verificando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-green-900">
        <NavBar />
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Verificando enlace...</p>
        </div>
      </div>
    );
  }

  if (!tokenValido) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-green-900 p-6">
        <NavBar />
        <motion.div
          className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md p-8 ring-1 ring-white/20 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl font-bold text-white mb-4">Enlace Inválido</h2>
          <p className="text-green-100 mb-6">{error}</p>
          <Link to="/forgot-password">
            <Button color="white">Solicitar nuevo enlace</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

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
          <h2 className="text-3xl font-bold text-white mt-3">Nueva Contraseña</h2>
          <p className="text-green-100 text-sm mt-2">
            Crea una nueva contraseña para tu cuenta
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="nuevaContrasena" className="block text-sm font-medium text-white mb-2">
              Nueva contraseña
            </label>
            <input
              id="nuevaContrasena"
              name="nuevaContrasena"
              type="password"
              value={formData.nuevaContrasena}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              className="w-full rounded-xl border border-green-300 bg-white/90 px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-300"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmarContrasena" className="block text-sm font-medium text-white mb-2">
              Confirmar contraseña
            </label>
            <input
              id="confirmarContrasena"
              name="confirmarContrasena"
              type="password"
              value={formData.confirmarContrasena}
              onChange={handleChange}
              placeholder="Repite la contraseña"
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
            {loading ? "Actualizando..." : "Restablecer contraseña"}
          </Button>
        </form>

        {/* Footer */}
        <footer className="text-center mt-8 text-xs text-green-200">
          © 2025 Sistema de Gestión de Canchas — Proyecto académico
        </footer>
      </motion.div>
    </div>
  );
}

export default ResetPasswordPage;