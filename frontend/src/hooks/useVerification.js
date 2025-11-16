import { useState, useEffect } from 'react';
import * as verificationService from '../services/verificationService';

/**
 * Hook para gestionar la verificación de código
 * @param {string} email - Email del usuario/propietario
 * @param {string} tipo - 'user' o 'cancha'
 * @param {number} resendSeconds - Segundos para reenvío (por defecto 40)
 */
export const useVerification = (email, tipo = 'user', resendSeconds = 40) => {
  const [codigo, setCodigo] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(resendSeconds);

  // Temporizador para reenvío
  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const onVerify = async (e) => {
    if (e) e.preventDefault();
    
    if (!codigo) {
      setMsg("Ingrese el código recibido.");
      return { success: false };
    }

    setLoading(true);
    setMsg("");

    try {
      let data;
      
      if (tipo === "cancha") {
        data = await verificationService.verifyCancha(email, codigo);
      } else {
        data = await verificationService.verifyUsuario(email, codigo);
      }

      setMsg(data.mensaje || "Verificación correcta.");
      return { success: true, mensaje: data.mensaje };
    } catch (err) {
      setMsg(err.message || "No se pudo verificar el código.");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setMsg("");
    setLoading(true);

    try {
      let data;

      if (tipo === "cancha") {
        data = await verificationService.resendCodeCancha(email);
      } else {
        data = await verificationService.resendCodeUsuario(email);
      }

      setMsg(data.mensaje || "Se reenvió el código al correo.");
      setSeconds(resendSeconds);
      return { success: true, mensaje: data.mensaje };
    } catch (err) {
      setMsg(err.message || "No se pudo reenviar el código.");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    codigo,
    setCodigo,
    msg,
    loading,
    seconds,
    onVerify,
    onResend
  };
};
