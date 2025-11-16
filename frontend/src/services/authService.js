/**
 * Servicio de autenticación
 * Centraliza todas las llamadas relacionadas con login, registro y autenticación
 */

import { post } from "./api";

/**
 * Inicia sesión con credenciales de usuario
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{token: string, usuario: object}>}
 */
export async function login(email, password) {
  const data = await post("/api/usuarios/login", {
    email,
    contrasena: password,
  });

  // Guardar en localStorage
  if (data.token && data.usuario) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data.usuario));
  }

  return data;
}

/**
 * Registra un nuevo usuario regular
 * @param {object} userData - { nombre, email, telefono, contrasena }
 * @returns {Promise<object>}
 */
export async function register(userData) {
  return await post("/api/usuarios/register", userData);
}

/**
 * Registra un nuevo proveedor
 * @param {object} providerData - { nombre, email, telefono, contrasena }
 * @returns {Promise<object>}
 */
export async function registerProvider(providerData) {
  return await post("/api/usuarios/register-provider", providerData);
}

/**
 * Cierra la sesión del usuario
 */
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("usuario");
}

/**
 * Obtiene el usuario actual desde localStorage
 * @returns {object|null}
 */
export function getCurrentUser() {
  try {
    const usuario = localStorage.getItem("usuario");
    return usuario ? JSON.parse(usuario) : null;
  } catch (error) {
    return null;
  }
}

/**
 * Verifica si hay un usuario autenticado
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

/**
 * Obtiene el role del usuario actual
 * @returns {string|null} "user", "provider", etc.
 */
export function getUserRole() {
  const user = getCurrentUser();
  return user?.role || null;
}
