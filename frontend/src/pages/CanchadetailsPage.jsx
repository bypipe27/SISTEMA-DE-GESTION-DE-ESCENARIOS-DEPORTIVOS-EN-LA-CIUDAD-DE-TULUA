import React from "react";
import { useParams, Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

// Datos simulados
const canchasMock = [
  {
    id: 1,
    nombre: "Cancha Sintética La 14",
    descripcion:
      "Cancha sintética de tamaño profesional con iluminación LED y graderías. Ideal para torneos y entrenamientos nocturnos.",
    direccion: "Cra. 14 #12-45, Tuluá, Valle del Cauca",
    horario: "Lunes a Domingo, 6:00 AM - 11:00 PM",
    precio: "60.000 / hora",
    lat: 4.085, // ejemplo para mapa
    lng: -76.195,
  },
  {
    id: 2,
    nombre: "Cancha del Parque Guaduales",
    descripcion:
      "Espacio amplio y con excelente mantenimiento. Perfecta para partidos recreativos y entrenamientos escolares.",
    direccion: "Calle 25 #18-20, Tuluá, Valle del Cauca",
    horario: "Lunes a Domingo, 7:00 AM - 10:00 PM",
    precio: "45.000 / hora",
    lat: 4.084,
    lng: -76.201,
  },
];

function CanchaDetailsPage() {
  const { id } = useParams();
  const cancha = canchasMock.find((c) => c.id === parseInt(id));

  if (!cancha) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-green-800 text-white">
        <h2>Cancha no encontrada</h2>
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps?q=${cancha.lat},${cancha.lng}&z=15&output=embed`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-700 via-green-800 to-green-900 text-white p-6">
      <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 relative">
        <Link
          to="/dashboard"
          className="absolute top-4 left-4 text-white hover:text-green-300 flex items-center gap-2"
        >
          <FaArrowLeft /> Volver
        </Link>

        <h1 className="text-4xl font-bold text-center mb-6">{cancha.nombre}</h1>

        <div className="space-y-4 text-lg">
          <p>
            <strong>Descripción:</strong> {cancha.descripcion}
          </p>
          <p>
            <strong>Dirección:</strong> {cancha.direccion}
          </p>
          <p>
            <strong>Horario:</strong> {cancha.horario}
          </p>
          <p>
            <strong>Precio:</strong> {cancha.precio}
          </p>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-3">Ubicación 📍</h2>
          <iframe
            title="Mapa de la cancha"
            src={mapUrl}
            width="100%"
            height="300"
            style={{ borderRadius: "12px" }}
            allowFullScreen
            loading="lazy"
          ></iframe>
        </div>

        <div className="mt-8 flex justify-center">
          <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-xl transition-all">
            Reservar cancha
          </button>
        </div>
      </div>
    </div>
  );
}

export default CanchaDetailsPage;
