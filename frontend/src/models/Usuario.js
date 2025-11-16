/**
 * Modelo de Usuario
 * Define la estructura, validaciones y transformaciones de datos de usuario
 */

export class Usuario {
  constructor(data = {}) {
    this.id = data.id || null;
    this.nombre = data.nombre || "";
    this.email = data.email || "";
    this.telefono = data.telefono || "";
    this.role = data.role || "user";
    this.verificado = data.verificado || false;
  }

  /**
   * Valida que el email tenga formato correcto
   */
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Valida que la contraseña cumpla requisitos mínimos
   */
  static isValidPassword(password) {
    return password && password.length >= 6;
  }

  /**
   * Valida que dos contraseñas coincidan
   */
  static passwordsMatch(password, confirmPassword) {
    return password === confirmPassword;
  }

  /**
   * Valida datos de registro de usuario
   * @returns {object} { valid: boolean, errors: string[] }
   */
  static validateRegister(data) {
    const errors = [];

    if (!data.nombre || data.nombre.trim().length === 0) {
      errors.push("El nombre es requerido.");
    }

    if (!data.email || !Usuario.isValidEmail(data.email)) {
      errors.push("El email no es válido.");
    }

    if (!data.contrasena || !Usuario.isValidPassword(data.contrasena)) {
      errors.push("La contraseña debe tener al menos 6 caracteres.");
    }

    if (!Usuario.passwordsMatch(data.contrasena, data.confirmarContrasena)) {
      errors.push("Las contraseñas no coinciden.");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Valida datos de login
   */
  static validateLogin(data) {
    const errors = [];

    if (!data.email || data.email.trim().length === 0) {
      errors.push("El email es requerido.");
    }

    if (!data.password || data.password.trim().length === 0) {
      errors.push("La contraseña es requerida.");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Verifica si el usuario es proveedor
   */
  isProvider() {
    return this.role === "provider" || this.role === "proveedor";
  }

  /**
   * Convierte el usuario a JSON limpio
   */
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      email: this.email,
      telefono: this.telefono,
      role: this.role,
      verificado: this.verificado,
    };
  }
}
