// ...existing code...
import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaUser, FaPhone, FaMoneyBillWave } from "react-icons/fa";

function ReservaPage() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // location.state puede ser { cancha, fecha } o directamente la cancha (compatibilidad)
  const locState = location.state || null;
  const initialCancha = locState ? (locState.cancha || locState) : null;
  const initialDate = locState ? (locState.fecha || locState.date || "") : "";

  const [cancha, setCancha] = useState(initialCancha);
  const [loading, setLoading] = useState(!initialCancha);
  const [date, setDate] = useState(initialDate);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // 🔹 Base del backend sin proxy
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

 useEffect(() => {
    if (!cancha) {
      (async () => {
        try {
          // pedir datos de la cancha (no availability)
          const res = await fetch(`${API_BASE}/api/canchas/${id}`);
          if (res.ok) {
            const data = await res.json();
            setCancha(data);
          } else {
            console.error("Error cargando cancha:", res.status);
          }
        } catch (e) {
          console.error("Error de conexión:", e);
        } finally {
          setLoading(false);
        }
      })();
    } else {
      setLoading(false);
    }
  }, [id, cancha]);

  // 🔹 Función para traer disponibilidad de horarios
  async function fetchSlots(d) {
    if (!d) return;
    try {
      const res = await fetch(`${API_BASE}/api/reservas/cancha/${id}/availability?date=${d}`);

      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setSlots(data.slots || []);
      setSelectedSlot(null);
      setSelectedIndex(null);
    } catch (err) {
      console.error("Error al obtener horarios:", err);
    }
  }

  // Si la página se abrió con fecha desde el Dashboard, cargar slots automáticamente
  useEffect(() => {
    if (cancha && date) {
      fetchSlots(date);
    }
  }, [cancha, date]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedSlot) return alert("Seleccione un horario");
    if (!clienteNombre) return alert("Nombre requerido");
    setSubmitting(true);
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario")); // 👈 obtiene el usuario
      const body = {
        cancha_id: Number(id),
        date,
        start: selectedSlot.start,
        end: selectedSlot.end,
        cliente_nombre: clienteNombre,
        cliente_telefono: clienteTelefono,
        metodo_pago: "efectivo",
        usuario_id: usuario?.id // 👈 añade el id del usuario
      };
      const res = await fetch(`${API_BASE}/api/reservas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
        if (res.status === 201) {
      const reservaCreada = await res.json();
      // Navegar a la página de confirmación con todos los datos
      navigate("/confirmacion-reserva", { 
        state: { 
          reserva: reservaCreada.reserva,
          cancha: cancha,
          horario: selectedSlot
        }
      });
    } else {
      const err = await res.json();
      alert("Error: " + (err.error || "No disponible"));
      fetchSlots(date); // refrescar horarios
    }
    } catch (err) {
      console.error("Error creando reserva:", err);
      alert("Error al crear la reserva");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!cancha) return <div className="min-h-screen flex items-center justify-center">Cancha no encontrada</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* estilos locales mínimos y armónicos (no tocan la lógica ni la tipografía global) */}
      <style>{`
        .rp-card { max-width: 820px; margin: 0 auto; background: #fff; border-radius: 14px; padding: 20px; box-shadow: 0 12px 30px rgba(2,6,23,0.06); border: 1px solid rgba(2,6,23,0.04); }
        .rp-input { width:100%; padding:10px 12px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); background:#fff; }
        .rp-select { width:100%; padding:10px 12px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); background:#fff; }
        .rp-btn { background:#10B981; color:#fff; padding:10px 14px; border-radius:10px; font-weight:600; }
        .rp-btn[disabled] { opacity:0.6; cursor:not-allowed; transform:none; }
        .rp-meta { color:#6b7280; font-size:0.95rem; }
        .rp-grid { display:grid; grid-template-columns:1fr; gap:12px; }
        @media(min-width:720px){ .rp-grid { grid-template-columns: 1fr 320px; gap:20px; } }
        .rp-section { background: #fafafa; padding:12px; border-radius:10px; border: 1px solid rgba(2,6,23,0.03); }
        .rp-badge { display:inline-block; padding:6px 10px; border-radius:999px; background:rgba(16,185,129,0.12); color:#065f46; font-weight:600; }
      `}</style>

      <div className="rp-card">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-700 mb-3"
        >
          <FaArrowLeft /> Volver
        </button>

        <div className="mb-4">
          <h2 className="text-2xl font-semibold">{cancha.nombre}</h2>
          <p className="rp-meta mt-1">{cancha.descripcion}</p>
        </div>

        <div className="rp-grid">
          <div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Fecha</label>
              <div className="flex items-center gap-2">
                <FaCalendarAlt className="text-gray-400" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    if (!initialDate) {
                      setDate(e.target.value);
                      fetchSlots(e.target.value);
                    }
                  }}
                  readOnly={Boolean(initialDate)}
                  disabled={Boolean(initialDate)}
                  className={`rp-input ${initialDate ? "bg-gray-50 cursor-not-allowed" : ""}`}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </div>

            <div className="mb-4">
              <h3 className="font-semibold mb-2">Horarios</h3>
              <div>
                {slots.length === 0 ? (
                  <div className="rp-section rp-meta">Seleccione una fecha</div>
                ) : (
                  <select
                    className="rp-select"
                    value={selectedIndex ?? ""}
                    onChange={(e) => {
                      const idx = Number(e.target.value);
                      setSelectedIndex(idx);
                      setSelectedSlot(slots[idx]);
                    }}
                  >
                    <option value="">-- Seleccione un horario --</option>
                    {slots.map((s, idx) => (
                      <option
                        key={idx}
                        value={idx}
                        disabled={s.status !== "free"}
                      >
                        {s.start} - {s.end} {s.status !== "free" ? `(${s.status})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {selectedSlot && (
                <div className="mt-3 rp-section">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-600">Horario seleccionado</div>
                      <div className="font-medium">{selectedSlot.start} — {selectedSlot.end}</div>
                    </div>
                    <div className="rp-badge">Libre</div>
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-400" />
                  <input
                    type="text"
                    value={clienteNombre}
                    onChange={(e) => setClienteNombre(e.target.value)}
                    className="rp-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Teléfono</label>
                <div className="flex items-center gap-2">
                  <FaPhone className="text-gray-400" />
                  <input
                    type="text"
                    value={clienteTelefono}
                    onChange={(e) => setClienteTelefono(e.target.value)}
                    className="rp-input"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Método de pago</label>
                <div className="flex items-center gap-2">
                  <FaMoneyBillWave className="text-gray-400" />
                  <input
                    type="text"
                    readOnly
                    value="Efectivo"
                    className="rp-input bg-gray-50"
                  />
                </div>
              </div>

              <div className="flex justify-end mt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rp-btn"
                >
                  {submitting ? "Reservando..." : "Reservar (Efectivo)"}
                </button>
              </div>
            </form>
          </div>

          <aside>
            <div className="rp-section">
              <h4 className="font-semibold mb-2">Detalles de la cancha</h4>
              <p className="text-sm text-gray-700 mb-2"><FaMapMarkerAlt className="inline mr-2 text-gray-400" />{cancha.direccion}</p>
              <p className="text-sm text-gray-700 mb-2"><FaClock className="inline mr-2 text-gray-400" />Horario base: {cancha.horarios ? "Ver horarios" : "No disponible"}</p>
              {cancha.precio && <p className="text-lg font-bold text-green-600 mt-2">${Number(cancha.precio).toLocaleString()} COP</p>}
              <div className="mt-3 rp-meta">Por favor llega 10-15 minutos antes del inicio.</div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default ReservaPage;
