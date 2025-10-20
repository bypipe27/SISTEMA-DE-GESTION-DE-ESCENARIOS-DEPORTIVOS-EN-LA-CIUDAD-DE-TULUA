// ...existing code...
import React, { useEffect, useState } from "react";
import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

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
  const API_BASE = "http://localhost:5000";

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
      const body = {
        cancha_id: Number(id),
        date,
        start: selectedSlot.start,
        end: selectedSlot.end,
        cliente_nombre: clienteNombre,
        cliente_telefono: clienteTelefono,
        metodo_pago: "efectivo",
      };
      const res = await fetch(`${API_BASE}/api/reservas`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.status === 201) {
        alert("✅ Reserva confirmada");
        navigate("/dashboard");
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
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-green-700"
        >
          <FaArrowLeft /> Volver
        </button>

        <h2 className="text-2xl font-bold mt-4">{cancha.nombre}</h2>
        <p className="text-sm text-gray-600">{cancha.descripcion}</p>

        <div className="mt-4">
          <label className="block text-sm">Fecha</label>
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
            className={`border p-2 rounded w-full ${
              initialDate ? "bg-gray-100 cursor-not-allowed" : ""
            }`}
            min={new Date().toISOString().split("T")[0]}
          />
        </div>

        <div className="mt-4">
            <h3 className="font-semibold">Horarios</h3>
            <div className="mt-2">
              {slots.length === 0 ? (
                <div className="text-gray-500">Seleccione una fecha</div>
              ) : (
                <select
                  className="w-full border p-2 rounded"
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
          </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-sm">Nombre</label>
            <input
              type="text"
              value={clienteNombre}
              onChange={(e) => setClienteNombre(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>
          <div>
            <label className="block text-sm">Teléfono</label>
            <input
              type="text"
              value={clienteTelefono}
              onChange={(e) => setClienteTelefono(e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block text-sm">Método de pago</label>
            <input
              type="text"
              readOnly
              value="Efectivo"
              className="w-full border p-2 rounded bg-gray-50"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="bg-green-600 text-white px-4 py-2 rounded"
            >
              {submitting ? "Reservando..." : "Reservar (Efectivo)"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ReservaPage;
// ...existing code...
// import React, { useEffect, useState } from "react";
// import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
// import { FaArrowLeft } from "react-icons/fa";

// function ReservaPage() {
//   const { id } = useParams();
//   const location = useLocation();
//   const navigate = useNavigate();

//   // location.state puede ser { cancha, fecha } o directamente la cancha (compatibilidad)
//   const locState = location.state || null;
//   const initialCancha = locState ? (locState.cancha || locState) : null;
//   const initialDate = locState ? (locState.fecha || locState.date || "") : "";

//   const [cancha, setCancha] = useState(initialCancha);
//   const [loading, setLoading] = useState(!initialCancha);
//   const [date, setDate] = useState(initialDate);
//   const [slots, setSlots] = useState([]);
//   const [selectedSlot, setSelectedSlot] = useState(null);
//   const [selectedIndex, setSelectedIndex] = useState(null);
//   const [clienteNombre, setClienteNombre] = useState("");
//   const [clienteTelefono, setClienteTelefono] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   // NUEVO: estado para indicar carga de horarios
//   const [loadingSlots, setLoadingSlots] = useState(false);

//   // 🔹 Base del backend sin proxy
//   const API_BASE = "http://localhost:5000";

//   useEffect(() => {
//     if (!cancha) {
//       (async () => {
//         try {
//           // pedir datos de la cancha (no availability)
//           const res = await fetch(`${API_BASE}/api/canchas/${id}`);
//           if (res.ok) {
//             const data = await res.json();
//             setCancha(data);
//           } else {
//             console.error("Error cargando cancha:", res.status);
//           }
//         } catch (e) {
//           console.error("Error de conexión:", e);
//         } finally {
//           setLoading(false);
//         }
//       })();
//     } else {
//       setLoading(false);
//     }
//   }, [id, cancha]);

//   // 🔹 Función para traer disponibilidad de horarios
//   async function fetchSlots(d) {
//     if (!d) return;
//     try {
//       setLoadingSlots(true);
//       const res = await fetch(
//         `${API_BASE}/api/reservas/cancha/${id}/availability?date=${d}`
//       );

//       if (!res.ok) throw new Error(`Error ${res.status}`);
//       const data = await res.json();
//       // esperar que backend devuelva data.slots (array con {start,end,status})
//       setSlots(data.slots || []);
//       setSelectedSlot(null);
//       setSelectedIndex(null);
//     } catch (err) {
//       console.error("Error al obtener horarios:", err);
//       setSlots([]);
//     } finally {
//       setLoadingSlots(false);
//     }
//   }

//   // Si la página se abrió con fecha desde el Dashboard, cargar slots automáticamente
//   // (Ahora escucha solo `date` para forzar la carga aun cuando `cancha` venga por separado)
//   useEffect(() => {
//     if (date) {
//       fetchSlots(date);
//     }
//   }, [date]);

//   async function handleSubmit(e) {
//     e.preventDefault();
//     if (!selectedSlot) return alert("Seleccione un horario");
//     if (!clienteNombre) return alert("Nombre requerido");
//     setSubmitting(true);
//     try {
//       const body = {
//         cancha_id: Number(id),
//         date,
//         start: selectedSlot.start,
//         end: selectedSlot.end,
//         cliente_nombre: clienteNombre,
//         cliente_telefono: clienteTelefono,
//         metodo_pago: "efectivo",
//       };
//       const res = await fetch(`${API_BASE}/api/reservas`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(body),
//       });
//       if (res.status === 201) {
//         alert("✅ Reserva confirmada");
//         navigate("/dashboard");
//       } else {
//         const err = await res.json().catch(() => ({}));
//         alert("Error: " + (err.error || "No disponible"));
//         fetchSlots(date); // refrescar horarios
//       }
//     } catch (err) {
//       console.error("Error creando reserva:", err);
//       alert("Error al crear la reserva");
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   if (loading)
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         Cargando...
//       </div>
//     );
//   if (!cancha)
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         Cancha no encontrada
//       </div>
//     );

//   return (
//     <div className="min-h-screen p-6 bg-gray-100">
//       <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
//         <button
//           onClick={() => navigate("/dashboard")}
//           className="flex items-center gap-2 text-green-700"
//         >
//           <FaArrowLeft /> Volver
//         </button>

//         <h2 className="text-2xl font-bold mt-4">{cancha.nombre}</h2>
//         <p className="text-sm text-gray-600">{cancha.descripcion}</p>

//         <div className="mt-4">
//           <label className="block text-sm">Fecha</label>
//           <input
//             type="date"
//             value={date}
//             onChange={(e) => {
//               if (!initialDate) {
//                 setDate(e.target.value);
//                 // fetchSlots se ejecuta por el useEffect que escucha `date`
//               }
//             }}
//             readOnly={Boolean(initialDate)}
//             disabled={Boolean(initialDate)}
//             className={`border p-2 rounded w-full ${
//               initialDate ? "bg-gray-100 cursor-not-allowed" : ""
//             }`}
//             min={new Date().toISOString().split("T")[0]}
//           />
//         </div>

//         <div className="mt-4">
//           <h3 className="font-semibold">Horarios</h3>
//           <div className="mt-2">
//             {loadingSlots ? (
//               <div className="text-gray-500">Cargando horarios...</div>
//             ) : date && slots.length === 0 ? (
//               <div className="text-gray-500">
//                 No hay horarios disponibles para esta fecha
//               </div>
//             ) : slots.length === 0 ? (
//               <div className="text-gray-500">Seleccione una fecha</div>
//             ) : (
//               <select
//                 className="w-full border p-2 rounded"
//                 value={selectedIndex ?? ""}
//                 onChange={(e) => {
//                   const idx = Number(e.target.value);
//                   setSelectedIndex(idx);
//                   setSelectedSlot(slots[idx]);
//                 }}
//               >
//                 <option value="">-- Seleccione un horario --</option>
//                 {slots.map((s, idx) => (
//                   <option key={idx} value={idx} disabled={s.status !== "free"}>
//                     {s.start} - {s.end} {s.status !== "free" ? `(${s.status})` : ""}
//                   </option>
//                 ))}
//               </select>
//             )}
//           </div>
//         </div>

//         <form onSubmit={handleSubmit} className="mt-4 space-y-3">
//           <div>
//             <label className="block text-sm">Nombre</label>
//             <input
//               type="text"
//               value={clienteNombre}
//               onChange={(e) => setClienteNombre(e.target.value)}
//               className="w-full border p-2 rounded"
//             />
//           </div>
//           <div>
//             <label className="block text-sm">Teléfono</label>
//             <input
//               type="text"
//               value={clienteTelefono}
//               onChange={(e) => setClienteTelefono(e.target.value)}
//               className="w-full border p-2 rounded"
//             />
//           </div>

//           <div>
//             <label className="block text-sm">Método de pago</label>
//             <input
//               type="text"
//               readOnly
//               value="Efectivo"
//               className="w-full border p-2 rounded bg-gray-50"
//             />
//           </div>

//           <div className="flex justify-end">
//             <button
//               type="submit"
//               disabled={submitting}
//               className="bg-green-600 text-white px-4 py-2 rounded"
//             >
//               {submitting ? "Reservando..." : "Reservar (Efectivo)"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default ReservaPage;