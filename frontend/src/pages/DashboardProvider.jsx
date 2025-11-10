import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FaFutbol } from "react-icons/fa";
import NavBarProvider from "../components/NavBarProvider";


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
      <style>{`
        /* estilos locales minimalistas (no tocan tipografía global ni lógica) */
        .pd-topbar { background: linear-gradient(90deg,#059669,#047857); border-bottom: 1px solid rgba(0,0,0,0.06); }
        .pd-container { max-width:1100px; margin:0 auto; padding:1rem; }
        .pd-grid { display:grid; gap:1rem; grid-template-columns:1fr; }
        @media(min-width:640px){ .pd-grid { grid-template-columns: repeat(3, 1fr); } }
        .pd-card { background:#fff; border-radius:12px; padding:1rem; border:1px solid rgba(2,6,23,0.04); box-shadow:0 10px 30px rgba(2,6,23,0.04); }
        .pd-kpi { text-align:center; padding:1rem; border-radius:10px; background:linear-gradient(180deg,#ffffff,#fbfbfb); }
        .pd-list-item { background:#fff; border-radius:10px; padding:12px; border:1px solid rgba(2,6,23,0.04); box-shadow:none; display:flex; justify-content:space-between; gap:12px; align-items:flex-start; }
        .pd-btn { padding:8px 12px; border-radius:10px; transition:transform .08s ease; }
        .pd-btn.primary { background:#10B981; color:#fff; border:none; }
      `}</style>

      <NavBarProvider brand={"SISTEMA DE GESTION DE ESCENARIOS DEPORTIVOS"} className={"shadow z-40"} />

  <div className="p-6 pd-container" style={{ paddingTop: '6.5rem' }}>
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Panel de proveedor</h1>
            <p className="text-sm text-gray-600 mt-1">Resumen y accesos rápidos</p>
          </div>
        </header>

        <div className="pd-grid mb-6">
          <div className="pd-card pd-kpi">
            <h3 className="text-sm text-gray-500">Gestión de canchas</h3>
            <p className="mt-2 text-lg font-bold text-gray-900">Agregar, editar y listar</p>
            <div className="mt-4">
              <button onClick={() => navigate("/canchas-manager")} className="pd-btn primary">
                Ir a mis canchas
              </button>
            </div>
          </div>

          <div className="pd-card pd-kpi">
            <h3 className="text-sm text-gray-500">Reservas</h3>
            <p className="mt-2 text-lg font-bold text-gray-900">Ver y gestionar reservas</p>
            <div className="mt-4">
              <button onClick={() => navigate("/reservas-provider")} className="pd-btn primary">
                Ir a reservas
              </button>
            </div>
          </div>

          <div className="pd-card pd-kpi">
            <h3 className="text-sm text-gray-500">Reportes</h3>
            <p className="mt-2 text-lg font-bold text-gray-900">Estadísticas básicas</p>
            <div className="mt-4">
              <button onClick={() => navigate("/reportes-provider")} className="pd-btn primary">
                Ver reportes
              </button>
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-lg font-semibold mb-3">Mis canchas</h2>

          {loading ? (
            <p className="text-gray-600">Cargando...</p>
          ) : canchas.length === 0 ? (
            <div className="pd-card">
              <p className="text-gray-700">No tienes canchas registradas todavía.</p>
              <button onClick={() => navigate("/register-cancha")} className="mt-3 pd-btn primary">
                Registrar cancha
              </button>
            </div>
          ) : (
            <ul className="space-y-4">
              {canchas.map((c) => (
                <li key={c.id} className="pd-list-item">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{c.nombre}</h3>
                    <p className="text-sm text-gray-600">{c.tipo} — Capacidad: {c.capacidad} — Precio: {c.precio}</p>
                    <p className="text-sm mt-2 text-gray-700">{c.descripcion}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={() => navigate(`/cancha/${c.id}`)} className="pd-btn border rounded-md">
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