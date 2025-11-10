// ...existing code...
import React, { useEffect, useState } from "react";
import NavBarProvider from "../components/NavBarProvider";

 function ProviderReservas() {
  const [reservas, setReservas] = useState([]);
  const [filters, setFilters] = useState({ from: "", to: "", usuario: "" });
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState(null); // id de reserva cuyo menu está abierto

  const API = import.meta.env.VITE_API_BASE || import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://localhost:5000";

  function formatDate(iso) {
    try {
      const d = new Date(iso);
      if (isNaN(d)) return String(iso);
      return d.toLocaleDateString("es-CO");
    } catch (e) { return String(iso); }
  }
  function parseDateTime(reserva, timeField) {
  // fecha viene como DATE en Postgres (YYYY-MM-DD) o como Date
  let dateStr = "";
  if (typeof reserva.fecha === "string") {
    dateStr = reserva.fecha.slice(0, 10);
  } else if (reserva.fecha && typeof reserva.fecha.toISOString === 'function') {
    dateStr = reserva.fecha.toISOString().slice(0, 10);
  } else if (reserva.fecha) {
    try { dateStr = new Date(reserva.fecha).toISOString().slice(0,10); } catch { dateStr = String(reserva.fecha).slice(0,10); }
  }

  // buscar varios candidatos posibles para la hora
  const timeCandidates = [
    reserva[timeField],
    reserva.hora_inicio,
    reserva.hora_fin,
    reserva.inicio,
    reserva.fin,
    reserva.start,
    reserva.end,
    reserva.start_time,
    reserva.time,
  ];
  const rawTime = String(timeCandidates.find(t => t !== undefined && t !== null && String(t).trim() !== "") || "");
  // aceptar formatos como '20:00:00' o '20:00'
  const m = rawTime.match(/(\d{2}:\d{2})/);
  const time = m ? m[1] : rawTime.slice(0,5);

  if (!dateStr || !time || time.length < 4) return null;
  // crear Date en zona local: YYYY-MM-DDTHH:MM:00
  return new Date(`${dateStr}T${time}:00`);
  }

  function canProviderCancel(reserva) {
    const inicio = parseDateTime(reserva, 'inicio');
    if (!inicio) return false;
    // bloquear si quedan 3 horas o menos: permitir sólo si queda > 3 horas
    const msLeft = inicio - new Date();
    const threeHoursMs = 3 * 60 * 60 * 1000;
    return msLeft > threeHoursMs && (!reserva.estado || reserva.estado !== 'cancelada');
  }

  function canProviderCompleteOrNoShow(reserva) {
    const fin = parseDateTime(reserva, 'fin') || parseDateTime(reserva, 'end');
    if (!fin) return false;
    return new Date() >= fin && reserva.estado !== 'cancelada' && reserva.estado !== 'completada';
  }

  function getCancelInfo(reserva) {
    const inicio = parseDateTime(reserva, 'inicio');
    if (!inicio) return { allowed: false, reason: 'Fecha u hora inválida' };
    const now = new Date();
    const diffMs = inicio - now;
    const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    if (reserva.estado === 'cancelada') return { allowed: false, reason: 'La reserva ya está cancelada' };
    if (diffMs <= 0) return { allowed: false, reason: 'La reserva ya finalizó o está en curso' };

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const threeHoursMs = 3 * 60 * 60 * 1000;

    if (diffMs > threeHoursMs) {
      return { allowed: true, reason: `Cancelación permitida — queda ${hours}h ${mins}m hasta el inicio` };
    }

    // Si queda 3 horas o menos, bloquear y explicar claramente
    return { allowed: false, reason: `Cancelación deshabilitada: queda menos de 3 horas para el inicio (falta ${hours}h ${mins}m)` };
  }

  function getCompleteInfo(reserva) {
    const fin = parseDateTime(reserva, 'fin') || parseDateTime(reserva, 'end');
    if (!fin) return { allowed: false, reason: 'Fecha u hora inválida' };
    if (reserva.estado === 'cancelada') return { allowed: false, reason: 'Reserva cancelada' };
    if (reserva.estado === 'completada') return { allowed: false, reason: 'Ya marcada como completada' };
    if (new Date() >= fin) return { allowed: true, reason: 'La reserva ya finalizó' };
    const diffMs = fin - new Date();
    const diffMins = Math.ceil(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return { allowed: false, reason: `Sólo después del fin (falta ${hours}h ${mins}m)` };
  }

  function formatTime(t) {
    if (!t) return "";
    if (typeof t === 'string') {
      const m = t.match(/^(\d{2}:\d{2})/);
      if (m) return m[1];
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
      // En lugar de eliminarla del listado, sólo actualizar su estado a 'cancelada'
      setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: 'cancelada' } : r));
      setOpenMenu(null);
    } catch (err) {
      console.error(err);
      alert("No se pudo cancelar la reserva.");
    }
  }
    async function completarReserva(id) {
    if (!confirm("Marcar reserva como completada?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/reservas/provider/completar/${id}`, { method: "PUT", headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" } });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo marcar completada");
        return;
      }
      setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: 'completada' } : r));
    } catch (err) {
      console.error(err);
      alert("Error marcando completada.");
    }
  }

  async function marcarNoShow(id) {
    if (!confirm("Marcar reserva como cancelada por no-show?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/reservas/provider/no-show/${id}`, { method: "PUT", headers: { Authorization: token ? `Bearer ${token}` : "", "Content-Type": "application/json" } });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo marcar no-show");
        return;
      }
      setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: 'cancelada' } : r));
    } catch (err) {
      console.error(err);
      alert("Error marcando no-show.");
    }
  }

  return (
    <div>
      {/* NavBarProvider: aparece en la parte superior (fixed) */}
      <NavBarProvider />

      {/* Contenido con padding-top para no quedar oculto por la navbar fija */}
      <div className="p-6 max-w-6xl mx-auto pt-28">
        <h1 className="text-2xl font-bold mb-4">Reservas</h1>

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
                  <td className="py-2 relative">
                    {/* Botón que abre el mini-menu */}
                    <button
                      onClick={() => setOpenMenu(openMenu === r.id ? null : r.id)}
                      className="px-3 py-1 bg-gray-200 rounded"
                      aria-haspopup="true"
                      aria-expanded={openMenu === r.id}
                    >Acciones ▾</button>

                    {/* Menú desplegable */}
                    {openMenu === r.id && (
                      <div className="absolute right-0 mt-2 w-60 bg-white border rounded shadow z-10">
                        {/* Cancelar */}
                        {(() => {
                          const info = getCancelInfo(r);
                          return (
                            <div className="px-3 py-2 border-b">
                              <button
                                disabled={!info.allowed}
                                onClick={async () => {
                                  if (!info.allowed) return;
                                  await cancelarReserva(r.id);
                                  setOpenMenu(null);
                                }}
                                className={`w-full text-left ${info.allowed ? 'text-red-600' : 'text-gray-400 cursor-not-allowed'}`}
                              >Cancelar reserva</button>
                              {!info.allowed && <div className="text-xs text-gray-500 mt-1">{info.reason}</div>}
                            </div>
                          );
                        })()}

                        {/* Completar */}
                        {(() => {
                          const info = getCompleteInfo(r);
                          return (
                            <div className="px-3 py-2 border-b">
                              <button
                                disabled={!info.allowed}
                                onClick={async () => {
                                  if (!info.allowed) return;
                                  await completarReserva(r.id);
                                  setOpenMenu(null);
                                }}
                                className={`w-full text-left ${info.allowed ? 'text-green-600' : 'text-gray-400 cursor-not-allowed'}`}
                              >Marcar como completada</button>
                              {!info.allowed && <div className="text-xs text-gray-500 mt-1">{info.reason}</div>}
                            </div>
                          );
                        })()}

                        {/* No-show */}
                        {(() => {
                          const info = getCompleteInfo(r); // mismo criterio temporal
                          return (
                            <div className="px-3 py-2">
                              <button
                                disabled={!info.allowed}
                                onClick={async () => {
                                  if (!info.allowed) return;
                                  await marcarNoShow(r.id);
                                  setOpenMenu(null);
                                }}
                                className={`w-full text-left ${info.allowed ? 'text-yellow-600' : 'text-gray-400 cursor-not-allowed'}`}
                              >Marcar no se presenta Cliente (no-show)</button>
                              {!info.allowed && <div className="text-xs text-gray-500 mt-1">{info.reason}</div>}
                            </div>
                          );
                        })()}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </div>
  );
}
export default ProviderReservas;
// ...existing code...