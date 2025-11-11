import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFutbol } from "react-icons/fa";

function NavBarUser({ usuarioProp, onLogout }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const usuario =
    usuarioProp ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("usuario") || "null");
      } catch {
        return null;
      }
    })();

  const handleLogout = () => {
    if (onLogout) return onLogout();
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
  <nav className="w-full py-4 px-10 flex justify-between items-center bg-green-900/80 backdrop-blur-md fixed top-0 z-50 shadow-lg text-white font-sans antialiased border-b border-green-800" aria-label="Barra de navegación de usuario">
  <h1 className="text-2xl md:text-2xl font-bold flex items-center gap-3 text-white">
    <FaFutbol className="text-green-300 text-3xl animate-pulse" />
    <span className="hidden md:inline">SISTEMA DE GESTIÓN DE ESCENARIOS DEPORTIVOS</span>
    <span className="md:hidden">Tulúa Deportes</span>
  </h1>

  <div className="flex items-center gap-3">
    <span className="text-sm text-white/95">
      Hola,&nbsp; <span className="font-medium text-white">{usuario?.nombre || "Usuario"}</span>
    </span>

      <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-sm text-white transition-colors"
        aria-expanded={open}
        aria-haspopup="true"
        aria-controls="user-menu"
      >
        Opciones <span className="text-xs">▾</span>
      </button>

      {open && (
        <div
          id="user-menu"
          className="absolute right-0 mt-2 w-56 bg-white text-gray-900 rounded-md shadow-lg overflow-hidden"
          onMouseLeave={() => setOpen(false)}
          role="menu"
        >
          <button
            className="w-full text-left px-4 py-2 hover:bg-green-50 hover:text-green-800 flex items-center gap-2"
            onClick={() => alert("Agregar medio de pago (simulado).")}
            role="menuitem"
          >
            <span className="text-green-600">➕</span>
            <span>Agregar medio de pago</span>
          </button>

          <button
            className="w-full text-left px-4 py-2 hover:bg-green-50 hover:text-green-800 flex items-center gap-2"
            onClick={() => {
              setOpen(false);
              navigate("/mis-reservas");
            }}
            role="menuitem"
          >
            <span className="text-green-600">📋</span>
            <span>Ver reservas</span>
          </button>

          <button
            className="w-full text-left px-4 py-2 hover:bg-green-50 hover:text-green-800 flex items-center gap-2"
            onClick={() => {
              setOpen(false);
              navigate("/dashboard");
            }}
            role="menuitem"
          >
            <span className="text-green-600">🏠</span>
            <span>Ir al Dashboard</span>
          </button>
          <hr className="border-t border-green-100" />

          <button
            className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 text-red-600"
            onClick={handleLogout}
            role="menuitem"
          >
            <span className="text-red-600">✖</span>
            <span>Cerrar sesión</span>
          </button>
        </div>
      )}
    </div>
  </div>
</nav>

  );
}

export default NavBarUser;
