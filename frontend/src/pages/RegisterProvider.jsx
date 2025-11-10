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
  const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/usuarios/register-provider`, {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-green-900">
      <NavBar />
      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md mt-20">
        <h2 className="text-2xl font-bold text-center text-green-700 mb-6">Registro de proveedor</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-1">Nombre o negocio</label>
            <input name="nombre" value={form.nombre} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Correo</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Teléfono (opcional)</label>
            <input name="telefono" value={form.telefono} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-1">Contraseña</label>
            <input name="contrasena" type="password" value={form.contrasena} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg" required />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {mensaje && <p className="text-sm text-green-600">{mensaje}</p>}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Cancelar</button>
            <button type="submit" disabled={loading} className="px-6 py-2 bg-green-600 text-white rounded">
              {loading ? "Enviando..." : "Registrar proveedor"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RegisterProvider;