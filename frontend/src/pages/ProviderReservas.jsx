import React, { useEffect, useState } from "react";

 function ProviderReservas() {
  const [reservas, setReservas] = useState([]);
  const [filters, setFilters] = useState({ from: "", to: "", usuario: "" });
  const [loading, setLoading] = useState(false);

// ...existing code...
  const API = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      if (isNaN(d)) return String(iso);
      return d.toLocaleDateString("es-CO");
    } catch (e) { return String(iso); }
  }

  function formatTime(t) {
    if (!t) return "";
    // puede venir como '05:00:00' o '05:00'
    if (typeof t === 'string') {
      const m = t.match(/^(\d{2}:\d{2})/);
      if (m) return m[1];
      // si es ISO datetime
      if (t.includes('T')) {
        try { return new Date(t).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }); } catch {}
      }
      return t;
    }
    if (t instanceof Date) return t.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    return String(t);
  }

  async function fetchReservas() {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await fetch(`${API}/api/reservas/provider`, { headers });
      const ct = res.headers.get("content-type") || "";

      if (!res.ok) {
        const txt = await res.text();
        console.error("API error:", res.status, txt);
        setReservas([]);
        return;
      }

      if (!ct.includes("application/json")) {
        const txt = await res.text();
        console.error("Respuesta no JSON:", txt);
        setReservas([]);
        return;
      }

      const data = await res.json();
      const arr = Array.isArray(data) ? data : [];
      // ordenar por fecha asc
      arr.sort((a,b) => new Date(a.fecha) - new Date(b.fecha));
      setReservas(arr);
    } catch (err) {
      console.error(err);
      setReservas([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchReservas(); }, []);

  async function cancelarReserva(id) {
    if (!confirm("Confirmar cancelación de la reserva?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/reservas/provider/cancelar/${id}`, { method: "PUT", headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" } });
      const txt = await res.text();
      if (!res.ok) {
        console.error('Error cancelando reserva:', res.status, txt);
        alert('No se pudo cancelar la reserva. ' + (txt || ''));
        return;
      }
      // actualizar lista
      setReservas(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      console.error(err);
      alert("No se pudo cancelar la reserva.");
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Reservas</h1>

      {/* filtros removidos: se muestran todas las reservas */}

      {loading ? <p>Cargando...</p> :
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="text-left">
              <th>Cancha</th>
              <th>Usuario</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservas.map(r => (
              <tr key={r.id} className="border-t">
                <td className="py-2">{r.cancha_nombre || r.cancha_id}</td>
                <td className="py-2">
                  <div className="font-medium">{r.cliente_nombre || r.usuario_email || '-'}</div>
                  {r.cliente_telefono && <div className="text-sm text-gray-500">{r.cliente_telefono}</div>}
                </td>
                <td className="py-2">{formatDate(r.fecha)}</td>
                <td className="py-2">{formatTime(r.inicio)} — {formatTime(r.fin)}</td>
                <td className="py-2">{r.estado}</td>
                <td className="py-2"><button onClick={() => cancelarReserva(r.id)} className="px-2 py-1 bg-red-600 text-white rounded">Cancelar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    </div>
  );
}
export default ProviderReservas; 