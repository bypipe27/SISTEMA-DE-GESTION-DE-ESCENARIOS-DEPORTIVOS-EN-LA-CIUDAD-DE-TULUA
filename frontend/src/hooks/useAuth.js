/**
 * Hook personalizado para manejo de autenticación
 * Centraliza la lógica de login, registro y gestión de sesión
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as authService from "../services/authService";
import { Usuario } from "../models/Usuario";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  /**
   * Inicia sesión
   */
  const handleLogin = async (email, password, remember = true) => {
    setLoading(true);
    setError("");

    // Validación básica
    const validation = Usuario.validateLogin({ email, password });
    if (!validation.valid) {
      setError(validation.errors[0]);
      setLoading(false);
      return false;
    }

    try {
      const data = await authService.login(email, password);

      // Redirigir según el rol
      if (data.usuario?.role === "provider" || data.usuario?.role === "proveedor") {
        navigate("/dashboard-provider");
      } else {
        navigate("/dashboard");
      }

      return true;
    } catch (err) {
      setError(err.message || "Error al iniciar sesión.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra un usuario regular
   */
  const handleRegister = async (userData) => {
    setLoading(true);
    setError("");

    // Validación
    const validation = Usuario.validateRegister(userData);
    if (!validation.valid) {
      setError(validation.errors[0]);
      setLoading(false);
      return { success: false };
    }

    try {
      // Remover confirmarContrasena antes de enviar
      const { confirmarContrasena, ...dataToSend } = userData;
      const result = await authService.register(dataToSend);

      // Redirigir a verificación
      return {
        success: true,
        message: result.mensaje || "Registro exitoso. Revisa tu correo.",
        email: userData.email,
      };
    } catch (err) {
      setError(err.message || "Error al registrar usuario.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registra un proveedor
   */
  const handleRegisterProvider = async (providerData) => {
    setLoading(true);
    setError("");

    // Validación
    const validation = Usuario.validateRegister(providerData);
    if (!validation.valid) {
      setError(validation.errors[0]);
      setLoading(false);
      return { success: false };
    }

    try {
      // Remover confirmarContrasena antes de enviar
      const { confirmarContrasena, ...dataToSend } = providerData;
      const result = await authService.registerProvider(dataToSend);

      return {
        success: true,
        message: result.mensaje || "Proveedor registrado. Revisa tu correo.",
        email: providerData.email,
      };
    } catch (err) {
      setError(err.message || "Error al registrar proveedor.");
      return { success: false };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cierra sesión
   */
  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  /**
   * Limpia el error
   */
  const clearError = () => {
    setError("");
  };

  return {
    loading,
    error,
    handleLogin,
    handleRegister,
    handleRegisterProvider,
    handleLogout,
    clearError,
    isAuthenticated: authService.isAuthenticated(),
    currentUser: authService.getCurrentUser(),
  };
}
