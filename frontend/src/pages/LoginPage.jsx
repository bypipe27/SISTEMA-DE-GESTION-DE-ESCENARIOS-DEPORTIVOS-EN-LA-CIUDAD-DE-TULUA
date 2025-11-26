import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import NavBar from "../components/NavBar";
import { useAuth } from "../hooks/useAuth";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaUserCircle } from "react-icons/fa";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const { loading, error, handleLogin, clearError } = useAuth();

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    clearError();
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await handleLogin(form.email, form.password, form.remember);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 relative overflow-hidden flex items-center justify-center p-4">
      {/* Decoraciones de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-teal-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <NavBar />

      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl shadow-emerald-500/20 border-2 border-emerald-100 overflow-hidden">
          {/* Header con gradiente */}
          <div className="relative bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 px-8 py-10 overflow-hidden">
            {/* Decoraciones en el header */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12 animate-pulse" style={{animationDelay: '0.5s'}}></div>
            </div>
            
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-4">
                <FaUserCircle className="text-5xl text-white drop-shadow-lg" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">Iniciar sesión</h2>
              <p className="text-emerald-50 text-sm">Accede para gestionar tus reservas y escenarios deportivos.</p>
            </div>
          </div>

          {/* Formulario */}
          <div className="px-8 py-8 bg-gradient-to-b from-emerald-50/30 to-white">
            <form onSubmit={onSubmit} className="space-y-5">
              {/* Correo electrónico */}
              <div>
                <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600">
                    <FaEnvelope className="text-lg" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={onChange}
                    placeholder="tucorreo@dominio.com"
                    className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-all shadow-sm hover:border-emerald-300 text-slate-800 placeholder-slate-400"
                    required
                    aria-required="true"
                  />
                </div>
              </div>

              {/* Contraseña */}
              <div>
                <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600">
                    <FaLock className="text-lg" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={onChange}
                    placeholder="••••••••"
                    className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-all shadow-sm hover:border-emerald-300 text-slate-800"
                    required
                    aria-required="true"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-emerald-600 transition-colors rounded-lg hover:bg-emerald-50"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <FaEyeSlash className="text-xl" /> : <FaEye className="text-xl" />}
                  </button>
                </div>
              </div>

              {/* Recordarme + Link */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={form.remember}
                    onChange={onChange}
                    className="h-5 w-5 rounded border-2 border-slate-300 text-emerald-600 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    aria-label="Recordarme"
                  />
                  <span className="text-sm text-slate-700 font-medium group-hover:text-emerald-600 transition-colors">Recordarme</span>
                </label>
                <Link 
                  to="/forgot-password" 
                  className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Error */}
              {error && (
                <div 
                  className="bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3 shadow-sm"
                  role="alert"
                  aria-live="polite"
                >
                  <span className="text-xl">⚠️</span>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Botón de iniciar sesión */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 rounded-xl font-bold text-white text-base transition-all shadow-lg ${
                  loading
                    ? 'bg-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-700 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar sesión'
                )}
              </button>

              {/* Separador */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
                <span className="text-sm font-medium text-slate-500">o</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
              </div>

              {/* Botón crear cuenta */}
              <Link to="/register" className="block">
                <button
                  type="button"
                  className="w-full py-4 rounded-xl font-bold text-emerald-700 text-base border-2 border-emerald-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                >
                  Crear cuenta nueva
                </button>
              </Link>
            </form>
          </div>

          {/* Footer */}
          <div className="bg-gradient-to-r from-slate-50 to-emerald-50/30 px-8 py-4 border-t border-emerald-100">
            <p className="text-center text-xs text-slate-600 font-medium">
              © 2025 Sistema de Gestión de Canchas — Proyecto académico
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

