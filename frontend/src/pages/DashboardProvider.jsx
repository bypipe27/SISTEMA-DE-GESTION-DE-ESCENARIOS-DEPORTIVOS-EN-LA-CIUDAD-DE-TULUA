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
    <div className="relative flex min-h-screen w-full bg-gray-100 font-sans">
      {/* SideNavBar */}
      <SideNavProvider />

      {/* Main Content */}
      <main className="flex-1 flex-col min-w-0">
        <div className="p-8">
          {/* PageHeading */}
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div className="flex flex-col gap-1">
              <p className="text-gray-900 text-3xl font-bold">
                Panel de Control
              </p>
              <p className="text-gray-500 text-base font-normal">
                Hola, {usuario?.nombre || "Bienvenido"}
              </p>
            </div>
            <div className="flex items-center gap-3 mt-4 md:mt-0">
              <select
                name="month"
                value={selectedDate.month}
                onChange={handleDateChange}
                disabled={reportLoading}
                className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
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
                className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-gray-200">
                  <p className="text-gray-600 text-base font-medium">
                    Ingresos del Mes
                  </p>
                  <p className="text-gray-900 tracking-light text-3xl font-bold">
                    ${Number(stats.total_ingresos).toLocaleString("es-CO")}
                  </p>
                  <p className="text-gray-500 text-base font-medium">
                    En reservas completadas
                  </p>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-gray-200">
                  <p className="text-gray-600 text-base font-medium">
                    Reservas del Mes
                  </p>
                  <p className="text-gray-900 tracking-light text-3xl font-bold">
                    {stats.total_reservas}
                  </p>
                  <p className="text-gray-500 text-base font-medium">
                    {stats.por_estado.completada} completadas
                  </p>
                </div>
                <div className="flex flex-col gap-2 rounded-xl p-6 bg-white border border-gray-200">
                  <p className="text-gray-600 text-base font-medium">
                    Tus Canchas
                  </p>
                  <p className="text-gray-900 tracking-light text-3xl font-bold">
                    {loading ? "..." : canchas.length}
                  </p>
                  <p className="text-gray-500 text-base font-medium">
                    Canchas activas
                  </p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white shadow-sm rounded-xl p-4 border min-w-0">
                  <h3 className="font-semibold mb-3">Ingresos diarios</h3>
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

                <div className="bg-white shadow-sm rounded-xl p-4 border min-w-0">
                  <h3 className="font-semibold mb-3">Reservas completadas por día</h3>
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
          <div className="bg-white shadow-sm rounded-xl p-6 border">
            <h3 className="font-semibold mb-4 text-lg">Próximas Reservas</h3>
            {reservasLoading ? (
              <p className="text-gray-500">Cargando reservas...</p>
            ) : reservas.length === 0 ? (
              <p className="text-gray-500">No tienes reservas próximas.</p>
            ) : (
              <div className="space-y-4">
                {reservas.map((reserva) => {
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
                    <div key={reserva.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800">{reserva.cancha_nombre}</span>
                        <span className="text-sm text-gray-600">
                          {fechaFmt} - {horaFmt}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-700">{reserva.cliente_nombre}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
             <button
                onClick={() => navigate("/reservas-provider")}
                className="mt-4 flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-emerald-500 text-white text-sm font-medium w-fit hover:bg-emerald-600"
              >
                <span>Ver Todas las Reservas</span>
              </button>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-8 mt-auto border-t border-gray-200">
          <div className="text-center text-sm text-gray-500">
            <p>
              © {new Date().getFullYear()} Sistema de Gestión de Escenarios Deportivos. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default ProviderDashboard;