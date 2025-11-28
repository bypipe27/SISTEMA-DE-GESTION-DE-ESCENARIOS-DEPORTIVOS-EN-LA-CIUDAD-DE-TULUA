import React, { useState } from 'react';
import { FaPlus, FaSyncAlt, FaTrash, FaEdit, FaTimes, FaStar } from 'react-icons/fa';
import SideNavProvider from '../components/SideNavProvider';
import { useServiciosExtra } from '../hooks/useServiciosExtra';
import { useCanchasManager } from '../hooks/useCanchasManager';


const ServiciosExtraManager = () => {
  const {
    servicios,
    loading,
    error,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
    setError,
    obtenerMisServicios
  } = useServiciosExtra();
 
  const { canchas, fetchCanchas } = useCanchasManager();
 
  const [showDialog, setShowDialog] = useState(false);
  const [editando, setEditando] = useState(null);
  const [canchaSeleccionada, setCanchaSeleccionada] = useState(null);
  const [formData, setFormData] = useState({
    cancha_id: '',
    tipo: 'arbitraje',
    nombre: '',
    descripcion: '',
    precio: '',
    duracion_minutos: 60,
    requiere_anticipacion_horas: 24,
    disponible: true
  });


  const tiposServicio = [
    { value: 'arbitraje', label: 'Arbitraje', icon: '⚽' },
    { value: 'premiacion', label: 'Premiación', icon: '🏆' },
    { value: 'celebracion', label: 'Celebración', icon: '🎉' }
  ];


  const abrirDialogParaCancha = (cancha) => {
    setCanchaSeleccionada(cancha);
    setEditando(null);
    setFormData({
      cancha_id: cancha.id,
      tipo: 'arbitraje',
      nombre: '',
      descripcion: '',
      precio: '',
      duracion_minutos: 60,
      requiere_anticipacion_horas: 24,
      disponible: true
    });
    setShowDialog(true);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
   
    try {
      if (editando) {
        await actualizarServicio(editando.id, formData);
      } else {
        await crearServicio(formData);
      }
     
      handleCloseDialog();
    } catch (err) {
      // Error ya manejado en el hook
    }
  };


  const handleEdit = (servicio) => {
    setEditando(servicio);
    setCanchaSeleccionada(null);
    setFormData({
      cancha_id: servicio.cancha_id,
      tipo: servicio.tipo,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      precio: servicio.precio || '',
      duracion_minutos: servicio.duracion_minutos || 60,
      requiere_anticipacion_horas: servicio.requiere_anticipacion_horas || 24,
      disponible: servicio.disponible
    });
    setShowDialog(true);
  };


  const handleDelete = async (servicio) => {
    if (window.confirm(`¿Estás seguro de eliminar el servicio "${servicio.nombre}"?`)) {
      try {
        await eliminarServicio(servicio.id);
      } catch (err) {
        // Error ya manejado en el hook
      }
    }
  };


  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditando(null);
    setCanchaSeleccionada(null);
    setFormData({
      cancha_id: '',
      tipo: 'arbitraje',
      nombre: '',
      descripcion: '',
      precio: '',
      duracion_minutos: 60,
      requiere_anticipacion_horas: 24,
      disponible: true
    });
    setError(null);
  };


  const refrescar = async () => {
    await Promise.all([obtenerMisServicios(), fetchCanchas()]);
  };


  const formatearPrecio = (precio) => {
    if (!precio) return 'Gratis';
    return `$${Number(precio).toLocaleString('es-CO')}`;
  };


  const obtenerIconoTipo = (tipo) => {
    return tiposServicio.find(t => t.value === tipo)?.icon || '✨';
  };


  const obtenerServiciosPorCancha = (canchaId) => {
    return servicios.filter(servicio => servicio.cancha_id === canchaId);
  };


  return (
    <div className="relative flex min-h-screen w-full bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 font-sans">
      <SideNavProvider />


      <main className="flex-1 flex-col min-w-0">
        <div className="p-8">
          <style>{`
            .se-card { background: linear-gradient(180deg,#ffffff,#fbfbfb); border:1px solid rgba(2,6,23,0.04); border-radius:16px; box-shadow: 0 12px 30px rgba(2,6,23,0.08); padding:1.5rem; }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            .fade-in {
              animation: fadeIn 0.5s ease-out;
            }
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
            .skeleton {
              background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
              background-size: 1000px 100%;
              animation: shimmer 2s infinite;
            }
            .skeleton-card {
              background: linear-gradient(135deg, #f8fafc 0%, #fdf2f8 50%, #f8fafc 100%);
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
              <div>
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">🎪 Servicios Extra</h1>
                <p className="text-gray-600 text-lg mt-2">Gestiona los servicios adicionales para tus canchas</p>
              </div>
              <div className="flex items-center space-x-3 mt-4 sm:mt-0">
                <button
                  onClick={refrescar}
                  className="refresh-btn flex items-center justify-center px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-purple-400 rounded-xl shadow-md text-sm font-bold hover:from-purple-600 hover:to-pink-600 hover:border-purple-500 transition-all hover:shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-400"
                >
                  <FaSyncAlt className="refresh-icon text-base mr-2" />
                  Refrescar
                </button>
              </div>
            </header>


            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                <div className="text-red-800">{error}</div>
              </div>
            )}


            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="skeleton-card rounded-2xl shadow-lg border-2 border-purple-200/60 overflow-hidden">
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
                {canchas.map((cancha, index) => {
                  const serviciosCancha = obtenerServiciosPorCancha(cancha.id);
                 
                  return (
                    <div
                      key={cancha.id}
                      className="fade-in bg-gradient-to-br from-white via-purple-50/40 to-pink-50/40 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col overflow-hidden border-2 border-purple-200/60 hover:border-purple-400 transform hover:scale-[1.03]"
                      style={{animationDelay: `${index * 0.05}s`}}
                    >
                      {cancha.imagen_url && (
                        <img
                          src={cancha.imagen_url}
                          alt={cancha.nombre}
                          className="w-full h-32 object-cover"
                        />
                      )}
                     
                      <div className="p-5 flex-grow bg-gradient-to-b from-transparent to-purple-50/30">
                        <h2 className="text-lg font-extrabold text-gray-900 mb-1">{cancha.nombre}</h2>
                        <p className="text-sm text-gray-600 font-medium mb-3">{cancha.tipo} — {cancha.direccion}</p>
                       
                        {/* Mostrar servicios existentes */}
                        {serviciosCancha.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs font-bold text-purple-700 mb-2">
                              <FaStar className="inline mr-1" />
                              {serviciosCancha.length} servicio(s):
                            </p>
                            <div className="space-y-1">
                              {serviciosCancha.slice(0, 2).map(servicio => (
                                <div key={servicio.id} className="flex items-center justify-between text-xs bg-purple-100 px-2 py-1 rounded-lg">
                                  <span className="flex items-center">
                                    <span className="mr-1">{obtenerIconoTipo(servicio.tipo)}</span>
                                    {servicio.nombre}
                                  </span>
                                  <div className="flex space-x-1">
                                    <button
                                      onClick={() => handleEdit(servicio)}
                                      className="text-blue-600 hover:text-blue-800 p-1"
                                      title="Editar"
                                    >
                                      <FaEdit size={10} />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(servicio)}
                                      className="text-red-600 hover:text-red-800 p-1"
                                      title="Eliminar"
                                    >
                                      <FaTrash size={10} />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {serviciosCancha.length > 2 && (
                                <p className="text-xs text-purple-600 font-medium">
                                  +{serviciosCancha.length - 2} más...
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                     
                      <div className="flex items-center justify-center mt-4 pt-4 border-t-2 border-purple-100 px-5 pb-4 bg-gradient-to-r from-gray-50 to-purple-50/30">
                        <button
                          onClick={() => abrirDialogParaCancha(cancha)}
                          className="flex items-center px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-lg transform hover:scale-105 w-full justify-center"
                        >
                          <FaPlus className="text-lg mr-2" />
                          Agregar Servicio
                        </button>
                      </div>
                    </div>
                  );
                })}
               
                {canchas.length === 0 && (
                  <div className="col-span-full text-center py-12 bg-white rounded-lg shadow-sm">
                    <div className="text-6xl mb-4">🏟️</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay canchas disponibles</h3>
                    <p className="text-gray-600">Primero necesitas crear canchas para agregar servicios extra</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>


      {/* Modal personalizado para crear/editar servicio */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto border-2 border-purple-200">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 rounded-t-2xl">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {editando ? '✏️ Editar Servicio' : `🎪 Nuevo Servicio ${canchaSeleccionada ? `- ${canchaSeleccionada.nombre}` : ''}`}
                </h2>
                <button
                  onClick={handleCloseDialog}
                  className="text-white hover:text-gray-200 p-2 hover:bg-white/20 rounded-full transition-all"
                >
                  <FaTimes size={20} />
                </button>
              </div>
            </div>
           
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
          {!canchaSeleccionada && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cancha *
              </label>
              <select
                value={formData.cancha_id}
                onChange={(e) => setFormData({...formData, cancha_id: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Selecciona una cancha</option>
                {canchas.map(cancha => (
                  <option key={cancha.id} value={cancha.id}>
                    {cancha.nombre}
                  </option>
                ))}
              </select>
            </div>
          )}


          {canchaSeleccionada && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm font-medium text-purple-800">
                📍 Agregando servicio a: <span className="font-bold">{canchaSeleccionada.nombre}</span>
              </p>
            </div>
          )}


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Servicio *
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({...formData, tipo: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {tiposServicio.map(tipo => (
                <option key={tipo.value} value={tipo.value}>
                  {tipo.icon} {tipo.label}
                </option>
              ))}
            </select>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Servicio *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Árbitro profesional, Trofeos personalizados..."
              required
            />
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="Describe los detalles del servicio..."
            />
          </div>


          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio (COP)
              </label>
              <input
                type="number"
                value={formData.precio}
                onChange={(e) => setFormData({...formData, precio: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min="0"
              />
            </div>


            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración (min)
              </label>
              <input
                type="number"
                value={formData.duracion_minutos || ''}
                onChange={(e) => setFormData({...formData, duracion_minutos: e.target.value ? parseInt(e.target.value) : 60})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                placeholder="60"
              />
            </div>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anticipación requerida (horas)
            </label>
            <input
              type="number"
              value={formData.requiere_anticipacion_horas || ''}
              onChange={(e) => setFormData({...formData, requiere_anticipacion_horas: e.target.value ? parseInt(e.target.value) : 24})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              placeholder="24"
            />
          </div>


          <div className="flex items-center">
            <input
              type="checkbox"
              id="disponible"
              checked={formData.disponible}
              onChange={(e) => setFormData({...formData, disponible: e.target.checked})}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="disponible" className="ml-2 text-sm text-gray-700">
              Servicio disponible
            </label>
          </div>


          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseDialog}
              className="px-6 py-3 border-2 border-gray-400 bg-gray-100 rounded-xl hover:bg-gray-200 font-bold text-gray-700 hover:border-gray-500 transition-all shadow-md hover:shadow-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 font-bold shadow-md hover:shadow-lg transition-all transform hover:scale-105"
            >
              {editando ? 'Actualizar' : 'Crear Servicio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
)}
    </div>
  );
};


export default ServiciosExtraManager;

