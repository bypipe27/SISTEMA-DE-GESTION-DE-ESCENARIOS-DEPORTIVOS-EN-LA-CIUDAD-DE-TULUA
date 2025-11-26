import api from './api';

/**
 * Crear un nuevo método de pago
 */
export const crearMetodoPago = async (datos) => {
  try {
    const response = await api.post('/api/metodos-pago', datos);
    return response;
  } catch (error) {
    console.error('Error al crear método de pago:', error);
    throw error.response?.data || { error: 'Error al crear método de pago' };
  }
};

/**
 * Obtener todos los métodos de pago del usuario
 */
export const obtenerMetodosPago = async () => {
  try {
    const response = await api.get('/api/metodos-pago');
    // La respuesta ya viene parseada desde api.js
    return response.metodos_pago || [];
  } catch (error) {
    console.error('Error al obtener métodos de pago:', error);
    throw error.response?.data || { error: 'Error al obtener métodos de pago' };
  }
};

/**
 * Obtener el método de pago predeterminado
 */
export const obtenerMetodoPagoPredeterminado = async () => {
  try {
    const response = await api.get('/api/metodos-pago/predeterminado');
    return response.metodo_pago;
  } catch (error) {
    if (error.response?.status === 404) {
      return null; // No hay método predeterminado
    }
    console.error('Error al obtener método predeterminado:', error);
    throw error.response?.data || { error: 'Error al obtener método predeterminado' };
  }
};

/**
 * Detectar tipo y marca de tarjeta
 */
export const detectarTarjeta = async (numero) => {
  try {
    const response = await api.post('/api/metodos-pago/detectar', { numero });
    return response;
  } catch (error) {
    console.error('Error al detectar tarjeta:', error);
    throw error.response?.data || { error: 'Error al detectar tarjeta' };
  }
};

/**
 * Actualizar un método de pago
 */
export const actualizarMetodoPago = async (id, datos) => {
  try {
    const response = await api.put(`/api/metodos-pago/${id}`, datos);
    return response;
  } catch (error) {
    console.error('Error al actualizar método de pago:', error);
    throw error.response?.data || { error: 'Error al actualizar método de pago' };
  }
};

/**
 * Establecer un método de pago como predeterminado
 */
export const establecerMetodoPredeterminado = async (id) => {
  try {
    const response = await api.patch(`/api/metodos-pago/${id}/predeterminado`);
    return response;
  } catch (error) {
    console.error('Error al establecer método predeterminado:', error);
    throw error.response?.data || { error: 'Error al establecer método predeterminado' };
  }
};

/**
 * Eliminar un método de pago
 */
export const eliminarMetodoPago = async (id) => {
  try {
    const response = await api.delete(`/api/metodos-pago/${id}`);
    return response;
  } catch (error) {
    console.error('Error al eliminar método de pago:', error);
    throw error.response?.data || { error: 'Error al eliminar método de pago' };
  }
};
