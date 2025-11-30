import React, { useMemo, useState } from "react";
import { FaSyncAlt, FaSearch, FaCheckCircle, FaTimes, FaCalendarAlt } from "react-icons/fa";
import SideNavBar from "../components/SideNavBar";
import { useNavigate } from "react-router-dom";
import { useCanchas } from "../hooks/useCanchas";
import * as canchaService from "../services/canchaService";

function DashboardPage({
  usuarioProp,
  onLogout,
  onModificarTelefono,
  onCambiarPass,
  onAgregarPago,
}) {
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

  // filtros y estado de ejemplo
  const [q, setQ] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [fecha, setFecha] = useState(() => {
    // Establecer la fecha de hoy por defecto
    const hoy = new Date();
    const yyyy = hoy.getFullYear();
    const mm = String(hoy.getMonth() + 1).padStart(2, "0");
    const dd = String(hoy.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }); // yyyy-mm-dd seleccionada

  // Hook de canchas con filtros
  const { canchas: resultados, tipos, loading, refetch } = useCanchas({
    searchTerm: q,
    tipo: tipoFiltro,
    soloDisponibles,
    fecha,
  });

  // Helper para verificar disponibilidad (delegado al servicio)
  const estaDisponibleEnFecha = (c, fechaIso) => {
    return canchaService.isCanchaAvailable(c, fechaIso);
  };

  const handleReservar = (cancha) => {
    // navega a /reservar/:id y pasa la cancha + fecha en state
    navigate(`/reservar/${cancha.id}`, { state: { cancha, fecha } });
  };

  const handleVerDetalles = (cancha) => {
    // Lleva a la página de detalles con el id de la cancha
    navigate(`/cancha/${cancha.id}`, { state: cancha });
  };

  const handleLogout = () => {
    if (onLogout) return onLogout();
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex">
      {/* SIDEBAR */}
      <SideNavBar usuarioProp={usuario} onLogout={handleLogout} />

      {/* CONTENT */}
      <div className="flex-1 ml-64">
        <div className="w-full mx-auto px-8 sm:px-10 lg:px-12 py-12">
          <div className="flex gap-12">
          {/* MAIN SECTION - Canchas */}
          <section className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-extrabold text-slate-900">Canchas Disponibles</h2>
              <span className="text-sm font-medium text-slate-500 bg-slate-100 px-4 py-2 rounded-full">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"></div>
                    Cargando...
                  </span>
                ) : (
                  `${resultados.length} resultado${resultados.length !== 1 ? "s" : ""}`
                )}
              </span>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                    <div className="w-full h-48 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 animate-shimmer"></div>
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                      <div className="h-3 bg-slate-200 rounded w-full"></div>
                      <div className="h-10 bg-slate-200 rounded mt-4"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {resultados.map((c) => {
                const disponibleHoy = estaDisponibleEnFecha(c, fecha);
                return (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl shadow-sm overflow-hidden flex flex-col group transform hover:-translate-y-1 transition-transform duration-300"
                  >
                    {/* Imagen con overlay */}
                    <div className="relative">
                      {c.imagen_url ? (
                        <img
                          alt={`Cancha ${c.nombre}`}
                          className="w-full h-48 object-cover"
                          src={c.imagen_url}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gradient-to-br from-green-400 to-green-600"></div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      
                      {/* Badge de disponibilidad */}
                      <div
                        className={`absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full ${
                          disponibleHoy
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {disponibleHoy ? "Disponible" : "No Disponible"}
                      </div>

                      {/* Info sobre la imagen */}
                      <div className="absolute bottom-4 left-4">
                        <h3 className="text-xl font-bold text-white">{c.nombre}</h3>
                        <p className="text-sm text-white/90">
                          {c.tipo} • Capacidad: {c.capacidad}
                        </p>
                      </div>
                    </div>

                    {/* Contenido de la tarjeta */}
                    <div className="p-5 flex-grow flex flex-col">
                      <p className="text-sm text-slate-600 flex-grow mb-4">
                        {c.descripcion}
                      </p>

                      <div className="flex items-center justify-between mb-4">
                        <p className="text-lg font-bold text-slate-800">
                          COP {c.precio.toLocaleString()}
                        </p>
                      </div>

                      {/* Botones de acción */}
                      <div className="mt-auto grid grid-cols-2 gap-3">
                        <button
                          onClick={() => handleVerDetalles(c)}
                          className="w-full py-2.5 px-4 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors text-sm"
                        >
                          Ver detalles
                        </button>
                        <button
                          disabled={!disponibleHoy}
                          onClick={() => handleReservar(c)}
                          className={`w-full py-2.5 px-4 font-semibold rounded-lg transition-colors text-sm ${
                            disponibleHoy
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-slate-300 text-slate-500 cursor-not-allowed"
                          }`}
                        >
                          Reservar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {resultados.length === 0 && !loading && (
                <div className="col-span-full text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
                    <FaSearch className="text-slate-400 text-2xl" />
                  </div>
                  <p className="text-slate-500 text-lg font-medium mb-2">No se encontraron canchas</p>
                  <p className="text-slate-400 text-sm">Intenta ajustar los filtros para ver más resultados</p>
                </div>
              )}
              </div>
            )}
          </section>

          {/* SIDEBAR FILTROS */}
          <aside className="w-72 flex-shrink-0">
            <div className="bg-gradient-to-br from-white via-teal-50/30 to-emerald-50/30 p-6 rounded-2xl shadow-xl sticky top-6 border-2 border-teal-100 animate-fadeInUp backdrop-blur-sm">
              {/* Header mejorado */}
              <div className="mb-6 pb-4 border-b-2 border-teal-100">
                <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-teal-700 via-emerald-600 to-green-700 font-extrabold text-2xl flex items-center gap-2">
                  <FaSearch className="text-teal-600" />
                  Filtros
                </h2>
                <p className="text-xs text-teal-600 mt-1">Personaliza tu busqueda</p>
              </div>
              
              <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
                {/* Buscar */}
                <div className="animate-slideInRight" style={{animationDelay: '0.1s', animationFillMode: 'both'}}>
                  <label
                    className="block text-sm font-bold text-teal-900 mb-2.5"
                    htmlFor="search"
                  >
                    Buscar Cancha
                  </label>
                  <div className="relative group">
                    <FaSearch className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-teal-400 transition-all duration-300 group-hover:text-teal-600 group-hover:scale-110" />
                    <input
                      className="w-full pl-11 pr-4 py-3 border-2 border-teal-200 bg-white rounded-xl focus:ring-4 focus:ring-teal-200 focus:border-teal-500 transition-all duration-300 text-sm placeholder-teal-300 hover:border-teal-400 hover:shadow-md"
                      id="search"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Nombre o tipo..."
                      type="text"
                    />
                  </div>
                </div>

                {/* Tipo */}
                <div className="animate-slideInRight" style={{animationDelay: '0.2s', animationFillMode: 'both'}}>
                  <label
                    className="block text-sm font-bold text-teal-900 mb-2.5"
                    htmlFor="type"
                  >
                    Tipo de Cancha
                  </label>
                  <select
                    className="w-full py-3 px-4 border-2 border-teal-200 bg-white rounded-xl focus:ring-4 focus:ring-teal-200 focus:border-teal-500 transition-all duration-300 text-sm hover:border-teal-400 hover:shadow-md cursor-pointer font-medium text-slate-700"
                    id="type"
                    value={tipoFiltro}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                  >
                    <option value="">Todos los tipos</option>
                    {tipos.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha */}
                <div className="animate-slideInRight" style={{animationDelay: '0.3s', animationFillMode: 'both'}}>
                  <label
                    className="block text-sm font-bold text-teal-900 mb-2.5"
                    htmlFor="date"
                  >
                    Seleccionar Fecha
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-4 py-3 border-2 border-teal-200 bg-white rounded-xl focus:ring-4 focus:ring-teal-200 focus:border-teal-500 transition-all duration-300 text-sm hover:border-teal-400 hover:shadow-md cursor-pointer font-medium text-slate-700"
                      id="date"
                      type="date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value)}
                      min={(() => {
                        const hoy = new Date();
                        const yyyy = hoy.getFullYear();
                        const mm = String(hoy.getMonth() + 1).padStart(2, "0");
                        const dd = String(hoy.getDate()).padStart(2, "0");
                        return `${yyyy}-${mm}-${dd}`;
                      })()}
                    />
                  </div>
                </div>

                {/* Solo disponibles */}
                <div className="bg-gradient-to-br from-white to-teal-50/50 p-4 rounded-xl border-2 border-teal-200 animate-slideInRight hover:shadow-lg transition-all duration-300" style={{animationDelay: '0.4s', animationFillMode: 'both'}}>
                  <div className="flex items-center justify-between">
                    <label
                      className="text-sm font-bold text-teal-900 cursor-pointer flex items-center gap-2"
                      htmlFor="available"
                    >
                      <FaCheckCircle className="text-teal-600 text-base" />
                      Solo disponibles
                    </label>
                    <label
                      className="relative inline-flex items-center cursor-pointer"
                      htmlFor="available"
                    >
                      <input
                        className="sr-only peer"
                        id="available"
                        type="checkbox"
                        checked={soloDisponibles}
                        onChange={() => setSoloDisponibles((v) => !v)}
                      />
                      <div className="w-14 h-7 bg-teal-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border-teal-300 after:border-2 after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-md peer-checked:bg-gradient-to-r peer-checked:from-teal-600 peer-checked:to-emerald-600 hover:shadow-lg transition-all duration-300"></div>
                    </label>
                  </div>
                </div>

                {/* Botones */}
                <div className="pt-4 space-y-3 animate-slideInRight" style={{animationDelay: '0.5s', animationFillMode: 'both'}}>
                  <button
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border-2 border-teal-400 bg-white text-teal-700 font-bold rounded-xl hover:bg-teal-50 hover:border-teal-500 transition-all duration-300 shadow-md hover:shadow-xl transform hover:scale-[1.02] active:scale-95 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    type="button"
                    disabled={isClearing || loading}
                    onClick={async () => {
                      setIsClearing(true);
                      setQ("");
                      setTipoFiltro("");
                      setSoloDisponibles(false);
                      const hoy = new Date();
                      const yyyy = hoy.getFullYear();
                      const mm = String(hoy.getMonth() + 1).padStart(2, "0");
                      const dd = String(hoy.getDate()).padStart(2, "0");
                      setFecha(`${yyyy}-${mm}-${dd}`);
                      // Refrescar después de limpiar para mostrar todas las canchas
                      await new Promise(resolve => setTimeout(resolve, 300));
                      await refetch();
                      setIsClearing(false);
                    }}
                  >
                    <FaTimes className={`text-lg transition-transform duration-300 ${isClearing ? 'animate-spin' : 'group-hover:rotate-90'}`} />
                    {isClearing ? 'Limpiando...' : 'Limpiar filtros'}
                  </button>
                  <button
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-teal-600 via-emerald-600 to-green-600 text-white font-bold rounded-xl hover:from-teal-700 hover:via-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-95 hover:brightness-110 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:brightness-100"
                    type="button"
                    onClick={refetch}
                    disabled={loading}
                  >
                    <FaSyncAlt className={`transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                    {loading ? 'Actualizando...' : 'Refrescar canchas'}
                  </button>
                </div>
              </form>
            </div>
          </aside>
        </div>
      </div>
    </div>
    </div>
  );
}

export default DashboardPage;
