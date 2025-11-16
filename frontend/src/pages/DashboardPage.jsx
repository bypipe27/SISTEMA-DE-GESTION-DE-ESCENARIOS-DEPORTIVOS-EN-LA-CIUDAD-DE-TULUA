import React, { useMemo, useState } from "react";
import { FaSyncAlt } from "react-icons/fa";
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
              <span className="text-sm font-medium text-slate-500">
                {resultados.length} resultado{resultados.length !== 1 ? "s" : ""}
              </span>
            </div>

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
              
              {resultados.length === 0 && (
                <div className="col-span-full text-center text-slate-500 py-8">
                  No se encontraron canchas que coincidan con los filtros.
                </div>
              )}
            </div>
          </section>

          {/* SIDEBAR FILTROS */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white p-5 rounded-xl shadow-sm sticky top-6">
              <h2 className="text-2xl font-bold mb-8 text-slate-900">Filtros</h2>
              
              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                {/* Buscar */}
                <div>
                  <label
                    className="block text-sm font-semibold text-slate-700 mb-2"
                    htmlFor="search"
                  >
                    Buscar
                  </label>
                  <div className="relative">
                    <input
                      className="w-full pl-10 pr-4 py-2.5 border border-slate-300 bg-slate-50 rounded-lg focus:ring-green-600 focus:border-green-600 transition-colors text-sm"
                      id="search"
                      value={q}
                      onChange={(e) => setQ(e.target.value)}
                      placeholder="Nombre o tipo..."
                      type="text"
                    />
                  </div>
                </div>

                {/* Tipo */}
                <div>
                  <label
                    className="block text-sm font-semibold text-slate-700 mb-2"
                    htmlFor="type"
                  >
                    Tipo
                  </label>
                  <select
                    className="w-full py-2.5 px-3 border border-slate-300 bg-slate-50 rounded-lg focus:ring-green-600 focus:border-green-600 transition-colors text-sm"
                    id="type"
                    value={tipoFiltro}
                    onChange={(e) => setTipoFiltro(e.target.value)}
                  >
                    <option value="">Todos</option>
                    {tipos.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Fecha */}
                <div>
                  <label
                    className="block text-sm font-semibold text-slate-700 mb-2"
                    htmlFor="date"
                  >
                    Fecha
                  </label>
                  <div className="relative">
                    <input
                      className="w-full px-3 py-2.5 border border-slate-300 bg-slate-50 rounded-lg focus:ring-green-600 focus:border-green-600 transition-colors text-sm"
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
                <div className="flex items-center justify-between pt-2">
                  <label
                    className="text-sm font-semibold text-slate-700"
                    htmlFor="available"
                  >
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
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                {/* Botones */}
                <div className="pt-6 space-y-4">
                  <button
                    className="w-full flex items-center justify-center py-2.5 px-4 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors"
                    type="button"
                    onClick={() => {
                      setQ("");
                      setTipoFiltro("");
                      setSoloDisponibles(false);
                      setFecha("");
                    }}
                  >
                    Limpiar filtros
                  </button>
                  <button
                    className="w-full flex items-center justify-center py-2.5 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                    type="button"
                    onClick={refetch}
                  >
                    <FaSyncAlt className="mr-2" />
                    Refrescar canchas
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
