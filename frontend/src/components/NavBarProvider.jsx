import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { FaFutbol } from "react-icons/fa";

export default function NavBarProvider({
  items,
  brand = "Sistema de Gestión de Escenarios Deportivos",
  showLogin = false,
  className = ""
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const defaultItems = [
    { to: "/dashboard-provider", label: "Panel", end: false },
    { to: "/canchas-manager", label: "Mis canchas", end: false },
    { to: "/reservas-provider", label: "Reservas", end: false },
    { to: "/reportes-provider", label: "Reportes", end: false }
  ];

  const navItems = items && items.length ? items : defaultItems;

  const usuario = (() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null");
    } catch {
      return null;
    }
  })();

  const linkClass = ({ isActive }) =>
    isActive
      ? "px-3 py-2 rounded-md bg-green-700 text-white text-sm font-medium"
      : "px-3 py-2 rounded-md text-sm font-medium text-white/90 hover:text-green-300";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <nav className={`w-full py-4 px-6 flex justify-between items-center bg-green-900/80 backdrop-blur-md fixed top-0 z-50 shadow-lg text-white ${className}`} aria-label="Barra de navegación de proveedor">
      <div className="flex items-center gap-3">
        <FaFutbol className="text-green-300 text-3xl" />
        <span className="text-lg font-bold">{brand}</span>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-white/95">Hola,&nbsp;<span className="font-medium text-white">{usuario?.nombre || "Proveedor"}</span></span>

        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-sm text-white transition-colors"
            aria-expanded={open}
            aria-haspopup="true"
            aria-controls="provider-menu"
          >
            Opciones <span className="text-xs">▾</span>
          </button>

          {open && (
            <div
              id="provider-menu"
              className="absolute right-0 mt-2 w-56 bg-white text-gray-900 rounded-md shadow-lg overflow-hidden"
              onMouseLeave={() => setOpen(false)}
              role="menu"
            >
              {navItems.map((it) => (
                <button
                  key={it.to}
                  className="w-full text-left px-4 py-2 hover:bg-green-50 hover:text-green-800 flex items-center gap-2"
                  onClick={() => {
                    setOpen(false);
                    navigate(it.to);
                  }}
                  role="menuitem"
                >
                  <span>{it.label}</span>
                </button>
              ))}

              <hr className="border-t border-green-100" />

              <button
                className="w-full text-left px-4 py-2 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 text-red-600"
                onClick={handleLogout}
                role="menuitem"
              >
                <span>✖</span>
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
