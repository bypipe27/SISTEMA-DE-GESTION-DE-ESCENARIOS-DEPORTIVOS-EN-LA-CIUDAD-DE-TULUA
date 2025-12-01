/**
 * Servicio de Reseñas
 * Provee funciones para listar, crear y obtener reseñas por usuario
 */

import { get, post } from "./api";

/**
 * Obtiene reseñas de una cancha
 * @param {number|string} canchaId
 * @param {number} limit
 * @param {number} offset
 * @returns {Promise<Array>}
 */
export async function getReviews(canchaId, limit = 50, offset = 0) {
  return await get(`/api/canchas/${canchaId}/reviews?limit=${limit}&offset=${offset}`);
}

/**
 * Publica o actualiza una reseña para una cancha
 * @param {number|string} canchaId
 * @param {object} payload
 * @returns {Promise<object>} respuesta del servidor
 */
export async function postReview(canchaId, payload) {
  return await post(`/api/canchas/${canchaId}/reviews`, payload);
}

/**
 * Obtiene reseñas de un usuario por su email
 * @param {string} email
 * @returns {Promise<Array>} arreglo de reseñas
 */
export async function getReviewsByUserEmail(email) {
  if (!email) return [];
  return await get(`/api/reviews/user?email=${encodeURIComponent(email)}`);
}

const reviewService = {
  getReviews,
  postReview,
  getReviewsByUserEmail,
};

export default reviewService;
