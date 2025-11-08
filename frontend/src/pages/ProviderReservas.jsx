import React, { useEffect, useState } from "react";

 function ProviderReservas() {
  const [reservas, setReservas] = useState([]);
  const [filters, setFilters] = useState({ from: "", to: "", usuario: "" });
  const [loading, setLoading] = useState(false);

  async function fetchReservas() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (filters.from) qs.set("from", filters.from);
      if (filters.to) qs.set("to", filters.to);
      if (filters.usuario) qs.set("usuario", filters.usuario);
      const res = await fetch(`http://localhost:5000/api/admin/reservas?${qs.toString()}`);
      const data = await res.json();
      setReservas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchReservas(); }, []);

  async function cancelarReserva(id) {
    if (!confirm("Confirmar cancelación de la reserva?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/admin/reservas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("No se pudo cancelar");
      setReservas(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert("No se pudo cancelar la reserva.");
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Reservas</h1>

      <div className="mb-4 flex gap-2">
        <input type="date" value={filters.from} onChange={e => setFilters({...filters, from: e.target.value})} className="px-3 py-2 border rounded" />
        <input type="date" value={filters.to} onChange={e => setFilters({...filters, to: e.target.value})} className="px-3 py-2 border rounded" />
        <input placeholder="Email usuario" value={filters.usuario} onChange={e => setFilters({...filters, usuario: e.target.value})} className="px-3 py-2 border rounded" />
        <button onClick={fetchReservas} className="px-3 py-2 bg-blue-600 text-white rounded">Filtrar</button>
      </div>

      {loading ? <p>Cargando...</p> :
        <table className="w-full table-auto border-collapse">
          <thead><tr className="text-left"><th>Cancha</th><th>Usuario</th><th>Fecha</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {reservas.map(r => (
              <tr key={r.id} className="border-t">
                <td>{r.cancha_nombre}</td>
                <td>{r.usuario_email}</td>
                <td>{r.fecha}</td>
                <td>{r.estado}</td>
                <td><button onClick={() => cancelarReserva(r.id)} className="px-2 py-1 bg-red-600 text-white rounded">Cancelar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    </div>
  );
}
export default ProviderReservas; 