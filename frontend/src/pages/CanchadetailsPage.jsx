import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaCalendarAlt, FaTag, FaInfoCircle } from "react-icons/fa";

function CanchaDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cancha, setCancha] = useState(null);
  const [loading, setLoading] = useState(true);
  const currentUser = React.useMemo(() => {
  try { return JSON.parse(localStorage.getItem("usuario") || "null"); } catch { return null; }
  }, []);
  const backTo = currentUser && currentUser.role === "provider" ? "/dashboard-provider" : "/dashboard";

  useEffect(() => {
    async function fetchCancha() {
      setLoading(true);
      try {
        const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiBase}/api/canchas/${id}`);
        const ct = res.headers.get("content-type") || "";
        if (!res.ok) {
          const txt = await res.text();
          console.error(`API error ${res.status}:`, txt);
          setCancha(null);
        } else if (!ct.includes("application/json")) {
          const txt = await res.text();
          console.error("Respuesta no JSON de /api/canchas/:id:", txt);
          setCancha(null);
        } else {
          const data = await res.json();
          setCancha(data);
        }
      } catch (err) {
        console.error("Error fetching cancha:", err);
        setCancha(null);
      } finally {
        setLoading(false);
      }
    }
    fetchCancha();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!cancha) return (
    <div className="min-h-screen flex items-center justify-center bg-green-800 text-white">
      <h2>Cancha no encontrada</h2>
      <button onClick={() => navigate(backTo)} className="mt-4 px-4 py-2 bg-white text-green-800 rounded">Volver</button>
    </div>
  );


  // usar únicamente el iframe guardado en la BD
  const iframeHtml = cancha.map_iframe;

  const dayNames = {
    0: "Domingo",
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
  };

  function parseHorarios(raw) {
    // acepta objeto { "0": [...], "1": [...] }, array, o JSON string
    let obj = raw ?? {};
    if (typeof obj === "string") {
      try { obj = JSON.parse(obj); } catch { obj = {}; }
    }
    const entries = [];

    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      // formato esperado: { "0": [], "1": [{start,end}], ... }
      for (const [key, arr] of Object.entries(obj)) {
        const diaNum = Number(key);
        if (!Array.isArray(arr) || arr.length === 0) continue; // ocultar días vacíos
        for (const slot of arr) {
          const start = slot?.start ?? slot?.hora ?? slot?.hora_inicio ?? slot?.from ?? null;
          const end = slot?.end ?? slot?.hora_fin ?? slot?.to ?? null;
          entries.push({ dia: diaNum, start, end });
        }
      }
    } else if (Array.isArray(obj)) {
      // array de objetos con campo dia
      for (const item of obj) {
        const dia = item?.dia ?? item?.day ?? item?.d ?? null;
        const diaNum = dia !== null ? Number(dia) : null;
        const start = item?.start ?? item?.hora ?? item?.hora_inicio ?? null;
        const end = item?.end ?? item?.hora_fin ?? item?.to ?? null;
        if (diaNum === null) continue;
        entries.push({ dia: diaNum, start, end });
      }
    }
    return entries;
  }

  function renderHorariosSection() {
    const raw = cancha.horarios ?? cancha.horario ?? {};
    const entries = parseHorarios(raw);
    if (entries.length === 0) {
      return <span className="ml-2 text-sm text-gray-200">No hay horarios disponibles.</span>;
    }

    const grouped = entries.reduce((acc, e) => {
      (acc[e.dia] = acc[e.dia] || []).push(e);
      return acc;
    }, {});
    const orderedDays = Object.keys(grouped).map(Number).sort((a, b) => a - b);

    return (
      <ul className="mt-2 space-y-1">
        {orderedDays.map((d) => (
          <li key={d} className="text-base">
            <strong>{dayNames[d] ?? `Día ${d}`}:</strong>{" "}
            {grouped[d]
              .map(s => {
                const sStart = s.start ?? "—";
                const sEnd = s.end ? ` - ${s.end}` : "";
                return `${sStart}${sEnd}`;
              })
              .join(", ")}
          </li>
        ))}
      </ul>
    );
  }

  function renderCerradosDias() {
    // acepta campo cerradosdias | cerrados_dias | cerradosDias (array o JSON string)
    const raw = cancha.cerradosdias ?? cancha.cerrados_dias ?? cancha.cerradosDias ?? [];
    let arr = raw;
    if (typeof arr === "string") {
      try { arr = JSON.parse(arr); } catch { arr = []; }
    }
    if (!Array.isArray(arr)) arr = [];
    const diasValidos = arr.map(n => Number(n)).filter(n => !Number.isNaN(n) && n >= 0 && n <= 6);
    if (diasValidos.length === 0) {
      return <span className="ml-2 text-sm text-gray-200">No hay días de mantenimiento programados.</span>;
    }
    diasValidos.sort((a,b) => a - b);

    return (
      <ul className="mt-2 space-y-1">
        {diasValidos.map(d => (
          <li key={d} className="text-base">
            <strong>{dayNames[d] ?? `Día ${d}`}</strong>
          </li>
        ))}
      </ul>
    );
  }

  function renderCerradosFechas() {
    const rawF = cancha.cerradosfechas ?? cancha.cerrados_fechas ?? cancha.cerradosFechas ?? [];
    let arrF = rawF;
    if (typeof arrF === "string") {
      try { arrF = JSON.parse(arrF); } catch { arrF = []; }
    }
    if (!Array.isArray(arrF) || arrF.length === 0) return null;
    return (
      <div className="mt-1 text-sm text-gray-200">
        <strong>Fechas cerradas:</strong> {arrF.join(", ")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 p-6">
      {/* estilos locales para asegurar el iframe responsivo sin tocar la lógica */}
      <style>{`
        .cancha-iframe-container iframe { width: 100% !important; height: 100% !important; border: 0; display:block; }
      `}</style>

      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 relative border border-gray-100">
        <Link to={backTo} className="absolute top-4 left-4 text-gray-600 hover:text-green-600 flex items-center gap-2 bg-white/60 backdrop-blur-sm px-3 py-1 rounded-full">
          <FaArrowLeft /> <span className="sr-only">Volver</span>
        </Link>

        <h1 className="text-3xl font-semibold text-center mb-6 text-gray-900">{cancha.nombre}</h1>

        <div className="space-y-6 text-base text-gray-700">
          <p className="leading-relaxed"><strong className="text-gray-900">Descripción:</strong> <span className="text-gray-700">{cancha.descripcion}</span></p>

          <p className="flex items-start gap-3">
            <FaMapMarkerAlt className="mt-1 text-green-600" />
            <span><strong className="text-gray-900">Dirección:</strong> <span className="text-gray-700">{cancha.direccion}</span></span>
          </p>

          <div className="flex gap-3">
            <FaClock className="mt-1 text-green-600" />
            <div className="w-full">
              <strong className="text-gray-900">Horario:</strong>
              {renderHorariosSection()}
            </div>
          </div>

          <div className="flex gap-3">
            <FaCalendarAlt className="mt-1 text-green-600" />
            <div className="w-full">
              <strong className="text-gray-900">Días de mantenimiento:</strong>
              {renderCerradosDias()}
              {renderCerradosFechas()}
            </div>
          </div>

          <p className="flex items-center gap-3">
            <FaTag className="text-green-600" />
            <span><strong className="text-gray-900">Precio:</strong> <span className="text-gray-700">{cancha.precio}</span></span>
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-medium mb-3 flex items-center gap-2 text-gray-900"><FaMapMarkerAlt className="text-green-600" /> Ubicación</h2>

          {iframeHtml ? (
            <div className="cancha-iframe-container rounded-lg overflow-hidden border border-gray-100" style={{ height: 320 }} dangerouslySetInnerHTML={{ __html: iframeHtml }} />
          ) : (
            <p className="text-sm text-gray-500">No hay iframe guardado para esta cancha.</p>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <button onClick={() => navigate(backTo)} className="border border-green-600 text-green-600 hover:bg-green-50 font-semibold py-2 px-6 rounded-lg">Volver</button>
        </div>
      </div>
    </div>
  );
}

export default CanchaDetailsPage;