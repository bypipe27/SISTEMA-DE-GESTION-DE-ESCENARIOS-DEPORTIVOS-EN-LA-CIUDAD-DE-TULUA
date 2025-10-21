import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheckCircle, FaFutbol, FaCalendarAlt, FaClock, FaUser, FaPhone, FaMoneyBillWave, FaArrowLeft, FaShare } from "react-icons/fa";
import NavBar from "../components/NavBar";
import Button from "../components/Button";

function ConfirmacionReservaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { reserva, cancha, horario } = location.state || {};

  // Si no hay datos de reserva, redirigir al dashboard
  if (!reserva || !cancha) {
    React.useEffect(() => {
      navigate("/dashboard");
    }, [navigate]);
    return null;
  }

  // Formatear fecha en español - VERSIÓN CORREGIDA PARA FORMATO ISO
const formatearFecha = (fechaStr) => {
  try {
    // Manejar tanto formato YYYY-MM-DD como formato ISO completo
    let fecha;
    
    if (fechaStr.includes('T')) {
      // Es formato ISO: "2025-10-21T05:00:00.000Z"
      fecha = new Date(fechaStr);
    } else {
      // Es formato simple: "2025-10-21"
      const [year, month, day] = fechaStr.split('-');
      fecha = new Date(year, month - 1, day);
    }
    
    if (isNaN(fecha.getTime())) {
      throw new Error('Fecha inválida');
    }
    
    const fechaFormateada = fecha.toLocaleDateString("es-ES", {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // ✅ Capitalizar primera letra del día
    return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
    
  } catch (error) {
    console.error('Error formateando fecha:', error);
    // Intentar mostrar solo la parte de la fecha si es ISO
    if (fechaStr.includes('T')) {
      return fechaStr.split('T')[0]; // Mostrar solo "2025-10-21"
    }
    return fechaStr; // Fallback: mostrar la fecha original
  }
};

  // Función para compartir (simulada)
  const compartirReserva = () => {
    const mensaje = `✅ Reserva confirmada en ${cancha.nombre}\n📅 ${formatearFecha(reserva.fecha)}\n🕒 ${horario.start} - ${horario.end}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Reserva Confirmada - Sistema de Canchas',
        text: mensaje,
        url: window.location.href,
      });
    } else {
      // Fallback: copiar al portapapeles
      navigator.clipboard.writeText(mensaje);
      alert("✅ Detalles de la reserva copiados al portapapeles");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          {/* Tarjeta de confirmación */}
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-green-200">
            {/* Header de éxito */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-8 text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <FaCheckCircle className="text-6xl mx-auto mb-4 text-green-200" />
              </motion.div>
              <h1 className="text-3xl font-bold mb-2">¡Reserva Confirmada!</h1>
              <p className="text-green-100 text-lg">
                Tu reserva ha sido procesada exitosamente
              </p>
            </div>

            {/* Cuerpo de la confirmación */}
            <div className="p-8">
              {/* Información de la cancha */}
              <div className="flex items-start gap-4 mb-6 p-4 bg-green-50 rounded-xl">
                <FaFutbol className="text-3xl text-green-600 mt-1" />
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{cancha.nombre}</h2>
                  <p className="text-gray-600">{cancha.descripcion}</p>
                  <p className="text-sm text-gray-500 mt-1">{cancha.direccion}</p>
                </div>
              </div>

              {/* Grid de detalles */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                {/* Fecha */}
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <FaCalendarAlt className="text-blue-600 text-xl" />
                  <div>
                    <p className="text-sm text-blue-600 font-semibold">Fecha</p>
                    <p className="text-gray-800 font-medium">
                      {formatearFecha(reserva.fecha)}
                    </p>
                  </div>
                </div>

                {/* Horario */}
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                  <FaClock className="text-purple-600 text-xl" />
                  <div>
                    <p className="text-sm text-purple-600 font-semibold">Horario</p>
                    <p className="text-gray-800 font-medium">
                      {horario.start} - {horario.end}
                    </p>
                  </div>
                </div>

                {/* Cliente */}
                <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                  <FaUser className="text-orange-600 text-xl" />
                  <div>
                    <p className="text-sm text-orange-600 font-semibold">Cliente</p>
                    <p className="text-gray-800 font-medium">{reserva.cliente_nombre}</p>
                  </div>
                </div>

                {/* Teléfono */}
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <FaPhone className="text-green-600 text-xl" />
                  <div>
                    <p className="text-sm text-green-600 font-semibold">Teléfono</p>
                    <p className="text-gray-800 font-medium">{reserva.cliente_telefono}</p>
                  </div>
                </div>
              </div>

              {/* Información de pago */}
              <div className="border-t pt-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaMoneyBillWave className="text-gray-600 text-xl" />
                    <div>
                      <p className="text-sm text-gray-600 font-semibold">Método de pago</p>
                      <p className="text-gray-800 font-medium capitalize">
                        {reserva.metodo_pago || "efectivo"}
                      </p>
                    </div>
                  </div>
                  {cancha.precio && (
                    <div className="text-right">
                      <p className="text-sm text-gray-600 font-semibold">Total</p>
                      <p className="text-xl font-bold text-green-600">
                        ${cancha.precio.toLocaleString()} COP
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Número de reserva */}
              <div className="text-center mb-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-sm text-yellow-700 font-semibold">NÚMERO DE RESERVA</p>
                <p className="text-2xl font-bold text-yellow-800 font-mono">
                  #{reserva.id.toString().padStart(6, '0')}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  Conserva este número para cualquier consulta
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  color="green" 
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-2"
                >
                  <FaArrowLeft />
                  Volver al Dashboard
                </Button>
                
                <Button 
                  color="white" 
                  onClick={compartirReserva}
                  className="flex items-center gap-2"
                >
                  <FaShare />
                  Compartir Reserva
                </Button>
              </div>

              {/* Información adicional */}
              <div className="text-center mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  📍 <strong>Dirección:</strong> {cancha.direccion}
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Por favor llega 15 minutos antes de tu horario reservado
                </p>
              </div>
            </div>
          </div>

          {/* Mensaje de agradecimiento */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center mt-6"
          >
            <p className="text-gray-600">
              ¡Gracias por confiar en nuestro sistema! 🎉
            </p>
            <p className="text-sm text-gray-500 mt-2">
              ¿Necesitas ayuda? Contacta al soporte técnico
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

export default ConfirmacionReservaPage;