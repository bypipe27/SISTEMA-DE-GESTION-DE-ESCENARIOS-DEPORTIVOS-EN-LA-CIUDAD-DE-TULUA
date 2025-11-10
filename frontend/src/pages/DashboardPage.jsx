import React, { useEffect, useMemo, useState } from "react";
import { FaFutbol, FaSearch, FaSyncAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function DashboardPage({
  usuarioProp,
  onLogout,
  onModificarTelefono,
  onCambiarPass,
  onAgregarPago,
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const usuario =
    usuarioProp ||
    (() => {
      try {
        return JSON.parse(localStorage.getItem("usuario") || "null");
      } catch {
        return null;
      }
    })();

  // filtros y estado de ejemplo
  const [q, setQ] = useState("");
  const [tipoFiltro, setTipoFiltro] = useState("");
  const [soloDisponibles, setSoloDisponibles] = useState(false);
  const [canchas, setCanchas] = useState([]);
  const [fecha, setFecha] = useState(""); // yyyy-mm-dd seleccionada

<<<<<<< HEAD
useEffect(() => {
  fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/canchas`)
    .then(res => res.json())
    .then(data => {
      console.log("✅ Canchas recibidas:", data);
      setCanchas(data);
    })
    .catch(err => console.error("❌ Error al cargar canchas:", err));
}, []);
=======
  useEffect(() => {
    fetch("http://localhost:5000/api/canchas")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Canchas recibidas:", data);
        setCanchas(data);
      })
      .catch((err) => console.error("❌ Error al cargar canchas:", err));
  }, []);
>>>>>>> origin/deploy

  const tipos = useMemo(() => {
    return Array.from(new Set(canchas.map((c) => c.tipo)));
  }, [canchas]);

  // const estaDisponibleEnFecha = (c, fechaIso) => {
  //   if (!fechaIso) return Boolean(c.disponible);

  //   try {
  //     const fechaObj = new Date(fechaIso + "T00:00:00");
  //     const dow = fechaObj.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado

  //     // Verifica si el día está cerrado
  //     if ((c.cerrados_dias || []).includes(dow)) return false;

  //     // Verifica si la fecha exacta está cerrada
  //     if ((c.cerrados_fechas || []).includes(fechaIso)) return false;

  //     return Boolean(c.disponible);
  //   } catch (err) {
  //     console.error("Error evaluando disponibilidad:", err);
  //     return Boolean(c.disponible);
  //   }
  // };
  const estaDisponibleEnFecha = (c, fechaIso) => {
    if (!fechaIso) return Boolean(c.disponible);

    try {
      // Divide la fecha yyyy-mm-dd y crea el objeto Date en local
      const [year, month, day] = fechaIso.split("-");
      const fechaObj = new Date(Number(year), Number(month) - 1, Number(day));
      const dow = fechaObj.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado

      // Verifica si el día está cerrado
      if ((c.cerrados_dias || []).includes(dow)) return false;

      // Verifica si la fecha exacta está cerrada
      if ((c.cerrados_fechas || []).includes(fechaIso)) return false;

      return Boolean(c.disponible);
    } catch (err) {
      console.error("Error evaluando disponibilidad:", err);
      return Boolean(c.disponible);
    }
  };

  // NUEVA: lista filtrada de resultados usada en el render
  const resultados = useMemo(() => {
    return canchas.filter((c) => {
      if (soloDisponibles && !estaDisponibleEnFecha(c, fecha)) return false;
      if (tipoFiltro && c.tipo !== tipoFiltro) return false;
      if (!q) return true;
      const term = q.toLowerCase();
      return (
        (c.nombre || "").toLowerCase().includes(term) ||
        (c.tipo || "").toLowerCase().includes(term)
      );
    });
  }, [canchas, q, tipoFiltro, soloDisponibles, fecha]);

  const handleReservar = (cancha) => {
    if (!fecha) {
      alert("Seleccione una fecha antes de reservar.");
      return;
    }
    // navega a /reservar/:id y pasa la cancha + fecha en state
    navigate(`/reservar/${cancha.id}`, { state: { cancha, fecha } });
  };

  const handleVerDetalles = (cancha) => {
    // Lleva a la página de detalles con el id de la cancha
    navigate(`/cancha/${cancha.id}`, { state: cancha });
  };

  const handleLogout = () => {
    if (onLogout) return onLogout();
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* estilos locales mínimos para look minimalista y armónico */}
      <style>{`
      .db-card { background: linear-gradient(180deg, #ffffff, #fbfbfb); border: 1px solid rgba(15,23,42,0.04); border-radius: 12px; box-shadow: 0 8px 30px rgba(2,6,23,0.04); }
      .db-aside { position: sticky; top: 28px; }
      .db-btn { transition: all .12s ease; }
      .db-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(2,6,23,0.04); }
      .db-list-item { transition: transform .08s ease, box-shadow .12s ease; }
      .db-list-item:hover { transform: translateY(-3px); box-shadow: 0 10px 30px rgba(2,6,23,0.06); }
    `}</style>

      {/* NAVBAR (misma funcionalidad, look más limpio) */}
      <nav className="w-full py-3 px-6 flex justify-between items-center bg-white/90 backdrop-blur-md fixed top-0 z-50 shadow-sm border-b">
        <h1 className="text-lg md:text-xl font-semibold flex items-center gap-3 text-gray-900">
          <FaFutbol className="text-green-600 text-2xl" />
          <span className="hidden md:inline">
            SISTEMA DE GESTIÓN DE ESCENARIOS DEPORTIVOS
          </span>
          <span className="md:hidden">Tulúa Deportes</span>
        </h1>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
            <FaSearch className="text-gray-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar nombre o tipo..."
              className="bg-transparent outline-none text-sm"
            />
          </div>

          <button
            onClick={() =>
              fetch("http://localhost:5000/api/canchas").then(() =>
                fetch("http://localhost:5000/api/canchas")
              )
            }
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1 bg-white border rounded-lg text-sm text-gray-700 db-btn"
          >
            <FaSyncAlt /> Refrescar
          </button>

          <div className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 bg-white/50 hover:bg-gray-100 px-3 py-1 rounded text-sm text-gray-800"
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
      <div className="max-w-6xl mx-auto px-4 pt-28 pb-12 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* SIDEBAR FILTROS */}
        <aside className="md:col-span-3">
          <div className="db-aside">
            <div className="db-card p-4 db-aside">
              <h4 className="font-semibold mb-3 text-gray-900">Filtros</h4>

              <label className="block text-sm mb-1">Buscar</label>
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Nombre o tipo..."
                className="w-full border rounded px-3 py-2 mb-3 text-sm bg-white"
              />

              <label className="block text-sm mb-1">Tipo</label>
              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-3 text-sm bg-white"
              >
                <option value="">Todos</option>
                {tipos.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>

              <label className="block text-sm mb-1">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                min={(() => {
                  const hoy = new Date();
                  const yyyy = hoy.getFullYear();
                  const mm = String(hoy.getMonth() + 1).padStart(2, "0");
                  const dd = String(hoy.getDate()).padStart(2, "0");
                  return `${yyyy}-${mm}-${dd}`;
                })()} // ✅ Fecha mínima local
                className="w-full border rounded px-3 py-2 mb-3 text-sm bg-white"
              />

              <div className="flex items-center gap-2 mb-3">
                <input
                  id="disp"
                  type="checkbox"
                  checked={soloDisponibles}
                  onChange={() => setSoloDisponibles((v) => !v)}
                />
                <label htmlFor="disp" className="text-sm">
                  Solo disponibles
                </label>
              </div>

              <button
                onClick={() => {
                  setQ("");
                  setTipoFiltro("");
                  setSoloDisponibles(false);
                  setFecha("");
                }}
                className="w-full bg-gray-100 text-gray-800 py-2 rounded text-sm db-btn"
              >
                Limpiar filtros
              </button>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="md:col-span-9">
          <div className="db-card p-6 min-h-[60vh]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Canchas</h2>
              <div className="text-sm text-gray-500">
                {resultados.length} resultado
                {resultados.length !== 1 ? "s" : ""}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {resultados.map((c) => {
                const disponibleHoy = estaDisponibleEnFecha(c, fecha);
                return (
                  <div
                    key={c.id}
                    className="border rounded-lg p-4 flex flex-col justify-between w-full bg-white db-list-item"
                  >
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900">
                        {c.nombre}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {c.tipo} • Capacidad: {c.capacidad}
                      </p>
                      <p className="mt-2 text-gray-700">
                        Precio:{" "}
                        <span className="font-medium">
                          COP {c.precio.toLocaleString()}
                        </span>
                      </p>
                      <p className="text-sm mt-2 text-gray-600">
                        {c.descripcion}
                      </p>

                      {fecha && (
                        <p className="mt-1 text-sm">
                          Estado para{" "}
                          <span className="font-medium">{fecha}</span>:{" "}
                          <span
                            className={
                              disponibleHoy ? "text-green-600" : "text-red-600"
                            }
                          >
                            {disponibleHoy ? "Disponible" : "Ocupada"}
                          </span>
                        </p>
                      )}
                    </div>

                    <div className="mt-4 flex justify-between items-center">
                      <span
                        className={`text-sm ${
                          disponibleHoy ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {disponibleHoy ? "Disponible" : "No disponible"}
                      </span>
                      <div className="flex gap-2">
                        <button
                          disabled={!disponibleHoy}
                          onClick={() => handleReservar(c)}
                          className={`px-3 py-1 rounded-lg db-btn ${
                            disponibleHoy
                              ? "bg-green-600 text-white"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          Reservar
                        </button>

                        <button
                          onClick={() => handleVerDetalles(c)}
                          className="px-3 py-1 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200"
                        >
                          Ver detalles
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
              {resultados.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No se encontraron canchas que coincidan con los filtros.
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default DashboardPage;
