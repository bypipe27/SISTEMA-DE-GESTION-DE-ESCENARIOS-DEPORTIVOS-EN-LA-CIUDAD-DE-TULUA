import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCanchas } from "../hooks/useCanchas";
import { useProviderProximasReservas, useProviderReportes } from "../hooks/useReservas";
import SideNavProvider from "../components/SideNavProvider";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

function ProviderDashboard() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState({
    year: currentYear,
    month: new Date().getMonth() + 1, // 1-12
  });

  const usuario = useMemo(() => {
    try {
      const userData = localStorage.getItem("usuario");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }, []);
  const usuarioId = usuario?.id ?? null;

  // Usar hooks en lugar de fetch manual
  const { canchas, loading } = useCanchas({ propietarioId: usuarioId });
  const { reservas, loading: reservasLoading } = useProviderProximasReservas();
  const { stats, loading: reportLoading } = useProviderReportes(
    selectedDate.year,
    selectedDate.month
  );

  useEffect(() => {
    if (!usuarioId) {
      navigate("/login");
    }
  }, [navigate, usuarioId]);

  const handleLogout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setSelectedDate(prev => ({ ...prev, [name]: parseInt(value) }));
  };

const chartData = Array.isArray(stats?.series)
  ? stats.series.map((item) => {
      const fechaRaw = item.fecha ?? item.fecha_reserva ?? item.date ?? null;
      const fechaStr =
        typeof fechaRaw === "string"
          ? fechaRaw
          : fechaRaw
          ? new Date(fechaRaw).toISOString().slice(0, 10)
          : "";
      return {
        dia: fechaStr ? fechaStr.slice(-2) : "",
        fecha: fechaStr,
        ingresos: Number(item.ingresos) || 0,
        completadas: Number(item.completadas) || 0,
      };
    })
  : [];

  return (
    <div className="relative flex min-h-screen w-full bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 font-sans">
      {/* SideNavBar */}
      <SideNavProvider />

      {/* Main Content */}
      <main className="flex-1 flex-col min-w-0">
        <div className="p-8">
          {/* PageHeading */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-10">
            <div className="flex flex-col gap-2">
              <p className="text-gray-900 text-4xl font-extrabold tracking-tight">
                Panel de Control
              </p>
              <p className="text-gray-600 text-lg font-medium">
                👋 Hola, {usuario?.nombre || "Bienvenido"}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <select
                name="month"
                value={selectedDate.month}
                onChange={handleDateChange}
                disabled={reportLoading}
                className="bg-white border-2 border-purple-300 rounded-lg shadow-sm py-2.5 px-4 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 hover:border-purple-400 transition-colors"
              >
                {MONTH_NAMES.map((name, index) => (
                  <option key={name} value={index + 1}>{name}</option>
                ))}
              </select>
              <select
                name="year"
                value={selectedDate.year}
                onChange={handleDateChange}
                disabled={reportLoading}
                className="bg-white border-2 border-purple-300 rounded-lg shadow-sm py-2.5 px-4 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50 hover:border-purple-400 transition-colors"
              >
                {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
          </div>

          {/* Stats */}
          {reportLoading ? (
            <div className="text-center p-10">Cargando reportes...</div>
          ) : !stats ? (
            <div className="p-6 text-center text-red-600 bg-white rounded-xl border border-gray-200">
              No se pudieron cargar los datos de reportes para el período seleccionado.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="flex flex-col gap-3 rounded-2xl p-7 bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg hover:shadow-xl transition-shadow border border-emerald-400/20">
                  <p className="text-emerald-50 text-sm font-semibold uppercase tracking-wider">
                    💰 Ingresos del Mes
                  </p>
                  <p className="text-white tracking-tight text-4xl font-extrabold">
                    ${Number(stats.total_ingresos).toLocaleString("es-CO")}
                  </p>
                  <p className="text-emerald-100 text-sm font-medium">
                    En reservas completadas
                  </p>
                </div>
                <div className="flex flex-col gap-3 rounded-2xl p-7 bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg hover:shadow-xl transition-shadow border border-blue-400/20">
                  <p className="text-blue-50 text-sm font-semibold uppercase tracking-wider">
                    📅 Reservas del Mes
                  </p>
                  <p className="text-white tracking-tight text-4xl font-extrabold">
                    {stats.total_reservas}
                  </p>
                  <p className="text-blue-100 text-sm font-medium">
                    {stats.por_estado.completada} completadas
                  </p>
                </div>
                <div className="flex flex-col gap-3 rounded-2xl p-7 bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg hover:shadow-xl transition-shadow border border-purple-400/20">
                  <p className="text-purple-50 text-sm font-semibold uppercase tracking-wider">
                    ⚽ Tus Canchas
                  </p>
                  <p className="text-white tracking-tight text-4xl font-extrabold">
                    {loading ? "..." : canchas.length}
                  </p>
                  <p className="text-purple-100 text-sm font-medium">
                    Canchas activas
                  </p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
                <div className="bg-gradient-to-br from-green-100 via-emerald-100 to-teal-100 shadow-lg rounded-2xl p-6 border-2 border-emerald-400 min-w-0 hover:shadow-xl transition-shadow">
                  <h3 className="font-bold text-lg text-emerald-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📈</span> Ingresos diarios
                  </h3>
                  <div style={{ width: "100%", height: 320 }}>
                    <ResponsiveContainer width="100%" height={320}>
                      <LineChart data={chartData} margin={{ top: 10, right: 30, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="dia" tick={{ fill: "#555" }} />
                        <YAxis tick={{ fill: "#555" }} tickFormatter={(val) => val.toLocaleString()} />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#fff", borderRadius: "8px" }}
                          formatter={(val) => `${val.toLocaleString("es-CO")} COP`}
                          labelFormatter={(label, payload) => {
                            if (payload && payload.length > 0) {
                              return `Fecha: ${payload[0].payload.fecha}`;
                            }
                            return label;
                          }}
                        />
                        <Line type="monotone" dataKey="ingresos" stroke="#22c55e" strokeWidth={3} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 shadow-lg rounded-2xl p-6 border-2 border-indigo-400 min-w-0 hover:shadow-xl transition-shadow">
                  <h3 className="font-bold text-lg text-indigo-900 mb-4 flex items-center gap-2">
                    <span className="text-2xl">📊</span> Reservas completadas por día
                  </h3>
                  <div style={{ width: "100%", height: 320 }}>
                    <ResponsiveContainer width="100%" height={320}>
                      <BarChart data={chartData} margin={{ top: 10, right: 30, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="dia" tick={{ fill: "#555" }} />
                        <YAxis
                          tick={{ fill: "#555" }}
                          allowDecimals={false}
                          domain={[0, 'dataMax + 2']}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#fff", borderRadius: "8px" }}
                          labelFormatter={(label, payload) => {
                            if (payload && payload.length > 0) {
                              return `Fecha: ${payload[0].payload.fecha}`;
                            }
                            return label;
                          }}
                        />
                        <Bar dataKey="completadas" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Upcoming Bookings */}
          <div className="bg-gradient-to-br from-pink-100 via-rose-100 to-red-100 shadow-lg rounded-2xl p-7 border-2 border-pink-400 hover:shadow-xl transition-shadow">
            <h3 className="font-bold mb-5 text-xl text-rose-900 flex items-center gap-2">
              <span className="text-2xl">🔜</span> Próximas Reservas
            </h3>
            {reservasLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl border-2 border-orange-200 animate-pulse">
                    <div className="flex flex-col gap-2 flex-1">
                      <div className="h-5 bg-gradient-to-r from-orange-200 to-yellow-200 rounded w-2/3 animate-shimmer"></div>
                      <div className="h-4 bg-gradient-to-r from-orange-100 to-yellow-100 rounded w-1/2 animate-shimmer" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <div className="h-8 bg-gradient-to-r from-orange-200 to-yellow-200 rounded-full w-24 animate-shimmer" style={{animationDelay: '0.4s'}}></div>
                  </div>
                ))}
              </div>
            ) : reservas.length === 0 ? (
              <p className="text-gray-500">No tienes reservas próximas.</p>
            ) : (
              <div className="space-y-4">
                {reservas.map((reserva, index) => {
                  const fechaRaw = reserva.fecha ?? reserva.fecha_reserva ?? null;
                  const fechaFmt = fechaRaw
                    ? new Date(fechaRaw).toLocaleDateString('es-ES', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'short',
                      })
                    : 'Fecha inválida';
                  const horaFmt = reserva.inicio ? String(reserva.inicio).slice(0, 5) : '--:--';
                  return (
                    <div 
                      key={reserva.id} 
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-100 via-amber-100 to-yellow-100 rounded-xl border-2 border-orange-300 hover:border-orange-400 transition-all hover:shadow-lg transform hover:scale-[1.02] opacity-0 animate-fadeInUp"
                      style={{animationDelay: `${index * 0.1}s`, animationFillMode: 'forwards'}}
                    >
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-gray-900">{reserva.cancha_nombre}</span>
                        <span className="text-sm text-gray-600 font-medium">
                          📅 {fechaFmt} - ⏰ {horaFmt}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">{reserva.cliente_nombre}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
             <button
                onClick={() => navigate("/reservas-provider")}
                className="mt-6 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-6 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold w-fit hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all transform hover:scale-105"
              >
                <span>📋 Ver Todas las Reservas</span>
              </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-8 mt-auto border-t border-gray-200 bg-white/50">
          <div className="text-center text-sm text-gray-600">
            <p className="font-medium">
              © {new Date().getFullYear()} Sistema de Gestión de Escenarios Deportivos. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default ProviderDashboard;