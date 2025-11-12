import React, { useEffect, useState } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer
} from "recharts";
import { FaChartLine, FaDollarSign } from "react-icons/fa";
import NavBarProvider from "../components/NavBarProvider";

const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

function ProviderReportes() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState({
    year: currentYear,
    month: new Date().getMonth() + 1, // 1-12
  });

  const API =
    import.meta.env.VITE_API_BASE ||
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const url = `${API}/api/reservas/provider/reportes?year=${selectedDate.year}&month=${selectedDate.month}`;
        
        const res = await fetch(url, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });

        if (!res.ok) throw new Error("Error cargando reportes");
        const d = await res.json();
        setStats(d);
      } catch (err) {
        console.error("❌ Error al cargar reportes:", err);
        setStats(null); // Limpiar datos en caso de error
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [selectedDate, API]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setSelectedDate(prev => ({ ...prev, [name]: parseInt(value) }));
  };

  const data = stats?.series?.map((item) => ({
    dia: item.fecha.slice(-2),
    fecha: item.fecha,
    ingresos: item.ingresos,
    completadas: item.completadas,
  })) || [];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <NavBarProvider />

      <div className="max-w-6xl mx-auto p-6" style={{ paddingTop: "6.5rem" }}>
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold">📊 Reportes del Proveedor</h1>
            <p className="text-sm text-gray-600">
              Resumen para: {MONTH_NAMES[selectedDate.month - 1]} de {selectedDate.year}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-4 md:mt-0">
            <select
              name="month"
              value={selectedDate.month}
              onChange={handleDateChange}
              disabled={loading}
              className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {MONTH_NAMES.map((name, index) => (
                <option key={name} value={index + 1}>{name}</option>
              ))}
            </select>
            <select
              name="year"
              value={selectedDate.year}
              onChange={handleDateChange}
              disabled={loading}
              className="bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {YEARS.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center p-10">Cargando reportes...</div>
        ) : !stats ? (
          <div className="p-6 text-center text-red-600">No hay datos válidos para mostrar.</div>
        ) : (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white shadow-sm rounded-xl p-4 text-center border">
                <h3 className="text-sm text-gray-500">Ingresos (completadas)</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">
                  <FaDollarSign className="inline mr-1 text-base" />
                  {Number(stats.total_ingresos).toLocaleString("es-CO")} COP
                </p>
              </div>
              <div className="bg-white shadow-sm rounded-xl p-4 text-center border">
                <h3 className="text-sm text-gray-500">Total reservas</h3>
                <p className="text-2xl font-bold mt-2">{stats.total_reservas}</p>
              </div>
              <div className="bg-white shadow-sm rounded-xl p-4 border text-center">
                <h3 className="text-sm text-gray-500 mb-2">Por estado</h3>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>✅ Completadas: {stats.por_estado.completada}</li>
                  <li>❌ Canceladas: {stats.por_estado.cancelada}</li>
                  <li>🕓 Activas: {stats.por_estado.activa}</li>
                </ul>
              </div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white shadow-sm rounded-xl p-4 border">
                <h3 className="font-semibold mb-3">Ingresos diarios</h3>
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <LineChart data={data} margin={{ top: 10, right: 30, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="dia" tick={{ fill: "#555" }} />
                      <YAxis tick={{ fill: "#555" }} tickFormatter={(val) => val.toLocaleString()} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#fff", borderRadius: "8px" }}
                        formatter={(val) => `${val.toLocaleString("es-CO")} COP`}
                        labelFormatter={(label,payload) =>{
                          if (payload && payload.length > 0){
                            return `Fecha: ${payload[0].payload.fecha}`;
                          }
                          return label
    
                        }}
                      />
                      <Line type="monotone" dataKey="ingresos" stroke="#22c55e" strokeWidth={3} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white shadow-sm rounded-xl p-4 border">
                <h3 className="font-semibold mb-3">Reservas completadas</h3>
                <div style={{ width: "100%", height: 320 }}>
                  <ResponsiveContainer>
                    <BarChart data={data} margin={{ top: 10, right: 30, bottom: 0, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="dia" tick={{ fill: "#555" }} />
                      <YAxis
                        tick={{ fill: "#555" }}
                        allowDecimals={false}
                        domain={[0, 10]}
                        ticks={[0, 2, 4, 6, 8, 10]}
                      />
                      <Tooltip contentStyle={{ backgroundColor: "#fff", borderRadius: "8px" }} />
                      <Bar dataKey="completadas" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default ProviderReportes;