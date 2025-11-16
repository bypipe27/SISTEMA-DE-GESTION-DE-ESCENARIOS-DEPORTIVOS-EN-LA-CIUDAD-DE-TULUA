import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaCheckCircle } from "react-icons/fa";
import SideNavBar from "../components/SideNavBar";
import Reserva from "../models/Reserva";

function ConfirmacionReservaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reserva, cancha, horario } = location.state || {};

  // Si no hay datos de reserva, redirigir al dashboard
  if (!Reserva.validarDatosReserva(reserva, cancha, horario)) {
    React.useEffect(() => {
      navigate("/dashboard");
    }, [navigate]);
    return null;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <SideNavBar />
      
      <main className="flex-1 ml-64 p-4 sm:p-6 lg:p-10 overflow-y-auto">
        <div className="flex justify-center items-start w-full">
          <div className="flex flex-col max-w-2xl w-full">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              {/* Header de confirmación */}
              <div className="flex flex-col items-center text-center p-6 sm:p-8">
                <div className="flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mb-4">
                  <FaCheckCircle className="text-3xl text-green-500" />
                </div>
                <h1 className="text-slate-900 tracking-tight text-2xl sm:text-3xl font-bold leading-tight">
                  ¡Reserva Confirmada!
                </h1>
                <p className="text-slate-600 text-base font-normal leading-normal mt-2">
                  Gracias por tu reserva. Tu cancha ha sido reservada exitosamente.
                </p>
              </div>

              {/* Detalles de la reserva */}
              <div className="border-t border-slate-200 p-6 sm:p-8">
                <div className="space-y-4">
                  <div className="flex justify-between items-center gap-x-6">
                    <p className="text-slate-500 text-sm font-normal leading-normal">Número de Reserva</p>
                    <p className="text-slate-800 text-sm font-medium leading-normal text-right">
                      {Reserva.formatearNumeroReserva(reserva.id)}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center gap-x-6">
                    <p className="text-slate-500 text-sm font-normal leading-normal">Cancha</p>
                    <p className="text-slate-800 text-sm font-medium leading-normal text-right">
                      {cancha.nombre}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center gap-x-6">
                    <p className="text-slate-500 text-sm font-normal leading-normal">Fecha</p>
                    <p className="text-slate-800 text-sm font-medium leading-normal text-right">
                      {Reserva.formatearFecha(reserva.fecha)}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center gap-x-6">
                    <p className="text-slate-500 text-sm font-normal leading-normal">Hora</p>
                    <p className="text-slate-800 text-sm font-medium leading-normal text-right">
                      {horario.start} - {horario.end}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center gap-x-6">
                    <p className="text-slate-500 text-sm font-normal leading-normal">Cliente</p>
                    <p className="text-slate-800 text-sm font-medium leading-normal text-right">
                      {reserva.cliente_nombre}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center gap-x-6">
                    <p className="text-slate-500 text-sm font-normal leading-normal">Teléfono</p>
                    <p className="text-slate-800 text-sm font-medium leading-normal text-right">
                      {reserva.cliente_telefono}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center gap-x-6">
                    <p className="text-slate-500 text-sm font-normal leading-normal">Método de pago</p>
                    <p className="text-slate-800 text-sm font-medium leading-normal text-right capitalize">
                      {reserva.metodo_pago || "Efectivo"}
                    </p>
                  </div>
                </div>

                {/* Total */}
                {cancha.precio && (
                  <>
                    <div className="border-t border-slate-200 my-6"></div>
                    <div className="flex justify-between items-center gap-x-6">
                      <p className="text-slate-500 text-sm font-normal leading-normal">Precio Total</p>
                      <p className="text-slate-900 text-lg font-bold leading-normal text-right">
                        {Reserva.formatearPrecio(cancha.precio)}
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Información adicional */}
              <div className="border-t border-slate-200 p-6 sm:p-8 bg-slate-50">
                <div className="text-center space-y-2">
                  <p className="text-sm text-slate-600">
                    <strong>Dirección:</strong> {cancha.direccion}
                  </p>
                  <p className="text-xs text-slate-500">
                    Por favor llega 15 minutos antes de tu horario reservado
                  </p>
                  <p className="text-xs text-slate-500">
                    Conserva tu número de reserva para cualquier consulta
                  </p>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button
                    onClick={() => navigate("/dashboard")}
                    className="flex-1 px-6 py-2.5 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2"
                  >
                    Volver al Dashboard
                  </button>
                  <button
                    onClick={() => navigate("/mis-reservas")}
                    className="flex-1 px-6 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-md hover:bg-slate-200 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-600 focus:ring-offset-2"
                  >
                    Mis Reservas
                  </button>
                </div>
              </div>
            </div>

            {/* Mensaje final */}
            <div className="text-center mt-6">
              <p className="text-slate-600">¡Gracias por confiar en nuestro sistema! 🎉</p>
              <p className="text-sm text-slate-500 mt-2">
                ¿Necesitas ayuda? Contacta al soporte técnico
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ConfirmacionReservaPage;
