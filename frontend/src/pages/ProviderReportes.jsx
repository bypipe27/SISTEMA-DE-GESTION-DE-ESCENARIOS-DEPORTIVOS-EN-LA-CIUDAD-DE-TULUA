import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import NavBarProvider from "../components/NavBarProvider";
import { FaChartLine, FaDollarSign } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend);

function ProviderReportes() {
  const [stats, setStats] = useState(null);
  const API = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    async function fetchStats() {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API}/api/reservas/provider/reportes`, {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        });
        if (!res.ok) throw new Error("Error cargando reportes");
        const d = await res.json();
        setStats(d);
      } catch (err) {
        console.error(err);
      }
    }
    fetchStats();
  }, []);

  if (!stats) return <div className="p-6">Cargando reportes...</div>;

  const ingresosChart = {
    labels: stats.series.labels,
    datasets: [
      {
        label: "Ingresos (COP)",
        data: stats.series.ingresos,
        borderColor: "rgba(34,197,94,0.9)",
        backgroundColor: "rgba(34,197,94,0.3)",
        tension: 0.2,
        fill: true,
      },
    ],
  };

  const completadasChart = {
    labels: stats.series.labels,
    datasets: [
      {
        label: "Reservas completadas",
        data: stats.series.completadas,
        backgroundColor: "rgba(59,130,246,0.8)",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <style>{`
      /* Estilos locales minimalistas (no modifican tipografía global) */
      .pr-container { max-width: 1100px; margin: 0 auto; padding: 1.5rem; }
      .pr-card { background: #fff; border: 1px solid rgba(2,6,23,0.04); border-radius: 12px; box-shadow: 0 10px 30px rgba(2,6,23,0.04); }
      .pr-header { display:flex; align-items:center; gap:12px; }
      .pr-kpi { border-radius: 10px; background: linear-gradient(180deg,#ffffff,#fbfbfb); padding: 1rem; text-align:center; }
      .pr-graph { padding: 1rem; border-radius: 10px; background: #fff; border: 1px solid rgba(2,6,23,0.04); }
      .pr-title { font-weight: 600; color: #111827; }
    `}</style>

      <NavBarProvider />
      <div className="pr-container p-6 pt-28">
        <div className="mb-6 pr-header">
          <div>
            <h1 className="text-2xl font-semibold pr-title">Reportes (Proveedor)</h1>
            <p className="text-sm text-gray-600">Resumen de ingresos y reservas (últimos 30 días)</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaChartLine className="text-green-600" />{" "}
              <span className="font-medium">{stats.series.labels.length} días</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="pr-kpi">
            <h3 className="text-sm text-gray-500">Ingresos (completadas)</h3>
            <p className="text-2xl font-bold text-green-600 mt-2">
              <FaDollarSign className="inline mr-2 text-base" />
              {Number(stats.total_ingresos).toLocaleString("es-CO")} COP
            </p>
          </div>
          <div className="pr-kpi">
            <h3 className="text-sm text-gray-500">Total reservas</h3>
            <p className="text-2xl font-bold mt-2">{stats.total_reservas}</p>
          </div>
          <div className="pr-kpi">
            <h3 className="text-sm text-gray-500">Por estado</h3>
            <ul className="text-sm mt-2 text-gray-700">
              <li>Completadas: {stats.por_estado.completada}</li>
              <li>Canceladas: {stats.por_estado.cancelada}</li>
              <li>Activas: {stats.por_estado.activa}</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="pr-graph pr-card">
            <h3 className="font-semibold mb-3">Ingresos últimos 30 días</h3>
            <div style={{ height: 320 }}>
              <Line
                data={ingresosChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: true } },
                  scales: {
                    x: { ticks: { color: "#374151" } },
                    y: { ticks: { color: "#374151" } },
                  },
                }}
              />
            </div>
          </div>

          <div className="pr-graph pr-card">
            <h3 className="font-semibold mb-3">Reservas completadas (últimos 30 días)</h3>
            <div style={{ height: 320 }}>
              <Bar
                data={completadasChart}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { ticks: { color: "#374151" } },
                    y: { ticks: { color: "#374151" } },
                  },
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProviderReportes;
