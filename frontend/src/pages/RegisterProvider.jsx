import React, { useState } from "react";
import NavBar from "../components/NavBar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { FaStore, FaEnvelope, FaPhone, FaLock, FaCheckCircle, FaUserTie } from "react-icons/fa";

function RegisterProvider() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    contrasena: "",
    confirmarContrasena: "",
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Decoraciones de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <NavBar />

      <div className="relative z-10 w-full max-w-lg mt-16">
        <div className="bg-white rounded-3xl shadow-2xl shadow-blue-500/20 border-2 border-blue-100 overflow-hidden">
          {/* Header con gradiente */}
          <div className="relative bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 px-8 py-10 overflow-hidden">
            {/* Decoraciones en el header */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                <FaStore className="text-5xl text-white drop-shadow-lg" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Registro de proveedor</h2>
              <p className="text-blue-50 text-sm">Registra tu negocio para gestionar canchas y reservas.</p>
            </div>
          </div>

          {/* Formulario */}
          <div className="px-8 py-8 bg-gradient-to-b from-blue-50/30 to-white">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nombre o negocio */}
              <div>
                <label htmlFor="nombre" className="block text-sm font-bold text-slate-700 mb-2">
                  Nombre o negocio
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600">
                    <FaUserTie className="text-lg" />
                  </div>
                  <input
                    id="nombre"
                    name="nombre"
                    value={form.nombre}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all shadow-sm hover:border-blue-300 text-slate-800 placeholder-slate-400"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Correo */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                  Correo
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600">
                    <FaEnvelope className="text-lg" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all shadow-sm hover:border-blue-300 text-slate-800 placeholder-slate-400"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Teléfono */}
              <div>
                <label htmlFor="telefono" className="block text-sm font-bold text-slate-700 mb-2">
                  Teléfono <span className="text-slate-500 font-normal">(opcional)</span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600">
                    <FaPhone className="text-lg" />
                  </div>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={form.telefono}
                    onChange={handleChange}
                    onKeyDown={(e) => {
                      // Bloquear completamente letras, espacios y caracteres especiales
                      const isNumber = /[0-9]/.test(e.key);
                      const isControlKey = ['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key);
                      const isCtrlA = e.ctrlKey && e.key === 'a';
                      
                      // Solo permitir números, teclas de control y Ctrl+A
                      if (!isNumber && !isControlKey && !isCtrlA) {
                        e.preventDefault();
                        return false;
                      }
                      
                      // Limitar a máximo 10 dígitos
                      const valorActual = e.target.value.replace(/[^0-9]/g, '');
                      if (valorActual.length >= 10 && isNumber) {
                        e.preventDefault();
                        return false;
                      }
                    }}
                    onPaste={(e) => {
                      // Prevenir pegar contenido no numérico
                      e.preventDefault();
                      const paste = (e.clipboardData || window.clipboardData).getData('text');
                      const onlyNumbers = paste.replace(/[^0-9]/g, '').slice(0, 10);
                      if (onlyNumbers) {
                        setForm(prev => ({ ...prev, telefono: onlyNumbers }));
                      }
                    }}
                    placeholder="Número de contacto (máx. 10 dígitos)"
                    pattern="[0-9]{10}"
                    maxLength="10"
                    title="Ingrese un número de teléfono válido (máximo 10 dígitos)"
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all shadow-sm hover:border-blue-300 text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="contrasena" className="block text-sm font-bold text-slate-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600">
                    <FaLock className="text-lg" />
                  </div>
                  <input
                    id="contrasena"
                    name="contrasena"
                    type="password"
                    value={form.contrasena}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all shadow-sm hover:border-blue-300 text-slate-800"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Confirmar contraseña */}
              <div>
                <label htmlFor="confirmarContrasena" className="block text-sm font-bold text-slate-700 mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-600">
                    <FaCheckCircle className="text-lg" />
                  </div>
                  <input
                    id="confirmarContrasena"
                    name="confirmarContrasena"
                    type="password"
                    value={form.confirmarContrasena}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all shadow-sm hover:border-blue-300 text-slate-800"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Mensajes de error o éxito */}
              {error && (
                <div 
                  className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3 shadow-sm"
                  role="alert"
                  aria-live="assertive"
                >
                  <span className="text-xl">⚠️</span>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}
              
              {mensaje && (
                <div 
                  className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 text-emerald-700 px-4 py-3 rounded-xl flex items-start gap-3 shadow-sm"
                  role="status"
                >
                  <span className="text-xl">✅</span>
                  <span className="text-sm font-medium">{mensaje}</span>
                </div>
              )}

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="flex-1 py-3 rounded-xl font-bold text-slate-700 text-base border-2 border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 py-3 rounded-xl font-bold text-white text-base transition-all shadow-lg ${
                    loading
                      ? 'bg-slate-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:via-indigo-700 hover:to-purple-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    'Registrar proveedor'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50/30 px-8 py-4 border-t border-blue-100">
            <p className="text-center text-xs text-slate-600 font-medium">
              © 2025 Sistema de Gestión de Canchas — Proyecto académico
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterProvider;