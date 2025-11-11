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
  const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/usuarios/register`, {
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
        /* Encabezado con mayor contraste */
        .rp-legend { color: #053f34; }
        /* Inputs con texto oscuro para legibilidad */
        .rp-input { background: #fff; border: 1px solid rgba(15,23,42,0.06); padding: 12px 14px; border-radius: 12px; color: #0f172a; }
        /* Notas y textos secundarios con contraste aumentado */
        .rp-note { color: #374151; font-size:0.95rem; }
        /* Botones: usar sombra, y el color específico se aplica en la clase del botón para mayor control */
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
            <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-2">
              Nombre completo
            </label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ingresa tu nombre"
              className="w-full rp-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200"
              required
              aria-invalid={error && !formData.nombre ? "true" : undefined}
              aria-describedby={error && !formData.nombre ? "nombre-error" : undefined}
            />
            {error && !formData.nombre && (
              <span id="nombre-error" className="text-red-600 text-xs">El nombre es requerido.</span>
            )}
          </div>

          {/* Correo */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              className="w-full rp-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200"
              required
              aria-invalid={error && !formData.email ? "true" : undefined}
              aria-describedby={error && !formData.email ? "email-error" : undefined}
            />
            {error && !formData.email && (
              <span id="email-error" className="text-red-600 text-xs">El correo es requerido.</span>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              id="telefono"
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
            <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="contrasena"
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="Crea una contraseña"
              className="w-full rp-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200"
              required
              aria-invalid={error && !formData.contrasena ? "true" : undefined}
              aria-describedby={error && !formData.contrasena ? "contrasena-error" : undefined}
            />
            {error && !formData.contrasena && (
              <span id="contrasena-error" className="text-red-600 text-xs">La contraseña es requerida.</span>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label htmlFor="confirmarContrasena" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar contraseña
            </label>
            <input
              id="confirmarContrasena"
              type="password"
              name="confirmarContrasena"
              value={formData.confirmarContrasena}
              onChange={handleChange}
              placeholder="Repite la contraseña"
              className="w-full rp-input text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-200"
              required
              aria-invalid={error && formData.contrasena !== formData.confirmarContrasena ? "true" : undefined}
              aria-describedby={error && formData.contrasena !== formData.confirmarContrasena ? "confirmar-error" : undefined}
            />
            {error && formData.contrasena !== formData.confirmarContrasena && (
              <span id="confirmar-error" className="text-red-600 text-xs">Las contraseñas no coinciden.</span>
            )}
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
            className="w-full bg-green-800 text-white font-semibold rp-btn hover:bg-green-900 focus:outline-none focus:ring-2 focus:ring-green-300"
          >
            Registrarse
          </button>
        </form>

        <p className="text-center text-gray-800 mt-6">
          ¿Ya tienes una cuenta?{" "}
          <a href="/login" className="text-green-800 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-green-300">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
