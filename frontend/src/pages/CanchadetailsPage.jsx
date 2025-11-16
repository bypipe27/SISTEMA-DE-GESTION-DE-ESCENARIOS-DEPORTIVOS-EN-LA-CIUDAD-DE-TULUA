import React from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaTag, FaInfoCircle, FaFutbol } from "react-icons/fa";
import { useCancha } from "../hooks/useCanchas";
import { Cancha } from "../models/Cancha";
import SideNavBar from "../components/SideNavBar";

function CanchaDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { cancha, loading } = useCancha(id);
  
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

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex">
      <SideNavBar usuarioProp={currentUser} onLogout={handleLogout} />
      <div className="flex-1 ml-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    </div>
  );
  
  if (!cancha) return (
    <div className="min-h-screen bg-slate-50 flex">
      <SideNavBar usuarioProp={currentUser} onLogout={handleLogout} />
      <div className="flex-1 ml-64 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Cancha no encontrada</h2>
          <button onClick={handleBack} className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
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
          <div key={d} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <h3 className="text-xs font-bold text-slate-900 mb-2 border-b border-slate-200 pb-1.5 text-center">
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
                    <div key={idx} className="px-2 py-1.5 rounded-md bg-green-100 text-green-800 text-xs font-medium text-center">
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* estilos locales para asegurar el iframe responsivo */}
      <style>{`
        .cancha-iframe-container iframe { width: 100% !important; height: 100% !important; border: 0; display:block; }
      `}</style>
      
      <SideNavBar usuarioProp={currentUser} onLogout={handleLogout} />
      
      <div className="flex-1 ml-64">
        <div className="container mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
          {/* Header con botón de volver */}
          <header className="flex items-center mb-6">
            <button
              onClick={handleBack}
              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white hover:bg-slate-100 transition-colors duration-200"
            >
              <FaArrowLeft className="text-slate-600" />
            </button>
          </header>

          <main>
            {/* Imagen principal */}
            <div className="relative w-full h-96 rounded-lg overflow-hidden mb-6">
              {cancha.imagen_url ? (
                <img
                  alt={`Vista principal de ${cancha.nombre}`}
                  className="w-full h-full object-cover"
                  src={cancha.imagen_url}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <FaFutbol className="text-white text-8xl opacity-30" />
                </div>
              )}
            </div>

            {/* Información principal */}
            <div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{cancha.nombre}</h1>
              <div className="flex items-center gap-1.5 text-slate-600 text-sm">
                <FaMapMarkerAlt className="text-lg" />
                <p>{cancha.direccion}</p>
              </div>
              <p className="mt-4 text-base leading-relaxed text-slate-700">
                {cancha.descripcion}
              </p>
            </div>

            <div className="w-full h-px bg-slate-200 my-6"></div>

            {/* Información adicional en cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-100 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaTag className="text-green-600 text-2xl" />
                  <div>
                    <h3 className="font-medium text-sm text-slate-600">Precio por hora</h3>
                    <p className="text-lg font-bold text-slate-900">{Cancha.formatPrice(cancha.precio)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-100 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <FaInfoCircle className="text-green-600 text-2xl" />
                  <div>
                    <h3 className="font-medium text-sm text-slate-600">Tipo de cancha</h3>
                    <p className="text-lg font-bold text-slate-900">{cancha.tipo}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Horarios disponibles */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <FaClock className="text-green-600 text-xl" />
                <h2 className="text-xl font-bold text-slate-900">Horarios Disponibles</h2>
              </div>
              {renderHorariosSection()}
            </div>

            {/* Días de mantenimiento */}
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg mb-6">
              <div className="flex items-start gap-3">
                <FaCalendarAlt className="text-amber-600 text-xl mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2">Días de mantenimiento</h3>
                  {renderCerradosDias()}
                  {renderCerradosFechas()}
                </div>
              </div>
            </div>

            {/* Mapa de ubicación */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt className="text-green-600" />
                Ubicación
              </h2>
              <div className="rounded-lg overflow-hidden border border-slate-200">
                {iframeHtml ? (
                  <div className="cancha-iframe-container" style={{ height: 320 }} dangerouslySetInnerHTML={{ __html: iframeHtml }} />
                ) : (
                  <div className="h-64 bg-slate-100 flex items-center justify-center">
                    <p className="text-sm text-slate-500">No hay mapa disponible para esta cancha</p>
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