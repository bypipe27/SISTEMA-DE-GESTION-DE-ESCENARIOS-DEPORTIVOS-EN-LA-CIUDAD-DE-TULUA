
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

function CanchaDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cancha, setCancha] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <button onClick={() => navigate("/dashboard")} className="mt-4 px-4 py-2 bg-white text-green-800 rounded">Volver</button>
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
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white p-6">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 relative">
        <Link to="/dashboard" className="absolute top-4 left-4 text-white hover:text-green-300 flex items-center gap-2">
          <FaArrowLeft /> Volver
        </Link>

        <h1 className="text-4xl font-bold text-center mb-6">{cancha.nombre}</h1>

        <div className="space-y-4 text-lg text-white">
          <p><strong>Descripción:</strong> {cancha.descripcion}</p>
          <p><strong>Dirección:</strong> {cancha.direccion}</p>

          <div>
            <strong>Horario:</strong>
            {renderHorariosSection()}
          </div>

          <div>
            <strong>Días de mantenimiento:</strong>
            {renderCerradosDias()}
            {renderCerradosFechas()}
          </div>

          <p><strong>Precio:</strong> {cancha.precio}</p>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-3">Ubicación 📍</h2>

          {iframeHtml ? (
            <div dangerouslySetInnerHTML={{ __html: iframeHtml }} />
          ) : (
            <p className="text-sm text-gray-200">No hay iframe guardado para esta cancha.</p>
          )}
        </div>

        <div className="mt-8 flex justify-center">
          <button onClick={() => navigate("/dashboard")} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl">Volver</button>
        </div>
      </div>
    </div>
  );
}

export default CanchaDetailsPage;
// ...existing code...