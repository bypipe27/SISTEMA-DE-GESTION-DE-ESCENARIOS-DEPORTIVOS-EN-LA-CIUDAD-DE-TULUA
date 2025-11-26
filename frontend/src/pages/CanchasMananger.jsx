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
    <div className="relative flex min-h-screen w-full bg-gradient-to-br from-cyan-100 via-blue-100 to-indigo-100 font-sans">
      <SideNavProvider />

      <main className="flex-1 flex-col min-w-0">
        <div className="p-8">
          <style>{`
            .cm-card { background: linear-gradient(180deg,#ffffff,#fbfbfb); border:1px solid rgba(2,6,23,0.04); border-radius:16px; box-shadow: 0 12px 30px rgba(2,6,23,0.08); padding:1.5rem; }
            .cm-modal { max-width:1000px; width:100%; border-radius:20px; background:#fff; border:2px solid rgba(2,6,23,0.06); box-shadow: 0 20px 60px rgba(2,6,23,0.15); padding:24px; max-height:85vh; overflow:auto; }
            .cm-input, .cm-textarea, .cm-select { width:100%; padding:12px 14px; border-radius:12px; border:2px solid rgba(15,23,42,0.1); background:#fff; font-weight:500; transition:all 0.2s; }
            .cm-input:focus, .cm-textarea:focus, .cm-select:focus { outline:none; border-color:#10b981; box-shadow: 0 0 0 3px rgba(16,185,129,0.1); }
            .cm-small { font-size:0.9rem; color:#6b7280; }
            @keyframes spin-smooth {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            .refresh-icon.spinning {
              animation: spin-smooth 0.6s ease-in-out;
            }
            .refresh-btn:active .refresh-icon {
              animation: spin-smooth 0.6s ease-in-out;
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .fade-in {
              animation: fadeIn 0.5s ease-out;
            }
            @keyframes shimmer {
              0% { background-position: -1000px 0; }
              100% { background-position: 1000px 0; }
            }
            .skeleton {
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 1000px 100%;
              animation: shimmer 2s infinite;
            }
            .skeleton-card {
              background: linear-gradient(135deg, #f8fafc 0%, #e0f2fe 50%, #f8fafc 100%);
              background-size: 200% 200%;
              animation: gradientShift 3s ease infinite;
            }
            @keyframes gradientShift {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
          `}</style>

          <div className="max-w-7xl mx-auto">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10">
              <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">⚽ Gestión de canchas</h1>
              <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                <button onClick={() => fetchCanchas()} className="refresh-btn flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white border-2 border-cyan-400 rounded-xl shadow-md text-sm font-bold hover:from-cyan-600 hover:to-blue-600 hover:border-cyan-500 transition-all hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-400" title="Refrescar">
                  <FaSyncAlt className="refresh-icon text-base mr-2" />
                  Refrescar
                </button>
                <button onClick={abrirNuevo} className="flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-md text-sm font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-400">
                  <FaPlus className="text-base mr-2" />
                  Agregar cancha
                </button>
              </div>
            </header>

            {error && <p className="text-red-600 mb-4">{error}</p>}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton-card rounded-2xl shadow-lg border-2 border-cyan-200/60 overflow-hidden">
                    <div className="skeleton h-40 w-full"></div>
                    <div className="p-5 space-y-3">
                      <div className="skeleton h-6 w-3/4 rounded"></div>
                      <div className="skeleton h-4 w-full rounded"></div>
                      <div className="skeleton h-4 w-5/6 rounded"></div>
                    </div>
                    <div className="flex gap-2 p-5 pt-0">
                      <div className="skeleton h-10 w-20 rounded-lg"></div>
                      <div className="skeleton h-10 w-20 rounded-lg"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {canchas.map((c, index) => (
                  <div key={c.id} className="fade-in bg-gradient-to-br from-white via-emerald-50/40 to-blue-50/40 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden border-2 border-emerald-200/60 hover:border-emerald-400 transform hover:scale-[1.03]" style={{animationDelay: `${index * 0.05}s`}}>
                    {c.imagen_url && (
                      <img 
                        src={c.imagen_url} 
                        alt={c.nombre}
                        className="w-full h-40 object-cover"
                      />
                    )}
                    <div className="p-5 flex-grow bg-gradient-to-b from-transparent to-emerald-50/30">
                      <h2 className="text-lg font-extrabold text-gray-900">{c.nombre}</h2>
                      <p className="text-sm text-gray-600 mt-2 font-medium">{c.tipo} — {c.direccion}</p>
                    </div>
                    <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t-2 border-emerald-100 px-5 pb-4 bg-gradient-to-r from-gray-50 to-emerald-50/30">
                      <button onClick={() => abrirEdicion(c)} className="flex items-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105">
                        <FaEdit className="text-lg mr-1" />
                        Editar
                      </button>
                      <button onClick={() => eliminar(c)} className="flex items-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105" title={`Eliminar ${c.nombre}`}>
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="cm-modal">
              <h2 className="text-2xl font-extrabold mb-5 text-white bg-gradient-to-r from-cyan-600 to-blue-600 rounded-t-xl -mx-6 -mt-6 px-6 py-4">{editing ? "✏️ Editar cancha" : "+ Agregar cancha"}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sección de imagen */}
                <div className="col-span-2 border-2 border-dashed border-cyan-400 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-5 hover:border-cyan-500 transition-colors">
                  <label className="block text-sm font-bold mb-3 text-cyan-900">
                    <FaImage className="inline mr-2 text-cyan-600" />
                    Imagen de la cancha
                  </label>
                  
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-48 object-cover rounded-xl shadow-lg"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-3 right-3 bg-gradient-to-r from-red-500 to-red-600 text-white p-2.5 rounded-full hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all transform hover:scale-110"
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
                        className="cursor-pointer inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105"
                      >
                        <FaImage className="mr-2" />
                        Seleccionar imagen
                      </label>
                      <p className="text-xs text-cyan-700 mt-3 font-medium">
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

                <label className="col-span-2 text-sm font-bold text-indigo-900 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2 rounded-lg">Horarios semanales</label>
                <div className="col-span-2 grid gap-3">
                  {DAY_NAMES.map((name, day) => (
                    <div key={day} className="border-2 border-indigo-200 rounded-xl overflow-hidden hover:border-indigo-400 transition-colors">
                      <button type="button" onClick={() => togglePanel(day)} className="w-full text-left px-5 py-3.5 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 transition-all">
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={form.cerrados_dias.includes(day)} onChange={() => toggleClosedDay(day)} onClick={e => e.stopPropagation()} className="w-4 h-4 text-indigo-600 rounded" />
                          <span className="font-bold text-indigo-900">{name}</span>
                        </div>
                        <div className="text-sm text-indigo-700 font-semibold">{openDayPanels[day] ? "▼ Ocultar" : (form.horarios && form.horarios[day] && form.horarios[day].length ? `${form.horarios[day].length} intervalo(s)` : "Sin horarios")}</div>
                      </button>

                      {openDayPanels[day] && (
                        <div className="p-4 space-y-3 bg-white">
                          {!form.cerrados_dias.includes(day) && (
                            <>
                              {(form.horarios && form.horarios[day] ? form.horarios[day] : []).map((it, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <select value={it.start || ""} onChange={e => updateInterval(day, idx, "start", e.target.value)} className="px-3 py-2 border-2 border-indigo-300 rounded-lg font-semibold text-gray-700 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200">
                                    {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                                  </select>
                                  <span className="text-sm font-bold text-indigo-600">→</span>
                                  <select value={it.end || ""} onChange={e => updateInterval(day, idx, "end", e.target.value)} className="px-3 py-2 border-2 border-indigo-300 rounded-lg font-semibold text-gray-700 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200">
                                    {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
                                  </select>
                                  <button type="button" onClick={() => removeInterval(day, idx)} className="px-3 py-2 text-sm bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-bold hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all">Quitar</button>
                                </div>
                              ))}
                              <div>
                                <button type="button" onClick={() => addInterval(day)} className="px-4 py-2 mt-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-sm font-bold hover:from-indigo-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all">+ Añadir intervalo</button>
                              </div>
                            </>
                          )}
                          {form.cerrados_dias.includes(day) && <p className="text-sm text-gray-500">Día marcado como cerrado</p>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <label className="col-span-2 text-sm font-bold text-pink-900 bg-gradient-to-r from-pink-50 to-rose-50 px-4 py-2 rounded-lg">Fechas cerradas (selecciona desde el calendario)</label>
                <div className="col-span-2 flex flex-col gap-3">
                  <div className="flex gap-2">
                    <input type="date" value={fechaToAdd} onChange={e => setFechaToAdd(e.target.value)} className="cm-input" />
                    <button type="button" onClick={addFecha} className="px-5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold hover:from-pink-600 hover:to-rose-600 shadow-md hover:shadow-lg transition-all">+ Añadir fecha</button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(!form.cerrados_fechas || form.cerrados_fechas.length === 0) && (
                      <p className="cm-small">Sin fechas cerradas</p>
                    )}
                    {(form.cerrados_fechas || []).map((f, i) => (
                      <div key={f + i} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-rose-100 to-pink-100 border-2 border-rose-300 rounded-lg shadow-sm">
                        <span className="text-sm font-bold text-rose-900">{f}</span>
                        <button type="button" onClick={() => removeFecha(i)} className="text-rose-600 hover:text-rose-800 px-2 font-bold">×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button 
                  onClick={() => { setOpenForm(false); }} 
                  className="px-6 py-3 border-2 border-gray-400 bg-gray-100 rounded-xl hover:bg-gray-200 font-bold text-gray-700 hover:border-gray-500 transition-all shadow-md hover:shadow-lg"
                  disabled={uploadingImage}
                >
                  Cancelar
                </button>
                <button 
                  onClick={handleSaveWithImage} 
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 disabled:from-gray-400 disabled:to-gray-500 font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105"
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