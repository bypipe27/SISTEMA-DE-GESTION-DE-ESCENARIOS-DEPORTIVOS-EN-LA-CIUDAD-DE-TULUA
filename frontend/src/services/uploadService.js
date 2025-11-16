/**
 * Servicio para subir imágenes a Cloudinary
 * Configuración limpia con validaciones
 */

// Configuración de Cloudinary (obtenida del dashboard)
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "demo";
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "ml_default";

// Restricciones
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/**
 * Valida un archivo de imagen antes de subirlo
 * @param {File} file - Archivo a validar
 * @returns {object} { isValid: boolean, error: string }
 */
export function validateImage(file) {
  if (!file) {
    return { isValid: false, error: "No se seleccionó ningún archivo" };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: "Formato no permitido. Solo se aceptan JPG, PNG o WebP",
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `El archivo es muy grande. Máximo 5MB (tamaño: ${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    };
  }

  return { isValid: true, error: null };
}

/**
 * Sube una imagen a Cloudinary
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string>} URL de la imagen subida
 */
export async function uploadImage(file) {
  // Validar antes de subir
  const validation = validateImage(file);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", "canchas"); // Organizar en carpeta

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Error al subir la imagen al servidor");
    }

    const data = await response.json();
    return data.secure_url; // URL HTTPS de la imagen
  } catch (error) {
    throw new Error(error.message || "Error al subir la imagen");
  }
}

/**
 * Genera un preview local de la imagen antes de subirla
 * @param {File} file - Archivo de imagen
 * @returns {Promise<string>} URL del preview (data URL)
 */
export function generatePreview(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error("Error al leer el archivo"));
    reader.readAsDataURL(file);
  });
}
