import { useState, useEffect, useMemo } from 'react';
import { getProviderReservas } from '../services/reservaService';

/**
 * Hook para gestionar las reservas del proveedor con filtros y acciones
 */
export const useProviderReservasManager = () => {
  const [reservas, setReservas] = useState([]);
  const [filters, setFilters] = useState({ from: "", to: "", usuario: "", estado: "" });
  const [loading, setLoading] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const API = import.meta.env.VITE_API_BASE || 
               import.meta.env.VITE_BACKEND_URL || 
               import.meta.env.VITE_API_URL || 
               "http://localhost:5000";

  // Cargar reservas
  const fetchReservas = async () => {
    setLoading(true);
    try {
      const data = await getProviderReservas();
      const arr = Array.isArray(data) ? data : [];
      arr.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      setReservas(arr);
    } catch (err) {
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  // Funciones auxiliares de validación
  const parseDateTime = (reserva, timeField) => {
    let dateStr = "";
    if (typeof reserva.fecha === "string") {
      dateStr = reserva.fecha.slice(0, 10);
    } else if (reserva.fecha && typeof reserva.fecha.toISOString === 'function') {
      dateStr = reserva.fecha.toISOString().slice(0, 10);
    } else if (reserva.fecha) {
      try {
        dateStr = new Date(reserva.fecha).toISOString().slice(0, 10);
      } catch {
        dateStr = String(reserva.fecha).slice(0, 10);
      }
    }

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
    const m = rawTime.match(/(\d{2}:\d{2})/);
    const time = m ? m[1] : rawTime.slice(0, 5);

    if (!dateStr || !time || time.length < 4) return null;
    return new Date(`${dateStr}T${time}:00`);
  };

  const getCancelInfo = (reserva) => {
    const inicio = parseDateTime(reserva, 'inicio');
    if (!inicio) return { allowed: false, reason: 'Fecha u hora inválida' };
    
    const now = new Date();
    const diffMs = inicio - now;
    const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    
    if (reserva.estado === 'cancelada') 
      return { allowed: false, reason: 'La reserva ya está cancelada' };
    if (diffMs <= 0) 
      return { allowed: false, reason: 'La reserva ya finalizó o está en curso' };

    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    const threeHoursMs = 3 * 60 * 60 * 1000;

    if (diffMs > threeHoursMs) {
      return { allowed: true, reason: `Cancelación permitida — queda ${hours}h ${mins}m hasta el inicio` };
    }

    return { allowed: false, reason: `Cancelación deshabilitada: queda menos de 3 horas para el inicio (falta ${hours}h ${mins}m)` };
  };

  const getCompleteInfo = (reserva) => {
    const fin = parseDateTime(reserva, 'fin') || parseDateTime(reserva, 'end');
    if (!fin) return { allowed: false, reason: 'Fecha u hora inválida' };
    if (reserva.estado === 'cancelada') 
      return { allowed: false, reason: 'Reserva cancelada' };
    if (reserva.estado === 'completada') 
      return { allowed: false, reason: 'Ya marcada como completada' };
    
    if (new Date() >= fin) 
      return { allowed: true, reason: 'La reserva ya finalizó' };
    
    const diffMs = fin - new Date();
    const diffMins = Math.ceil(diffMs / (1000 * 60));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    
    return { allowed: false, reason: `Sólo después del fin (falta ${hours}h ${mins}m)` };
  };

  // Filtrar reservas
  const filteredReservas = useMemo(() => {
    const term = (filters.usuario || "").toLowerCase().trim();
    const from = filters.from ? new Date(filters.from) : null;
    const to = filters.to ? new Date(filters.to) : null;
    const estado = (filters.estado || "").toLowerCase();

    return reservas.filter(r => {
      const usuarioText = (r.cliente_nombre || r.usuario_email || "").toLowerCase();
      const canchaText = (r.cancha_nombre || String(r.cancha_id || "")).toLowerCase();
      const matchesText = term === "" || usuarioText.includes(term) || canchaText.includes(term);

      const stateText = (r.estado || "programada").toLowerCase();
      const matchesEstado = !estado || stateText === estado;

      let fechaR = null;
      try {
        fechaR = r.fecha ? new Date(typeof r.fecha === 'string' ? r.fecha.slice(0, 10) : r.fecha) : null;
      } catch {}
      const afterFrom = !from || (fechaR && fechaR >= from);
      const beforeTo = !to || (fechaR && fechaR <= to);

      return matchesText && matchesEstado && afterFrom && beforeTo;
    });
  }, [reservas, filters]);

  // Acciones sobre reservas
  const cancelarReserva = async (id) => {
    if (!confirm("Confirmar cancelación de la reserva?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/reservas/provider/cancelar/${id}`, {
        method: "PUT",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        }
      });
      
      const txt = await res.text();
      if (!res.ok) {
        alert('No se pudo cancelar la reserva. ' + (txt || ''));
        return;
      }
      
      setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: 'cancelada' } : r));
      setOpenMenu(null);
    } catch (err) {
      alert("No se pudo cancelar la reserva.");
    }
  };

  const completarReserva = async (id) => {
    if (!confirm("Marcar reserva como completada?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/reservas/provider/completar/${id}`, {
        method: "PUT",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        }
      });
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo marcar completada");
        return;
      }
      
      setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: 'completada' } : r));
      setOpenMenu(null);
    } catch (err) {
      alert("Error marcando completada.");
    }
  };

  const marcarNoShow = async (id) => {
    if (!confirm("Marcar reserva como cancelada por no-show?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API}/api/reservas/provider/no-show/${id}`, {
        method: "PUT",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
          "Content-Type": "application/json"
        }
      });
      
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "No se pudo marcar no-show");
        return;
      }
      
      setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: 'cancelada' } : r));
      setOpenMenu(null);
    } catch (err) {
      alert("Error marcando no-show.");
    }
  };

  return {
    reservas: filteredReservas,
    filters,
    setFilters,
    loading,
    openMenu,
    setOpenMenu,
    getCancelInfo,
    getCompleteInfo,
    cancelarReserva,
    completarReserva,
    marcarNoShow,
    fetchReservas
  };
};
