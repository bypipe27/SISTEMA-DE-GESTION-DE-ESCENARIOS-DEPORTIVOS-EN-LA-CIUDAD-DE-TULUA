import { useState, useEffect, useMemo } from 'react';

/**
 * Hook para gestionar CRUD de canchas del proveedor
 * Incluye validaciones, horarios, fechas cerradas y más
 */
export const useCanchasManager = () => {
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fechaToAdd, setFechaToAdd] = useState("");
  const [openDayPanels, setOpenDayPanels] = useState(() => {
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

  const BACKEND = import.meta.env.VITE_API_BASE || 
                  import.meta.env.VITE_BACKEND_URL || 
                  "http://localhost:5000";

  const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  const TODAY_STR = new Date().toISOString().split('T')[0];
  const HOUR_START = 6;
  const HOUR_END = 23;
  const HOUR_OPTIONS = Array.from(
    { length: HOUR_END - HOUR_START + 1 }, 
    (_, i) => String(HOUR_START + i).padStart(2, '0') + ':00'
  );

  const ALLOWED_TIPOS = ["Futbol 11", "Futbol sala", "Voley", "Tenis", "Padel"];
  const ALLOWED_CAPACIDADES = [2, 4, 6, 10, 12, 14, 16, 22];
  const PRICE_OPTIONS = Array.from(
    { length: ((100000 - 50000) / 5000) + 1 }, 
    (_, i) => 50000 + i * 5000
  );

  const usuario = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("usuario") || "null");
    } catch {
      return null;
    }
  }, []);

  const usuarioId = usuario?.id ?? null;

  // Funciones auxiliares
  function alignHour(value) {
    if (!value || typeof value !== 'string') return HOUR_OPTIONS[0];
    const m = value.match(/(\d{1,2})/);
    let h = m ? parseInt(m[1], 10) : HOUR_START;
    if (Number.isNaN(h)) h = HOUR_START;
    if (h < HOUR_START) h = HOUR_START;
    if (h > HOUR_END) h = HOUR_END;
    return String(h).padStart(2, '0') + ':00';
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
      try {
        input = JSON.parse(input);
      } catch {
        return initEmptyHorarios();
      }
    }
    const out = initEmptyHorarios();
    Object.keys(out).forEach(k => {
      if (input[k] && Array.isArray(input[k])) {
        out[k] = input[k].map(it => {
          const rawStart = it.start ?? it.from ?? "";
          const rawEnd = it.end ?? it.to ?? "";
          return { start: alignHour(rawStart), end: alignHour(rawEnd) };
        });
      }
    });
    return out;
  }

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

  function getHeaders() {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  // Gestión de paneles y días
  function togglePanel(day) {
    setOpenDayPanels(prev => ({ ...prev, [day]: !prev[day] }));
  }

  function toggleClosedDay(day) {
    setForm(prev => {
      const arr = Array.isArray(prev.cerrados_dias) ? [...prev.cerrados_dias] : [];
      const i = arr.indexOf(day);
      if (i === -1) arr.push(day);
      else arr.splice(i, 1);
      return { ...prev, cerrados_dias: arr };
    });
  }

  // Gestión de intervalos de horarios
  function addInterval(day) {
    setForm(prev => {
      const horarios = { ...(prev.horarios || initEmptyHorarios()) };
      const defaultStart = HOUR_OPTIONS[0];
      const defaultEnd = HOUR_OPTIONS[1] || HOUR_OPTIONS[0];
      horarios[day] = horarios[day] 
        ? [...horarios[day], { start: defaultStart, end: defaultEnd }] 
        : [{ start: defaultStart, end: defaultEnd }];
      return { ...prev, horarios };
    });
  }

  function removeInterval(day, idx) {
    setForm(prev => {
      const horarios = { ...(prev.horarios || initEmptyHorarios()) };
      horarios[day] = horarios[day].filter((_, i) => i !== idx);
      return { ...prev, horarios };
    });
  }

  function updateInterval(day, idx, field, value) {
    setForm(prev => {
      const horarios = { ...(prev.horarios || initEmptyHorarios()) };
      horarios[day] = horarios[day].map((it, i) => 
        i === idx ? { ...it, [field]: value } : it
      );
      return { ...prev, horarios };
    });
  }

  // Gestión de fechas cerradas
  function addFecha() {
    if (!fechaToAdd) {
      setError("Selecciona una fecha");
      return;
    }
    const iso = fechaToAdd;
    if (iso < TODAY_STR) {
      setError("No se pueden añadir fechas anteriores a hoy");
      return;
    }
    const exists = Array.isArray(form.cerrados_fechas) && form.cerrados_fechas.includes(iso);
    if (exists) {
      setError("Fecha ya añadida");
      return;
    }
    setForm(prev => ({ 
      ...prev, 
      cerrados_fechas: [...(prev.cerrados_fechas || []), iso] 
    }));
    setFechaToAdd("");
    setError("");
  }

  function removeFecha(idx) {
    setForm(prev => ({ 
      ...prev, 
      cerrados_fechas: (prev.cerrados_fechas || []).filter((_, i) => i !== idx) 
    }));
  }

  // Fetch canchas
  async function fetchCanchas(controllerOrSignal, mounted = true) {
    setLoading(true);
    const signal = (controllerOrSignal && controllerOrSignal.signal) 
      ? controllerOrSignal.signal 
      : controllerOrSignal;
    
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
      if (mounted) {
        setError("No se pudo conectar al servidor o la respuesta no es válida");
        setCanchas([]);
      }
    } finally {
      if (mounted) setLoading(false);
    }
  }

  // Abrir formularios
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

  // Guardar cancha
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
      
      // Validar intervalos de horarios
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
      
      // Validaciones
      if (!ALLOWED_TIPOS.includes(payload.tipo)) {
        setError('Tipo inválido');
        return;
      }
      if (!ALLOWED_CAPACIDADES.includes(Number(payload.capacidad))) {
        setError('Capacidad inválida');
        return;
      }
      if (!validatePrice(payload.precio)) {
        setError('Precio inválido. Debe ser entre 50.000 y 100.000 con incrementos de 5.000');
        return;
      }
      
      const iframeCheck = validateIframe(payload.map_iframe);
      if (!iframeCheck.ok) {
        setError('Iframe inválido: ' + iframeCheck.reason);
        return;
      }
      
      delete payload.propietario_id;
      payload.horarios = payload.horarios || {};
      
      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }
      
      if (!res.ok) {
        setError((data && (data.error || data.message)) || `Error ${res.status}`);
        return;
      }
      
      const cancha = (data && (data.cancha || data)) || null;
      if (cancha) {
        if (editing) {
          setCanchas(prev => prev.map(p => p.id === cancha.id ? cancha : p));
        } else {
          setCanchas(prev => [cancha, ...prev]);
        }
      } else {
        fetchCanchas();
      }
      setOpenForm(false);
    } catch (err) {
      setError("Error al guardar cancha");
    }
  }

  // Eliminar cancha
  async function eliminar(cancha) {
    try {
      const res = await fetch(`${BACKEND}/api/canchas/provider/${cancha.id}`, {
        method: "DELETE",
        headers: getHeaders()
      });
      
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {}
      
      if (!res.ok) {
        const errorMessage = data && (data.error || data.message);
        let userFriendlyMessage = errorMessage || `Error ${res.status}`;
        
        // Detectar si el error es por reservas futuras
        if (errorMessage && errorMessage.includes('reserva(s) futura(s)')) {
          const match = errorMessage.match(/(\d+)\s+reserva\(s\)\s+futura\(s\)/);
          const numReservas = match ? match[1] : 'algunas';
          userFriendlyMessage = `No se puede eliminar la cancha "${cancha.nombre}" porque tiene ${numReservas} reserva(s) activa(s). Debe esperar a que finalicen o cancelarlas primero.`;
        }
        
        return { success: false, message: userFriendlyMessage };
      }
      
      setCanchas(prev => prev.filter(c => c.id !== cancha.id));
      return { success: true, message: `Cancha "${cancha.nombre}" eliminada exitosamente` };
    } catch (err) {
      return { success: false, message: `Error de conexión al eliminar la cancha "${cancha.nombre}"` };
    }
  }

  // Cargar canchas al montar
  useEffect(() => {
    const controller = new AbortController();
    let mounted = true;
    fetchCanchas(controller, mounted);
    return () => {
      mounted = false;
      controller.abort();
    };
  }, [usuarioId]);

  return {
    // Estado
    canchas,
    loading,
    error,
    setError,
    openForm,
    setOpenForm,
    editing,
    form,
    setForm,
    fechaToAdd,
    setFechaToAdd,
    openDayPanels,
    
    // Constantes
    DAY_NAMES,
    TODAY_STR,
    HOUR_OPTIONS,
    ALLOWED_TIPOS,
    ALLOWED_CAPACIDADES,
    PRICE_OPTIONS,
    
    // Funciones
    togglePanel,
    toggleClosedDay,
    addInterval,
    removeInterval,
    updateInterval,
    addFecha,
    removeFecha,
    fetchCanchas,
    abrirNuevo,
    abrirEdicion,
    guardar,
    eliminar
  };
};
