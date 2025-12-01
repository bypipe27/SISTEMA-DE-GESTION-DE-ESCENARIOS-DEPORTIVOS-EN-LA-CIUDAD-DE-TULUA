import React from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaTag, FaInfoCircle, FaFutbol } from "react-icons/fa";
import { useCancha } from "../hooks/useCanchas";
import { Cancha } from "../models/Cancha";
import SideNavBar from "../components/SideNavBar";
import RatingWidget from "../components/RatingWidget";
import reviewService from "../services/reviewService";
import useSocket from "../hooks/useSocket";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// Reviews moved to ReservaPage panel

function CanchaDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { cancha, loading } = useCancha(id);
  const [stats, setStats] = React.useState({ avg: cancha?.avg_rating ?? 0, count: cancha?.reviews_count ?? 0 });
  
  // Detectar de dónde viene el usuario
  const fromReserva = location.state?.from === 'reserva';
  const reservaData = location.state?.reservaData;
  
  const currentUser = React.useMemo(() => {
  try { return JSON.parse(localStorage.getItem("usuario") || "null"); } catch { return null; }
  }, []);
  const backTo = currentUser && currentUser.role === "provider" ? "/dashboard-provider" : "/dashboard";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  const handleBack = () => {
    if (fromReserva && reservaData) {
      // Volver a la página de reserva con los datos previos
      navigate(`/reservar/${id}`, { 
        state: { 
          cancha: location.state.cancha, 
          fecha: reservaData.date 
        } 
      });
    } else {
      // Volver al dashboard
      navigate(backTo);
    }
  };

  // actualizar stats cuando cambie cancha
  React.useEffect(() => {
    setStats({ avg: cancha?.avg_rating ?? 0, count: cancha?.reviews_count ?? 0 });
  }, [cancha]);

  // Socket: actualizar stats en tiempo real
  useSocket(import.meta.env.VITE_API_BASE || null, {
    'cancha:statsUpdated': (payload) => {
      try {
        if (payload?.canchaId === cancha?.id && payload.stats) {
          setStats({ avg: payload.stats.avg_rating, count: payload.stats.reviews_count });
        }
      } catch (e) {}
    }
  });

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 flex">
      <SideNavBar usuarioProp={currentUser} onLogout={handleLogout} />
      <div className="flex-1 ml-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-t-transparent border-cyan-500"></div>
      </div>
    </div>
  );
  
  if (!cancha) return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 flex">
      <SideNavBar usuarioProp={currentUser} onLogout={handleLogout} />
      <div className="flex-1 ml-64 flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 mb-4">Cancha no encontrada</h2>
          <button onClick={handleBack} className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl hover:from-cyan-700 hover:to-blue-700 transition-all duration-300 shadow-md">
            Volver
          </button>
        </div>
      </div>
    </div>
  );


  // usar únicamente el iframe guardado en la BD
  const iframeHtml = cancha.map_iframe;

  function renderHorariosSection() {
    const raw = cancha.horarios ?? cancha.horario ?? {};
    const entries = Cancha.parseHorarios(raw);
    if (entries.length === 0) {
      return <p className="text-sm text-slate-500">No hay horarios disponibles.</p>;
    }
    // agrupar por día y ordenar slots por hora de inicio
    const grouped = entries.reduce((acc, e) => {
      (acc[e.dia] = acc[e.dia] || []).push(e);
      return acc;
    }, {});
    const orderedDays = Object.keys(grouped).map(Number).sort((a, b) => a - b);

    // Mostrar como grid de tarjetas
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7 gap-3 mt-4">
        {orderedDays.map((d) => (
          <div key={d} className="bg-gradient-to-br from-teal-50 to-cyan-100 border-2 border-teal-200 rounded-xl p-3 shadow-sm hover:shadow-md transition-shadow duration-300">
            <h3 className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-700 to-cyan-700 mb-2 border-b-2 border-teal-300 pb-1.5 text-center">
              {Cancha.DAY_NAMES[d] ?? `Día ${d}`}
            </h3>
            <div className="space-y-1.5">
              {grouped[d]
                .slice()
                .sort((a,b) => {
                  const ta = Number(Cancha.formatTime(a.start).replace(':','')) || 0;
                  const tb = Number(Cancha.formatTime(b.start).replace(':','')) || 0;
                  return ta - tb;
                })
                .map((s, idx) => {
                  const start = Cancha.formatTime(s.start) || "--:--";
                  const end = s.end ? Cancha.formatTime(s.end) : null;
                  return (
                    <div key={idx} className="px-2 py-1.5 rounded-lg bg-gradient-to-r from-emerald-100 to-teal-100 border border-emerald-300 text-emerald-800 text-xs font-semibold text-center shadow-sm">
                      {start}{end ? ` - ${end}` : ""}
                    </div>
                  );
                })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderCerradosDias() {
    const diasValidos = Cancha.parseCerradosDias(cancha);
    if (diasValidos.length === 0) {
      return <span className="ml-2 text-sm text-gray-700">No hay días de mantenimiento programados.</span>;
    }

    return (
      <ul className="mt-2 space-y-1">
        {diasValidos.map(d => (
          <li key={d} className="text-base">
            <strong>{Cancha.DAY_NAMES[d] ?? `Día ${d}`}</strong>
          </li>
        ))}
      </ul>
    );
  }

  function renderCerradosFechas() {
    const arrF = Cancha.parseCerradosFechas(cancha);
    if (arrF.length === 0) return null;
    return (
      <div className="mt-1 text-sm text-gray-200">
        <strong>Fechas cerradas:</strong> {arrF.join(", ")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-100 flex">
      {/* estilos locales para asegurar el iframe responsivo */}
      <style>{`
        .cancha-iframe-container iframe { width: 100% !important; height: 100% !important; border: 0; display:block; }
      `}</style>
      
      <SideNavBar usuarioProp={currentUser} onLogout={handleLogout} />
      
      <div className="flex-1 ml-64">
        <div className="container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
          <ToastContainer position="top-right" />
          {/* Header con botón de volver */}
          <header className="flex items-center mb-6">
            <button
              onClick={handleBack}
              className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <FaArrowLeft className="text-white text-lg" />
            </button>
          </header>

          <main>
            {/* Imagen principal */}
            <div className="relative w-full h-96 rounded-2xl overflow-hidden mb-6 shadow-2xl border-4 border-white/50">
              {cancha.imagen_url ? (
                <img
                  alt={`Vista principal de ${cancha.nombre}`}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  src={cancha.imagen_url}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 flex items-center justify-center">
                  <FaFutbol className="text-white text-8xl opacity-30" />
                </div>
              )}
            </div>

            {/* Información principal */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-cyan-200">
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 mb-3">{cancha.nombre}</h1>
              <div className="flex items-center gap-2 text-cyan-700 text-base">
                <FaMapMarkerAlt className="text-xl" />
                <p className="font-medium">{cancha.direccion}</p>
              </div>
              <p className="mt-4 text-base leading-relaxed text-slate-700">
                {cancha.descripcion}
              </p>
            </div>

            {/* Reseñas ahora se muestran en el panel de reserva */}

            <div className="w-full h-px bg-slate-200 my-6"></div>

            {/* Información adicional en cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-emerald-100 to-teal-100 p-5 rounded-xl shadow-md border-2 border-emerald-200 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-3 rounded-full">
                    <FaTag className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-emerald-800">Precio por hora</h3>
                    <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-teal-700">{Cancha.formatPrice(cancha.precio)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-5 rounded-xl shadow-md border-2 border-blue-200 hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-full">
                    <FaInfoCircle className="text-white text-xl" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-blue-800">Tipo de cancha</h3>
                    <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-indigo-700">{cancha.tipo}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Horarios disponibles */}
            <div className="bg-gradient-to-br from-white via-teal-50 to-cyan-50 p-6 rounded-2xl shadow-lg border-2 border-teal-200 mb-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 p-3 rounded-full">
                  <FaClock className="text-white text-xl" />
                </div>
                <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-700">Horarios Disponibles</h2>
              </div>
              {renderHorariosSection()}
            </div>

            {/* Días de mantenimiento */}
            <div className="bg-gradient-to-br from-amber-100 to-orange-100 border-2 border-amber-300 p-5 rounded-2xl mb-6 shadow-lg">
              <div className="flex items-start gap-3">
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-full flex-shrink-0">
                  <FaCalendarAlt className="text-white text-xl" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-xl text-transparent bg-clip-text bg-gradient-to-r from-amber-700 to-orange-700 mb-3">Días de mantenimiento</h3>
                  {renderCerradosDias()}
                  {renderCerradosFechas()}
                </div>
              </div>
            </div>

            {/* Mapa de ubicación */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border-2 border-cyan-200">
              <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-600 to-blue-600 mb-5 flex items-center gap-3">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 p-3 rounded-full">
                  <FaMapMarkerAlt className="text-white text-xl" />
                </div>
                Ubicación
              </h2>
              <div className="rounded-xl overflow-hidden border-2 border-cyan-300 shadow-md">
                {iframeHtml ? (
                  <div className="cancha-iframe-container" style={{ height: 320 }} dangerouslySetInnerHTML={{ __html: iframeHtml }} />
                ) : (
                  <div className="h-64 bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center">
                    <p className="text-base text-cyan-700 font-medium">No hay mapa disponible para esta cancha</p>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default CanchaDetailsPage;