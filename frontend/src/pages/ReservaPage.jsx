import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaUser, FaPhone, FaCreditCard, FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";
import SideNavBar from "../components/SideNavBar";
import { useReservaForm } from "../hooks/useReservaForm";

function ReservaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState(null);
  
  const {
    usuario,
    cancha,
    loading,
    date,
    slots,
    selectedSlot,
    selectedIndex,
    clienteNombre,
    clienteTelefono,
    submitting,
    initialDate,
    setClienteNombre,
    setClienteTelefono,
    handleDateChange,
    handleSlotChange,
    handleSubmit,
    handleLogout
  } = useReservaForm(id);

  // Función para obtener los días que la cancha no abre (basado en horarios)
  const getDisabledDates = () => {
    if (!cancha?.horarios) return [];
    
    // Verificar si horarios es un array
    if (!Array.isArray(cancha.horarios)) return [];
    
    const daysMap = {
      'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Miercoles': 3,
      'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Sabado': 6, 'Domingo': 0
    };
    
    const openDays = cancha.horarios.map(h => daysMap[h.dia]).filter(d => d !== undefined);
    return [0, 1, 2, 3, 4, 5, 6].filter(day => !openDays.includes(day));
  };

  const disabledDays = getDisabledDates();

  // Obtener fechas con mantenimiento/cerradas
  const getMaintenanceDates = () => {
    const cerradosFechas = cancha?.cerrados_fechas || cancha?.cerradosfechas || cancha?.cerradosFechas || [];
    return Array.isArray(cerradosFechas) ? cerradosFechas : [];
  };

  const maintenanceDates = getMaintenanceDates();

  // Validar si una fecha está deshabilitada
  const isDateDisabled = (dateString) => {
    if (!dateString) return { disabled: false };
    
    const selectedDate = new Date(dateString + 'T00:00:00');
    const dayOfWeek = selectedDate.getDay();
    
    // Verificar si el día de la semana está cerrado
    const cerradosDias = cancha?.cerrados_dias || cancha?.cerradosdias || cancha?.cerradosDias || [];
    if (Array.isArray(cerradosDias) && cerradosDias.includes(dayOfWeek)) {
      return { disabled: true, reason: 'La cancha no abre este día de la semana' };
    }
    
    // Verificar día de la semana (basado en horarios)
    if (disabledDays.includes(dayOfWeek)) {
      return { disabled: true, reason: 'La cancha no abre este día' };
    }
    
    // Verificar fechas específicas cerradas
    if (maintenanceDates.includes(dateString)) {
      return { disabled: true, reason: 'La cancha está cerrada este día' };
    }
    
    return { disabled: false };
  };

  if (loading) {
    return (
      <div className="flex h-screen">
        <SideNavBar />
        <div className="flex-1 ml-64 flex items-center justify-center bg-slate-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!cancha) {
    return (
      <div className="flex h-screen">
        <SideNavBar />
        <div className="flex-1 ml-64 flex items-center justify-center bg-slate-50">
          <p className="text-slate-600">Cancha no encontrada</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <SideNavBar />
      
      {/* Alerta emergente personalizada */}
      {alertMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/20 animate-fadeIn">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 animate-slideDown">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                  <FaExclamationCircle className="text-amber-600 text-2xl" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Fecha no disponible</h3>
                <p className="text-slate-600">{alertMessage}</p>
              </div>
              <button
                onClick={() => setAlertMessage(null)}
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setAlertMessage(null)}
                className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="flex-1 ml-64 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-5xl mx-auto">
            {/* Botón Volver */}
            <div className="mb-8">
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 text-slate-500 hover:text-green-600 transition-colors font-medium"
              >
                <FaArrowLeft />
                Volver
              </button>
            </div>

            {/* Grid Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
              {/* Columna Izquierda - Formulario */}
              <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-sm">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-slate-900">{cancha.nombre}</h2>
                  <p className="text-slate-500 mt-1">{cancha.descripcion}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Fecha y Horarios */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="fecha" className="block text-sm font-medium text-slate-500 mb-2">
                        Fecha
                      </label>
                      <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          id="fecha"
                          type="date"
                          value={date}
                          onChange={(e) => {
                            const newDate = e.target.value;
                            const validation = isDateDisabled(newDate);
                            
                            if (validation.disabled) {
                              setAlertMessage(validation.reason + ". Por favor selecciona otro día.");
                              return;
                            }
                            
                            handleDateChange(newDate);
                          }}
                          className="w-full pl-10 pr-3 py-2.5 rounded-md border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
                          min={new Date().toISOString().split("T")[0]}
                        />
                        {/* Indicador visual de días bloqueados */}
                        {(disabledDays.length > 0 || maintenanceDates.length > 0) && (
                          <div className="mt-1 text-xs text-slate-500">
                            {disabledDays.length > 0 && (
                              <p>⚠️ La cancha no abre algunos días de la semana</p>
                            )}
                            {maintenanceDates.length > 0 && (
                              <p>🔧 Hay fechas en mantenimiento</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="horarios" className="block text-sm font-medium text-slate-500 mb-2">
                        Horarios
                      </label>
                      <div className="relative">
                        <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                        <select
                          id="horarios"
                          className="w-full pl-10 pr-10 py-2.5 rounded-md border border-slate-200 bg-slate-50 appearance-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
                          value={selectedIndex ?? ""}
                          onChange={(e) => handleSlotChange(e.target.value)}
                        >
                          <option value="">Seleccione un horario</option>
                          {slots.length === 0 ? (
                            <option disabled>Seleccione una fecha primero</option>
                          ) : (
                            slots.map((s, idx) => (
                              <option key={idx} value={idx} disabled={s.status !== "free"}>
                                {s.start} - {s.end} {s.status !== "free" ? `(${s.status === "reserved" ? "Reservado" : "Mantenimiento"})` : ""}
                              </option>
                            ))
                          )}
                        </select>
                        <FaClock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ transform: 'translateY(-50%) rotate(0deg)' }} />
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-200" />

                  {/* Información del responsable */}
                  <h3 className="text-lg font-semibold text-slate-900">Información del responsable</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="nombre" className="block text-sm font-medium text-slate-500 mb-2">
                        Nombre
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          id="nombre"
                          type="text"
                          value={clienteNombre}
                          onChange={(e) => setClienteNombre(e.target.value)}
                          placeholder="Tu nombre completo"
                          className="w-full pl-10 pr-3 py-2.5 rounded-md border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="telefono" className="block text-sm font-medium text-slate-500 mb-2">
                        Teléfono
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          id="telefono"
                          type="tel"
                          value={clienteTelefono}
                          onChange={(e) => setClienteTelefono(e.target.value)}
                          placeholder="Tu número de teléfono"
                          className="w-full pl-10 pr-3 py-2.5 rounded-md border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="pago" className="block text-sm font-medium text-slate-500 mb-2">
                      Método de pago
                    </label>
                    <div className="relative">
                      <FaCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10" />
                      <select
                        id="pago"
                        className="w-full pl-10 pr-10 py-2.5 rounded-md border border-slate-200 bg-slate-50 appearance-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
                        disabled
                      >
                        <option>Efectivo</option>
                      </select>
                      <FaCreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ transform: 'translateY(-50%) rotate(0deg)' }} />
                    </div>
                  </div>
                </form>
              </div>

              {/* Columna Derecha - Detalles y Resumen */}
              <div className="lg:col-span-1 space-y-6">
                {/* Detalles de la cancha */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-slate-900">Detalles de la cancha</h3>
                  <ul className="space-y-3 text-slate-500 text-sm">
                    <li className="flex items-center gap-3">
                      <FaMapMarkerAlt className="text-green-600" />
                      <span>{cancha.direccion}</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <FaClock className="text-green-600" />
                      <span>
                        Horario base:{" "}
                        {cancha.horarios ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/cancha/${cancha.id}`, { 
                              state: { 
                                cancha, 
                                from: 'reserva',
                                reservaData: { date, clienteNombre, clienteTelefono }
                              } 
                            })}
                            className="text-green-600 font-medium hover:underline"
                          >
                            Ver horarios
                          </button>
                        ) : (
                          "No disponible"
                        )}
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Resumen de la reserva */}
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="text-lg font-semibold mb-4 text-slate-900">Resumen de la reserva</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">{cancha.nombre}</span>
                      <span className="font-medium">${Number(cancha.precio || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Impuestos</span>
                      <span className="font-medium">$0</span>
                    </div>
                  </div>
                  <hr className="border-slate-200 my-4" />
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span className="text-slate-900">Total a pagar</span>
                    <span className="text-green-600">${Number(cancha.precio || 0).toLocaleString()} COP</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-4 text-center">
                    Por favor llega 10-15 minutos antes del inicio de tu reserva.
                  </p>
                </div>

                {/* Botón de reservar */}
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={submitting || !selectedSlot || !clienteNombre || !clienteTelefono}
                  className="w-full bg-green-600 text-white font-bold py-3.5 px-4 rounded-md flex items-center justify-center gap-2 hover:bg-green-700 transition-colors shadow-lg shadow-green-600/30 focus:outline-none focus:ring-4 focus:ring-green-600/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaCheckCircle />
                  <span>{submitting ? "Reservando..." : "Reservar ahora"}</span>
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ReservaPage;

// Agregar estilos de animación al final del archivo
const styles = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  .animate-fadeIn {
    animation: fadeIn 0.2s ease-out;
  }
  .animate-slideDown {
    animation: slideDown 0.3s ease-out;
  }
`;
