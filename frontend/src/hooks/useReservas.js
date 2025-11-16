/**
 * Hook personalizado para manejo de reservas del proveedor
 */

import { useState, useEffect } from "react";
import * as reservaService from "../services/reservaService";

export function useProviderReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReservas = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await reservaService.getProviderReservas();
      const normalized = reservaService.normalizeReservas(data);
      normalized.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
      setReservas(normalized);
    } catch (err) {
      setError(err.message || "Error al cargar reservas");
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  return {
    reservas,
    loading,
    error,
    refetch: fetchReservas,
  };
}

/**
 * Hook para obtener próximas reservas
 */
export function useProviderProximasReservas() {
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchReservas = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await reservaService.getProviderProximasReservas();
      const normalized = reservaService.normalizeReservas(data);
      setReservas(normalized);
    } catch (err) {
      setError(err.message || "Error al cargar próximas reservas");
      setReservas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservas();
  }, []);

  return {
    reservas,
    loading,
    error,
    refetch: fetchReservas,
  };
}

/**
 * Hook para obtener reportes
 */
export function useProviderReportes(year, month) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await reservaService.getProviderReportes(year, month);
        setStats(data);
      } catch (err) {
        setError(err.message || "Error al cargar reportes");
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    if (year && month) {
      fetchStats();
    }
  }, [year, month]);

  return {
    stats,
    loading,
    error,
  };
}
