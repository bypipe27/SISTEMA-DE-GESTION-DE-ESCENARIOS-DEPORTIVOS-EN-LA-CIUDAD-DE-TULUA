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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 to-green-900">
      <NavBar />

      <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md mt-20">
        <h2 className="text-3xl font-bold text-center text-green-700 mb-6">
          Crear Cuenta
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Nombre completo
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ingresa tu nombre"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Correo */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Correo electrónico
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Teléfono */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Número de contacto"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Contraseña
            </label>
            <input
              type="password"
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="Crea una contraseña"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Confirmar contraseña
            </label>
            <input
              type="password"
              name="confirmarContrasena"
              value={formData.confirmarContrasena}
              onChange={handleChange}
              placeholder="Repite la contraseña"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="w-full bg-green-600 text-white font-bold py-2 rounded-lg hover:bg-green-700 transition-all"
          >
            Registrarse
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          ¿Ya tienes una cuenta?{" "}
          <a href="/login" className="text-green-700 font-semibold hover:underline">
            Inicia sesión
          </a>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
