/**
 * Hook personalizado para manejo de canchas
 */

import { useState, useEffect, useMemo } from "react";
import * as canchaService from "../services/canchaService";

export function useCanchas(filters = {}) {
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCanchas = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await canchaService.getAllCanchas();
      setCanchas(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Error al cargar canchas");
      setCanchas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCanchas();
  }, []);

  // Filtrado de canchas
  const filteredCanchas = useMemo(() => {
    let result = [...canchas];

    // Filtro por propietario
    if (filters.propietarioId) {
      result = canchaService.filterCanchasByOwner(result, filters.propietarioId);
    }

    // Filtro por búsqueda de texto
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter(
        (c) =>
          (c.nombre || "").toLowerCase().includes(term) ||
          (c.tipo || "").toLowerCase().includes(term)
      );
    }

    // Filtro por tipo
    if (filters.tipo) {
      result = result.filter((c) => c.tipo === filters.tipo);
    }

    // Filtro por disponibilidad en fecha
    if (filters.soloDisponibles && filters.fecha) {
      result = result.filter((c) =>
        canchaService.isCanchaAvailable(c, filters.fecha)
      );
    }

    return result;
  }, [canchas, filters]);

  // Obtener tipos únicos para filtros
  const tipos = useMemo(() => {
    return Array.from(new Set(canchas.map((c) => c.tipo)));
  }, [canchas]);

  return {
    canchas: filteredCanchas,
    allCanchas: canchas,
    loading,
    error,
    tipos,
    refetch: fetchCanchas,
  };
}

/**
 * Hook para obtener una cancha específica por ID
 */
export function useCancha(id) {
  const [cancha, setCancha] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCancha = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await canchaService.getCanchaById(id);
        setCancha(data);
      } catch (err) {
        setError(err.message || "Error al cargar cancha");
        setCancha(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCancha();
    }
  }, [id]);

  return { cancha, loading, error };
}
