// ...existing code...
import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

function CanchaDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [cancha, setCancha] = useState(null);
  const [loading, setLoading] = useState(true);

// ...existing code...
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
// ...existing code...

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!cancha) return (
    <div className="min-h-screen flex items-center justify-center bg-green-800 text-white">
      <h2>Cancha no encontrada</h2>
      <button onClick={() => navigate("/dashboard")} className="mt-4 px-4 py-2 bg-white text-green-800 rounded">Volver</button>
    </div>
  );

  // usar únicamente el iframe guardado en la BD
  const iframeHtml = cancha.map_iframe;

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
          <p><strong>Horario:</strong> {cancha.horario}</p>
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