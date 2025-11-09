// ...existing code...
import React, { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import NavBarProvider from "../components/NavBarProvider";
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
    <div>
      <NavBarProvider />
      <div className="p-6 max-w-6xl mx-auto pt-28">
        <h1 className="text-2xl font-bold mb-4">Reportes (Proveedor)</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="p-4 border rounded">
            <h3 className="font-semibold">Ingresos (completadas)</h3>
            <p className="text-2xl font-bold">
              {Number(stats.total_ingresos).toLocaleString("es-CO")} COP
            </p>
          </div>
          <div className="p-4 border rounded">
            <h3 className="font-semibold">Total reservas</h3>
            <p className="text-2xl font-bold">{stats.total_reservas}</p>
          </div>
          <div className="p-4 border rounded">
            <h3 className="font-semibold">Por estado</h3>
            <ul>
              <li>Completadas: {stats.por_estado.completada}</li>
              <li>Canceladas: {stats.por_estado.cancelada}</li>
              <li>Activas: {stats.por_estado.activa}</li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">Ingresos últimos 30 días</h3>
            <Line
              data={ingresosChart}
              options={{ responsive: true, plugins: { legend: { display: true } } }}
            />
          </div>

          <div className="p-4 border rounded">
            <h3 className="font-semibold mb-2">
              Reservas completadas (últimos 30 días)
            </h3>
            <Bar
              data={completadasChart}
              options={{ responsive: true, plugins: { legend: { display: false } } }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


export default ProviderReportes;
