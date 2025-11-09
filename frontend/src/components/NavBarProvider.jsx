import React from "react";
import { NavLink } from "react-router-dom";
import { FaFutbol } from "react-icons/fa";

export default function NavBarProvider({
  items,
  brand = "Panel Proveedor",
  showLogin = false,
  className = ""
}) {
  const defaultItems = [
    { to: "/dashboard-provider", label: "Panel", end: false },
    { to: "/canchas-manager", label: "Mis canchas", end: false },
    { to: "/reservas-provider", label: "Reservas", end: false },
    { to: "/reportes-provider", label: "Reportes", end: false }
  ];

  const navItems = items && items.length ? items : defaultItems;

  const linkClass = ({ isActive }) =>
    isActive
      ? "px-3 py-2 rounded-md bg-green-700 text-white text-sm font-medium"
      : "px-3 py-2 rounded-md text-sm font-medium text-white/90 hover:text-green-300";

  return (
    <nav className={`w-full py-4 px-6 flex justify-between items-center bg-green-900/80 backdrop-blur-md fixed top-0 z-50 shadow-lg text-white ${className}`}>
      <div className="flex items-center gap-3">
        <FaFutbol className="text-green-300 text-3xl" />
        <span className="text-lg font-bold">{brand}</span>
      </div>

      <div className="flex items-center gap-4">
        {navItems.map((it) => (
          <NavLink key={it.to} to={it.to} className={linkClass} end={!!it.end}>
            {it.label}
          </NavLink>
        ))}
        {showLogin && <NavLink to="/login" className="px-3 py-1 text-sm hover:text-green-300">Login</NavLink>}
      </div>
    </nav>
  );
}
