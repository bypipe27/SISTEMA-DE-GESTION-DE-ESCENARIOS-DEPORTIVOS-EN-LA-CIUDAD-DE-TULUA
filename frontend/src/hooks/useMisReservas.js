import { useState, useEffect, useMemo } from 'react';

/**
 * Hook para gestionar las reservas del usuario con filtros y acciones
 */
export const useMisReservas = () => {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todas");
  const [usuario, setUsuario] = useState(null);
  
  // Estados para diálogos personalizados
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'confirm',
    onConfirm: null
  });
  
  const [toastState, setToastState] = useState({
    isOpen: false,
    message: '',
    type: 'success'
  });

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  // Obtener usuario del localStorage
  useEffect(() => {
    const usuarioStorage = localStorage.getItem("usuario");
    if (usuarioStorage) {
      try {
        setUsuario(JSON.parse(usuarioStorage));
      } catch (error) {
      }
    }
  }, []);

  // Cargar reservas automáticamente si hay usuario
  useEffect(() => {
    if (usuario) {
      cargarReservas();
    } else {
      setLoading(false);
    }
  }, [usuario]);

  // Función auxiliar para normalizar fechas
  const toISODate = (fechaInput) => {
    if (!fechaInput && fechaInput !== 0) return "";
    if (typeof fechaInput === "string") {
      const m = fechaInput.match(/^(\d{4}-\d{2}-\d{2})/);
      if (m) return m[1];
      const d = new Date(fechaInput);
      if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
      return fechaInput;
    }
    if (fechaInput instanceof Date) return fechaInput.toISOString().slice(0, 10);
    try {
      return new Date(fechaInput).toISOString().slice(0, 10);
    } catch {
      return String(fechaInput).slice(0, 10);
    }
  };

  // Determinar estado de la reserva
  const getEstadoReserva = (reserva) => {
    const estadoBD = (reserva.estado || "").toString().toLowerCase();
    if (estadoBD === "cancelada" || estadoBD === "cancelado")
      return { texto: "Cancelada", color: "red", tipo: "cancelada" };
    if (estadoBD === "completada" || estadoBD === "completado")
      return { texto: "Completada", color: "gray", tipo: "completada" };

    const ahora = new Date();
    const fechaISO = toISODate(reserva.fecha);
    const finTime = (reserva.fin || reserva.hora_fin || reserva.end || "").toString().slice(0, 5);

    if (!fechaISO || !finTime) {
      return { texto: "Programada", color: "blue", tipo: "programada" };
    }
    
    const fechaReserva = new Date(`${fechaISO}T${finTime}`);
    if (isNaN(fechaReserva.getTime())) 
      return { texto: "Programada", color: "blue", tipo: "programada" };

    if (fechaReserva < ahora) 
      return { texto: "Completada", color: "gray", tipo: "completada" };
    
    const horas = (fechaReserva - ahora) / (1000 * 60 * 60);
    if (horas < 24) 
      return { texto: "Próxima", color: "green", tipo: "proxima" };
    
    return { texto: "Programada", color: "blue", tipo: "programada" };
  };

  // Cargar reservas
  const cargarReservas = async () => {
    try {
      setLoading(true);

      if (usuario && usuario.id) {
        const res = await fetch(`${API_BASE}/api/reservas/usuario/${usuario.id}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setReservas(data);
          else setReservas(data.reservas || []);
        } else {
          setReservas([]);
        }
        return;
      }

      if (!searchTerm) {
        setReservas([]);
        return;
      }

      const res = await fetch(
        `${API_BASE}/api/reservas/mis-reservas?email=${encodeURIComponent(searchTerm)}`
      );
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setReservas(data);
        else setReservas(data.reservas || []);
      } else {
        setReservas([]);
      }
    } catch (error) {
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  // Determina si la reserva puede ser cancelada
  const canCancelReserva = (reserva) => {
    const estado = (reserva.estado || "").toString().toLowerCase();
    if (estado.includes("cancel") || estado.includes("complet")) return false;

    const fechaISO = toISODate(reserva.fecha);
    const inicio = (reserva.inicio || reserva.hora_inicio || reserva.start || "").toString().slice(0, 5);
    if (!fechaISO || !inicio) return false;
    
    const fechaHoraReserva = new Date(`${fechaISO}T${inicio}`);
    if (isNaN(fechaHoraReserva.getTime())) return false;
    
    const ahora = new Date();
    const msLeft = fechaHoraReserva - ahora;
    const threeHoursMs = 3 * 60 * 60 * 1000;
    return msLeft > threeHoursMs;
  };

  // Cancelar reserva
  const handleCancelarReserva = async (reserva, formatearFecha) => {
    if (!reserva || !reserva.id) {
      setToastState({
        isOpen: true,
        message: 'Reserva inválida',
        type: 'error'
      });
      return;
    }
    
    // Mostrar diálogo de confirmación personalizado
    setDialogState({
      isOpen: true,
      title: 'Cancelar Reserva',
      message: `¿Estás seguro de cancelar la reserva para ${reserva.cancha_nombre} el ${formatearFecha(reserva.fecha)}?`,
      type: 'warning',
      onConfirm: async () => {
        try {
          setLoading(true);
          const resp = await fetch(`${API_BASE}/api/reservas/cancelar/${reserva.id}`, { method: 'PUT' });
          
          if (resp.ok) {
            setToastState({
              isOpen: true,
              message: 'Reserva cancelada correctamente. Se enviará notificación al proveedor.',
              type: 'success'
            });
            await cargarReservas();
          } else {
            const text = await resp.text();
            let data = null;
            try { data = JSON.parse(text); } catch {}
            const msg = (data && (data.error || data.message)) || text || 'Error al cancelar la reserva';
            setToastState({
              isOpen: true,
              message: msg,
              type: 'error'
            });
          }
        } catch (err) {
          setToastState({
            isOpen: true,
            message: 'Error conectando con el servidor al intentar cancelar.',
            type: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  // Filtrar reservas
  const reservasFiltradas = useMemo(() => {
    return reservas.filter(reserva => {
      const estado = getEstadoReserva(reserva);
      
      if (filterStatus !== "todas" && estado.tipo !== filterStatus) {
        return false;
      }
      
      if (searchTerm && !usuario) {
        return reserva.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
               reserva.cancha_nombre.toLowerCase().includes(searchTerm.toLowerCase());
      }
      
      return true;
    });
  }, [reservas, filterStatus, searchTerm, usuario]);

  // Calcular estadísticas
  const estadisticas = useMemo(() => {
    return {
      total: reservas.length,
      proximas: reservas.filter(r => getEstadoReserva(r).tipo === 'proxima').length,
      programadas: reservas.filter(r => getEstadoReserva(r).tipo === 'programada').length,
      completadas: reservas.filter(r => getEstadoReserva(r).tipo === 'completada').length,
      canceladas: reservas.filter(r => getEstadoReserva(r).tipo === 'cancelada').length,
    };
  }, [reservas]);

  return {
    reservas: reservasFiltradas,
    loading,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    usuario,
    cargarReservas,
    getEstadoReserva,
    canCancelReserva,
    handleCancelarReserva,
    estadisticas,
    // Estados para diálogos y notificaciones
    dialogState,
    setDialogState,
    toastState,
    setToastState
  };
};
