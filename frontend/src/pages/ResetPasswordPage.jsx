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
  const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/password/verify-reset-token`, {
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
  const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/password/reset-password`, {
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <NavBar />
        <div className="text-center">
          <style>{`
            .rp-loader { display:inline-block; border-radius:999px; width:56px; height:56px; border:4px solid rgba(0,0,0,0.06); border-top-color:#10B981; margin-bottom:12px; }
            .rp-note { color:#374151; }
          `}</style>
          <div className="rp-loader animate-spin mx-auto mb-4" />
          <p className="rp-note">Verificando enlace…</p>
        </div>
      </div>
    );
  }

  if (!tokenValido) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <NavBar />
        <motion.div
          className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <style>{`
            .rp-card { border-radius:14px; }
            .rp-err { color:#b91c1c; }
            .rp-sub { color:#6b7280; }
          `}</style>

          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Enlace inválido</h2>
          <p className="rp-sub mb-6">{error}</p>
          <Link to="/forgot-password">
            <Button color="green">Solicitar nuevo enlace</Button>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <NavBar />
      
      <motion.div
        className="w-full max-w-md bg-white rounded-2xl shadow-lg p-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        <style>{`
          .rp-title { color:#064e3b; font-weight:600; }
          .rp-sub { color:#6b7280; font-size:0.95rem; }
          .rp-input { width:100%; padding:12px 14px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); background:#fff; }
          .rp-msg-ok { background:#ecfdf5; border:1px solid #bbf7d0; color:#065f46; padding:10px; border-radius:10px; }
          .rp-msg-err { background:#fff1f2; border:1px solid #fecaca; color:#991b1b; padding:10px; border-radius:10px; }
        `}</style>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl rp-title mb-1">Nueva contraseña</h2>
          <p className="rp-sub">Crea una nueva contraseña para tu cuenta</p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nuevaContrasena" className="block text-sm font-medium text-gray-700 mb-2">
              Nueva contraseña
            </label>
            <input
              id="nuevaContrasena"
              name="nuevaContrasena"
              type="password"
              value={formData.nuevaContrasena}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              className="rp-input"
              required
            />
          </div>

          <div>
            <label htmlFor="confirmarContrasena" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar contraseña
            </label>
            <input
              id="confirmarContrasena"
              name="confirmarContrasena"
              type="password"
              value={formData.confirmarContrasena}
              onChange={handleChange}
              placeholder="Repite la contraseña"
              className="rp-input"
              required
            />
          </div>

          {/* Mensajes */}
          {mensaje && (
            <div className="rp-msg-ok text-sm">
              {mensaje}
            </div>
          )}

          {error && (
            <div className="rp-msg-err text-sm">
              {error}
            </div>
          )}

          {/* Botón */}
          <div>
            <Button 
              color="green" 
              className="w-full"
              disabled={loading}
            >
              {loading ? "Actualizando..." : "Restablecer contraseña"}
            </Button>
          </div>
        </form>

        {/* Footer */}
        <footer className="text-center mt-6 text-xs text-gray-400">
          © 2025 Sistema de Gestión de Canchas — Proyecto académico
        </footer>
      </motion.div>
    </div>
  );
}

export default ResetPasswordPage;