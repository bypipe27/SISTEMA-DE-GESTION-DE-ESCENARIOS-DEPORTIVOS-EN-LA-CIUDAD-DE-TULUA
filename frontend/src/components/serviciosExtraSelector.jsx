import React, { useState, useEffect } from 'react';
import { serviciosExtraService } from '../services/servicesExtra';

const ServiciosExtraSelector = ({ canchaId, onServiciosChange, serviciosSeleccionados = [] }) => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarServicios = async () => {
      if (!canchaId) return;
      
      try {
        setLoading(true);
        const data = await serviciosExtraService.obtenerPorCancha(canchaId);
        setServicios(data);
      } catch (err) {
        setError('Error al cargar servicios extra');
        console.error('Error cargando servicios:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarServicios();
  }, [canchaId]);

  const handleServicioToggle = (servicio) => {
    const yaSeleccionado = serviciosSeleccionados.some(s => s.servicio_id === servicio.id);
    
    let nuevosServicios;
    if (yaSeleccionado) {
      nuevosServicios = serviciosSeleccionados.filter(s => s.servicio_id !== servicio.id);
    } else {
      nuevosServicios = [
        ...serviciosSeleccionados,
        {
          servicio_id: servicio.id,
          precio_aplicado: servicio.precio,
          nombre: servicio.nombre,
          tipo: servicio.tipo
        }
      ];
    }
    
    onServiciosChange(nuevosServicios);
  };

  const formatearPrecio = (precio) => {
    if (!precio) return 'Gratis';
    return `$${Number(precio).toLocaleString('es-CO')}`;
  };

  const obtenerIconoTipo = (tipo) => {
    switch (tipo) {
      case 'arbitraje':
        return '⚽';
      case 'premiacion':
        return '🏆';
      case 'celebracion':
        return '🎉';
      default:
        return '✨';
    }
  };

  const obtenerColorTipo = (tipo) => {
    switch (tipo) {
      case 'arbitraje':
        return 'bg-blue-100 text-blue-800';
      case 'premiacion':
        return 'bg-yellow-100 text-yellow-800';
      case 'celebracion':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Servicios Extra</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Servicios Extra</h3>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (servicios.length === 0) {
    return null; // No mostrar la sección si no hay servicios
  }

  const totalServicios = serviciosSeleccionados.reduce((sum, s) => sum + (Number(s.precio_aplicado) || 0), 0);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">
        Servicios Extra Disponibles
        {serviciosSeleccionados.length > 0 && (
          <span className="ml-2 text-sm text-green-600 font-normal">
            ({serviciosSeleccionados.length} seleccionados)
          </span>
        )}
      </h3>
      
      <div className="space-y-3">
        {servicios.map(servicio => {
          const estaSeleccionado = serviciosSeleccionados.some(s => s.servicio_id === servicio.id);
          
          return (
            <div
              key={servicio.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                estaSeleccionado 
                  ? 'border-green-500 bg-green-50 shadow-md' 
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => handleServicioToggle(servicio)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{obtenerIconoTipo(servicio.tipo)}</span>
                    <input
                      type="checkbox"
                      checked={estaSeleccionado}
                      onChange={() => {}} // Manejado por el click del contenedor
                      className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
                    />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium text-gray-900">{servicio.nombre}</h4>
                      <span className={`px-2 py-1 text-xs rounded-full ${obtenerColorTipo(servicio.tipo)}`}>
                        {servicio.tipo}
                      </span>
                    </div>
                    
                    {servicio.descripcion && (
                      <p className="text-sm text-gray-600 mb-2">{servicio.descripcion}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {servicio.duracion_minutos && (
                        <span>⏱️ {servicio.duracion_minutos} min</span>
                      )}
                      {servicio.requiere_anticipacion_horas && (
                        <span>⏰ {servicio.requiere_anticipacion_horas}h anticipación</span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-semibold ${estaSeleccionado ? 'text-green-700' : 'text-gray-900'}`}>
                    {formatearPrecio(servicio.precio)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {serviciosSeleccionados.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-medium text-gray-700">Total servicios extra:</span>
            <span className="text-lg font-semibold text-green-700">
              {formatearPrecio(totalServicios)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiciosExtraSelector;
