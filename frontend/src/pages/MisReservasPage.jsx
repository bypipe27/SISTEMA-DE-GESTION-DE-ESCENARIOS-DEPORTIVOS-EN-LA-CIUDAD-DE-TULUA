import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useMisReservas } from "../hooks/useMisReservas";
import Reserva from "../models/Reserva";
import { 
  FaFutbol, 
  FaCalendarAlt, 
  FaClock, 
  FaUser, 
  FaMoneyBillWave,
  FaSearch,
  FaFilter,
  FaTimes,
  FaExclamationTriangle,
  FaEye,
  FaReceipt,
  FaRedo
} from "react-icons/fa";
import SideNavBar from "../components/SideNavBar";
import Button from "../components/Button";

function MisReservasPage() {
  const navigate = useNavigate();
  const {
    reservas,
    loading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    usuario,
    cargarReservas,
    getEstadoReserva,
    canCancelReserva,
    handleCancelarReserva,
    estadisticas
  } = useMisReservas();

  // Funciones auxiliares de UI

  const colorMap = {
    green: "#10B981",
    blue: "#3B82F6",
    gray: "#6B7280",
    red: "#EF4444",
    purple: "#8B5CF6",
    yellow: "#F59E0B",
  };

  function hexToRgba(hex, alpha = 0.12) {
    if (!hex) return `rgba(16,185,129,${alpha})`;
    const h = hex.replace("#", "");
    const bigint = parseInt(h.length === 3 ? h.split('').map(c=>c+c).join('') : h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  // Función para formatear hora sin ceros extras (17:00:00 -> 17:00)
  const formatearHora = (hora) => {
    if (!hora) return "";
    // Si tiene formato HH:MM:SS, quitar los segundos
    return hora.split(":").slice(0, 2).join(":");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* SIDEBAR */}
      <SideNavBar usuarioProp={usuario} onLogout={handleLogout} />
      
      {/* MAIN CONTENT */}
      <div className="flex-1 ml-64">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Mis Reservas</h2>
              <p className="mt-2 text-slate-600">
                {usuario 
                  ? `Hola ${usuario.nombre}, aquí puedes gestionar todas tus reservas activas y pasadas`
                  : "Aquí puedes gestionar todas tus reservas activas y pasadas"
                }
              </p>
            </div>

            {/* Controles de búsqueda y filtro */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Búsqueda */}
                <div className="relative col-span-1 md:col-span-1">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={usuario ? "Buscar en mis reservas..." : "Ingresa tu nombre..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors"
                  />
                </div>

                {/* Filtro por estado */}
                <div className="relative col-span-1 md:col-span-1">
                  <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-colors appearance-none"
                  >
                    <option value="todas">Todas las reservas</option>
                    <option value="proxima">Próximas</option>
                    <option value="programada">Programadas</option>
                    <option value="completada">Completadas</option>
                    <option value="cancelada">Canceladas</option>
                  </select>
                </div>

                {/* Botón de búsqueda */}
                <div className="col-span-1 md:col-span-1">
                  <button
                    onClick={cargarReservas}
                    className="w-full bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition-colors"
                  >
                    <FaSearch />
                    <span>Buscar Reservas</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido */}
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                <p className="text-slate-600 mt-4">Cargando tus reservas...</p>
              </div>
            ) : reservas.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-white rounded-lg shadow-md"
              >
                <FaExclamationTriangle className="text-6xl text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">
                  No se encontraron reservas
                </h3>
                <p className="text-slate-500 mb-6">
                  {searchTerm || usuario 
                    ? "No hay reservas que coincidan con tu búsqueda"
                    : "Ingresa tu nombre para buscar tus reservas"
                  }
                </p>
                <Button 
                  color="green" 
                  onClick={() => navigate("/dashboard")}
                >
                  Ir a Reservar Canchas
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {reservas.map((reserva, index) => {
                  const estado = getEstadoReserva(reserva);
                  const precioNum = Number(reserva.total ?? reserva.precio ?? reserva.total_final ?? 0) || 0;
                  
                  // Colores de badge según estado
                  const badgeClasses = {
                    green: "bg-green-100 text-green-800",
                    blue: "bg-blue-100 text-blue-800",
                    gray: "bg-slate-200 text-slate-600",
                    red: "bg-red-100 text-red-800",
                    purple: "bg-purple-100 text-purple-800",
                    yellow: "bg-yellow-100 text-yellow-800",
                  };
                  
                  const opacityClass = estado.color === 'gray' || estado.texto.toLowerCase().includes('cancelad') 
                    ? 'opacity-70' 
                    : '';
                  
                  return (
                    <motion.div
                      key={reserva.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl ${opacityClass}`}
                    >
                      <div className="p-6">
                        {/* Header con nombre y badge */}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">
                              {reserva.cancha_nombre}
                            </h3>
                            <p className="text-slate-500">{reserva.descripcion || `${reserva.tipo} - Cancha deportiva`}</p>
                          </div>
                          <span 
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badgeClasses[estado.color] || badgeClasses.green}`}
                          >
                            {estado.texto}
                          </span>
                        </div>

                        <div className="border-t border-slate-200 my-4"></div>

                        {/* Detalles en grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-3">
                            <FaCalendarAlt className="text-green-600 text-xl" />
                            <div>
                              <p className="font-semibold">{Reserva.formatearFecha(reserva.fecha)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <FaClock className="text-green-600 text-xl" />
                            <div>
                              <p className="font-semibold">{formatearHora(reserva.inicio)} - {formatearHora(reserva.fin)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <FaUser className="text-green-600 text-xl" />
                            <div>
                              <p className="text-slate-500">Reservado por:</p>
                              <p className="font-semibold">{reserva.cliente_nombre}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <FaMoneyBillWave className="text-green-600 text-xl" />
                            <div>
                              <p className="text-slate-500">Precio:</p>
                              <p className="font-semibold text-lg">${precioNum.toLocaleString()} COP</p>
                            </div>
                          </div>
                        </div>

                        <div className="border-t border-slate-200 my-4"></div>

                        {/* Botones de acción */}
                        <div className="flex flex-col sm:flex-row gap-3">
                          {canCancelReserva(reserva) ? (
                            <button
                              onClick={() => handleCancelarReserva(reserva, Reserva.formatearFecha)}
                              className="w-full bg-red-500 text-white font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 hover:bg-red-600 transition-colors"
                            >
                              <FaTimes className="text-base" />
                              <span>Cancelar Reserva</span>
                            </button>
                          ) : (
                            <button
                              disabled
                              className="w-full bg-slate-200 text-slate-400 font-semibold py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 cursor-not-allowed"
                            >
                              <span>No Cancelable</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Estadísticas */}
            {reservas.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 bg-white rounded-lg shadow-md p-6"
              >
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-green-600">{estadisticas.total}</p>
                    <p className="text-sm text-slate-600">Total Reservas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {estadisticas.proximas}
                    </p>
                    <p className="text-sm text-slate-600">Próximas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {estadisticas.programadas}
                    </p>
                    <p className="text-sm text-slate-600">Programadas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-slate-600">
                      {estadisticas.completadas}
                    </p>
                    <p className="text-sm text-slate-600">Completadas</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">
                      {estadisticas.canceladas}
                    </p>
                    <p className="text-sm text-slate-600">Canceladas</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default MisReservasPage;