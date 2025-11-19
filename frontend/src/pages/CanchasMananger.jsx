import React, { useState } from "react";
import { FaPlus, FaSyncAlt, FaTrash, FaEdit, FaImage, FaTimes } from "react-icons/fa";
import SideNavProvider from "../components/SideNavProvider";
import { useCanchasManager } from "../hooks/useCanchasManager";
import { uploadImage, validateImage, generatePreview } from "../services/uploadService";
function CanchasManager() {
  const {
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
    DAY_NAMES,
    TODAY_STR,
    HOUR_OPTIONS,
    ALLOWED_TIPOS,
    ALLOWED_CAPACIDADES,
    PRICE_OPTIONS,
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
  } = useCanchasManager();

  // Configuración del backend
  const BACKEND = import.meta.env.VITE_API_BASE || 
                  import.meta.env.VITE_BACKEND_URL || 
                  "http://localhost:5000";

  // Estados para manejo de imagen
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState("");

  // Manejar selección de imagen
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageError("");

    // Validar archivo
    const validation = validateImage(file);
    if (!validation.isValid) {
      setImageError(validation.error);
      e.target.value = ""; // Limpiar input
      return;
    }

    // Generar preview local
    try {
      const preview = await generatePreview(file);
      setImagePreview(preview);
      
      // Guardar archivo temporalmente para subirlo al guardar
      setForm({ ...form, _imageFile: file });
    } catch (err) {
      setImageError("Error al procesar la imagen");
    }
  };

  // Eliminar imagen
  const handleRemoveImage = () => {
    setImagePreview(null);
    setForm({ ...form, imagen_url: null, _imageFile: null });
    setImageError("");
    // Limpiar input file si existe
    const fileInput = document.getElementById('imageInput');
    if (fileInput) fileInput.value = "";
  };

  // Guardar con imagen
  const handleSaveWithImage = async () => {
    setError("");
    let imageUrl = form.imagen_url; // Mantener URL existente si no hay imagen nueva
    
    // Si hay una imagen nueva, subirla primero
    if (form._imageFile) {
      setUploadingImage(true);
      setImageError("");
      
      try {
        imageUrl = await uploadImage(form._imageFile);
      } catch (err) {
        setImageError(err.message || "Error al subir la imagen");
        setUploadingImage(false);
        return;
      } finally {
        setUploadingImage(false);
      }
    }
    
    // Preparar datos con la URL de imagen
    const formConImagen = { ...form };
    formConImagen.imagen_url = imageUrl;
    delete formConImagen._imageFile;
    
    // Guardar directamente con los datos preparados
    await guardarCancha(formConImagen);
  };

  // Función que guarda la cancha (copia de la lógica del hook pero con datos específicos)
  const guardarCancha = async (datos) => {
    if (!datos.nombre || !datos.tipo) {
      setError("Nombre y tipo son obligatorios");
      return;
    }

    try {
      const url = editing
        ? `${BACKEND}/api/canchas/provider/${editing.id}`
        : `${BACKEND}/api/canchas/provider`;
      const method = editing ? "PUT" : "POST";
      
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      };

      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(datos)
      });

      const responseData = await res.json();

      if (!res.ok) {
        setError(responseData.error || responseData.message || `Error ${res.status}`);
        return;
      }

      // Recargar canchas
      await fetchCanchas();
      
      // Cerrar formulario y limpiar
      setOpenForm(false);
      setImagePreview(null);
      setImageError("");
      
      alert(editing ? "Cancha actualizada exitosamente" : "Cancha creada exitosamente");
      
    } catch (err) {
      setError("Error al guardar cancha: " + err.message);
    }
  };

  // Cuando se abre el formulario, cargar imagen existente
  React.useEffect(() => {
    if (openForm && editing && form.imagen_url) {
      setImagePreview(form.imagen_url);
    } else if (!openForm) {
      setImagePreview(null);
      setImageError("");
    }
  }, [openForm, editing, form.imagen_url]);

  return (
    <div className="relative flex min-h-screen w-full bg-gray-100 font-sans">
      <SideNavProvider />

      <main className="flex-1 flex-col min-w-0">
        <div className="p-8">
          <style>{`
            .cm-card { background: linear-gradient(180deg,#ffffff,#fbfbfb); border:1px solid rgba(2,6,23,0.04); border-radius:14px; box-shadow: 0 12px 30px rgba(2,6,23,0.04); padding:1rem; }
            .cm-modal { max-width:980px; width:100%; border-radius:12px; background:#fff; border:1px solid rgba(2,6,23,0.04); box-shadow: 0 14px 40px rgba(2,6,23,0.06); padding:18px; max-height:80vh; overflow:auto; }
            .cm-input, .cm-textarea, .cm-select { width:100%; padding:10px 12px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); background:#fff; }
            .cm-small { font-size:0.9rem; color:#6b7280; }
          `}</style>

          <div className="max-w-7xl mx-auto">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
              <h1 className="text-3xl font-bold">Gestión de canchas</h1>
              <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                <button onClick={() => fetchCanchas()} className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500" title="Refrescar">
                  <FaSyncAlt className="text-base mr-2" />
                  Refrescar
                </button>
                <button onClick={abrirNuevo} className="flex items-center justify-center px-4 py-2 bg-emerald-500 text-white rounded-lg shadow-sm text-sm font-medium hover:bg-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">
                  <FaPlus className="text-base mr-2" />
                  Agregar cancha
                </button>
              </div>
            </header>

            {error && <p className="text-red-600 mb-4">{error}</p>}
            {loading ? (
              <p className="cm-small">Cargando...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {canchas.map((c) => (
                  <div key={c.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 flex flex-col overflow-hidden">
                    {c.imagen_url && (
                      <img 
                        src={c.imagen_url} 
                        alt={c.nombre}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-5 flex-grow">
                      <h2 className="text-lg font-bold">{c.nombre}</h2>
                      <p className="text-sm text-gray-600 mt-1">{c.tipo} — {c.direccion}</p>
                    </div>
                    <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                      <button onClick={() => abrirEdicion(c)} className="flex items-center p-2 rounded-md text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors">
                        <FaEdit className="text-lg mr-1" />
                        Editar
                      </button>
                      <button onClick={() => eliminar(c)} className="flex items-center p-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors" title={`Eliminar ${c.nombre}`}>
                        <FaTrash className="text-lg mr-1" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
                {canchas.length === 0 && (
                  <div className="col-span-full text-center text-gray-500">No hay canchas para mostrar.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {openForm && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="cm-modal">
              <h2 className="text-xl font-semibold mb-3">{editing ? "Editar cancha" : "Agregar cancha"}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Sección de imagen */}
                <div className="col-span-2 border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <label className="block text-sm font-semibold mb-2">
                    <FaImage className="inline mr-2" />
                    Imagen de la cancha
                  </label>
                  
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="imageInput"
                      />
                      <label
                        htmlFor="imageInput"
                        className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                      >
                        <FaImage className="mr-2" />
                        Seleccionar imagen
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        JPG, PNG o WebP • Máximo 5MB
                      </p>
                    </div>
                  )}
                  
                  {imageError && (
                    <p className="text-red-600 text-sm mt-2">{imageError}</p>
                  )}
                </div>

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
                      <button type="button" onClick={() => togglePanel(day)} className="w-full text-left px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100">
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
                    <input type="date" value={fechaToAdd} onChange={e => setFechaToAdd(e.target.value)} className="cm-input" />
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
                <button 
                  onClick={() => { setOpenForm(false); }} 
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  disabled={uploadingImage}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveWithImage} 
                  className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:bg-gray-400"
                  disabled={uploadingImage}
                >
                  {uploadingImage ? "Subiendo imagen..." : (editing ? "Guardar" : "Crear")}
                </button>
              </div>

              {error && <p className="text-red-600 mt-3">{error}</p>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default CanchasManager;