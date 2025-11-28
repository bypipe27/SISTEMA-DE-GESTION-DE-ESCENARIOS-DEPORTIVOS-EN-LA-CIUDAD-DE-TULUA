/**
 * Servicio de Reservas
 * Centraliza todas las llamadas relacionadas con reservas
 */


import { get, put, post } from "./api";


/**
 * Obtiene todas las reservas del proveedor autenticado
 * @returns {Promise<Array>}
 */
export async function getProviderReservas() {
  return await get("/api/reservas/provider");
}


/**
 * Obtiene las próximas reservas del proveedor
 * @returns {Promise<Array>}
 */
export async function getProviderProximasReservas() {
  return await get("/api/reservas/provider/proximas");
}


/**
 * Obtiene reportes de reservas del proveedor
 * @param {number} year
 * @param {number} month
 * @returns {Promise<object>}
 */
export async function getProviderReportes(year, month) {
  return await get(`/api/reservas/provider/reportes?year=${year}&month=${month}`);
}


/**
 * Cancela una reserva
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function cancelarReserva(id) {
  return await put(`/api/reservas/provider/cancelar/${id}`);
}


/**
 * Marca una reserva como completada
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function completarReserva(id) {
  return await put(`/api/reservas/provider/completar/${id}`);
}


/**
 * Marca una reserva como no-show
 * @param {number} id
 * @returns {Promise<object>}
 */
export async function marcarNoShow(id) {
  return await put(`/api/reservas/provider/no-show/${id}`);
}


/**
 * Normaliza datos de reserva para asegurar campos consistentes
 * @param {object} reserva
 * @returns {object}
 */
export function normalizeReserva(reserva) {
  return {
    ...reserva,
    fecha: reserva.fecha ?? reserva.fecha_reserva ?? null,
    inicio: reserva.inicio ?? reserva.hora_inicio ?? null,
  };
}


/**
 * Normaliza un array de reservas
 * @param {Array} reservas
 * @returns {Array}
 */
export function normalizeReservas(reservas) {
  if (!Array.isArray(reservas)) return [];
  return reservas.map(normalizeReserva);
}


/**
 * Crea una nueva reserva
 * @param {object} reservaData
 * @returns {Promise<object>}
 */
export async function crearReserva(reservaData) {
  return await post("/api/reservas", reservaData);
}


// Exportar por defecto
const reservaService = {
  getProviderReservas,
  getProviderProximasReservas,
  getProviderReportes,
  cancelarReserva,
  completarReserva,
  marcarNoShow,
  normalizeReserva,
  normalizeReservas,
  crearReserva
};


export default reservaService;



