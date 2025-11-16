import { post } from './api';

/**
 * Servicio para operaciones de verificación de código
 */

/**
 * Verifica el código de un usuario
 * @param {string} email - Correo electrónico del usuario
 * @param {string} codigo - Código de verificación de 6 dígitos
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const verifyUsuario = async (email, codigo) => {
  return await post('/api/usuarios/verify', { email, codigo });
};

/**
 * Verifica el código de un propietario de cancha
 * @param {string} correo - Correo electrónico del propietario
 * @param {string} codigo - Código de verificación de 6 dígitos
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const verifyCancha = async (correo, codigo) => {
  return await post('/api/canchas/verify', { correo, codigo });
};

/**
 * Reenvía el código de verificación a un usuario
 * @param {string} email - Correo electrónico del usuario
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const resendCodeUsuario = async (email) => {
  return await post('/api/usuarios/resend-code', { email });
};

/**
 * Reenvía el código de verificación a un propietario de cancha
 * @param {string} correo - Correo electrónico del propietario
 * @returns {Promise<Object>} Respuesta del servidor
 */
export const resendCodeCancha = async (correo) => {
  return await post('/api/canchas/resend-code', { correo });
};
