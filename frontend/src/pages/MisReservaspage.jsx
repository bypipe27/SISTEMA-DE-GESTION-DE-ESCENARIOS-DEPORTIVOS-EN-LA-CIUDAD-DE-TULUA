import React, { useEffect, useState } from "react";
import { FaCalendarAlt, FaClock, FaFutbol, FaTimesCircle } from "react-icons/fa";
import { format, isBefore, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

function formatHora(hora) {
  return hora ? hora.slice(0, 5) : "";
}

function MisReservasPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!usuario) return;
    fetch(`http://localhost:5000/api/reservas/usuario/${usuario.id}`)
      .then(res => res.json())
      .then(data => setReservas(data))
      .catch(err => console.error("Error al cargar reservas:", err))
      .finally(() => setLoading(false));
  }, [usuario]);

  const cancelarReserva = async (id) => {
    if (!window.confirm("¿Seguro que deseas cancelar esta reserva?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/reservas/cancelar/${id}`, {
        method: "PUT",
      });
      const data = await res.json();
      if (res.ok) {
        alert("Reserva cancelada exitosamente.");
        setReservas(prev => prev.map(r => r.id === id ? { ...r, estado: "cancelada" } : r));
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error al cancelar la reserva.");
    }
  };

   const getEstado = (reserva) => {
    const fechaHora = parseISO(`${reserva.fecha}T${reserva.hora_fin}`);
    if (isBefore(fechaHora, new Date())) return "Finalizada";
    return reserva.estado === "cancelada" ? "Cancelada" : "Activa";
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="w-full py-4 px-6 flex justify-between items-center bg-green-900/80 backdrop-blur-md fixed top-0 z-50 shadow-lg text-white">
        <h1 className="text-lg md:text-2xl font-bold flex items-center gap-3">
          <FaFutbol className="text-green-300 text-2xl md:text-3xl" />
          <span className="hidden md:inline">
            SISTEMA DE GESTIÓN DE ESCENARIOS DEPORTIVOS
          </span>
          <span className="md:hidden">Tulúa Deportes</span>
        </h1>
        <div className="flex items-center gap-4">
          <span className="text-sm md:text-base">
            Hola, <span className="font-medium">{usuario?.nombre || "Usuario"}</span>
          </span>
          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1 rounded text-white text-sm"
            >
              Opciones <span className="text-xs">▾</span>
            </button>
            {open && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white text-gray-900 rounded-md shadow-lg overflow-hidden"
                onMouseLeave={() => setOpen(false)}
              >
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => alert("Agregar medio de pago (simulado).")}
                >
                  ➕ Agregar medio de pago
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setOpen(false);
                    navigate("/mis-reservas");
                  }}
                >
                  📋 Ver reservas
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    setOpen(false);
                    navigate("/dashboard");
                  }}
                >
                  🏠 Ir al Dashboard
                </button>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => alert("Cambiar contraseña (simulado).")}
                >
                  🔒 Cambiar contraseña
                </button>
                <hr />
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                  onClick={handleLogout}
                >
                  Cerrar sesión
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto pt-28 px-4 pb-10">
        <h1 className="text-3xl font-bold text-center text-green-800 mb-8">
          Mis Reservas
        </h1>
        {loading ? (
          <div className="text-center py-12 text-gray-700">Cargando...</div>
        ) : reservas.length === 0 ? (
          <div className="text-center text-gray-500">No tienes reservas registradas.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {reservas.map((r) => {
              const estado = getEstado(r);
              const fechaStr = format(parseISO(r.fecha), "PPP", { locale: es });
              const jugado = estado === "Finalizada";
              return (
                <div
                  key={r.id}
                  className={`p-5 rounded-2xl shadow-md transition ${
                    estado === "Cancelada"
                      ? "bg-gray-200"
                      : jugado
                      ? "bg-green-100"
                      : "bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-semibold text-green-800 flex items-center gap-2">
                      <FaFutbol /> {r.cancha_nombre}
                    </h3>
                    <span
                      className={`text-sm font-medium ${
                        estado === "Cancelada"
                          ? "text-red-600"
                          : jugado
                          ? "text-green-700"
                          : "text-blue-600"
                      }`}
                    >
                      {estado}
                    </span>
                  </div>
                  <div className="text-gray-700 space-y-1">
                    <p className="flex items-center gap-2">
                      <FaCalendarAlt className="text-green-700" /> {fechaStr}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaClock className="text-green-700" /> {formatHora(r.inicio)} - {formatHora(r.fin)}
                    </p>
                    <p className="text-sm">Método de pago: {r.metodo_pago}</p>
                  </div>
                  {!jugado && estado === "Activa" && (
                    <button
                      onClick={() => cancelarReserva(r.id)}
                      className="mt-4 flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      <FaTimesCircle /> Cancelar reserva
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MisReservasPage;