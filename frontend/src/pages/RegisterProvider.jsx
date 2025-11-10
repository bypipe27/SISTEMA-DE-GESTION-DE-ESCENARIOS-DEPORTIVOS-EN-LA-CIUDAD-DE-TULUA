import React, { useState } from "react";
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";

function RegisterProvider() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    contrasena: "",
  });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((s) => ({ ...s, [e.target.name]: e.target.value }));
    setError("");
    setMensaje("");
  };

  const validar = () => {
    if (!form.nombre || !form.email || !form.contrasena) {
      setError("Complete los campos obligatorios: nombre, email y contraseña.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setLoading(true);
    try {
        const res = await fetch("http://localhost:5000/api/usuarios/register-provider", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: form.nombre,
          email: form.email,
          telefono: form.telefono || null,
          contrasena: form.contrasena
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Error ${res.status} al registrar proveedor.`);
        setLoading(false);
        return;
      }

      setMensaje(data.mensaje || "Se envió código al correo para verificar la cuenta.");
      setTimeout(() => navigate(`/verify?email=${encodeURIComponent(form.email)}&type=user`), 700);
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex items-center justify-center p-6">
      {/* estilos locales visuales (no afectan la lógica) */}
      <style>{`
        .rp-card { width:100%; max-width:560px; border-radius:14px; background:#fff; border:1px solid rgba(2,6,23,0.04); box-shadow:0 10px 30px rgba(2,6,23,0.06); }
        .rp-header { color:#065f46; }
        .rp-input { width:100%; padding:10px 12px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); background:#fff; }
        .rp-note { color:#6b7280; font-size:0.95rem; }
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre o negocio</label>
            <input
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
              className="rp-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="rp-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono (opcional)</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              className="rp-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              name="contrasena"
              type="password"
              value={form.contrasena}
              onChange={handleChange}
              className="rp-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {mensaje && <p className="text-sm text-green-600">{mensaje}</p>}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded-md rp-btn">Cancelar</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded-md rp-btn">
              {loading ? "Enviando..." : "Registrar proveedor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterProvider;