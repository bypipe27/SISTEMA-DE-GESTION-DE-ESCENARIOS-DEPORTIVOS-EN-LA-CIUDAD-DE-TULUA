import React, { useEffect, useState } from "react";

 function ProviderReportes() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("http://localhost:5000/api/admin/reportes/reservas-summary");
        const d = await res.json();
        setStats(d);
      } catch (err) {
        console.error(err);
      }
    }
    fetchStats();
  }, []);

  if (!stats) return <div className="p-6">Cargando reportes...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Reportes</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 border rounded">
          <h3 className="font-semibold">Cantidad total de reservas</h3>
          <p className="text-3xl font-bold">{stats.total_reservas}</p>
        </div>
        <div className="p-4 border rounded">
          <h3 className="font-semibold">Días más reservados</h3>
          <ul>
            {stats.dias_mas_reservados.map(d => <li key={d.dia}>{d.dia}: {d.cantidad}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
export default ProviderReportes; 