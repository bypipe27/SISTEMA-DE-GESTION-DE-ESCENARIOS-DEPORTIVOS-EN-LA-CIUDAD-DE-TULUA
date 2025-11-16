import React, { useState } from "react";
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function RegisterProvider() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    contrasena: "",
    confirmContrasena: "",
  });
  const [mensaje, setMensaje] = useState("");
  const { loading, error, handleRegisterProvider, clearError } = useAuth();

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    clearError();
    setMensaje("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await handleRegisterProvider(form);

    if (result.success) {
      setMensaje(result.message);
      setTimeout(() => {
        navigate(`/verify?email=${encodeURIComponent(result.email)}&type=user`);
      }, 700);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex items-center justify-center p-6">
      {/* estilos locales visuales (no afectan la lógica) */}
      <style>{`
        .rp-card { width:100%; max-width:560px; border-radius:14px; background:#fff; border:1px solid rgba(2,6,23,0.04); box-shadow:0 10px 30px rgba(2,6,23,0.06); }
        /* Encabezado más oscuro para buen contraste */
        .rp-header { color:#053f34; }
        .rp-input { width:100%; padding:10px 12px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); background:#fff; color:#0f172a; }
        /* Nota más oscura */
        .rp-note { color:#374151; font-size:0.95rem; }
        .rp-actions { display:flex; justify-end; gap:12px; }
        .rp-btn { border-radius:10px; padding:10px 14px; transition:transform .08s ease; }
        .rp-btn:active { transform:translateY(1px); }
      `}</style>

      <NavBar />

      <div className="rp-card p-8 mt-20">
        <h2 className="text-2xl font-semibold text-center mb-2 rp-header">Registro de proveedor</h2>
        <p className="text-center rp-note mb-6">Registra tu negocio para gestionar canchas y reservas.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre o negocio</label>
            <input
              id="nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="rp-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200"
              required
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="rp-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200"
              required
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional)</label>
            <input
              id="telefono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              className="rp-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>

          <div>
            <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              id="contrasena"
              name="contrasena"
              type="password"
              value={form.contrasena}
              onChange={handleChange}
              className="rp-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200"
              required
              aria-required="true"
            />
          </div>

          <div>
            <label htmlFor="confirmContrasena" className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña</label>
            <input
              id="confirmContrasena"
              name="confirmContrasena"
              type="password"
              value={form.confirmContrasena}
              onChange={handleChange}
              className="rp-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200"
              required
              aria-required="true"
            />
          </div>

          {error && <p className="text-sm text-red-600" role="alert" aria-live="assertive">{error}</p>}
          {mensaje && <p className="text-sm text-green-600" role="status">{mensaje}</p>}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded-md rp-btn">Cancelar</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-green-800 text-white rounded-md rp-btn focus:outline-none focus:ring-2 focus:ring-green-300">
              {loading ? "Enviando..." : "Registrar proveedor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterProvider;