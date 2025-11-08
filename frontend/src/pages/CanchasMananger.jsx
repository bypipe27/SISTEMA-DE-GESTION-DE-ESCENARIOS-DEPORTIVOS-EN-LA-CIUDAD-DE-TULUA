import React, { useEffect, useState } from "react";

function CanchasManager() {
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // modal / form state para cancha y horarios
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState(null); // cancha en edición
  const [form, setForm] = useState({
    nombre: "",
    tipo: "",
    sede: "",
    map_iframe: "",
    capacidad: "",
    precio: "",
    descripcion: "",
  });
  const [horarios, setHorarios] = useState([]); // horarios del item seleccionado

  useEffect(() => {
    fetchCanchas();
  }, []);

  async function fetchCanchas() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/admin/canchas");
      const data = await res.json();
      setCanchas(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar canchas.");
    } finally {
      setLoading(false);
    }
  }

  function abrirNuevo() {
    setEditing(null);
    setForm({
      nombre: "",
      tipo: "",
      sede: "",
      map_iframe: "",
      capacidad: "",
      precio: "",
      descripcion: "",
    });
    setHorarios([]);
    setOpenForm(true);
  }

  function abrirEdicion(cancha) {
    setEditing(cancha);
    setForm({
      nombre: cancha.nombre || "",
      tipo: cancha.tipo || "",
      sede: cancha.sede || "",
      map_iframe: cancha.map_iframe || "",
      capacidad: cancha.capacidad || "",
      precio: cancha.precio || "",
      descripcion: cancha.descripcion || "",
    });
    // cargar horarios por API al seleccionar (ver implementación backend)
    fetchHorarios(cancha.id);
    setOpenForm(true);
  }

  async function fetchHorarios(canchaId) {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/canchas/${canchaId}/horarios`);
      const data = await res.json();
      setHorarios(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("No se pudieron cargar horarios.", err);
      setHorarios([]);
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gestión de canchas</h1>
        <button onClick={abrirNuevo} className="px-4 py-2 bg-green-600 text-white rounded">
          Agregar cancha
        </button>
      </header>

      {loading ? (
        <p>Cargando...</p>
      ) : (
        <>
          {error && <p className="text-red-600">{error}</p>}
          <ul className="space-y-4">
            {canchas.map((cancha) => (
              <li key={cancha.id} className="p-4 border rounded flex justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{cancha.nombre}</h3>
                  <p className="text-sm text-gray-600">
                    {cancha.tipo} — {cancha.sede}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => abrirEdicion(cancha)} className="px-3 py-1 border rounded">
                    Editar / Horarios
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
export default CanchasManager; 