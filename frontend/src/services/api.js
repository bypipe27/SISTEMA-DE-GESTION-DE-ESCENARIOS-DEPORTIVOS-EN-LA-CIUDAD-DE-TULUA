/**
 * Cliente HTTP base para todas las llamadas a la API
 * Centraliza configuración y manejo de errores
 */

const API_BASE = import.meta.env.VITE_API_BASE || 
                 import.meta.env.VITE_BACKEND_URL || 
                 import.meta.env.VITE_API_URL || 
                 "http://localhost:5000";

/**
 * Realiza una petición HTTP genérica
 * @param {string} endpoint - Ruta relativa del endpoint (ej: "/api/usuarios/login")
 * @param {object} options - Opciones de fetch (method, headers, body, etc.)
 * @returns {Promise<object>} Respuesta parseada o error
 */
async function request(endpoint, options = {}) {
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  // Agregar token si existe
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    // Intentar parsear la respuesta
    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Si la respuesta no es ok, lanzar error con el mensaje del servidor
    if (!response.ok) {
      const errorMessage = typeof data === "object" ? data.error : data;
      throw new Error(errorMessage || `Error ${response.status}`);
    }

    return data;
  } catch (error) {
    // Re-lanzar el error para que el servicio lo maneje
    throw error;
  }
}

/**
 * GET request
 */
export async function get(endpoint, options = {}) {
  return request(endpoint, { ...options, method: "GET" });
}

/**
 * POST request
 */
export async function post(endpoint, body, options = {}) {
  return request(endpoint, {
    ...options,
    method: "POST",
    body: JSON.stringify(body),
  });
}

/**
 * PUT request
 */
export async function put(endpoint, body, options = {}) {
  return request(endpoint, {
    ...options,
    method: "PUT",
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request
 */
export async function del(endpoint, options = {}) {
  return request(endpoint, { ...options, method: "DELETE" });
}

export { API_BASE };
