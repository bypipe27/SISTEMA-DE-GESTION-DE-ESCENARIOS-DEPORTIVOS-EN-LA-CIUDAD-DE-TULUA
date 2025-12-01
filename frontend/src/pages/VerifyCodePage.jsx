import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaEnvelope, FaCheckCircle, FaClock, FaShieldAlt } from "react-icons/fa";
import NavBar from "../components/NavBar";
import Button from "../components/Button";
import { useVerification } from "../hooks/useVerification";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

function VerifyCodePage() {
  const q = useQuery();
  const navigate = useNavigate();
  const email = q.get("email") || "";
  const tipo = q.get("type") || "user";

  const {
    codigo,
    setCodigo,
    msg,
    loading,
    seconds,
    onVerify,
    onResend
  } = useVerification(email, tipo, 40);

  // Temporizador de validez del código (10 minutos = 600 segundos)
  const [codeValiditySeconds, setCodeValiditySeconds] = React.useState(600);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCodeValiditySeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Resetear temporizador al reenviar código
  useEffect(() => {
    if (seconds === 40) {
      setCodeValiditySeconds(600);
    }
  }, [seconds]);

  useEffect(() => {
    if (!email) {
      navigate("/", { replace: true });
    }
  }, [email, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    const result = await onVerify(e);
    
    if (result.success) {
      setTimeout(() => {
        navigate("/login");
      }, 800);
    }
  };

  const handleResend = async () => {
    await onResend();
  };

  // Formatear tiempo restante
  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Calcular porcentaje para la barra de progreso
  const validityPercentage = (codeValiditySeconds / 600) * 100;
  
  // Determinar color basado en tiempo restante
  const getTimerColor = () => {
    if (codeValiditySeconds > 300) return "text-green-600"; // > 5 min
    if (codeValiditySeconds > 120) return "text-yellow-600"; // > 2 min
    return "text-red-600"; // < 2 min
  };

  const getProgressColor = () => {
    if (codeValiditySeconds > 300) return "stroke-green-500";
    if (codeValiditySeconds > 120) return "stroke-yellow-500";
    return "stroke-red-500";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/40 text-gray-800 flex flex-col relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-200/20 to-emerald-300/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-green-200/20 to-teal-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
      
      <NavBar />

      <div className="flex-grow flex items-center justify-center px-4 py-10 relative z-10">
        <motion.div
          className="w-full max-w-lg"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {/* Card principal */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-teal-100/50 overflow-hidden">
            {/* Header con gradiente */}
            <div className="bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600 px-8 py-10 text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4 relative"
              >
                <FaEnvelope className="text-4xl text-white" />
                <motion.div
                  className="absolute -top-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring" }}
                >
                  <FaShieldAlt className="text-xs text-yellow-900" />
                </motion.div>
              </motion.div>
              
              <h1 className="text-3xl font-extrabold text-white mb-2 drop-shadow-lg">Verifica tu correo</h1>
              <p className="text-teal-50 text-sm font-medium">Seguridad y autenticación</p>
            </div>

            {/* Contenido del formulario */}
            <div className="px-8 py-8">
              {/* Email badge */}
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-xl p-4 mb-6 text-center">
                <p className="text-sm text-slate-600 mb-1">Código enviado a</p>
                <p className="font-bold text-teal-900 flex items-center justify-center gap-2 break-all">
                  <FaEnvelope className="text-teal-600 flex-shrink-0" />
                  <span className="text-sm">{email}</span>
                </p>
              </div>

              {/* Temporizador de validez del código */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className={`mb-6 bg-gradient-to-br from-white to-slate-50 border-2 rounded-xl p-5 shadow-md transition-all duration-300 ${
                  codeValiditySeconds <= 120 
                    ? 'border-red-300 bg-red-50/50 animate-pulse-scale' 
                    : codeValiditySeconds <= 300
                    ? 'border-yellow-300'
                    : 'border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FaClock className={`transition-all duration-300 ${
                        codeValiditySeconds <= 120 
                          ? 'text-red-600 animate-bounce-slow' 
                          : 'text-teal-600'
                      }`} />
                      <p className="text-xs font-bold text-slate-700">Código válido por:</p>
                    </div>
                    <div className={`text-3xl font-extrabold ${getTimerColor()} transition-colors duration-300`}>
                      {formatTime(codeValiditySeconds)}
                    </div>
                    <p className={`text-xs mt-1 font-medium transition-colors duration-300 ${
                      codeValiditySeconds <= 120 
                        ? 'text-red-600' 
                        : codeValiditySeconds <= 300
                        ? 'text-yellow-600'
                        : 'text-slate-500'
                    }`}>
                      {codeValiditySeconds > 120 
                        ? 'El código expirará pronto' 
                        : codeValiditySeconds > 0
                        ? '⚠️ ¡Apresúrate! El código expira pronto'
                        : '❌ Código expirado - Solicita uno nuevo'}
                    </p>
                  </div>
                  
                  {/* Círculo de progreso animado */}
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <svg className="transform -rotate-90 w-24 h-24">
                      {/* Círculo de fondo */}
                      <circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        className="text-slate-200"
                      />
                      {/* Círculo de progreso */}
                      <motion.circle
                        cx="48"
                        cy="48"
                        r="40"
                        stroke="currentColor"
                        strokeWidth="6"
                        fill="none"
                        className={`${getProgressColor()} transition-colors duration-500`}
                        strokeLinecap="round"
                        initial={{ strokeDasharray: "251.2 251.2", strokeDashoffset: 0 }}
                        animate={{ 
                          strokeDashoffset: 251.2 - (251.2 * validityPercentage) / 100 
                        }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        style={{
                          strokeDasharray: "251.2 251.2"
                        }}
                      />
                    </svg>
                    {/* Porcentaje en el centro */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={`text-lg font-bold ${getTimerColor()}`}>
                        {Math.round(validityPercentage)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Barra de progreso lineal adicional */}
                <div className="mt-4 w-full bg-slate-200 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <motion.div
                    className={`h-full rounded-full transition-colors duration-500 ${
                      codeValiditySeconds > 300 
                        ? 'bg-gradient-to-r from-green-400 to-green-600' 
                        : codeValiditySeconds > 120 
                        ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' 
                        : 'bg-gradient-to-r from-red-400 to-red-600'
                    }`}
                    initial={{ width: "100%" }}
                    animate={{ width: `${validityPercentage}%` }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  />
                </div>
                
                {/* Mensaje de alerta cuando quedan menos de 2 minutos */}
                {codeValiditySeconds <= 120 && codeValiditySeconds > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 flex items-center gap-2 text-xs font-semibold text-red-700 bg-red-100 px-3 py-2 rounded-lg border border-red-300"
                  >
                    <FaShieldAlt className="animate-pulse" />
                    <span>Ingresa el código ahora antes de que expire</span>
                  </motion.div>
                )}
              </motion.div>

              <form onSubmit={handleVerify} className="space-y-6">
                <div>
                  <label htmlFor="codigo" className="block text-sm font-bold text-slate-700 mb-3 text-center">
                    Ingresa el código de 6 dígitos
                  </label>
                  <div className="relative">
                    <input
                      id="codigo"
                      className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 px-4 border-3 border-teal-300 bg-white rounded-xl focus:ring-4 focus:ring-teal-200 focus:border-teal-500 transition-all duration-300 text-teal-900 placeholder-teal-200 outline-none shadow-sm hover:border-teal-400 hover:shadow-md"
                      placeholder="● ● ● ● ● ●"
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      inputMode="numeric"
                      maxLength={6}
                      required
                      aria-invalid={msg && msg.toLowerCase().includes("error") ? "true" : undefined}
                      aria-describedby={msg && msg.toLowerCase().includes("error") ? "codigo-error" : undefined}
                    />
                    {codigo.length === 6 && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2"
                      >
                        <FaCheckCircle className="text-green-500 text-2xl" />
                      </motion.div>
                    )}
                  </div>
                </div>

                {msg && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`text-center text-sm font-medium p-3 rounded-lg ${
                      msg.toLowerCase().includes("error")
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-green-50 text-green-700 border border-green-200"
                    }`}
                    id={msg.toLowerCase().includes("error") ? "codigo-error" : undefined}
                  >
                    {msg}
                  </motion.div>
                )}

                <div className="pt-2">
                  <Button 
                    type="submit"
                    color="green" 
                    className="w-full py-4 text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 flex items-center justify-center gap-3" 
                    disabled={loading || codigo.length !== 6 || codeValiditySeconds === 0}
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Verificando...</span>
                      </>
                    ) : codeValiditySeconds === 0 ? (
                      <>
                        <FaClock className="text-xl" />
                        <span>Código expirado</span>
                      </>
                    ) : (
                      <>
                        <FaCheckCircle className="text-xl" />
                        <span>Confirmar código</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {/* Resend section */}
              <div className="mt-6 pt-6 border-t-2 border-slate-100">
                <div className="text-center">
                  {seconds > 0 ? (
                    <div className="flex items-center justify-center gap-2 text-slate-500">
                      <FaClock className="text-teal-500" />
                      <span className="text-sm">
                        ¿No te llegó? Puedes reenviar en <span className="font-bold text-teal-600">{seconds}s</span>
                      </span>
                    </div>
                  ) : (
                    <button 
                      onClick={handleResend} 
                      className="text-teal-700 font-bold text-sm hover:text-teal-800 transition-colors duration-200 flex items-center justify-center gap-2 mx-auto px-6 py-2 bg-teal-50 hover:bg-teal-100 rounded-lg border-2 border-teal-200 hover:border-teal-300"
                    >
                      <FaEnvelope />
                      Reenviar código
                    </button>
                  )}
                </div>
              </div>

              {/* Info adicional */}
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-400 p-4 rounded-lg">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <FaShieldAlt className="text-blue-500 text-xl mt-0.5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-blue-900 mb-1">Consejo de seguridad</p>
                    <p className="text-xs text-blue-700">
                      Nunca compartas este código con nadie. El código es válido solo por unos minutos.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer info */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center text-xs text-slate-500 mt-6"
          >
            Si tienes problemas, contacta al administrador del sistema
          </motion.p>
        </motion.div>
      </div>

      <footer className="text-center py-6 text-sm text-slate-600 relative z-10 bg-white/50 backdrop-blur-sm border-t border-slate-200">
        © 2025 Sistema de Gestión de Canchas — Proyecto académico
      </footer>
    </div>
  );
}

export default VerifyCodePage;
