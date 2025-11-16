import { useState } from 'react';
import * as passwordService from '../services/passwordService';

/**
 * Hook para gestionar el flujo de "Olvidé mi contraseña"
 */
export const useForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMensaje("");

    try {
      const data = await passwordService.forgotPassword(email);
      setMensaje(data.mensaje || "Enlace enviado correctamente");
      setEmail("");
    } catch (err) {
      setError(err.message || "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    mensaje,
    error,
    loading,
    handleSubmit
  };
};

/**
 * Hook para gestionar el restablecimiento de contraseña
 */
export const useResetPassword = (token, email) => {
  const [formData, setFormData] = useState({
    nuevaContrasena: "",
    confirmarContrasena: "",
  });
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [tokenValido, setTokenValido] = useState(false);
  const [verificando, setVerificando] = useState(true);

  // Verificar token
  const verificarToken = async () => {
    if (!token || !email) {
      setError("Enlace inválido o expirado.");
      setVerificando(false);
      return;
    }

    try {
      const data = await passwordService.verifyResetToken(token, email);
      if (data.valido) {
        setTokenValido(true);
      } else {
        setError(data.error || "El enlace ha expirado o es inválido.");
      }
    } catch (err) {
      setError(err.message || "Error al verificar el enlace.");
    } finally {
      setVerificando(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.nuevaContrasena !== formData.confirmarContrasena) {
      setError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    if (formData.nuevaContrasena.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const data = await passwordService.resetPassword(token, email, formData.nuevaContrasena);
      setMensaje(data.mensaje || "Contraseña restablecida correctamente");
    } catch (err) {
      setError(err.message || "Ocurrió un error al restablecer la contraseña.");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    error,
    mensaje,
    loading,
    tokenValido,
    verificando,
    verificarToken,
    handleChange,
    handleSubmit
  };
};
