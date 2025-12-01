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
import { CustomDialog, CustomToast } from "../components/CustomDialog";

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
    estadisticas,
    dialogState,
    setDialogState,
    toastState,
    setToastState
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

  // Agrupar reservas por estado
  const reservasAgrupadas = React.useMemo(() => {
    const grupos = {
      proximas: [],
      programadas: [],
      completadas: [],
      canceladas: []
    };

    reservas.forEach(reserva => {
      const estado = getEstadoReserva(reserva);
      const estadoTexto = estado.texto.toLowerCase();
      
      if (estadoTexto.includes('próxima') || estadoTexto.includes('proxima')) {
        grupos.proximas.push(reserva);
      } else if (estadoTexto.includes('programada')) {
        grupos.programadas.push(reserva);
      } else if (estadoTexto.includes('completada')) {
        grupos.completadas.push(reserva);
      } else if (estadoTexto.includes('cancelada')) {
        grupos.canceladas.push(reserva);
      }
    });

    return grupos;
  }, [reservas, getEstadoReserva]);

  // Renderizar tarjeta de reserva
  const renderReservaCard = (reserva, index) => {
    const estado = getEstadoReserva(reserva);
    const precioNum = Number(reserva.total ?? reserva.precio ?? reserva.total_final ?? 0) || 0;
    
    const badgeClasses = {
      green: "bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border-2 border-emerald-400 font-bold",
      blue: "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-2 border-blue-400 font-bold",
      gray: "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-600 border-2 border-slate-400 font-bold",
      red: "bg-gradient-to-r from-rose-50 to-red-50 text-red-700 border-2 border-red-400 font-bold",
      purple: "bg-gradient-to-r from-purple-50 to-fuchsia-50 text-purple-700 border-2 border-purple-400 font-bold",
      yellow: "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-2 border-amber-400 font-bold",
    };
    
    const opacityClass = estado.color === 'gray' || estado.texto.toLowerCase().includes('cancelad') 
      ? 'opacity-70' 
      : '';
    
    const cardGradients = {
      green: "from-white via-emerald-50/30 to-teal-50/30",
      blue: "from-white via-blue-50/30 to-indigo-50/30",
      gray: "from-white via-slate-50/50 to-gray-50/50",
      red: "from-white via-rose-50/30 to-red-50/30",
      purple: "from-white via-teal-50/30 to-emerald-50/30",
      yellow: "from-white via-amber-50/30 to-yellow-50/30",
    };
    
    return (
      <motion.div
        key={reserva.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={`bg-gradient-to-br ${cardGradients[estado.color] || cardGradients.green} rounded-2xl shadow-lg border-2 border-teal-200/60 overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-teal-400 ${opacityClass}`}
      >
        <div className="p-6 bg-white/40 backdrop-blur-sm">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-green-700">
                {reserva.cancha_nombre}
              </h3>
              <p className="text-slate-600 font-medium">{reserva.descripcion || `${reserva.tipo} - Cancha deportiva`}</p>
            </div>
            <span 
              className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold shadow-sm ${badgeClasses[estado.color] || badgeClasses.green}`}
            >
              {estado.texto}
            </span>
          </div>

          <div className="border-t-2 border-teal-200 my-4"></div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-3 bg-white/90 p-3 rounded-xl shadow-sm border border-teal-100 hover:border-teal-300 transition-colors">
              <div className="bg-gradient-to-br from-teal-500 to-green-600 p-2 rounded-lg shadow-md">
                <FaCalendarAlt className="text-white text-lg" />
              </div>
              <div>
                <p className="font-bold text-slate-800">{Reserva.formatearFecha(reserva.fecha)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/90 p-3 rounded-xl shadow-sm border border-teal-100 hover:border-teal-300 transition-colors">
              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-2 rounded-lg shadow-md">
                <FaClock className="text-white text-lg" />
              </div>
              <div>
                <p className="font-bold text-slate-800">{formatearHora(reserva.inicio)} - {formatearHora(reserva.fin)}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/90 p-3 rounded-xl shadow-sm border border-teal-100 hover:border-teal-300 transition-colors">
              <div className="bg-gradient-to-br from-cyan-500 to-teal-600 p-2 rounded-lg shadow-md">
                <FaUser className="text-white text-lg" />
              </div>
              <div>
                <p className="text-slate-500 text-xs">Reservado por:</p>
                <p className="font-bold text-slate-800">{reserva.cliente_nombre}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 bg-white/90 p-3 rounded-xl shadow-sm border border-teal-100 hover:border-teal-300 transition-colors">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-lg shadow-md">
                <FaMoneyBillWave className="text-white text-lg" />
              </div>
              <div>
                <p className="text-slate-500 text-xs">Precio:</p>
                <p className="font-bold text-lg text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-green-600">${precioNum.toLocaleString()} COP</p>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-teal-200 my-4"></div>

          <div className="flex flex-col sm:flex-row gap-3">
            {canCancelReserva(reserva) ? (
              <button
                onClick={() => handleCancelarReserva(reserva, Reserva.formatearFecha)}
                className="w-full bg-gradient-to-r from-red-500 to-rose-600 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <FaTimes className="text-base" />
                <span>Cancelar Reserva</span>
              </button>
            ) : (
              <button
                disabled
                className="w-full bg-gradient-to-r from-slate-200 to-gray-200 text-slate-400 font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed border-2 border-slate-300"
              >
                <span>No Cancelable</span>
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-100 flex">
      {/* SIDEBAR */}
      <SideNavBar usuarioProp={usuario} onLogout={handleLogout} />
      
      {/* MAIN CONTENT */}
      <div className="flex-1 ml-64">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-teal-200 animate-fadeInUp">
              <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-green-600 to-emerald-600">Mis Reservas</h2>
              <p className="mt-2 text-slate-700 font-medium">
                {usuario 
                  ? `Hola ${usuario.nombre}, aquí puedes gestionar todas tus reservas activas y pasadas`
                  : "Aquí puedes gestionar todas tus reservas activas y pasadas"
                }
              </p>
            </div>

            {/* Controles de búsqueda y filtro */}
            <div className="bg-gradient-to-br from-white via-teal-50 to-emerald-50 p-4 sm:p-6 rounded-2xl shadow-lg border-2 border-teal-200 mb-8 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Búsqueda */}
                <div className="relative col-span-1 md:col-span-1">
                  <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400 transition-colors" />
                  <input
                    type="text"
                    placeholder={usuario ? "Buscar en mis reservas..." : "Ingresa tu nombre..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-teal-200 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300 placeholder-teal-300 hover:border-teal-300"
                  />
                </div>

                {/* Filtro por estado */}
                <div className="relative col-span-1 md:col-span-1">
                  <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-teal-400 transition-colors" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border-2 border-teal-200 rounded-xl bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-green-400 focus:border-green-400 transition-all duration-300 appearance-none hover:border-teal-300"
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
                    className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-95"
                  >
                    <FaSearch />
                    <span>Buscar Reservas</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Contenido */}
            {loading ? (
              <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent border-teal-500 mx-auto"></div>
                <p className="text-slate-700 font-semibold mt-4">Cargando tus reservas...</p>
              </div>
            ) : reservas.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 bg-gradient-to-br from-white via-teal-50 to-emerald-50 rounded-2xl shadow-lg border-2 border-teal-200"
              >
                <div className="bg-gradient-to-br from-teal-500 to-green-500 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <FaExclamationTriangle className="text-4xl text-white" />
                </div>
                <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-green-600 mb-2">
                  No se encontraron reservas
                </h3>
                <p className="text-slate-600 font-medium mb-6">
                  {searchTerm || usuario 
                    ? "No hay reservas que coincidan con tu búsqueda"
                    : "Ingresa tu nombre para buscar tus reservas"
                  }
                </p>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Ir a Reservar Canchas
                </button>
              </motion.div>
            ) : (
              <div className="space-y-8">
                {/* Próximas (Urgentes) */}
                {reservasAgrupadas.proximas.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-2 rounded-lg shadow-md">
                        <FaRedo className="text-white text-xl" />
                      </div>
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                        Próximas (Hoy o Muy Pronto)
                      </h3>
                      <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {reservasAgrupadas.proximas.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {reservasAgrupadas.proximas.map((reserva, index) => renderReservaCard(reserva, index))}
                    </div>
                  </motion.section>
                )}

                {/* Programadas */}
                {reservasAgrupadas.programadas.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-2 rounded-lg shadow-md">
                        <FaCalendarAlt className="text-white text-xl" />
                      </div>
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        Programadas
                      </h3>
                      <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {reservasAgrupadas.programadas.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {reservasAgrupadas.programadas.map((reserva, index) => renderReservaCard(reserva, index))}
                    </div>
                  </motion.section>
                )}

                {/* Completadas */}
                {reservasAgrupadas.completadas.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-r from-slate-500 to-gray-500 p-2 rounded-lg shadow-md">
                        <FaReceipt className="text-white text-xl" />
                      </div>
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-gray-600">
                        Completadas
                      </h3>
                      <span className="bg-gradient-to-r from-slate-500 to-gray-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {reservasAgrupadas.completadas.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {reservasAgrupadas.completadas.map((reserva, index) => renderReservaCard(reserva, index))}
                    </div>
                  </motion.section>
                )}

                {/* Canceladas */}
                {reservasAgrupadas.canceladas.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="bg-gradient-to-r from-rose-500 to-red-500 p-2 rounded-lg shadow-md">
                        <FaTimes className="text-white text-xl" />
                      </div>
                      <h3 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-red-600">
                        Canceladas
                      </h3>
                      <span className="bg-gradient-to-r from-rose-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                        {reservasAgrupadas.canceladas.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {reservasAgrupadas.canceladas.map((reserva, index) => renderReservaCard(reserva, index))}
                    </div>
                  </motion.section>
                )}
              </div>
            )}

            {/* Estadísticas */}
            {reservas.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 bg-gradient-to-br from-white via-teal-50 to-emerald-50 rounded-2xl shadow-lg p-6 border-2 border-teal-200"
              >
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div className="bg-gradient-to-br from-teal-50 to-green-50 p-4 rounded-xl border-2 border-teal-300 shadow-sm hover:shadow-md hover:scale-105 transition-all">
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-green-600">{estadisticas.total}</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">Total Reservas</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-300 shadow-sm hover:shadow-md hover:scale-105 transition-all">
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                      {estadisticas.proximas}
                    </p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">Próximas</p>
                  </div>
                  <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-xl border-2 border-emerald-300 shadow-sm hover:shadow-md hover:scale-105 transition-all">
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                      {estadisticas.programadas}
                    </p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">Programadas</p>
                  </div>
                  <div className="bg-gradient-to-br from-slate-50 to-gray-50 p-4 rounded-xl border-2 border-slate-300 shadow-sm hover:shadow-md hover:scale-105 transition-all">
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-gray-600">
                      {estadisticas.completadas}
                    </p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">Completadas</p>
                  </div>
                  <div className="bg-gradient-to-br from-rose-50 to-red-50 p-4 rounded-xl border-2 border-rose-300 shadow-sm hover:shadow-md hover:scale-105 transition-all">
                    <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-red-600">
                      {estadisticas.canceladas}
                    </p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">Canceladas</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>
      
      {/* Diálogo de confirmación personalizado */}
      <CustomDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ ...dialogState, isOpen: false })}
        onConfirm={dialogState.onConfirm}
        title={dialogState.title}
        message={dialogState.message}
        type={dialogState.type}
      />
      
      {/* Notificación (Toast) personalizada */}
      <CustomToast
        isOpen={toastState.isOpen}
        onClose={() => setToastState({ ...toastState, isOpen: false })}
        message={toastState.message}
        type={toastState.type}
      />
    </div>
  );
}

export default MisReservasPage;