import React ,{useState} from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaCheckCircle, FaFutbol, FaCalendarAlt, FaClock, FaUser, FaPhone, FaMoneyBillWave, FaArrowLeft, FaShare } from "react-icons/fa";
import Button from "../components/Button";

function ConfirmacionReservaPage() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { reserva, cancha, horario } = location.state || {};
  const usuario = React.useMemo(() => {
  try {
    return JSON.parse(localStorage.getItem("usuario") || "null");
  } catch {
    return null;
  }
  }, []);

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
  navigate("/login");
  };
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
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Estilos locales para look minimalista y armónico (sin tocar tipografía global) */}
      <style>{`
        .confirm-card { border: 1px solid rgba(16,185,129,0.08); border-radius: 1rem; overflow: hidden; }
        .confirm-header { padding: 2rem; display:flex; flex-direction:column; align-items:center; gap:0.5rem; background:transparent; }
        .confirm-icon { width:86px; height:86px; border-radius:9999px; display:flex; align-items:center; justify-content:center; background: linear-gradient(180deg,#ecfdf5,#dcfce7); color:#16a34a; box-shadow: 0 8px 24px rgba(16,24,40,0.06); }
        .detail-box { background: #fff; border: 1px solid #f3f4f6; padding: 0.75rem; border-radius: 0.6rem; }
        .info-grid > div { min-height: 72px; display:flex; align-items:center; gap:0.75rem; padding:0.75rem; }
        .mono-ticket { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Helvetica Neue", monospace; }
        .actions { display:flex; flex-direction:column; gap:0.75rem; align-items:center; }
        @media (min-width:640px) { .actions { flex-direction:row; justify-content:center; } }
      `}</style>

      {/* Barra de navegación (misma funcionalidad, look más limpio) */}
      <nav className="w-full py-3 px-6 flex justify-between items-center bg-white/90 backdrop-blur-md fixed top-0 z-50 shadow-sm border-b">
        <h1 className="text-lg md:text-xl font-semibold flex items-center gap-3 text-gray-900">
          <FaFutbol className="text-green-600 text-2xl" />
          <span className="hidden md:inline">SISTEMA DE GESTIÓN DE ESCENARIOS DEPORTIVOS</span>
          <span className="md:hidden">Tulúa Deportes</span>
        </h1>

        <div className="flex items-center gap-4">
          <span className="text-sm">
            Hola, <span className="font-medium">{usuario?.nombre || "Usuario"}</span>
          </span>

          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 bg-white/50 hover:bg-gray-100 px-3 py-1 rounded text-sm text-gray-800"
            >
              Opciones <span className="text-xs">▾</span>
            </button>

            {open && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white text-gray-900 rounded-md shadow-lg overflow-hidden"
                onMouseLeave={() => setOpen(false)}
              >
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => alert("Agregar medio de pago (simulado).")}
                >
                  ➕ Agregar medio de pago
                </button>

                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setOpen(false);
                    navigate("/mis-reservas");
                  }}
                >
                  📋 Ver reservas
                </button>

                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setOpen(false);
                    navigate("/dashboard");
                  }}
                >
                  🏠 Ir al Dashboard
                </button>

                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => alert("Cambiar contraseña (simulado).")}
                >
                  🔒 Cambiar contraseña
                </button>

                <hr />

                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white confirm-card shadow-lg">
            {/* Header de éxito - visual renovado pero misma info */}
            <div className="confirm-header text-center">
              <div className="confirm-icon">
                <FaCheckCircle className="text-4xl" />
              </div>
              <h1 className="text-2xl font-semibold">¡Reserva Confirmada!</h1>
              <p className="text-sm text-gray-600">Tu reserva ha sido procesada exitosamente</p>
            </div>

            {/* Cuerpo de la confirmación */}
            <div className="p-6">
              {/* Información de la cancha */}
              <div className="flex items-start gap-4 mb-6 p-4 bg-transparent rounded-xl">
                <FaFutbol className="text-3xl text-green-600 mt-1" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{cancha.nombre}</h2>
                  <p className="text-gray-600">{cancha.descripcion}</p>
                  <p className="text-sm text-gray-500 mt-1">{cancha.direccion}</p>
                </div>
              </div>

              {/* Grid de detalles */}
              <div className="grid md:grid-cols-2 gap-4 mb-6 info-grid">
                <div className="detail-box">
                  <div className="flex items-center gap-3">
                    <FaCalendarAlt className="text-blue-600 text-xl" />
                    <div>
                      <p className="text-xs text-blue-600 font-semibold">Fecha</p>
                      <p className="text-sm text-gray-800 font-medium">{formatearFecha(reserva.fecha)}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-box">
                  <div className="flex items-center gap-3">
                    <FaClock className="text-purple-600 text-xl" />
                    <div>
                      <p className="text-xs text-purple-600 font-semibold">Horario</p>
                      <p className="text-sm text-gray-800 font-medium">{horario.start} - {horario.end}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-box">
                  <div className="flex items-center gap-3">
                    <FaUser className="text-orange-600 text-xl" />
                    <div>
                      <p className="text-xs text-orange-600 font-semibold">Cliente</p>
                      <p className="text-sm text-gray-800 font-medium">{reserva.cliente_nombre}</p>
                    </div>
                  </div>
                </div>

                <div className="detail-box">
                  <div className="flex items-center gap-3">
                    <FaPhone className="text-green-600 text-xl" />
                    <div>
                      <p className="text-xs text-green-600 font-semibold">Teléfono</p>
                      <p className="text-sm text-gray-800 font-medium">{reserva.cliente_telefono}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información de pago */}
              <div className="border-t pt-4 mb-6">
                <div className="flex items-center justify-between p-3 bg-transparent rounded-lg">
                  <div className="flex items-center gap-3">
                    <FaMoneyBillWave className="text-gray-600 text-xl" />
                    <div>
                      <p className="text-xs text-gray-600 font-semibold">Método de pago</p>
                      <p className="text-sm text-gray-800 font-medium capitalize">{reserva.metodo_pago || "efectivo"}</p>
                    </div>
                  </div>
                  {cancha.precio && (
                    <div className="text-right">
                      <p className="text-xs text-gray-600 font-semibold">Total</p>
                      <p className="text-lg font-bold text-green-600">${cancha.precio.toLocaleString()} COP</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Número de reserva */}
              <div className="text-center mb-6 p-4 bg-transparent rounded-xl">
                <p className="text-xs text-gray-600 font-semibold">NÚMERO DE RESERVA</p>
                <p className="text-2xl font-bold text-gray-900 mono-ticket">#{reserva.id.toString().padStart(6, '0')}</p>
                <p className="text-xs text-gray-500 mt-1">Conserva este número para cualquier consulta</p>
              </div>

              {/* Botones de acción */}
              <div className="actions mt-2">
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
              <div className="text-center mt-6 p-4 bg-transparent rounded-lg">
                <p className="text-sm text-gray-600">📍 <strong>Dirección:</strong> {cancha.direccion}</p>
                <p className="text-xs text-gray-500 mt-2">Por favor llega 15 minutos antes de tu horario reservado</p>
              </div>
            </div>
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center mt-6">
            <p className="text-gray-600">¡Gracias por confiar en nuestro sistema! 🎉</p>
            <p className="text-sm text-gray-500 mt-2">¿Necesitas ayuda? Contacta al soporte técnico</p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
export default ConfirmacionReservaPage;
