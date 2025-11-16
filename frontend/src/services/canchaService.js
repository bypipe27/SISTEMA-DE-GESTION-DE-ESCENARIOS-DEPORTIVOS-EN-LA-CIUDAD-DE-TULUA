/**
 * Servicio de Canchas
 * Centraliza todas las llamadas relacionadas con canchas
 */

import { get } from "./api";

/**
 * Obtiene todas las canchas
 * @returns {Promise<Array>}
 */
export async function getAllCanchas() {
  return await get("/api/canchas");
}

/**
 * Obtiene una cancha por ID
 * @param {number} id 
 * @returns {Promise<object>}
 */
export async function getCanchaById(id) {
  return await get(`/api/canchas/${id}`);
}

/**
 * Obtiene canchas del proveedor autenticado
 * @returns {Promise<Array>}
 */
export async function getProviderCanchas() {
  return await get("/api/canchas/provider");
}

/**
 * Filtra canchas por propietario
 * @param {Array} canchas 
 * @param {number} propietarioId 
 * @returns {Array}
 */
export function filterCanchasByOwner(canchas, propietarioId) {
  if (!Array.isArray(canchas)) return [];
  return canchas.filter(c => Number(c.propietario_id) === Number(propietarioId));
}

/**
 * Verifica si una cancha está disponible en una fecha específica
 * @param {object} cancha 
 * @param {string} fechaIso - formato YYYY-MM-DD
 * @returns {boolean}
 */
export function isCanchaAvailable(cancha, fechaIso) {
  if (!fechaIso) return Boolean(cancha.disponible);

  try {
    // Divide la fecha yyyy-mm-dd y crea el objeto Date en local
    const [year, month, day] = fechaIso.split("-");
    const fechaObj = new Date(Number(year), Number(month) - 1, Number(day));
    const dow = fechaObj.getDay(); // 0 = domingo, 1 = lunes, ..., 6 = sábado

    // Verifica si el día está cerrado
    const cerradosDias = cancha.cerrados_dias || cancha.cerradosdias || cancha.cerradosDias || [];
    if (cerradosDias.includes(dow)) return false;

    // Verifica si la fecha exacta está cerrada
    const cerradosFechas = cancha.cerrados_fechas || cancha.cerradosfechas || cancha.cerradosFechas || [];
    if (cerradosFechas.includes(fechaIso)) return false;

    return Boolean(cancha.disponible);
  } catch (err) {
    return Boolean(cancha.disponible);
  }
}
