import { post } from './api';

/**
 * Servicio para operaciones de recuperación de contraseña
 */

/**
 * Solicita un enlace de recuperación de contraseña
 * @param {string} email - Correo electrónico del usuario
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const forgotPassword = async (email) => {
  return await post('/api/password/forgot-password', { email });
};

/**
 * Verifica si un token de reset es válido
 * @param {string} token - Token de verificación
 * @param {string} email - Correo electrónico del usuario
 * @returns {Promise<Object>} Respuesta con validez del token
 */
export const verifyResetToken = async (token, email) => {
  return await post('/api/password/verify-reset-token', { token, email });
};

/**
 * Restablece la contraseña del usuario
 * @param {string} token - Token de verificación
 * @param {string} email - Correo electrónico del usuario
 * @param {string} nuevaContrasena - Nueva contraseña
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const resetPassword = async (token, email, nuevaContrasena) => {
  return await post('/api/password/reset-password', {
    token,
    email,
    nueva_contrasena: nuevaContrasena
  });
};
