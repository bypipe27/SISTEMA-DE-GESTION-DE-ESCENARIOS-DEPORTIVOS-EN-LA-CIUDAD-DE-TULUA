import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
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
    <div className="flex h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 relative overflow-hidden">
      {/* Decoraciones de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-96 h-96 bg-emerald-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-32 left-32 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>
      <SideNavBar />
      
      <main className="flex-1 ml-64 p-4 sm:p-6 lg:p-10 overflow-y-auto relative z-10">
        <div className="flex justify-center items-start w-full">
          <div className="flex flex-col max-w-2xl w-full">
            <div className="bg-gradient-to-br from-white via-emerald-50/40 to-blue-50/40 rounded-2xl shadow-2xl shadow-emerald-500/20 border-2 border-emerald-200/60 overflow-hidden backdrop-blur-md hover:shadow-3xl transition-all">
              {/* Header de confirmación - Con más color */}
              <div className="relative flex flex-col items-center text-center px-8 pt-12 pb-8 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 overflow-hidden">
                {/* Decoración de fondo */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32 animate-pulse"></div>
                  <div className="absolute bottom-0 left-0 w-48 h-48 bg-yellow-200 rounded-full translate-y-24 -translate-x-24 animate-pulse" style={{animationDelay: '1s'}}></div>
                  <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-blue-200 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                </div>
                
                <div className="relative z-10 flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full mb-5 shadow-lg">
                  <FaCheckCircle className="text-3xl text-white drop-shadow-lg" />
                </div>
                <h1 className="relative z-10 text-white text-2xl font-semibold mb-2 drop-shadow-md">
                  ¡Reserva Confirmada!
                </h1>
                <p className="relative z-10 text-emerald-50 text-sm max-w-sm">
                  Tu cancha ha sido reservada exitosamente
                </p>
              </div>

              {/* Detalles de la reserva - Con fondo suave */}
              <div className="px-8 py-6 bg-gradient-to-b from-emerald-50/50 via-blue-50/30 to-purple-50/20">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-100 to-teal-100 hover:from-emerald-200 hover:to-teal-200 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-emerald-200">
                    <p className="text-emerald-700 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                      <span className="text-base">🎫</span> Número de Reserva
                    </p>
                    <p className="text-slate-900 text-sm font-bold font-mono bg-white px-3 py-1.5 rounded-lg shadow-sm">
                      {Reserva.formatearNumeroReserva(reserva.id)}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-blue-50 to-sky-100 hover:from-blue-100 hover:to-sky-200 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-blue-200">
                    <p className="text-blue-700 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                      <span className="text-base">⚽</span> Cancha
                    </p>
                    <p className="text-slate-900 text-sm font-bold text-right">
                      {cancha.nombre}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-purple-50 to-pink-100 hover:from-purple-100 hover:to-pink-200 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-purple-200">
                    <p className="text-purple-700 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                      <span className="text-base">📅</span> Fecha
                    </p>
                    <p className="text-slate-900 text-sm font-bold text-right">
                      {Reserva.formatearFecha(reserva.fecha)}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-amber-50 to-orange-100 hover:from-amber-100 hover:to-orange-200 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-amber-200">
                    <p className="text-amber-700 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                      <span className="text-base">⏰</span> Hora
                    </p>
                    <p className="text-slate-900 text-sm font-bold text-right">
                      {horario.start} - {horario.end}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-teal-50 to-cyan-100 hover:from-teal-100 hover:to-cyan-200 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-teal-200">
                    <p className="text-teal-700 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                      <span className="text-base">👤</span> Cliente
                    </p>
                    <p className="text-slate-900 text-sm font-bold text-right">
                      {reserva.cliente_nombre}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-50 to-blue-100 hover:from-indigo-100 hover:to-blue-200 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-indigo-200">
                    <p className="text-indigo-700 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                      <span className="text-base">📱</span> Teléfono
                    </p>
                    <p className="text-slate-900 text-sm font-bold text-right">
                      {reserva.cliente_telefono}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 px-4 rounded-xl bg-gradient-to-r from-rose-50 to-pink-100 hover:from-rose-100 hover:to-pink-200 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 border border-rose-200">
                    <p className="text-rose-700 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                      <span className="text-base">💳</span> Método de pago
                    </p>
                    <p className="text-slate-900 text-sm font-bold text-right capitalize">
                      {reserva.metodo_pago || "Stripe"}
                    </p>
                  </div>
                </div>

                {/* Servicios Extra */}
                {servicios_extra && servicios_extra.length > 0 && (
                  <div className="mt-5">
                    <div className="border-t-2 border-dashed border-purple-300 mb-4"></div>
                    <h3 className="text-sm font-bold text-purple-700 mb-3 flex items-center gap-2">
                      <span className="text-base">✨</span> Servicios Extra
                    </h3>
                    <div className="space-y-2">
                      {servicios_extra.map((servicio, index) => (
                        <div key={index} className="flex justify-between items-center py-2 px-4 rounded-xl bg-gradient-to-r from-violet-50 to-purple-100 hover:from-violet-100 hover:to-purple-200 transition-all shadow-sm hover:shadow-md border border-violet-200">
                          <p className="text-violet-700 text-xs font-bold">
                            {servicio.nombre}
                          </p>
                          <p className="text-slate-900 text-sm font-bold">
                            {Reserva.formatearPrecio(servicio.precio_aplicado)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                                {/* Total - Con más énfasis */}
                {(cancha.precio || totalAmount) && (
                  <>
                    <div className="border-t-2 border-dashed border-emerald-300 my-5"></div>
                    <div className="flex justify-between items-center py-4 px-5 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] border-2 border-emerald-300">
                      <p className="text-white text-base font-bold flex items-center gap-2">
                        <span className="text-xl">💰</span> Total Pagado
                      </p>
                      <p className="text-white text-3xl font-black drop-shadow-lg">
                        {Reserva.formatearPrecio(totalAmount || reserva.total || cancha.precio)}
                      </p>
                    </div>
                  </>
                )}
              </div>



              {/* Información adicional - Con color */}
              <div className="border-t-2 border-emerald-200 px-8 py-6 bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50/40">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-50 to-orange-100 rounded-xl border-2 border-red-200 hover:border-red-300 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                    <span className="text-3xl mt-0.5">📍</span>
                    <div className="flex-1">
                      <p className="text-xs text-red-700 font-bold uppercase tracking-wide mb-1.5">Dirección</p>
                      <p className="text-sm text-slate-900 font-bold">{cancha.direccion}</p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500 border-2 border-blue-300 rounded-2xl p-5 space-y-3 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02]">
                    <p className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                      <span className="text-xl">💡</span>
                      <span>Información importante</span>
                    </p>
                    <p className="text-sm text-white font-semibold flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-2">
                      <span className="text-lg">⏰</span>
                      <span>Llega 15 minutos antes del horario reservado</span>
                    </p>
                    <p className="text-sm text-white font-semibold flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg p-2">
                      <span className="text-lg">💼</span>
                      <span>Conserva tu número de reserva para consultas</span>
                    </p>
                  </div>
                  
                  {reserva?.pagado && reserva?.factura?.numero_factura && (
                    <button
                      onClick={() => descargarFactura(reserva.id, reserva.factura.numero_factura)}
                      className="w-full mt-3 px-5 py-4 bg-gradient-to-r from-emerald-400 to-teal-500 border-2 border-emerald-300 text-white text-sm font-bold rounded-xl hover:from-emerald-500 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02]"
                    >
                      <span className="text-xl">📄</span>
                      <span>Descargar Factura ({reserva.factura.numero_factura})</span>
                    </button>
                  )}
                </div>

                {/* Botones de acción - Con más color */}
                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 text-white text-base font-bold rounded-xl hover:from-emerald-600 hover:via-teal-700 hover:to-cyan-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02] border-2 border-emerald-400"
                  >
                    🏠 Volver al Dashboard
                  </button>
                  <button
                    onClick={() => navigate("/mis-reservas")}
                    className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-base font-bold rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-[1.02] border-2 border-blue-400"
                  >
                    📋 Mis Reservas
                  </button>
                </div>
              </div>
            </div>

            {/* Mensaje final - Con toque de color */}
            <div className="text-center mt-8 space-y-3 bg-gradient-to-r from-purple-100 via-pink-100 to-rose-100 backdrop-blur-sm rounded-2xl py-5 px-8 border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all">
              <p className="text-base text-purple-800 font-bold flex items-center justify-center gap-2">
                <span className="text-xl">✉️</span>
                <span>Factura enviada a tu correo electrónico</span>
              </p>
              <p className="text-sm text-slate-600 font-medium bg-white/70 rounded-lg py-2 px-4 inline-block">
                ¿Necesitas ayuda? Contacta al soporte técnico 📞
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ConfirmacionReservaPage;
