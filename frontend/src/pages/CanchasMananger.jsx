import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import NavBarProvider from "../components/NavBarProvider"; // añadido
// Añadidos iconos para mejorar la UI (sin cambiar lógica)
import { FaPlus, FaSyncAlt, FaTrash, FaEdit, FaCalendarAlt } from "react-icons/fa";

function CanchasManager() {
  const navigate = useNavigate();
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fechaToAdd, setFechaToAdd] = useState("");
  const [openDayPanels, setOpenDayPanels] = useState(()=> {
    const init = {};
    for (let i = 0; i < 7; i++) init[i] = false;
    return init;
  });

  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    nombre: "",
    tipo: "",
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
  const BACKEND = import.meta.env.VITE_API_BASE || import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
  const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const TODAY_STR = new Date().toISOString().split('T')[0];
  const HOUR_START = 6;
  const HOUR_END = 23;
  const HOUR_OPTIONS = Array.from({ length: HOUR_END - HOUR_START + 1 }, (_, i) => String(HOUR_START + i).padStart(2, '0') + ':00');

  function alignHour(value) {
    if (!value || typeof value !== 'string') return HOUR_OPTIONS[0];
    const m = value.match(/(\d{1,2})/);
    let h = m ? parseInt(m[1], 10) : HOUR_START;
    if (Number.isNaN(h)) h = HOUR_START;
    if (h < HOUR_START) h = HOUR_START;
    if (h > HOUR_END) h = HOUR_END;
    return String(h).padStart(2, '0') + ':00';
  }

  function addFecha() {
    if (!fechaToAdd) { setError("Selecciona una fecha"); return; }
    const iso = fechaToAdd;
    if (iso < TODAY_STR) { setError("No se pueden añadir fechas anteriores a hoy"); return; }
    const exists = Array.isArray(form.cerrados_fechas) && form.cerrados_fechas.includes(iso);
    if (exists) { setError("Fecha ya añadida"); return; }
    setForm(prev => ({ ...prev, cerrados_fechas: [...(prev.cerrados_fechas || []), iso] }));
    setFechaToAdd("");
    setError("");
  }
  function removeFecha(idx) {
    setForm(prev => ({ ...prev, cerrados_fechas: (prev.cerrados_fechas || []).filter((_, i) => i !== idx) }));
  }
  function initEmptyHorarios() {
    const horarios = {};
    for (let i = 0; i < 7; i++) {
      horarios[i] = [];
    }
    return horarios;
  }
  function normalizeHorarios(input) {
    if (!input) return initEmptyHorarios();
    if (typeof input === "string") {
      try { input = JSON.parse(input); } catch { return initEmptyHorarios(); }
    }
    const out = initEmptyHorarios();
    Object.keys(out).forEach(k => {
      if (input[k] && Array.isArray(input[k])) out[k] = input[k].map(it => {
        const rawStart = it.start ?? it.from ?? "";
        const rawEnd = it.end ?? it.to ?? "";
        return { start: alignHour(rawStart), end: alignHour(rawEnd) };
      });
    });
    return out;
  }

  function togglePanel(day) {
    setOpenDayPanels(prev => ({ ...prev, [day]: !prev[day] }));
  }

  function toggleClosedDay(day) {
    setForm(prev => {
      const arr = Array.isArray(prev.cerrados_dias) ? [...prev.cerrados_dias] : [];
      const i = arr.indexOf(day);
      if (i === -1) arr.push(day); else arr.splice(i,1);
      return { ...prev, cerrados_dias: arr };
    });
  }

  function addInterval(day) {
    setForm(prev => {
      const horarios = { ...(prev.horarios || initEmptyHorarios()) };
      const defaultStart = HOUR_OPTIONS[0];
      const defaultEnd = HOUR_OPTIONS[1] || HOUR_OPTIONS[0];
      horarios[day] = horarios[day] ? [...horarios[day], { start: defaultStart, end: defaultEnd }] : [{ start: defaultStart, end: defaultEnd }];
      return { ...prev, horarios };
    });
  }

  function removeInterval(day, idx) {
    setForm(prev => {
      const horarios = { ...(prev.horarios || initEmptyHorarios()) };
      horarios[day] = horarios[day].filter((_,i) => i !== idx);
      return { ...prev, horarios };
    });
  }

  function updateInterval(day, idx, field, value) {
    setForm(prev => {
      const horarios = { ...(prev.horarios || initEmptyHorarios()) };
      horarios[day] = horarios[day].map((it,i) => i===idx ? { ...it, [field]: value } : it);
      return { ...prev, horarios };
    });
  }

  function getHeaders() {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  const ALLOWED_TIPOS = ["Futbol 11", "Futbol sala", "Voley", "Tenis", "Padel"];
  const ALLOWED_CAPACIDADES = [2,4,6,10,12,14,16,22];
  const PRICE_OPTIONS = Array.from({ length: ((100000-50000)/5000) + 1 }, (_,i) => 50000 + i*5000);
  function validatePrice(price) {
    const p = Number(price);
    if (Number.isNaN(p)) return false;
    if (p < 50000 || p > 100000) return false;
    return ((p - 50000) % 5000) === 0;
  }

  function extractIframeSrc(html) {
    if (!html || typeof html !== 'string') return null;
    const m = html.match(/src=["']([^"']+)["']/i);
    return m ? m[1] : null;
  }

  function validateIframe(html) {
    if (!html) return { ok: true, src: null };
    const src = extractIframeSrc(html);
    if (!src) return { ok: false, reason: 'No se encontró el atributo src en el iframe' };
    if (!src.startsWith('https://')) return { ok: false, reason: 'El src debe comenzar con https://' };
    return { ok: true, src };
  }

  const usuario = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("usuario") || "null"); } catch { return null; }
  }, []);
  const usuarioId = usuario?.id ?? null;

  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    fetchCanchas(controller, mounted);
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [navigate, usuarioId]);

  async function fetchCanchas(controllerOrSignal, mounted = true) {
    setLoading(true);
    const signal = (controllerOrSignal && controllerOrSignal.signal) ? controllerOrSignal.signal : controllerOrSignal;
    const buildFetchOptions = (extra = {}) => {
      const opts = { headers: getHeaders(), cache: "no-store", ...extra };
      if (signal && typeof signal === "object" && typeof signal.aborted === "boolean") {
        opts.signal = signal;
      }
      return opts;
    };

    try {
      const urlProvider = `${BACKEND}/api/canchas/provider`;
      const res = await fetch(urlProvider, buildFetchOptions());

      if (res.status === 304) {
        const retry = await fetch(urlProvider, buildFetchOptions());
        if (retry.ok) {
          const payload = await retry.json();
          if (mounted) setCanchas(Array.isArray(payload) ? payload : []);
          setError("");
          return;
        }
      }

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          const pub = await fetch(`${BACKEND}/api/canchas`, buildFetchOptions());
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
      capacidad: "",
      precio: "",
      descripcion: "",
      disponible: true,
      map_iframe: "",
      cerrados_dias: [],
      cerrados_fechas: [],
      horarios: initEmptyHorarios(),
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
      capacidad: c.capacidad ?? "",
      precio: c.precio ?? "",
      descripcion: c.descripcion || "",
      disponible: typeof c.disponible === "boolean" ? c.disponible : true,
      map_iframe: c.map_iframe || "",
      cerrados_dias: c.cerrados_dias || c.cerradosdias || [],
      cerrados_fechas: c.cerrados_fechas || c.cerradosfechas || [],
      horarios: normalizeHorarios(c.horarios),
      direccion: c.direccion || "",
      propietario_id: c.propietario_id || null,
    });
    setOpenForm(true);
  }

  async function guardar() {
    if (!form.nombre || !form.tipo) {
      setError("Nombre y tipo son obligatorios");
      return;
    }
    setError("");
    try {
      const url = editing
        ? `${BACKEND}/api/canchas/provider/${editing.id}`
        : `${BACKEND}/api/canchas/provider`;
      const method = editing ? "PUT" : "POST";
      const payload = { ...form };
      payload.horarios = payload.horarios || {};
      for (const dayKey of Object.keys(payload.horarios)) {
        const arr = payload.horarios[dayKey] || [];
        for (let i = 0; i < arr.length; i++) {
          const it = arr[i] || {};
          const rawStart = it.start ?? it.from ?? "";
          const rawEnd = it.end ?? it.to ?? "";
          const start = alignHour(rawStart);
          const end = alignHour(rawEnd);
          const sh = parseInt(start.split(':')[0], 10);
          const eh = parseInt(end.split(':')[0], 10);
          if (Number.isNaN(sh) || Number.isNaN(eh) || sh >= eh) {
            setError(`Intervalo inválido en día ${DAY_NAMES[Number(dayKey)] || dayKey}: ${start} - ${end}`);
            return;
          }
          arr[i] = { start, end };
        }
        payload.horarios[dayKey] = arr;
      }
      if (!ALLOWED_TIPOS.includes(payload.tipo)) { setError('Tipo inválido'); return; }
      if (!ALLOWED_CAPACIDADES.includes(Number(payload.capacidad))) { setError('Capacidad inválida'); return; }
      if (!validatePrice(payload.precio)) { setError('Precio inválido. Debe ser entre 50.000 y 100.000 con incrementos de 5.000'); return; }
      const iframeCheck = validateIframe(payload.map_iframe);
      if (!iframeCheck.ok) { setError('Iframe inválido: ' + iframeCheck.reason); return; }
      delete payload.propietario_id;
      payload.horarios = payload.horarios || {};
      const res = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(payload) });
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch { data = null; }
      if (!res.ok) {
        setError((data && (data.error||data.message)) || `Error ${res.status}`);
        return;
      }
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
      const res = await fetch(`${BACKEND}/api/canchas/provider/${cancha.id}`, { method: "DELETE", headers: getHeaders() });
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
    <div>
      {/* NavBarProvider añadido */}
      <NavBarProvider />

      <div className="p-6 max-w-6xl mx-auto pt-28">
        {/* estilos locales mínimos y armónicos (no tocan la lógica ni la tipografía global) */}
        <style>{`
          .cm-card { background: linear-gradient(180deg,#ffffff,#fbfbfb); border:1px solid rgba(2,6,23,0.04); border-radius:14px; box-shadow: 0 12px 30px rgba(2,6,23,0.04); padding:1rem; }
          .cm-header { display:flex; align-items:center; gap:12px; }
          .cm-actions .cm-btn { display:inline-flex; align-items:center; gap:8px; padding:8px 12px; border-radius:10px; border:1px solid rgba(2,6,23,0.06); background:#fff; transition:all .12s ease; }
          .cm-actions .cm-btn.primary { background:#10B981; color:#fff; border-color:transparent; }
          .cm-actions .cm-btn:active { transform:translateY(1px); }
          .cm-list-item { border-radius:10px; padding:12px; background:#fff; border:1px solid rgba(2,6,23,0.04); display:flex; justify-content:space-between; align-items:center; gap:12px; }
          .cm-modal { max-width:980px; width:100%; border-radius:12px; background:#fff; border:1px solid rgba(2,6,23,0.04); box-shadow: 0 14px 40px rgba(2,6,23,0.06); padding:18px; max-height:80vh; overflow:auto; }
          .cm-input, .cm-textarea, .cm-select { width:100%; padding:10px 12px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); background:#fff; }
          .cm-small { font-size:0.9rem; color:#6b7280; }
        `}</style>

        <header className="flex items-center justify-between mb-6 cm-header">
          <h1 className="text-2xl font-bold">Gestión de canchas</h1>
          <div className="flex gap-2 cm-actions">
            <button onClick={abrirNuevo} className="cm-btn primary">
              <FaPlus /> <span>Agregar cancha</span>
            </button>
            <button onClick={() => fetchCanchas()} className="cm-btn">
              <FaSyncAlt /> <span>Refrescar</span>
            </button>
          </div>
        </header>

        {loading ? <p className="cm-small">Cargando...</p> : (
          <>
            {error && <p className="text-red-600">{error}</p>}
            <ul className="space-y-3">
              {canchas.map(c => (
                <li key={c.id} className="cm-list-item">
                  <div>
                    <h3 className="text-lg font-semibold">{c.nombre}</h3>
                    <p className="cm-small">{c.tipo} — {c.direccion}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => abrirEdicion(c)} className="cm-btn">
                      <FaEdit /> <span>Editar</span>
                    </button>
                    <button onClick={() => eliminar(c)} className="cm-btn" style={{ background:'#fee2e2', color:'#991b1b', borderColor:'transparent' }}>
                      <FaTrash /> <span>Eliminar</span>
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}

        {openForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="cm-modal">
              <h2 className="text-xl font-semibold mb-3">{editing ? "Editar cancha" : "Agregar cancha"}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} className="cm-input" />
                <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})} className="cm-select">
                  <option value="">-- Seleccionar tipo --</option>
                  {ALLOWED_TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={form.capacidad || ""} onChange={e => setForm({...form, capacidad: e.target.value ? Number(e.target.value) : ""})} className="cm-select">
                  <option value="">-- Capacidad --</option>
                  {ALLOWED_CAPACIDADES.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <select value={form.precio || ""} onChange={e => setForm({...form, precio: e.target.value ? Number(e.target.value) : ""})} className="cm-select">
                  <option value="">-- Precio --</option>
                  {PRICE_OPTIONS.map(p => <option key={p} value={p}>{p.toLocaleString('es-CO')}</option>)}
                </select>

                <input placeholder="Dirección" value={form.direccion} onChange={e => setForm({...form, direccion: e.target.value})} className="cm-input col-span-2" />
                <textarea placeholder="Descripción" value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} className="cm-textarea col-span-2" />

                <label className="col-span-2 text-sm">Mapa (iframe embed)</label>
                <textarea placeholder="Pega aquí el iframe de Google Maps" value={form.map_iframe || ""} onChange={e => setForm({...form, map_iframe: e.target.value})} className="cm-textarea col-span-2 h-24" />
                <p className="cm-small col-span-2">Pega el código completo del iframe. Se validará que contenga un src con https (ej: embed de Google Maps).</p>

                <label className="col-span-2 text-sm font-semibold">Horarios semanales</label>
                <div className="col-span-2 grid gap-2">
                  {DAY_NAMES.map((name, day) => (
                    <div key={day} className="border rounded">
                      <button
                        type="button"
                        onClick={() => togglePanel(day)}
                        className="w-full text-left px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={form.cerrados_dias.includes(day)} onChange={() => toggleClosedDay(day)} onClick={e => e.stopPropagation()} />
                          <span className="font-medium">{name}</span>
                        </div>
                        <div className="text-sm text-gray-600">{openDayPanels[day] ? "Ocultar" : (form.horarios && form.horarios[day] && form.horarios[day].length ? `${form.horarios[day].length} intervalo(s)` : "Sin horarios")}</div>
                      </button>

                      {openDayPanels[day] && (
                        <div className="p-3 space-y-2">
                          {!form.cerrados_dias.includes(day) && (
                            <>
                              {(form.horarios && form.horarios[day] ? form.horarios[day] : []).map((it, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <select value={it.start || ""} onChange={e => updateInterval(day, idx, "start", e.target.value)} className="px-2 py-1 border rounded">
                                    {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                                  </select>
                                  <span className="text-sm">a</span>
                                  <select value={it.end || ""} onChange={e => updateInterval(day, idx, "end", e.target.value)} className="px-2 py-1 border rounded">
                                    {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                                  </select>
                                  <button type="button" onClick={() => removeInterval(day, idx)} className="px-2 py-1 text-sm bg-red-600 text-white rounded">Quitar</button>
                                </div>
                              ))}
                              <div>
                                <button type="button" onClick={() => addInterval(day)} className="px-3 py-1 mt-1 bg-blue-600 text-white rounded text-sm">Añadir intervalo</button>
                              </div>
                            </>
                          )}
                          {form.cerrados_dias.includes(day) && <p className="text-sm text-gray-500">Día marcado como cerrado</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <label className="col-span-2 text-sm">Fechas cerradas (selecciona desde el calendario):</label>
                <div className="col-span-2 flex flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={fechaToAdd}
                      onChange={e => setFechaToAdd(e.target.value)}
                      className="cm-input"
                    />
                    <button type="button" onClick={addFecha} className="cm-btn primary">Añadir fecha</button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(!form.cerrados_fechas || form.cerrados_fechas.length === 0) && (
                      <p className="cm-small">Sin fechas cerradas</p>
                    )}
                    {(form.cerrados_fechas || []).map((f, i) => (
                      <div key={f + i} className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded">
                        <span className="text-sm">{f}</span>
                        <button type="button" onClick={() => removeFecha(i)} className="text-red-600 px-2">✕</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <button onClick={() => { setOpenForm(false); }} className="cm-btn">Cancelar</button>
                <button onClick={guardar} className="cm-btn primary">{editing ? "Guardar" : "Crear"}</button>
              </div>

              {error && <p className="text-red-600 mt-3">{error}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CanchasManager;