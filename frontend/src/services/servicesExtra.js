import api from './api.js';


export const serviciosExtraService = {
  // Obtener servicios de una cancha (público)
  obtenerPorCancha: async (canchaId) => {
    const response = await api.get(`/api/servicios-extra/cancha/${canchaId}`);
    return response;
  },


  // Provider - Obtener todos los servicios
  obtenerMisServicios: async () => {
    const response = await api.get('/api/servicios-extra/provider');
    return response;
  },


  // Provider - Crear servicio
  crear: async (servicioData) => {
    const response = await api.post('/api/servicios-extra/provider', servicioData);
    return response;
  },


  // Provider - Obtener servicio por ID
  obtenerPorId: async (id) => {
    const response = await api.get(`/api/servicios-extra/provider/${id}`);
    return response;
  },


  // Provider - Actualizar servicio
  actualizar: async (id, servicioData) => {
    const response = await api.put(`/api/servicios-extra/provider/${id}`, servicioData);
    return response;
  },


  // Provider - Eliminar servicio
  eliminar: async (id) => {
    const response = await api.delete(`/api/servicios-extra/provider/${id}`);
    return response;
  }
};

