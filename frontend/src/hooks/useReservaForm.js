import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook para gestionar el formulario de creación de reservas
 */
export const useReservaForm = (canchaId) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Usuario desde localStorage
  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null");
    } catch {
      return null;
    }
  }, []);

  // Location state (cancha y fecha inicial)
  const locState = location.state || null;
  const initialCancha = locState ? (locState.cancha || locState) : null;
  const initialDate = locState ? (locState.fecha || locState.date || "") : "";

  // Estado
  const [cancha, setCancha] = useState(initialCancha);
  const [loading, setLoading] = useState(!initialCancha);
  const [date, setDate] = useState(initialDate);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  // Cargar datos de la cancha si no vienen en el state
  useEffect(() => {
    if (!cancha) {
      (async () => {
        try {
          const res = await fetch(`${API_BASE}/api/canchas/${canchaId}`);
          if (res.ok) {
            const data = await res.json();
            setCancha(data);
          } else {
          }
        } catch (e) {
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [canchaId, cancha, API_BASE]);

  // Función para obtener horarios disponibles
  async function fetchSlots(d) {
    if (!d) return;
    try {
      const res = await fetch(`${API_BASE}/api/reservas/cancha/${canchaId}/availability?date=${d}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setSlots(data.slots || []);
      setSelectedSlot(null);
      setSelectedIndex(null);
    } catch (err) {
    }
  }

  // Si hay fecha inicial, cargar slots automáticamente
  useEffect(() => {
    if (cancha && date) {
      fetchSlots(date);
    }
  }, [cancha, date]);

  // Manejar cambio de fecha
  const handleDateChange = (newDate) => {
    setDate(newDate);
    fetchSlots(newDate);
  };

  // Manejar selección de horario
  const handleSlotChange = (idx) => {
    const index = Number(idx);
    setSelectedIndex(index);
    setSelectedSlot(slots[index]);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) return alert("Seleccione un horario");
    if (!clienteNombre) return alert("Nombre requerido");
    
    setSubmitting(true);
    try {
      const body = {
        cancha_id: Number(canchaId),
        date,
        start: selectedSlot.start,
        end: selectedSlot.end,
        cliente_nombre: clienteNombre,
        cliente_telefono: clienteTelefono,
        metodo_pago: "stripe",
        usuario_id: usuario?.id
      };
      
      const res = await fetch(`${API_BASE}/api/reservas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      
      if (res.status === 201) {
        const reservaCreada = await res.json();
        navigate("/pago", {
          state: {
            reserva: reservaCreada.reserva,
            cancha: cancha,
            horario: selectedSlot
          }
        });
      } else {
        const err = await res.json();
        alert("Error: " + (err.error || "No disponible"));
        fetchSlots(date);
      }
    } catch (err) {
      alert("Error al crear la reserva");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return {
    // Estado
    usuario,
    cancha,
    loading,
    date,
    slots,
    selectedSlot,
    selectedIndex,
    clienteNombre,
    clienteTelefono,
    submitting,
    initialDate,
    
    // Setters
    setDate,
    setClienteNombre,
    setClienteTelefono,
    
    // Funciones
    handleDateChange,
    handleSlotChange,
    handleSubmit,
    handleLogout,
    fetchSlots
  };
};
