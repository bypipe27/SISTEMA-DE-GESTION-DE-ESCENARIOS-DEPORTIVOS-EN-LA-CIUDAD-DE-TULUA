import { useState, useEffect } from 'react';
import { serviciosExtraService } from '../services/servicesExtra';


export const useServiciosExtra = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);


  const obtenerMisServicios = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await serviciosExtraService.obtenerMisServicios();
      setServicios(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar servicios');
    } finally {
      setLoading(false);
    }
  };


  const crearServicio = async (servicioData) => {
    setError(null);
    try {
      const { servicio } = await serviciosExtraService.crear(servicioData);
      setServicios(prev => [...prev, servicio]);
      return servicio;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al crear servicio';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };


  const actualizarServicio = async (id, servicioData) => {
    setError(null);
    try {
      const { servicio } = await serviciosExtraService.actualizar(id, servicioData);
      setServicios(prev =>
        prev.map(s => s.id === id ? servicio : s)
      );
      return servicio;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al actualizar servicio';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };


  const eliminarServicio = async (id) => {
    setError(null);
    try {
      await serviciosExtraService.eliminar(id);
      setServicios(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Error al eliminar servicio';
      setError(errorMsg);
      throw new Error(errorMsg);
    }
  };


  const obtenerPorCancha = async (canchaId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await serviciosExtraService.obtenerPorCancha(canchaId);
      return data;
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar servicios');
      return [];
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    obtenerMisServicios();
  }, []);


  return {
    servicios,
    loading,
    error,
    obtenerMisServicios,
    crearServicio,
    actualizarServicio,
    eliminarServicio,
    obtenerPorCancha,
    setError
  };
};

