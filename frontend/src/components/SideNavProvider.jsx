import React, { useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdDashboard, MdSportsSoccer, MdCalendarMonth, MdSettings, MdLogout } from "react-icons/md";

/**
 * SideNavProvider: Barra lateral reutilizable para el panel de proveedor
 * - Navegación por rutas con navigate(to) (sin href="#")
 * - Resalta el item activo según location.pathname
 * - Muestra nombre de usuario desde localStorage
 * - Incluye botón de Cerrar Sesión
 *
 * Props opcionales:
 * - items: Array<{ to: string, label: string, icon?: ReactNode }>
 * - footerItems: Array similar para seccion inferior (opcional)
 * - title: string (por defecto "Panel Proveedor")
 */
function SideNavProvider({
  items,
  footerItems,
  title = "Panel Proveedor",
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const usuario = useMemo(() => {
    try {
      const raw = localStorage.getItem("usuario");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const defaultItems = [
    { to: "/dashboard-provider", label: "Dashboard", icon: <MdDashboard size={20} /> },
    { to: "/canchas-manager", label: "Gestión de Canchas", icon: <MdSportsSoccer size={20} /> },
    { to: "/reservas-provider", label: "Gestión de Reservas", icon: <MdCalendarMonth size={20} /> },
  ];

  const navItems = Array.isArray(items) && items.length ? items : defaultItems;
  const bottomItems = Array.isArray(footerItems) ? footerItems : [];

  function handleLogout() {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    navigate("/login");
  }

  const isActive = (to) => {
    // Marca activo si la ruta coincide exactamente o si es prefijo (para subrutas)
    return location.pathname === to || location.pathname.startsWith(to + "/");
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-gradient-to-b from-white via-gray-50 to-gray-100 sticky top-0 shadow-xl">
      <div className="flex flex-col gap-4 p-5 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center aspect-square rounded-xl size-12 text-white font-extrabold text-lg shadow-lg">
            SG
          </div>
          <div className="flex flex-col">
            <h1 className="text-gray-900 text-base font-extrabold tracking-tight">{title}</h1>
            <p className="text-gray-600 text-sm font-semibold">{usuario?.nombre || "Usuario"}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between flex-1 p-3">
        <nav className="flex flex-col gap-2">
          {navItems.map((it) => (
            <button
              key={it.to}
              type="button"
              onClick={() => navigate(it.to)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-left transition-all duration-200 ${
                isActive(it.to)
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md transform scale-[1.02]"
                  : "hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 text-gray-700 hover:text-gray-900 hover:shadow-sm"
              }`}
            >
              {it.icon ?? null}
              <span>{it.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-2 mt-2">
          {bottomItems.map((it) => (
            <button
              key={it.to}
              type="button"
              onClick={() => navigate(it.to)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-left transition-all duration-200 ${
                isActive(it.to)
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md transform scale-[1.02]"
                  : "hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-200 text-gray-700 hover:text-gray-900 hover:shadow-sm"
              }`}
            >
              {it.icon ?? null}
              <span>{it.label}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 text-gray-700 hover:text-red-600 text-sm font-bold text-left transition-all duration-200 hover:shadow-sm mt-2 border-t border-gray-200 pt-4"
          >
            <MdLogout size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default SideNavProvider;
