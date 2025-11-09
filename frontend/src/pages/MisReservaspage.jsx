import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  FaFutbol, 
  FaCalendarAlt, 
  FaClock, 
  FaMapMarkerAlt, 
  FaMoneyBillWave,
  FaSearch,
  FaFilter,
  FaTimes,
  FaExclamationTriangle
} from "react-icons/fa";
import NavBar from "../components/NavBar";
import Button from "../components/Button";

function MisReservasPage() {
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todas");
  const [usuario, setUsuario] = useState(null);

  const API_BASE = "http://localhost:5000";

  // Obtener usuario del localStorage
  useEffect(() => {
    const usuarioStorage = localStorage.getItem("usuario");
    if (usuarioStorage) {
      try {
        setUsuario(JSON.parse(usuarioStorage));
      } catch (error) {
        console.error("Error parsing usuario:", error);
      }
    }
  }, []);

  // Cargar reservas
  useEffect(() => {
    cargarReservas();
  }, []);

  const cargarReservas = async () => {
    try {
      setLoading(true);
      
      // Usar nombre del usuario logueado o permitir búsqueda manual
      const nombreBusqueda = usuario?.nombre || searchTerm;
      
      if (!nombreBusqueda) {
        setReservas([]);
        return;
      }

      const res = await fetch(
        `${API_BASE}/api/reservas/mis-reservas?email=${encodeURIComponent(nombreBusqueda)}`
      );

      if (res.ok) {
        const data = await res.json();
        setReservas(data.reservas || []);
      } else {
        console.error("Error cargando reservas");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha
  const formatearFecha = (fechaStr) => {
    try {
      const fecha = new Date(fechaStr + "T00:00:00");
      const formateada = fecha.toLocaleDateString("es-ES", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      return formateada.charAt(0).toUpperCase() + formateada.slice(1);
    } catch (error) {
      return fechaStr;
    }
  };

  // Determinar estado de la reserva
  const getEstadoReserva = (reserva) => {
    const ahora = new Date();
    const fechaReserva = new Date(reserva.fecha + "T" + reserva.fin);
    
    if (fechaReserva < ahora) {
      return { texto: "Completada", color: "gray", tipo: "completada" };
    }
    
    const diferencia = fechaReserva - ahora;
    const horas = diferencia / (1000 * 60 * 60);
    
    if (horas < 24) {
      return { texto: "Próxima", color: "green", tipo: "proxima" };
    }
    
    return { texto: "Programada", color: "blue", tipo: "programada" };
  };

  // Filtrar reservas
  const reservasFiltradas = reservas.filter(reserva => {
    const estado = getEstadoReserva(reserva);
    
    // Filtro por estado
    if (filterStatus !== "todas" && estado.tipo !== filterStatus) {
      return false;
    }
    
    // Filtro por búsqueda
    if (searchTerm && !usuario) {
      return reserva.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
             reserva.cancha_nombre.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    return true;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <NavBar />
      
      <div className="container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Mis Reservas
        </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              {usuario 
                ? `Hola ${usuario.nombre}, aquí puedes gestionar todas tus reservas`
                : "Consulta el estado de tus reservas ingresando tu nombre"
              }
            </p>
          </div>

          {/* Controles de búsqueda y filtro */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Búsqueda */}
          <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder={usuario ? "Buscar en mis reservas..." : "Ingresa tu nombre..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Filtro por estado */}
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 appearance-none bg-white"
                >
                  <option value="todas">Todas las reservas</option>
                  <option value="proxima">Próximas</option>
                  <option value="programada">Programadas</option>
                  <option value="completada">Completadas</option>
                </select>
              </div>

              {/* Botón de búsqueda */}
              <Button 
                color="green" 
                onClick={cargarReservas}
                className="w-full h-full"
              >
                <FaSearch className="inline mr-2" />
                Buscar Reservas
              </Button>
            </div>
          </div>

          {/* Contenido */}
        {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Cargando tus reservas...</p>
            </div>
          ) : reservasFiltradas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 bg-white rounded-2xl shadow-lg"
            >
              <FaExclamationTriangle className="text-6xl text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No se encontraron reservas
              </h3>
              <p className="text-gray-500 mb-6">
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid gap-6"
            >
              {reservasFiltradas.map((reserva, index) => {
                const estado = getEstadoReserva(reserva);
                
              return (
                  <motion.div
                    key={reserva.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg overflow-hidden border-l-4"
                    style={{ borderLeftColor: `var(--${estado.color}-500)` }}
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        {/* Información principal */}
                        <div className="flex-1">
                          <div className="flex items-start gap-4 mb-3">
                            <div className="bg-green-100 p-3 rounded-xl">
                              <FaFutbol className="text-2xl text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-2">
                                <h3 className="text-xl font-bold text-gray-800">
                                  {reserva.cancha_nombre}
                    </h3>
                    <span
                                  className={`px-3 py-1 rounded-full text-sm font-medium bg-${estado.color}-100 text-${estado.color}-800`}
                    >
                                  {estado.texto}
                    </span>
                  </div>
                              <p className="text-gray-600 text-sm mb-3">
                                {reserva.descripcion}
                              </p>
                              
                              {/* Detalles en grid */}
                              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <FaCalendarAlt className="text-blue-500" />
                                  <span className="font-medium text-gray-700">
                                    {formatearFecha(reserva.fecha)}
                                  </span>
                  </div>
                                
                                <div className="flex items-center gap-2 text-sm">
                                  <FaClock className="text-purple-500" />
                                  <span className="font-medium text-gray-700">
                                    {reserva.inicio} - {reserva.fin}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm">
                                  <FaMapMarkerAlt className="text-red-500" />
                                  <span className="text-gray-600">
                                    {reserva.direccion}
                                  </span>
                                </div>
                                
                                <div className="flex items-center gap-2 text-sm">
                                  <FaMoneyBillWave className="text-green-500" />
                                  <span className="font-bold text-green-600">
                                    ${reserva.precio?.toLocaleString() || '0'} COP
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Información del cliente y acciones */}
                        <div className="lg:text-right">
                          <div className="mb-3">
                            <p className="text-sm text-gray-600">Reservado a nombre de</p>
                            <p className="font-semibold text-gray-800">{reserva.cliente_nombre}</p>
                            <p className="text-sm text-gray-500">{reserva.cliente_telefono}</p>
                          </div>
                          
                          <div className="flex lg:flex-col gap-2">
                            <Button 
                              color="white" 
                              size="sm"
                              onClick={() => navigate(`/cancha/${reserva.cancha_id}`)}
                            >
                              Ver Cancha
                            </Button>
                            <Button 
                              color="green" 
                              size="sm"
                              onClick={() => navigate(`/reserva/${reserva.cancha_id}`, {
                                state: { 
                                  cancha: reserva,
                                  fecha: reserva.fecha 
                                }
                              })}
                            >
                              Reservar Otra Vez
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {/* Estadísticas */}
          {reservasFiltradas.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 bg-white rounded-2xl shadow-lg p-6"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-green-600">{reservas.length}</p>
                  <p className="text-sm text-gray-600">Total Reservas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {reservas.filter(r => getEstadoReserva(r).tipo === 'proxima').length}
                  </p>
                  <p className="text-sm text-gray-600">Próximas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">
                    {reservas.filter(r => getEstadoReserva(r).tipo === 'programada').length}
                  </p>
                  <p className="text-sm text-gray-600">Programadas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-600">
                    {reservas.filter(r => getEstadoReserva(r).tipo === 'completada').length}
                  </p>
                  <p className="text-sm text-gray-600">Completadas</p>
                </div>
          </div>
            </motion.div>
        )}
        </motion.div>
      </div>
    </div>
  );
}

export default MisReservasPage;