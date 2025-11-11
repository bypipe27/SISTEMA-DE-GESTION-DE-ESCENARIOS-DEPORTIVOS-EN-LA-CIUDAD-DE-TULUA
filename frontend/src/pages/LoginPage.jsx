import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/Button";
import NavBar from "../components/NavBar";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("Por favor, completa todos los campos.");
      return;
    }

    try {
  const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/usuarios/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          contrasena: form.password, // 👈 Usa el mismo nombre del backend
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Error al iniciar sesión.");

      // ✅ Guardar token y usuario en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("usuario", JSON.stringify(data.usuario));

      // redirigir según role
      if (data.usuario?.role === "provider" || data.usuario?.role === "proveedor") {
        navigate("/dashboard-provider"); // crea esta ruta
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      console.error("❌ Error al iniciar sesión:", err);
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex items-center justify-center p-6">
      {/* estilos locales para look minimalista (no afectan la lógica) */}
      <style>{`
        .lp-card { width:100%; max-width:520px; border-radius:14px; background:#fff; box-shadow:0 12px 30px rgba(2,6,23,0.06); border:1px solid rgba(2,6,23,0.04); padding:20px; }
        .lp-legend { color:#064e3b; font-weight:600; }
        .lp-sub { color:#6b7280; font-size:0.95rem; }
        .lp-input { width:100%; padding:12px 14px; border-radius:12px; border:1px solid rgba(15,23,42,0.06); background:#fff; }
        .lp-small { font-size:0.9rem; color:#6b7280; }
        .lp-actions { display:flex; flex-direction:column; gap:12px; align-items:center; }
        .lp-divider { display:flex; align-items:center; gap:12px; width:100%; }
        .lp-divider > div { flex:1; height:1px; background:rgba(16,185,129,0.12); }
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
                className="lp-input pr-12"
                required
                aria-required="true"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
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
                className="h-4 w-4 rounded border-gray-300 text-green-600"
              />
              Recordarme
            </label>
            <Link to="/forgot-password" className="text-green-600 hover:underline text-sm">¿Olvidaste tu contraseña?</Link>
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
              <Button color="green" className="w-full" onClick={onSubmit}>
                Iniciar sesión
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

