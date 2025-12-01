import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle, FaTicketAlt, FaFutbol, FaCalendarAlt, FaClock, FaUser, FaPhone, FaCreditCard, FaStar, FaMapMarkerAlt, FaInfoCircle, FaFileInvoice, FaHome, FaClipboardList, FaEnvelope, FaHeadset } from "react-icons/fa";
import SideNavBar from "../components/SideNavBar";
import Reserva from "../models/Reserva";
import { descargarFactura } from "../services/pagoService";

function ConfirmacionReservaPage() {
  const location = useLocation();
  const navigate = useNavigate();
 const { reserva, cancha, horario, servicios_extra = [], totalAmount } = location.state || {};


  // Si no hay datos de reserva, redirigir al dashboard
  if (!Reserva.validarDatosReserva(reserva, cancha, horario)) {
    React.useEffect(() => {
      navigate("/dashboard");
    }, [navigate]);
    return null;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-teal-50 via-emerald-50 to-green-100 relative overflow-hidden">
      {/* Decoraciones de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-32 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-green-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      <SideNavBar />
      
      <main className="flex-1 ml-64 p-4 sm:p-6 lg:p-10 overflow-y-auto relative z-10">
        <div className="flex justify-center items-start w-full">
          <div className="flex flex-col max-w-2xl w-full animate-fadeIn">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border-2 border-teal-200 overflow-hidden hover:shadow-3xl transition-all duration-300">
              {/* Header de confirmación */}
              <div className="relative flex flex-col items-center text-center px-8 pt-12 pb-8 bg-gradient-to-br from-teal-500 via-emerald-500 to-green-600 overflow-hidden">
                {/* Decoración de fondo */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32 animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24 animate-pulse" style={{animationDelay: '1s'}}></div>
                  <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                </div>
                
                <div className="relative z-10 flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-5 shadow-lg animate-scaleIn">
                  <FaCheckCircle className="text-4xl text-white drop-shadow-lg" />
                </div>
                <h1 className="relative z-10 text-white text-3xl font-bold mb-2 drop-shadow-md">
                  ¡Reserva Confirmada!
                </h1>
                <p className="relative z-10 text-white/90 text-base max-w-sm">
                  Tu cancha ha sido reservada exitosamente
                </p>
              </div>

              {/* Detalles de la reserva */}
              <div className="px-8 py-6 bg-gradient-to-b from-teal-50/30 to-white">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-4 px-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] border-2 border-emerald-200 animate-fadeInUp">
                    <div className="flex items-center gap-3">
                      <FaTicketAlt className="text-emerald-600 text-xl" />
                      <p className="text-emerald-700 text-sm font-bold uppercase tracking-wide">
                        Número de Reserva
                      </p>
                    </div>
                    <p className="text-slate-900 text-base font-bold font-mono bg-white px-4 py-2 rounded-lg shadow-sm">
                      {Reserva.formatearNumeroReserva(reserva.id)}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center py-4 px-5 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] border-2 border-teal-200 animate-fadeInUp" style={{animationDelay: '0.1s'}}>
                    <div className="flex items-center gap-3">
                      <FaFutbol className="text-teal-600 text-xl" />
                      <p className="text-teal-700 text-sm font-bold uppercase tracking-wide">
                        Cancha
                      </p>
                    </div>
                    <p className="text-slate-900 text-base font-bold">
                      {cancha.nombre}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center py-4 px-5 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] border-2 border-green-200 animate-fadeInUp" style={{animationDelay: '0.2s'}}>
                    <div className="flex items-center gap-3">
                      <FaCalendarAlt className="text-green-600 text-xl" />
                      <p className="text-green-700 text-sm font-bold uppercase tracking-wide">
                        Fecha
                      </p>
                    </div>
                    <p className="text-slate-900 text-base font-bold">
                      {Reserva.formatearFecha(reserva.fecha)}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center py-4 px-5 rounded-xl bg-gradient-to-r from-cyan-50 to-teal-50 hover:from-cyan-100 hover:to-teal-100 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] border-2 border-cyan-200 animate-fadeInUp" style={{animationDelay: '0.3s'}}>
                    <div className="flex items-center gap-3">
                      <FaClock className="text-cyan-600 text-xl" />
                      <p className="text-cyan-700 text-sm font-bold uppercase tracking-wide">
                        Hora
                      </p>
                    </div>
                    <p className="text-slate-900 text-base font-bold">
                      {horario.start} - {horario.end}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center py-4 px-5 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] border-2 border-emerald-200 animate-fadeInUp" style={{animationDelay: '0.4s'}}>
                    <div className="flex items-center gap-3">
                      <FaUser className="text-emerald-600 text-xl" />
                      <p className="text-emerald-700 text-sm font-bold uppercase tracking-wide">
                        Cliente
                      </p>
                    </div>
                    <p className="text-slate-900 text-base font-bold">
                      {reserva.cliente_nombre}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center py-4 px-5 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] border-2 border-teal-200 animate-fadeInUp" style={{animationDelay: '0.5s'}}>
                    <div className="flex items-center gap-3">
                      <FaPhone className="text-teal-600 text-xl" />
                      <p className="text-teal-700 text-sm font-bold uppercase tracking-wide">
                        Teléfono
                      </p>
                    </div>
                    <p className="text-slate-900 text-base font-bold">
                      {reserva.cliente_telefono}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center py-4 px-5 rounded-xl bg-gradient-to-r from-green-50 to-cyan-50 hover:from-green-100 hover:to-cyan-100 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] border-2 border-green-200 animate-fadeInUp" style={{animationDelay: '0.6s'}}>
                    <div className="flex items-center gap-3">
                      <FaCreditCard className="text-green-600 text-xl" />
                      <p className="text-green-700 text-sm font-bold uppercase tracking-wide">
                        Método de pago
                      </p>
                    </div>
                    <p className="text-slate-900 text-base font-bold capitalize">
                      {reserva.metodo_pago || "Tarjeta"}
                    </p>
                  </div>
                </div>

                {/* Servicios Extra */}
                {servicios_extra && servicios_extra.length > 0 && (
                  <div className="mt-6">
                    <div className="border-t-2 border-dashed border-teal-200 mb-4"></div>
                    <h3 className="text-base font-bold text-teal-700 mb-3 flex items-center gap-2">
                      <FaStar className="text-teal-600" /> Servicios Extra
                    </h3>
                    <div className="space-y-2">
                      {servicios_extra.map((servicio, index) => (
                        <div key={index} className="flex justify-between items-center py-3 px-5 rounded-xl bg-gradient-to-r from-cyan-50 to-emerald-50 hover:from-cyan-100 hover:to-emerald-100 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02] border-2 border-cyan-200">
                          <p className="text-cyan-700 text-sm font-bold">
                            {servicio.nombre}
                          </p>
                          <p className="text-slate-900 text-base font-bold">
                            {Reserva.formatearPrecio(servicio.precio_aplicado)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Total */}
                {(cancha.precio || totalAmount) && (
                  <>
                    <div className="border-t-2 border-dashed border-teal-200 my-6"></div>
                    <div className="flex justify-between items-center py-5 px-6 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] border-2 border-teal-400">
                      <div className="flex items-center gap-3">
                        <FaCreditCard className="text-white text-2xl" />
                        <p className="text-white text-lg font-bold">
                          Total Pagado
                        </p>
                      </div>
                      <p className="text-white text-4xl font-black drop-shadow-lg">
                        {Reserva.formatearPrecio(totalAmount || reserva.total || cancha.precio)}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Información adicional */}
              <div className="border-t-2 border-teal-200 px-8 py-6 bg-gradient-to-br from-teal-50/50 to-emerald-50/30">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border-2 border-orange-200 hover:border-orange-300 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-[1.02]">
                    <FaMapMarkerAlt className="text-orange-600 text-2xl mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm text-orange-700 font-bold uppercase tracking-wide mb-2">Dirección</p>
                      <p className="text-base text-slate-900 font-bold">{cancha.direccion}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 border-2 border-teal-400 rounded-2xl p-6 space-y-3 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    <div className="flex items-center gap-3 mb-3">
                      <FaInfoCircle className="text-white text-2xl" />
                      <p className="text-lg font-bold text-white">
                        Información Importante
                      </p>
                    </div>
                    <div className="flex items-start gap-3 bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <FaClock className="text-white text-lg mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-white font-semibold">
                        Llega 15 minutos antes del horario reservado
                      </p>
                    </div>
                    <div className="flex items-start gap-3 bg-white/20 backdrop-blur-sm rounded-lg p-3">
                      <FaTicketAlt className="text-white text-lg mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-white font-semibold">
                        Conserva tu número de reserva para consultas
                      </p>
                    </div>
                  </div>
                  
                  {reserva?.pagado && reserva?.factura?.numero_factura && (
                    <button
                      onClick={() => descargarFactura(reserva.id, reserva.factura.numero_factura)}
                      className="w-full mt-3 px-5 py-4 bg-gradient-to-r from-cyan-500 to-teal-500 border-2 border-cyan-400 text-white text-base font-bold rounded-xl hover:from-cyan-600 hover:to-teal-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3 hover:scale-[1.02]"
                    >
                      <FaFileInvoice className="text-xl" />
                      <span>Descargar Factura ({reserva.factura.numero_factura})</span>
                    </button>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-teal-500 via-emerald-600 to-green-600 text-white text-base font-bold rounded-xl hover:from-teal-600 hover:via-emerald-700 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-[0.98] border-2 border-teal-400 flex items-center justify-center gap-2"
                  >
                    <FaHome className="text-lg" /> Volver al Dashboard
                  </button>
                  <button
                    onClick={() => navigate("/mis-reservas")}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-cyan-500 to-teal-600 text-white text-base font-bold rounded-xl hover:from-cyan-600 hover:to-teal-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-[0.98] border-2 border-cyan-400 flex items-center justify-center gap-2"
                  >
                    <FaClipboardList className="text-lg" /> Mis Reservas
                  </button>
                </div>
              </div>
            </div>

            {/* Mensaje final */}
            <div className="text-center mt-8 space-y-3 bg-gradient-to-r from-teal-50 via-emerald-50 to-green-50 backdrop-blur-sm rounded-2xl py-6 px-8 border-2 border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300 animate-fadeIn">
              <div className="flex items-center justify-center gap-3">
                <FaEnvelope className="text-teal-600 text-2xl" />
                <p className="text-lg text-teal-800 font-bold">
                  Factura enviada a tu correo electrónico
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 text-slate-600 font-medium bg-white/80 rounded-lg py-3 px-5 inline-flex shadow-sm">
                <FaHeadset className="text-emerald-600 text-lg" />
                <span>¿Necesitas ayuda? Contacta al soporte técnico</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ConfirmacionReservaPage;
