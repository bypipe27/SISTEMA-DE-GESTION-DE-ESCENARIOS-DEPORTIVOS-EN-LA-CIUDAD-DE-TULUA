import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/NavBar";
import { useAuth } from "../hooks/useAuth";
import { FaUser, FaEnvelope, FaPhone, FaLock, FaCheckCircle, FaUserPlus } from "react-icons/fa";

function RegisterPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    contrasena: "",
    confirmarContrasena: "",
  });

  const [mensaje, setMensaje] = useState("");
  const { loading, error, handleRegister, clearError } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    clearError();
    if (mensaje) setMensaje("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones adicionales antes del registro
    try {
      // Validar confirmación de contraseña
      if (formData.contrasena !== formData.confirmarContrasena) {
        throw new Error('Las contraseñas no coinciden');
      }

      // Validar longitud mínima de contraseña
      if (formData.contrasena.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      // Validar formato de teléfono si se proporciona
      if (formData.telefono && !/^[0-9+\-\s()]{10,15}$/.test(formData.telefono)) {
        throw new Error('El formato del teléfono no es válido');
      }

      const result = await handleRegister(formData);

      if (result.success) {
        setMensaje(result.message);
        // Redirigir a verificación
        setTimeout(() => {
          navigate(`/verify?email=${encodeURIComponent(result.email)}`);
        }, 500);
      } else if (result.error) {
        // Manejo específico de errores del servidor
        if (result.error.includes('email ya existe') || result.error.includes('already exists')) {
          setMensaje('Este correo electrónico ya está registrado. Intenta con otro.');
        } else if (result.error.includes('telefono ya existe')) {
          setMensaje('Este número de teléfono ya está registrado.');
        } else {
          setMensaje(result.error);
        }
      }
    } catch (validationError) {
      setMensaje(validationError.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Decoraciones de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <NavBar />

      <div className="relative z-10 w-full max-w-lg mt-16">
        <div className="bg-white rounded-3xl shadow-2xl shadow-teal-500/20 border-2 border-teal-100 overflow-hidden">
          {/* Header con gradiente */}
          <div className="relative bg-gradient-to-r from-teal-500 via-emerald-600 to-green-600 px-8 py-10 overflow-hidden">
            {/* Decoraciones en el header */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                <FaUserPlus className="text-5xl text-white drop-shadow-lg" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Crear cuenta</h2>
              <p className="text-teal-50 text-sm">Regístrate para gestionar reservas y canchas.</p>
            </div>
          </div>

          {/* Contenido del formulario */}
          <div className="px-8 py-8">
            {/* Mensajes de error y éxito */}
            {error && (
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 shadow-sm">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}
            
            {mensaje && (
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border-l-4 border-emerald-500 shadow-sm animate-fadeIn">
                <p className="text-emerald-700 text-sm font-medium">{mensaje}</p>
              </div>
            )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nombre */}
          <div>
            <label htmlFor="nombre" className="block text-sm font-bold text-slate-700 mb-2">
              Nombre completo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaUser className="text-teal-500 text-lg" />
              </div>
              <input
                id="nombre"
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Tu nombre completo"
                minLength="2"
                maxLength="50"
                title="El nombre debe tener entre 2 y 50 caracteres"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-slate-800 placeholder-slate-400 bg-slate-50 hover:bg-white"
                required
                aria-invalid={error && !formData.nombre ? "true" : undefined}
                aria-describedby={error && !formData.nombre ? "nombre-error" : undefined}
              />
            </div>
            {error && !formData.nombre && (
              <span id="nombre-error" className="text-red-600 text-xs mt-1 block">El nombre es requerido.</span>
            )}
          </div>

          {/* Correo */}
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
              Correo electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaEnvelope className="text-emerald-500 text-lg" />
              </div>
              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-800 placeholder-slate-400 bg-slate-50 hover:bg-white"
                required
                aria-invalid={error && !formData.email ? "true" : undefined}
                aria-describedby={error && !formData.email ? "email-error" : undefined}
              />
            </div>
            {error && !formData.email && (
              <span id="email-error" className="text-red-600 text-xs mt-1 block">El correo es requerido.</span>
            )}
          </div>

          {/* Teléfono */}
          <div>
            <label htmlFor="telefono" className="block text-sm font-bold text-slate-700 mb-2">
              Teléfono
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaPhone className="text-green-500 text-lg" />
              </div>
              <input
                id="telefono"
                type="tel"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                onInput={(e) => {
                  // Filtrar solo números, espacios, guiones y paréntesis
                  e.target.value = e.target.value.replace(/[^0-9+\-\s()]/g, '');
                }}
                onKeyPress={(e) => {
                  // Prevenir ingreso de letras
                  if (!/[0-9+\-\s()]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab') {
                    e.preventDefault();
                  }
                }}
                placeholder="Número de contacto (ej: 3001234567)"
                pattern="[0-9+\-\s()]{10,15}"
                title="Ingrese un número de teléfono válido (10-15 dígitos)"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-slate-800 placeholder-slate-400 bg-slate-50 hover:bg-white"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="contrasena" className="block text-sm font-bold text-slate-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaLock className="text-teal-500 text-lg" />
              </div>
              <input
                id="contrasena"
                type="password"
                name="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                placeholder="Crea una contraseña segura (mín. 6 caracteres)"
                minLength="6"
                maxLength="50"
                title="La contraseña debe tener entre 6 y 50 caracteres"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all text-slate-800 placeholder-slate-400 bg-slate-50 hover:bg-white"
                required
                aria-invalid={error && !formData.contrasena ? "true" : undefined}
                aria-describedby={error && !formData.contrasena ? "contrasena-error" : undefined}
              />
            </div>
            {error && !formData.contrasena && (
              <span id="contrasena-error" className="text-red-600 text-xs mt-1 block">La contraseña es requerida.</span>
            )}
          </div>

          {/* Confirmar contraseña */}
          <div>
            <label htmlFor="confirmarContrasena" className="block text-sm font-bold text-slate-700 mb-2">
              Confirmar contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaCheckCircle className="text-emerald-500 text-lg" />
              </div>
              <input
                id="confirmarContrasena"
                type="password"
                name="confirmarContrasena"
                value={formData.confirmarContrasena}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                className="w-full pl-12 pr-4 py-3.5 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-slate-800 placeholder-slate-400 bg-slate-50 hover:bg-white"
                required
                aria-invalid={error && formData.contrasena !== formData.confirmarContrasena ? "true" : undefined}
                aria-describedby={error && formData.contrasena !== formData.confirmarContrasena ? "confirmar-error" : undefined}
              />
            </div>
            {error && formData.contrasena !== formData.confirmarContrasena && (
              <span id="confirmar-error" className="text-red-600 text-xs mt-1 block">Las contraseñas no coinciden.</span>
            )}
          </div>

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 mt-6 bg-gradient-to-r from-teal-500 via-emerald-600 to-green-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:from-teal-600 hover:via-emerald-700 hover:to-green-700 focus:outline-none focus:ring-4 focus:ring-teal-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Registrando...
              </span>
            ) : (
              "Registrarse"
            )}
          </button>
        </form>

            <div className="text-center mt-8 pb-2">
              <p className="text-slate-600 text-sm">
                ¿Ya tienes una cuenta?{" "}
                <a href="/login" className="text-teal-600 font-bold hover:text-emerald-600 hover:underline focus:outline-none focus:ring-2 focus:ring-teal-300 rounded px-1 transition-colors">
                  Inicia sesión
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
