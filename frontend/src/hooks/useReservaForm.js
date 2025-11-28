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
  const [error, setError] = useState("");


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
  const handleSubmit = async (e, reservaDataOverride = null) => {
    e.preventDefault();
   
    if (!selectedSlot || !clienteNombre || !clienteTelefono) {
      setError("Por favor completa todos los campos requeridos");
      return;
    }


    try {
      setSubmitting(true);
      setError("");


      // Si se proporciona reservaDataOverride, usarlo (incluye servicios extra)
      // Si no, usar los datos del formulario básico
      const body = reservaDataOverride || {
        cancha_id: cancha.id,
        date: date,
        start: selectedSlot.start,
        end: selectedSlot.end,
        cliente_nombre: clienteNombre,
        cliente_telefono: clienteTelefono,
        metodo_pago: "efectivo",
        total: cancha.precio,
        usuario_id: usuario.id,
        servicios_extra: [] // Por defecto vacío si no se proporciona
      };
     
      // Si el método de pago es efectivo, crear la reserva directamente
      if (body.metodo_pago === "efectivo") {
        const res = await fetch(`${API_BASE}/api/reservas`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
       
        if (res.status === 201) {
          const reservaCreada = await res.json();
          // Pago en efectivo - ir directo a confirmación
          navigate("/confirmacion-reserva", {
            state: {
              reserva: reservaCreada.reserva,
              cancha: cancha,
              horario: selectedSlot
            }
          });
        } else {
          const err = await res.json();
          setError(err.error || "No disponible");
          fetchSlots(date);
        }
      } else {
        // Pago con tarjeta - NO crear la reserva aún, solo ir a PagoPage
        // PagoPage se encargará de crear la reserva después del pago
        navigate("/pago", {
          state: {
            reservaData: {
              ...body,
              cancha_nombre: cancha.nombre // Agregar nombre de cancha para metadatos
            },
            totalAmount: body.total
          }
        });
      }
    } catch (err) {
      console.error('Error creando reserva:', err);
      setError("Error al crear la reserva");
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
    error,
   
    // Setters
    setDate,
    setClienteNombre,
    setClienteTelefono,
    setError,
   
    // Funciones
    handleDateChange,
    handleSlotChange,
    handleSubmit,
    handleLogout,
    fetchSlots
  };
};




