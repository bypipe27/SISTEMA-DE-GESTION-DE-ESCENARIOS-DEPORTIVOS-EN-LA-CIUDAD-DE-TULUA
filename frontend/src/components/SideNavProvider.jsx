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
    <aside className="flex h-screen w-64 flex-col border-r border-gray-200 bg-white sticky top-0">
      <div className="flex flex-col gap-4 p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-green-600 flex items-center justify-center aspect-square rounded-full size-10 text-white font-bold">
            SG
          </div>
          <div className="flex flex-col">
            <h1 className="text-gray-900 text-base font-bold">{title}</h1>
            <p className="text-gray-500 text-sm font-normal">{usuario?.nombre || "Usuario"}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col justify-between flex-1 p-2">
        <nav className="flex flex-col gap-1">
          {navItems.map((it) => (
            <button
              key={it.to}
              type="button"
              onClick={() => navigate(it.to)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-left ${
                isActive(it.to)
                  ? "bg-emerald-50 text-emerald-600"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {it.icon ?? null}
              <span>{it.label}</span>
            </button>
          ))}
        </nav>

        <div className="flex flex-col gap-1 mt-2">
          {bottomItems.map((it) => (
            <button
              key={it.to}
              type="button"
              onClick={() => navigate(it.to)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-left ${
                isActive(it.to)
                  ? "bg-emerald-50 text-emerald-600"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {it.icon ?? null}
              <span>{it.label}</span>
            </button>
          ))}

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 text-sm font-medium text-left"
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
