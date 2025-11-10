import React, { useState } from "react";
import NavBar from "../components/NavBar";

function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    contrasena: "",
    confirmarContrasena: "",
  });

  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError("");
    if (mensaje) setMensaje("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Validación de contraseñas
    if (formData.contrasena !== formData.confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    // 🔹 Datos a enviar (sin el campo confirmarContrasena)
    const { confirmarContrasena, ...usuario } = formData;

    try {
      const res = await fetch("http://localhost:5000/api/usuarios/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(usuario),
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje(data.mensaje || "Registro exitoso. Revisa tu correo para confirmar tu cuenta.");

        // 🔹 CAMBIO: redirigir a la página de verificación con el email
        window.location.href = `/verify?email=${encodeURIComponent(formData.email)}`;

        // (el reseteo ya no es necesario porque redirigimos, pero lo dejo tal cual pediste)
        setFormData({
          nombre: "",
          email: "",
          telefono: "",
          contrasena: "",
          confirmarContrasena: "",
        });
      } else {
        setError(data.error || "Ocurrió un error durante el registro.");
      }
    } catch (err) {
      console.error("❌ Error:", err);
      setError("No se pudo conectar con el servidor.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex items-center justify-center p-6">
      {/* estilos locales para look minimalista (no tocan la tipografía global ni la lógica) */}
      <style>{`
        .rp-card { width:100%; max-width:520px; border-radius:16px; background: #fff; box-shadow: 0 12px 30px rgba(2,6,23,0.06); border: 1px solid rgba(2,6,23,0.04); }
        .rp-legend { color: #065f46; }
        .rp-input { background: #fff; border: 1px solid rgba(15,23,42,0.06); padding: 12px 14px; border-radius: 12px; }
        .rp-note { color: #6b7280; font-size:0.95rem; }
        .rp-btn { border-radius: 12px; padding: 12px 14px; box-shadow: 0 6px 18px rgba(2,6,23,0.06); transition: transform .08s ease; }
        .rp-btn:active { transform: translateY(1px); }
      `}</style>

      <NavBar />

      <div className="rp-card p-8 mt-20">
        <h2 className="text-2xl font-semibold text-gray-900 text-center mb-4 rp-legend">
          Crear cuenta
        </h2>
        <p className="text-center rp-note mb-6">
          Regístrate para gestionar reservas y canchas.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ingresa tu nombre"
              className="w-full rp-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200"
              required
            />
          </div>

          {/* Correo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              className="w-full rp-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200"
              required
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Número de contacto"
              className="w-full rp-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="Crea una contraseña"
              className="w-full rp-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200"
              required
            />
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirmarContrasena"
              value={formData.confirmarContrasena}
              onChange={handleChange}
              placeholder="Repite la contraseña"
              className="w-full rp-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200"
              required
            />
          </div>

          {/* Errores o mensajes */}
          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}
          {mensaje && (
            <p className="text-sm text-green-600" role="status">
              {mensaje}
            </p>
          )}

          {/* Botón */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold rp-btn hover:bg-green-700"
          >
            Registrarse
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          ¿Ya tienes una cuenta?{" "}
          <a href="/login" className="text-green-600 font-medium hover:underline">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
