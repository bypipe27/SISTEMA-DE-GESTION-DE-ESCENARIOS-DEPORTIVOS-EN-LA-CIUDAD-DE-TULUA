import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaFutbol } from "react-icons/fa";


function ProviderDashboard() {
  const navigate = useNavigate();
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);

  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null");
    } catch {
      return null;
    }
  }, []);
  const usuarioId = usuario?.id ?? null;

  useEffect(() => {
    if (!usuarioId) {
      navigate("/login");
      return;
    }

    const controller = new AbortController();
    let mounted = true;

    const fetchCanchas = async () => {
      setLoading(true);
      try {
  const res = await fetch(`${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/canchas`, { signal: controller.signal });
        if (!res.ok) throw new Error("Error al cargar canchas");
        const data = await res.json();
        const mine = Array.isArray(data)
          ? data.filter((c) => Number(c.propietario_id) === Number(usuarioId))
          : [];
        if (!mounted) return;
        setCanchas(mine);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error al cargar canchas:", err);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchCanchas();

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [navigate, usuarioId]);

  return (
    <>
      {/* Barra superior simple (reemplaza NavBarProvider): título + acciones */}
      <div className="fixed top-0 left-0 right-0 bg-green-600 border-b shadow z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold flex items-center gap-6">
                    <FaFutbol className="text-green-300 text-3xl animate-pulse" />
                    <span className="text-white">SISTEMA DE GESTION DE ESCENARIOS DEPORTIVOS</span>
                  </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("usuario");
                navigate("/login");
              }}
              className="px-3 py-2 border border-white text-white text-3x rounded hover:text-white transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal con padding-top para no quedar oculto por la barra fija */}
      <div className="p-6 max-w-6xl mx-auto pt-24">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Panel de proveedor</h1>

        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="p-6 border rounded shadow">
            <h2 className="text-xl font-semibold mb-3">Gestión de canchas</h2>
            <p className="text-sm text-gray-600 mb-4">Agregar, editar y listar tus canchas.</p>
            <button onClick={() => navigate("/canchas-manager")} className="px-4 py-2 bg-blue-600 text-white rounded">
              Ir a mis canchas
            </button>
          </div>

          <div className="p-6 border rounded shadow">
            <h2 className="text-xl font-semibold mb-3">Reservas</h2>
            <p className="text-sm text-gray-600 mb-4">Ver y gestionar las reservas de tus canchas.</p>
            <button onClick={() => navigate("/reservas-provider")} className="px-4 py-2 bg-blue-600 text-white rounded">
              Ir a reservas
            </button>
          </div>

          <div className="p-6 border rounded shadow">
            <h2 className="text-xl font-semibold mb-3">Reportes</h2>
            <p className="text-sm text-gray-600 mb-4">Estadísticas básicas de tus canchas y reservas.</p>
            <button onClick={() => navigate("/reportes-provider")} className="px-4 py-2 bg-blue-600 text-white rounded">
              Ver reportes
            </button>
          </div>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-3">Mis canchas</h2>

          {loading ? (
            <p>Cargando...</p>
          ) : canchas.length === 0 ? (
            <div>
              <p>No tienes canchas registradas todavía.</p>
              <button onClick={() => navigate("/register-cancha")} className="px-3 py-2 bg-blue-600 text-white rounded mt-2">
                Registrar cancha
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {canchas.map((c) => (
                <li key={c.id} className="p-4 border rounded flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{c.nombre}</h3>
                    <p className="text-sm text-gray-600">{c.tipo} — Capacidad: {c.capacidad} — Precio: {c.precio}</p>
                    <p className="text-sm mt-2">{c.descripcion}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => navigate(`/cancha/${c.id}`)} className="px-3 py-1 border rounded">
                      Ver
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}

export default ProviderDashboard;