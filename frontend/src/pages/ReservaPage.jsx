import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaUser, FaPhone, FaCreditCard, FaCheckCircle, FaExclamationCircle, FaTimes } from "react-icons/fa";
import SideNavBar from "../components/SideNavBar";
import { useReservaForm } from "../hooks/useReservaForm";
import ServiciosExtraSelector from "../components/serviciosExtraSelector";


// function ReservaPage() {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [alertMessage, setAlertMessage] = useState(null);
 
//   const {
//     usuario,
//     cancha,
//     loading,
//     date,
//     slots,
//     selectedSlot,
//     selectedIndex,
//     clienteNombre,
//     clienteTelefono,
//     submitting,
//     initialDate,
//     setClienteNombre,
//     setClienteTelefono,
//     handleDateChange,
//     handleSlotChange,
//     handleSubmit,
//     handleLogout
//   } = useReservaForm(id);


//   // Función para obtener los días que la cancha no abre (basado en horarios)
//   const getDisabledDates = () => {
//     if (!cancha?.horarios) return [];
   
//     // Verificar si horarios es un array
//     if (!Array.isArray(cancha.horarios)) return [];
   
//     const daysMap = {
//       'Lunes': 1, 'Martes': 2, 'Miércoles': 3, 'Miercoles': 3,
//       'Jueves': 4, 'Viernes': 5, 'Sábado': 6, 'Sabado': 6, 'Domingo': 0
//     };
   
//     const openDays = cancha.horarios.map(h => daysMap[h.dia]).filter(d => d !== undefined);
//     return [0, 1, 2, 3, 4, 5, 6].filter(day => !openDays.includes(day));
//   };


//   const disabledDays = getDisabledDates();


//   // Obtener fechas con mantenimiento/cerradas
//   const getMaintenanceDates = () => {
//     const cerradosFechas = cancha?.cerrados_fechas || cancha?.cerradosfechas || cancha?.cerradosFechas || [];
//     return Array.isArray(cerradosFechas) ? cerradosFechas : [];
//   };


//   const maintenanceDates = getMaintenanceDates();


//   // Validar si una fecha está deshabilitada
//   const isDateDisabled = (dateString) => {
//     if (!dateString) return { disabled: false };
   
//     const selectedDate = new Date(dateString + 'T00:00:00');
//     const dayOfWeek = selectedDate.getDay();
   
//     // Verificar si el día de la semana está cerrado
//     const cerradosDias = cancha?.cerrados_dias || cancha?.cerradosdias || cancha?.cerradosDias || [];
//     if (Array.isArray(cerradosDias) && cerradosDias.includes(dayOfWeek)) {
//       return { disabled: true, reason: 'La cancha no abre este día de la semana' };
//     }
   
//     // Verificar día de la semana (basado en horarios)
//     if (disabledDays.includes(dayOfWeek)) {
//       return { disabled: true, reason: 'La cancha no abre este día' };
//     }
   
//     // Verificar fechas específicas cerradas
//     if (maintenanceDates.includes(dateString)) {
//       return { disabled: true, reason: 'La cancha está cerrada este día' };
//     }
   
//     return { disabled: false };
//   };


//   if (loading) {
//     return (
//       <div className="flex h-screen">
//         <SideNavBar />
//         <div className="flex-1 ml-64 flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100">
//           <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
//             <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent border-purple-500 mx-auto mb-4"></div>
//             <p className="text-slate-700 font-semibold">Cargando...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }


//   if (!cancha) {
//     return (
//       <div className="flex h-screen">
//         <SideNavBar />
//         <div className="flex-1 ml-64 flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100">
//           <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
//             <p className="text-slate-700 font-semibold">Cancha no encontrada</p>
//           </div>
//         </div>
//       </div>
//     );
//   }


//   return (
//     <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100">
//       <SideNavBar />
     
//       {/* Alerta emergente personalizada */}
//       {alertMessage && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/30 animate-fadeIn">
//           <div className="bg-gradient-to-br from-white via-amber-50 to-orange-50 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideDown border-2 border-amber-200">
//             <div className="flex items-start gap-4">
//               <div className="flex-shrink-0">
//                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
//                   <FaExclamationCircle className="text-white text-2xl" />
//                 </div>
//               </div>
//               <div className="flex-1">
//                 <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-700 mb-2">Fecha no disponible</h3>
//                 <p className="text-slate-700 font-medium">{alertMessage}</p>
//               </div>
//               <button
//                 onClick={() => setAlertMessage(null)}
//                 className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
//               >
//                 <FaTimes className="text-xl" />
//               </button>
//             </div>
//             <div className="mt-6 flex justify-end">
//               <button
//                 onClick={() => setAlertMessage(null)}
//                 className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
//               >
//                 Entendido
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
     
//       <div className="flex-1 ml-64 flex flex-col overflow-hidden">
//         <main className="flex-1 overflow-y-auto p-6 lg:p-10">
//           <div className="max-w-5xl mx-auto">
//             {/* Botón Volver */}
//             <div className="mb-8">
//               <button
//                 onClick={() => navigate("/dashboard")}
//                 className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
//               >
//                 <FaArrowLeft />
//                 Volver
//               </button>
//             </div>


//             {/* Grid Principal */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
//               {/* Columna Izquierda - Formulario */}
//               <div className="lg:col-span-2 bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 p-8 rounded-2xl shadow-lg border-2 border-purple-200">
//                 <div className="mb-6">
//                   <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600">{cancha.nombre}</h2>
//                   <p className="text-slate-600 mt-2 font-medium">{cancha.descripcion}</p>
//                 </div>


//                 <form onSubmit={handleSubmit} className="space-y-6">
//                   {/* Fecha y Horarios */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label htmlFor="fecha" className="block text-sm font-semibold text-purple-700 mb-2">
//                         Fecha
//                       </label>
//                       <div className="relative">
//                         <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
//                         <input
//                           id="fecha"
//                           type="date"
//                           value={date}
//                           onChange={(e) => {
//                             const newDate = e.target.value;
//                             const validation = isDateDisabled(newDate);
                           
//                             if (validation.disabled) {
//                               setAlertMessage(validation.reason + ". Por favor selecciona otro día.");
//                               return;
//                             }
                           
//                             handleDateChange(newDate);
//                           }}
//                           className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-purple-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300"
//                           min={new Date().toISOString().split("T")[0]}
//                         />
//                         {/* Indicador visual de días bloqueados */}
//                         {(disabledDays.length > 0 || maintenanceDates.length > 0) && (
//                           <div className="mt-1 text-xs text-slate-500">
//                             {disabledDays.length > 0 && (
//                               <p>⚠️ La cancha no abre algunos días de la semana</p>
//                             )}
//                             {maintenanceDates.length > 0 && (
//                               <p>🔧 Hay fechas en mantenimiento</p>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     </div>


//                     <div>
//                       <label htmlFor="horarios" className="block text-sm font-semibold text-purple-700 mb-2">
//                         Horarios
//                       </label>
//                       <div className="relative">
//                         <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 z-10" />
//                         <select
//                           id="horarios"
//                           className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-purple-200 bg-white/80 backdrop-blur-sm appearance-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300"
//                           value={selectedIndex ?? ""}
//                           onChange={(e) => handleSlotChange(e.target.value)}
//                         >
//                           <option value="">Seleccione un horario</option>
//                           {slots.length === 0 ? (
//                             <option disabled>Seleccione una fecha primero</option>
//                           ) : (
//                             slots.map((s, idx) => (
//                               <option key={idx} value={idx} disabled={s.status !== "free"}>
//                                 {s.start} - {s.end} {s.status !== "free" ? `(${s.status === "reserved" ? "Reservado" : "Mantenimiento"})` : ""}
//                               </option>
//                             ))
//                           )}
//                         </select>
//                         <FaClock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ transform: 'translateY(-50%) rotate(0deg)' }} />
//                       </div>
//                     </div>
//                   </div>


//                   <hr className="border-purple-300" />


//                   {/* Información del responsable */}
//                   <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Información del responsable</h3>


//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <label htmlFor="nombre" className="block text-sm font-semibold text-purple-700 mb-2">
//                         Nombre
//                       </label>
//                       <div className="relative">
//                         <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
//                         <input
//                           id="nombre"
//                           type="text"
//                           value={clienteNombre}
//                           onChange={(e) => setClienteNombre(e.target.value)}
//                           placeholder="Tu nombre completo"
//                           className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-purple-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 placeholder-purple-300"
//                           required
//                         />
//                       </div>
//                     </div>


//                     <div>
//                       <label htmlFor="telefono" className="block text-sm font-semibold text-purple-700 mb-2">
//                         Teléfono
//                       </label>
//                       <div className="relative">
//                         <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
//                         <input
//                           id="telefono"
//                           type="tel"
//                           value={clienteTelefono}
//                           onChange={(e) => setClienteTelefono(e.target.value)}
//                           placeholder="Tu número de teléfono"
//                           className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-purple-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 placeholder-purple-300"
//                           required
//                         />
//                       </div>
//                     </div>
//                   </div>


//                   <div>
//                     <label htmlFor="pago" className="block text-sm font-semibold text-purple-700 mb-2">
//                       Método de pago
//                     </label>
//                     <div className="relative">
//                       <FaCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 z-10" />
//                       <select
//                         id="pago"
//                         className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-purple-200 bg-white/80 backdrop-blur-sm appearance-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300"
//                         disabled
//                       >
//                         <option>Efectivo</option>
//                       </select>
//                       <FaCreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" style={{ transform: 'translateY(-50%) rotate(0deg)' }} />
//                     </div>
//                   </div>
//                 </form>
//               </div>


//               {/* Columna Derecha - Detalles y Resumen */}
//               <div className="lg:col-span-1 space-y-6">
//                 {/* Detalles de la cancha */}
//                 <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 p-6 rounded-2xl shadow-lg border-2 border-blue-200">
//                   <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">Detalles de la cancha</h3>
//                   <ul className="space-y-3 text-slate-600 text-sm">
//                     <li className="flex items-center gap-3 bg-white/80 p-3 rounded-xl shadow-sm">
//                       <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
//                         <FaMapMarkerAlt className="text-white" />
//                       </div>
//                       <span className="font-medium">{cancha.direccion}</span>
//                     </li>
//                     <li className="flex items-center gap-3 bg-white/80 p-3 rounded-xl shadow-sm">
//                       <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
//                         <FaClock className="text-white" />
//                       </div>
//                       <span className="font-medium">
//                         Horario base:{" "}
//                         {cancha.horarios ? (
//                           <button
//                             type="button"
//                             onClick={() => navigate(`/cancha/${cancha.id}`, {
//                               state: {
//                                 cancha,
//                                 from: 'reserva',
//                                 reservaData: { date, clienteNombre, clienteTelefono }
//                               }
//                             })}
//                             className="text-purple-600 font-bold hover:underline"
//                           >
//                             Ver horarios
//                           </button>
//                         ) : (
//                           "No disponible"
//                         )}
//                       </span>
//                     </li>
//                   </ul>
//                 </div>


//                 {/* Resumen de la reserva */}
//                 <div className="bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 p-6 rounded-2xl shadow-lg border-2 border-emerald-200">
//                   <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 mb-4">Resumen de la reserva</h3>
//                   <div className="space-y-2 mb-4">
//                     <div className="flex justify-between items-center bg-white/80 p-3 rounded-xl">
//                       <span className="text-slate-600 font-medium">{cancha.nombre}</span>
//                       <span className="font-bold text-emerald-700">${Number(cancha.precio || 0).toLocaleString()}</span>
//                     </div>
//                     <div className="flex justify-between items-center bg-white/80 p-3 rounded-xl">
//                       <span className="text-slate-600 font-medium">Impuestos</span>
//                       <span className="font-bold text-emerald-700">$0</span>
//                     </div>
//                   </div>
//                   <hr className="border-emerald-300 my-4" />
//                   <div className="flex justify-between items-center font-bold text-lg bg-gradient-to-r from-emerald-100 to-teal-100 p-4 rounded-xl border-2 border-emerald-300">
//                     <span className="text-slate-800">Total a pagar</span>
//                     <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">${Number(cancha.precio || 0).toLocaleString()} COP</span>
//                   </div>
//                   <p className="text-xs text-slate-600 font-medium mt-4 text-center bg-white/80 p-3 rounded-xl">
//                     Por favor llega 10-15 minutos antes del inicio de tu reserva.
//                   </p>
//                 </div>


//                 {/* Botón de reservar */}
//                 <button
//                   type="submit"
//                   onClick={handleSubmit}
//                   disabled={submitting || !selectedSlot || !clienteNombre || !clienteTelefono}
//                   className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   <FaCheckCircle />
//                   <span>{submitting ? "Reservando..." : "Reservar ahora"}</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// }




function ReservaPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState(null);
  const [serviciosExtra, setServiciosExtra] = useState([]);
  const [metodoPago, setMetodoPago] = useState("efectivo");
 
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
    handleSubmit: originalHandleSubmit,
    handleLogout
  } = useReservaForm(id);


  // Función para calcular el precio total incluyendo servicios extra
  const calcularPrecioTotal = () => {
    const precioBase = Number(cancha?.precio || 0);
    const precioServicios = serviciosExtra.reduce((sum, s) => sum + (Number(s.precio_aplicado) || 0), 0);
    return precioBase + precioServicios;
  };


  // Wrapper del handleSubmit original para incluir servicios extra
  const handleSubmit = async (e) => {
    e.preventDefault();
   
    const totalCalculado = calcularPrecioTotal();
   
    // Agregar servicios extra a los datos del formulario
    const reservaData = {
      cancha_id: cancha.id,
      date: date,
      start: selectedSlot?.start,
      end: selectedSlot?.end,
      cliente_nombre: clienteNombre,
      cliente_telefono: clienteTelefono,
      metodo_pago: metodoPago,
      total: totalCalculado,
      usuario_id: usuario?.id,
      servicios_extra: serviciosExtra
    };


    // Pasar los datos con el método de pago al handleSubmit original
    // que ahora maneja el flujo correcto según el método de pago
    await originalHandleSubmit(e, reservaData);
  };


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
        <div className="flex-1 ml-64 flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100">
          <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent border-purple-500 mx-auto mb-4"></div>
            <p className="text-slate-700 font-semibold">Cargando...</p>
          </div>
        </div>
      </div>
    );
  }


  if (!cancha) {
    return (
      <div className="flex h-screen">
        <SideNavBar />
        <div className="flex-1 ml-64 flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
            <p className="text-slate-700 font-semibold">Cancha no encontrada</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-100">
      <SideNavBar />
     
      {/* Alerta emergente personalizada */}
      {alertMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-slate-900/30 animate-fadeIn">
          <div className="bg-gradient-to-br from-white via-amber-50 to-orange-50 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-slideDown border-2 border-amber-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                  <FaExclamationCircle className="text-white text-2xl" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-700 mb-2">Fecha no disponible</h3>
                <p className="text-slate-700 font-medium">{alertMessage}</p>
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
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2"
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
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-semibold shadow-md hover:shadow-lg"
              >
                <FaArrowLeft />
                Volver
              </button>
            </div>


            {/* Grid Principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-start">
              {/* Columna Izquierda - Formulario */}
              <div className="lg:col-span-2 space-y-6">
                {/* Información básica y formulario */}
                <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 p-8 rounded-2xl shadow-lg border-2 border-purple-200">
                  <div className="mb-6">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600">{cancha.nombre}</h2>
                    <p className="text-slate-600 mt-2 font-medium">{cancha.descripcion}</p>
                  </div>


                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Fecha y Horarios */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="fecha" className="block text-sm font-semibold text-purple-700 mb-2">
                          Fecha
                        </label>
                        <div className="relative">
                          <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
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
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-purple-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300"
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
                        <label htmlFor="horarios" className="block text-sm font-semibold text-purple-700 mb-2">
                          Horarios disponibles
                        </label>
                        <div className="relative">
                          <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 z-10" />
                          <select
                            id="horarios"
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-purple-200 bg-white/80 backdrop-blur-sm appearance-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300"
                            value={selectedIndex ?? ""}
                            onChange={(e) => handleSlotChange(e.target.value)}
                          >
                            <option value="">Seleccione un horario</option>
                            {slots.length === 0 ? (
                              <option disabled>Seleccione una fecha primero</option>
                            ) : (
                              slots.map((s, idx) => (
                                <option
                                  key={idx}
                                  value={idx}
                                  disabled={s.status !== "free"}
                                  className={s.status !== "free" ? "text-gray-400" : ""}
                                >
                                  {s.start} - {s.end} {s.status !== "free" ? `(${s.status === "reserved" ? "🔒 Reservado" : "⚠️ Mantenimiento"})` : "✓ Disponible"}
                                </option>
                              ))
                            )}
                          </select>
                          <FaClock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" style={{ transform: 'translateY(-50%) rotate(0deg)' }} />
                        </div>
                       
                        {/* Leyenda de estados */}
                        {slots.length > 0 && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                            <p className="text-xs font-semibold text-purple-700 mb-2">Estado de horarios:</p>
                            <div className="flex flex-wrap gap-3 text-xs">
                              <div className="flex items-center gap-1">
                                <span className="text-green-600 font-bold">✓</span>
                                <span className="text-slate-600">Disponible</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-red-600 font-bold">🔒</span>
                                <span className="text-slate-600">Reservado</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-amber-600 font-bold">⚠️</span>
                                <span className="text-slate-600">Mantenimiento</span>
                              </div>
                            </div>
                            {slots.filter(s => s.status === "free").length === 0 && (
                              <p className="text-xs text-red-600 font-semibold mt-2">
                                ⚠️ No hay horarios disponibles para esta fecha
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>


                    <hr className="border-purple-300" />


                    {/* Información del responsable */}
                    <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Información del responsable</h3>


                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="nombre" className="block text-sm font-semibold text-purple-700 mb-2">
                          Nombre
                        </label>
                        <div className="relative">
                          <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                          <input
                            id="nombre"
                            type="text"
                            value={clienteNombre}
                            onChange={(e) => setClienteNombre(e.target.value)}
                            placeholder="Tu nombre completo"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-purple-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 placeholder-purple-300"
                            required
                          />
                        </div>
                      </div>


                      <div>
                        <label htmlFor="telefono" className="block text-sm font-semibold text-purple-700 mb-2">
                          Teléfono
                        </label>
                        <div className="relative">
                          <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
                          <input
                            id="telefono"
                            type="tel"
                            value={clienteTelefono}
                            onChange={(e) => setClienteTelefono(e.target.value)}
                            placeholder="Tu número de teléfono"
                            className="w-full pl-10 pr-3 py-2.5 rounded-xl border-2 border-purple-200 bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300 placeholder-purple-300"
                            required
                          />
                        </div>
                      </div>
                    </div>


                    <div>
                      <label htmlFor="pago" className="block text-sm font-semibold text-purple-700 mb-2">
                        Método de pago
                      </label>
                      <div className="relative">
                        <FaCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 z-10" />
                        <select
                          id="pago"
                          value={metodoPago}
                          onChange={(e) => setMetodoPago(e.target.value)}
                          className="w-full pl-10 pr-10 py-2.5 rounded-xl border-2 border-purple-200 bg-white/80 backdrop-blur-sm appearance-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition-all duration-300"
                        >
                          <option value="efectivo">Efectivo</option>
                          <option value="tarjeta">Tarjeta</option>
                        </select>
                        <FaCreditCard className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none" style={{ transform: 'translateY(-50%) rotate(0deg)' }} />
                      </div>
                    </div>
                  </form>
                </div>


                {/* Selector de servicios extra */}
                <ServiciosExtraSelector
                  canchaId={cancha?.id}
                  onServiciosChange={setServiciosExtra}
                  serviciosSeleccionados={serviciosExtra}
                />
              </div>


              {/* Columna Derecha - Detalles y Resumen */}
              <div className="lg:col-span-1 space-y-6">
                {/* Detalles de la cancha */}
                <div className="bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 p-6 rounded-2xl shadow-lg border-2 border-blue-200">
                  <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mb-4">Detalles de la cancha</h3>
                  <ul className="space-y-3 text-slate-600 text-sm">
                    <li className="flex items-center gap-3 bg-white/80 p-3 rounded-xl shadow-sm">
                      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-lg">
                        <FaMapMarkerAlt className="text-white" />
                      </div>
                      <span className="font-medium">{cancha.direccion}</span>
                    </li>
                    <li className="flex items-center gap-3 bg-white/80 p-3 rounded-xl shadow-sm">
                      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
                        <FaClock className="text-white" />
                      </div>
                      <span className="font-medium">
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
                            className="text-purple-600 font-bold hover:underline"
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
                <div className="bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/30 p-6 rounded-2xl shadow-lg border-2 border-emerald-200">
                  <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 mb-4">Resumen de la reserva</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between items-center bg-white/80 p-3 rounded-xl">
                      <span className="text-slate-600 font-medium">{cancha.nombre}</span>
                      <span className="font-bold text-emerald-700">${Number(cancha.precio || 0).toLocaleString()}</span>
                    </div>
                   
                    {/* Mostrar servicios extra seleccionados */}
                    {serviciosExtra.length > 0 && (
                      <div className="space-y-1">
                        {serviciosExtra.map((servicio, index) => (
                          <div key={index} className="flex justify-between items-center bg-blue-50/80 p-2 rounded-lg text-sm">
                            <span className="text-slate-600 font-medium">
                              {servicio.nombre}
                            </span>
                            <span className="font-bold text-blue-700">
                              ${Number(servicio.precio_aplicado || 0).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                   
                    <div className="flex justify-between items-center bg-white/80 p-3 rounded-xl">
                      <span className="text-slate-600 font-medium">Impuestos</span>
                      <span className="font-bold text-emerald-700">$0</span>
                    </div>
                  </div>
                  <hr className="border-emerald-300 my-4" />
                  <div className="flex justify-between items-center font-bold text-lg bg-gradient-to-r from-emerald-100 to-teal-100 p-4 rounded-xl border-2 border-emerald-300">
                    <span className="text-slate-800">Total a pagar</span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                      ${calcularPrecioTotal().toLocaleString()} COP
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-4 text-center bg-white/80 p-3 rounded-xl">
                    Por favor llega 10-15 minutos antes del inicio de tu reserva.
                  </p>
                </div>


                {/* Botón de reservar */}
                <button
                  type="submit"
                  onClick={handleSubmit}
                  disabled={submitting || !selectedSlot || !clienteNombre || !clienteTelefono}
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white font-bold py-4 px-4 rounded-xl flex items-center justify-center gap-2 hover:from-purple-700 hover:via-pink-700 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaCheckCircle />
                  <span>
                    {submitting ? "Procesando..." :
                     metodoPago === "efectivo" ? "Reservar ahora" :
                     "Proceder al pago"}
                  </span>
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



