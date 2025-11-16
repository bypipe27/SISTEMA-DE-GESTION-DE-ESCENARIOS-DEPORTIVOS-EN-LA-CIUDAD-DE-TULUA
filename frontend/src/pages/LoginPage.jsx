import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import NavBar from "../components/NavBar";
import { useAuth } from "../hooks/useAuth";

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
    <div className="min-h-screen bg-gray-50 text-gray-800 flex items-center justify-center p-6">
      {/* estilos locales para look minimalista (no afectan la lógica) */}
      <style>{`
        /* Tarjeta */
        .lp-card { width:100%; max-width:520px; border-radius:14px; background:#ffffff; box-shadow:0 12px 30px rgba(2,6,23,0.06); border:1px solid rgba(2,6,23,0.04); padding:20px; }
        /* Títulos: color accesible (contraste alto) */
        .lp-legend { color:#053f34; font-weight:700; }
        /* Subtítulos y textos secundarios: más oscuros para mejorar contraste */
        .lp-sub { color:#374151; font-size:0.95rem; }
        .lp-small { font-size:0.9rem; color:#374151; }

        /* Inputs */
        /* Aumentamos padding-right para dejar espacio al botón "mostrar contraseña" */
        .lp-input { width:100%; padding:12px 48px 12px 14px; border-radius:12px; border:1px solid rgba(15,23,42,0.06); background:#fff; color:#0f172a; }

        /* Botón mostrar/ocultar contraseña: área táctil mínima 44x44px */
        .lp-show-pass {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          color: #6b7280;
        }
        .lp-show-pass:hover { color: #374151; }
        .lp-show-pass:focus { outline: 3px solid rgba(5,63,52,0.12); outline-offset: 3px; }

        /* Enlaces con buen contraste */
        .lp-link { color:#053f34; text-decoration: none; }
        .lp-link:hover, .lp-link:focus { text-decoration: underline; color:#022823; }

        /* Acciones/layout */
        .lp-actions { display:flex; flex-direction:column; gap:12px; align-items:center; }
        .lp-divider { display:flex; align-items:center; gap:12px; width:100%; }
        .lp-divider > div { flex:1; height:1px; background:rgba(6,95,70,0.08); }
        @media(min-width:640px){ .lp-actions { flex-direction:row; } }
      `}</style>

      <NavBar />

      <div className="lp-card">
        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl lp-legend mb-1">Iniciar sesión</h2>
          <p className="lp-sub">Accede para gestionar tus reservas y escenarios deportivos.</p>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Correo */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="tucorreo@dominio.com"
              className="lp-input"
              required
              aria-required="true"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                className="lp-input"
                required
                aria-required="true"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="lp-show-pass"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Recordarme + Link */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 lp-small">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={onChange}
                className="h-5 w-5 rounded border-gray-300 text-green-600"
                aria-label="Recordarme"
              />
              Recordarme
            </label>
            <Link to="/forgot-password" className="lp-link lp-small">¿Olvidaste tu contraseña?</Link>
          </div>

          {/* Error */}
          {error && (
            <div 
              className="bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-2 rounded"
              role="alert"
              aria-live="polite"
            >
              {error}
            </div>
          )}

          {/* Botones centrados */}
          <div className="lp-actions mt-4">
            <div className="w-full sm:w-3/4">
              <Button color="green" className="w-full" onClick={onSubmit} disabled={loading}>
                {loading ? "Iniciando..." : "Iniciar sesión"}
              </Button>
            </div>

            <div className="lp-divider my-2 w-full sm:hidden">
              <div></div>
              <div className="text-center text-sm text-gray-400">o</div>
              <div></div>
            </div>

            <div className="w-full sm:w-3/4">
              <Link to="/register" className="w-full block">
                <Button color="white" className="w-full border">Crear cuenta nueva</Button>
              </Link>
            </div>
          </div>
        </form>

        {/* Footer */}
        <footer className="text-center mt-6 text-xs text-gray-500">
          © 2025 Sistema de Gestión de Canchas — Proyecto académico
        </footer>
      </div>
    </div>
  );
}

export default LoginPage;

