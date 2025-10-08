import React, { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import NavBar from "../components/NavBar";

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: "", password: "", remember: true });
  const [error, setError] = useState("");

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Por favor, completa todos los campos.");
      return;
    }
    console.log("Login:", form);
  };
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-600 via-green-700 to-green-900 p-6">
      <NavBar /> 
      <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl w-full max-w-md p-8 ring-1 ring-white/20">
        {/* Header */}
        <div className="text-center mb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-green-200 hover:text-white transition"
          >
            {/* <span className="text-sm"> Volver al inicio</span> */}
          </Link>
          <h2 className="text-3xl font-bold text-white mt-3">Iniciar Sesión</h2>
          <p className="text-green-100 text-sm mt-2">
            Accede para gestionar tus reservas y escenarios deportivos.
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} className="space-y-5">
          {/* Correo */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-white mb-1"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={onChange}
              placeholder="tucorreo@dominio.com"
              className="w-full rounded-xl border border-green-300 bg-white/90 px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-300"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-white mb-1"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={onChange}
                placeholder="••••••••"
                className="w-full rounded-xl border border-green-300 bg-white/90 px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-green-300"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Recordarme + Link */}
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-green-100">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={onChange}
                className="h-4 w-4 rounded border-green-400 text-green-600 focus:ring-green-500"
              />
              Recordarme
            </label>
            <Link
              to="/forgot-password"
              className="text-green-200 hover:text-white transition"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-2 rounded-xl">
              {error}
            </div>
          )}

          {/* Botones centrados */}
          <div className="flex flex-col items-center mt-8 gap-4">
            {/* Botón de iniciar sesión */}
            <div className="w-3/4 flex justify-center">
              <Button color="white" className="w-full" onClick={onSubmit}>
                Iniciar Sesión
              </Button>
            </div>

            {/* Divider con líneas */}
            <div className="relative flex items-center justify-center w-full my-2">
              <div className="w-1/4 border-t border-green-300/60"></div>
              <span className="mx-3 text-green-100 text-sm">o</span>
              <div className="w-1/4 border-t border-green-300/60"></div>
            </div>

            {/* Botón de crear cuenta */}
            <div className="w-full flex justify-center">
              <Link to="/register" className="w-3/4 flex justify-center">
                <Button color="green" className="w-full">
                  Crear cuenta nueva
                </Button>
              </Link>
            </div>
          </div>
        </form>

        {/* Footer */}
        <footer className="text-center mt-8 text-xs text-green-200">
          © 2025 Sistema de Gestión de Canchas — Proyecto académico
        </footer>
      </div>
    </div>
  );
}

export default LoginPage;
