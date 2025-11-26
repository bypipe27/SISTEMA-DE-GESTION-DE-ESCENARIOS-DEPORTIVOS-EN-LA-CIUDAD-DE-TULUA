import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaFutbol, FaCalendarAlt, FaCreditCard, FaSignOutAlt, FaSearch } from "react-icons/fa";

function SideNavBar({ usuarioProp, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

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

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 flex flex-col fixed inset-y-0 left-0 z-10 shadow-2xl">
      {/* Header - Mejorado */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-700/50 bg-slate-800/50">
        <div className="w-11 h-11 bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400/20">
          <FaFutbol className="text-white text-xl" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white tracking-tight">Panel Reservas</h1>
          <p className="text-xs text-emerald-400 font-medium">Gestión de canchas</p>
        </div>
      </div>

      {/* Navigation - Mejorado con color */}
      <nav className="flex-grow px-4 py-6">
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => navigate("/dashboard")}
              className={`flex items-center w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                isActive("/dashboard")
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              }`}
            >
              <FaSearch className="mr-3 text-base" />
              <span>Buscar canchas</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate("/mis-reservas")}
              className={`flex items-center w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                isActive("/mis-reservas")
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              }`}
            >
              <FaCalendarAlt className="mr-3 text-base" />
              <span>Mis reservas</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate("/metodos-pago")}
              className={`flex items-center w-full px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                isActive("/metodos-pago")
                  ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                  : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
              }`}
            >
              <FaCreditCard className="mr-3 text-base" />
              <span>Métodos de pago</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* User Profile - Mejorado */}
      <div className="px-4 py-4 border-t border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/50 transition-all duration-200 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/20">
            <span className="text-white text-xs font-bold">
              {getInitials(usuario?.nombre)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {usuario?.nombre || "Usuario"}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {usuario?.email || "email@ejemplo.com"}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-slate-700 group-hover:rotate-6 transform transition-transform duration-200"
            title="Cerrar sesión"
          >
            <FaSignOutAlt className="text-base" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default SideNavBar;
