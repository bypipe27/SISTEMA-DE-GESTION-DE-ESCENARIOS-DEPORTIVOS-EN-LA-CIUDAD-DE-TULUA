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

  return (
    <aside className="w-64 bg-white shadow-lg flex flex-col fixed inset-y-0 left-0 z-10">
      {/* Header */}
      <div className="flex items-center justify-center h-24 border-b border-slate-200">
        <FaFutbol className="text-4xl text-green-600 mr-3" />
        <h1 className="text-xl font-bold text-slate-800 tracking-wide">PANEL RESERVAS</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-grow px-6 py-8">
        <ul className="space-y-4">
          <li>
            <button
              onClick={() => navigate("/dashboard")}
              className={`flex items-center w-full px-4 py-3 font-bold rounded-lg transition-colors ${
                isActive("/dashboard")
                  ? "bg-green-100 text-green-600"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FaSearch className="mr-4 text-xl" />
              <span>Buscar canchas</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => navigate("/mis-reservas")}
              className={`flex items-center w-full px-4 py-3 font-semibold rounded-lg transition-colors ${
                isActive("/mis-reservas")
                  ? "bg-green-100 text-green-600"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FaCalendarAlt className="mr-4 text-xl" />
              <span>Mis reservas</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => alert("Agregar método de pago (en construcción)")}
              className="flex items-center w-full px-4 py-3 text-slate-600 hover:bg-slate-100 font-semibold rounded-lg transition-colors"
            >
              <FaCreditCard className="mr-4 text-xl" />
              <span>Método de pago</span>
            </button>
          </li>
        </ul>
      </nav>

      {/* User Profile */}
      <div className="px-6 py-8 border-t border-slate-200">
        <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-800">{usuario?.nombre || "Usuario"}</p>
            <p className="text-xs text-slate-500">{usuario?.email || "email@ejemplo.com"}</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-slate-500 hover:text-slate-700"
            title="Cerrar sesión"
          >
            <FaSignOutAlt className="text-xl" />
          </button>
        </div>
      </div>
    </aside>
  );
}

export default SideNavBar;
