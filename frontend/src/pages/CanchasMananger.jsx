import React, { useEffect, useState,useMemo } from "react";
import { useNavigate } from "react-router-dom"; 

function CanchasManager() {
  const navigate = useNavigate();
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    tipo: "",
    sede: "",
    capacidad: "",
    precio: "",
    descripcion: "",
    disponible: true,
    map_iframe: "",
    cerrados_dias: [],
    cerrados_fechas: [],
    horarios: {},
    direccion: "",
    propietario_id: null
  });
  const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
function getHeaders() {
  const token = localStorage.getItem("token");
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}


 const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("usuario") || "null"); } catch { return null; }
  }, []);
  const usuarioId = usuario?.id ?? null;

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;

    // pasar el controller entero; la función fetchCanchas extrae signal si existe
    fetchCanchas(controller);

    return () => {
      mounted = false;
      controller.abort();
    };
  }, [navigate, usuarioId]);


  async function fetchCanchas(signal, mounted = true) {
    setLoading(true);

    const buildFetchOptions = (extra = {}) => {
      const opts = { headers: getHeaders(), cache: "no-store", ...extra };
      // incluir signal solo si es AbortSignal válido
      if (signal && typeof signal === "object" && typeof signal.aborted === "boolean") {
        opts.signal = signal;
      }
      return opts;
    };

    try {
      const urlProvider = `${BACKEND}/api/canchas/provider`;
      console.log("-> request a:", urlProvider);
      const res = await fetch(urlProvider, buildFetchOptions());
      console.log("fetch /api/canchas/provider ->", res.status);

      if (res.status === 304) {
        // retry once
        const retry = await fetch(urlProvider, buildFetchOptions());
        if (retry.ok) {
          const payload = await retry.json();
          if (mounted) setCanchas(Array.isArray(payload) ? payload : []);
          setError("");
          return;
        }
      }

      if (!res.ok) {
        // auth error -> fallback al endpoint público (igual que ProviderDashboard)
        if (res.status === 401 || res.status === 403) {
          console.warn("Provider endpoint no autorizado, intentando /api/canchas público");
          const pub = await fetch(`${BACKEND}/api/canchas`, buildFetchOptions());
          console.log("/api/canchas (público) ->", pub.status);
          if (!pub.ok) throw new Error(`Error ${pub.status} al listar públicamente`);
          const all = await pub.json();
          const mine = Array.isArray(all)
            ? (usuarioId ? all.filter(c => Number(c.propietario_id) === Number(usuarioId)) : all)
            : [];
          if (mounted) setCanchas(mine);
          setError("");
          return;
        }

        const text = await res.text();
        let data = null;
        try { data = JSON.parse(text); } catch {}
        if (mounted) {
          setError((data && (data.error || data.message)) || `Error ${res.status}`);
          setCanchas([]);
        }
        return;
      }

      // OK
      const data = await res.json();
      if (mounted) {
        setCanchas(Array.isArray(data) ? data : []);
        setError("");
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      console.error("fetchCanchas error:", err);
      if (mounted) {
        setError("No se pudo conectar al servidor o la respuesta no es válida");
        setCanchas([]);
      }
    } finally {
      if (mounted) setLoading(false);
    }
  }

  function abrirNuevo() {
    setEditing(null);
    setForm({
      nombre: "",
      tipo: "",
      sede: "",
      capacidad: "",
      precio: "",
      descripcion: "",
      disponible: true,
      map_iframe: "",
      cerrados_dias: [],
      cerrados_fechas: [],
      horarios: {},
      direccion: "",
      propietario_id: null
    });
    setOpenForm(true);
  }

  function abrirEdicion(c) {
    setEditing(c);
    setForm({
      nombre: c.nombre || "",
      tipo: c.tipo || "",
      sede: c.sede || "",
      capacidad: c.capacidad ?? "",
      precio: c.precio ?? "",
      descripcion: c.descripcion || "",
      disponible: typeof c.disponible === "boolean" ? c.disponible : true,
      map_iframe: c.map_iframe || "",
      cerrados_dias: c.cerrados_dias || c.cerradosdias || [],
      cerrados_fechas: c.cerrados_fechas || c.cerradosfechas || [],
      horarios: c.horarios || {},
      direccion: c.direccion || "",
      propietario_id: c.propietario_id || null,
    });
    setOpenForm(true);
  }

  async function guardar() {
    // validaciones mínimas
    if (!form.nombre || !form.tipo) {
      setError("Nombre y tipo son obligatorios");
      return;
    }
    setError("");
    try {
      const url = editing ? `/api/admin/canchas/${editing.id}` : "/api/admin/canchas";
      const method = editing ? "PUT" : "POST";
      const payload = { ...form };
      const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(payload) });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = null; }
      if (!res.ok) {
        setError((data && (data.error||data.message)) || `Error ${res.status}`);
        return;
      }
      // actualizar listado local
      const cancha = (data && (data.cancha || data)) || null;
      if (cancha) {
        if (editing) setCanchas(prev => prev.map(p => p.id === cancha.id ? cancha : p));
        else setCanchas(prev => [cancha, ...prev]);
      } else {
        fetchCanchas();
      }
      setOpenForm(false);
    } catch (err) {
      console.error(err);
      setError("Error al guardar cancha");
    }
  }

  async function eliminar(cancha) {
    if (!confirm(`Eliminar cancha "${cancha.nombre}"?`)) return;
    try {
      const res = await fetch(`/api/admin/canchas/${cancha.id}`, { method: "DELETE", headers: getHeaders() });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch {}
      if (!res.ok) {
        alert((data && (data.error||data.message)) || `Error ${res.status}`);
        return;
      }
      setCanchas(prev => prev.filter(c => c.id !== cancha.id));
    } catch (err) {
      console.error(err);
      alert("Error eliminando cancha");
    }
  }

  // helpers de UI para editar horarios JSON (texto simple)
  function handleHorariosTextChange(e) {
    try {
      const parsed = JSON.parse(e.target.value || "{}");
      setForm(prev => ({ ...prev, horarios: parsed }));
      setError("");
    } catch (err) {
      setError("Formato JSON inválido en horarios");
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestión de canchas</h1>
        <div className="flex gap-2">
          <button onClick={abrirNuevo} className="px-4 py-2 bg-green-600 text-white rounded">Agregar cancha</button>
          <button onClick={fetchCanchas} className="px-4 py-2 border rounded">Refrescar</button>
        </div>
      </header>

      {loading ? <p>Cargando...</p> : (
        <>
          {error && <p className="text-red-600">{error}</p>}
          <ul className="space-y-4">
            {canchas.map(c => (
              <li key={c.id} className="p-4 border rounded flex justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{c.nombre}</h3>
                  <p className="text-sm text-gray-600">{c.tipo} — {c.sede || c.direccion}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => abrirEdicion(c)} className="px-3 py-1 border rounded">Editar</button>
                  <button onClick={() => eliminar(c)} className="px-3 py-1 bg-red-600 text-white rounded">Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {openForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded max-w-2xl w-full">
            <h2 className="text-xl font-semibold mb-3">{editing ? "Editar cancha" : "Agregar cancha"}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="px-3 py-2 border rounded" />
              <input placeholder="Tipo" value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className="px-3 py-2 border rounded" />
              <input placeholder="Sede" value={form.sede} onChange={e => setForm({...form, sede: e.target.value})} className="px-3 py-2 border rounded" />
              <input placeholder="Capacidad" value={form.capacidad} onChange={e => setForm({...form, capacidad: e.target.value})} className="px-3 py-2 border rounded" />
              <input placeholder="Precio" value={form.precio} onChange={e => setForm({...form, precio: e.target.value})} className="px-3 py-2 border rounded" />
              <input placeholder="Propietario (id)" value={form.propietario_id || ""} onChange={e => setForm({...form, propietario_id: e.target.value ? Number(e.target.value) : null})} className="px-3 py-2 border rounded" />
              <input placeholder="Dirección" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} className="px-3 py-2 border rounded col-span-2" />
              <textarea placeholder="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="px-3 py-2 border rounded col-span-2" />
              <label className="col-span-2 text-sm">Horarios (JSON):</label>
              <textarea defaultValue={JSON.stringify(form.horarios,null,2)} onChange={handleHorariosTextChange} className="px-3 py-2 border rounded col-span-2 h-36" />
              <label className="col-span-2 text-sm">Días cerrados (array de 0-6):</label>
              <input placeholder="[0,6]" value={JSON.stringify(form.cerrados_dias)} onChange={e => {
                try { setForm({...form, cerrados_dias: JSON.parse(e.target.value)}); setError(""); } catch { setError("Formato JSON inválido para cerrados_dias"); }
              }} className="px-3 py-2 border rounded col-span-2" />
              <label className="col-span-2 text-sm">Fechas cerradas (array fechas YYYY-MM-DD):</label>
              <input placeholder='["2025-12-25"]' value={JSON.stringify(form.cerrados_fechas)} onChange={e => {
                try { setForm({...form, cerrados_fechas: JSON.parse(e.target.value)}); setError(""); } catch { setError("Formato JSON inválido para cerrados_fechas"); }
              }} className="px-3 py-2 border rounded col-span-2" />
            </div>

            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => { setOpenForm(false); setError(""); }} className="px-4 py-2 border rounded">Cancelar</button>
              <button onClick={guardar} className="px-4 py-2 bg-green-600 text-white rounded">{editing ? "Guardar" : "Crear"}</button>
            </div>

            {error && <p className="text-red-600 mt-3">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default CanchasManager;