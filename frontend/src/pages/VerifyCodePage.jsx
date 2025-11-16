import React, { useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      {/* estilos locales mínimos para look minimalista (no afectan lógica) */}
      <style>{`
      .vc-container { max-width: 520px; margin: 0 auto; padding: 24px; }
      .vc-card { background: #fff; border-radius: 14px; padding: 24px; box-shadow: 0 12px 30px rgba(2,6,23,0.06); border: 1px solid rgba(2,6,23,0.04); }
      .vc-input { width:100%; text-align:center; letter-spacing: 0.3rem; font-size:1.6rem; padding:12px 10px; border-radius:10px; border:1px solid rgba(15,23,42,0.06); }
      .vc-note { color:#6b7280; font-size:0.95rem; }
      .vc-msg-error { color:#b91c1c; font-size:0.9rem; }
      .vc-footer { text-align:center; padding:18px 0; color:#6b7280; font-size:0.85rem; }
    `}</style>

      <NavBar />

      <div className="flex-grow flex items-center justify-center px-4 py-10 vc-container">
        <motion.div
          className="vc-card w-full"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-semibold text-gray-900 text-center mb-2">Verifica tu correo</h1>
          <p className="text-center vc-note mb-6">
            Ingresa el código enviado a <span className="font-medium text-gray-900">{email}</span>
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <label htmlFor="codigo" className="sr-only">Código de verificación</label>
            <input
              id="codigo"
              className="vc-input bg-gray-50 text-gray-900 placeholder-gray-400 outline-none"
              placeholder="●●●●●●"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              required
              aria-invalid={msg && msg.toLowerCase().includes("error") ? "true" : undefined}
              aria-describedby={msg && msg.toLowerCase().includes("error") ? "codigo-error" : undefined}
            />

            {msg && (
              <p id={msg.toLowerCase().includes("error") ? "codigo-error" : undefined} className={msg.toLowerCase().includes("error") ? "vc-msg-error" : "vc-note"}>{msg}</p>
            )}

            <div className="pt-2">
              <Button color="green" className="w-full" disabled={loading}>
                {loading ? "Verificando..." : "Confirmar código"}
              </Button>
            </div>
          </form>

          <div className="mt-5 text-center text-sm">
            {seconds > 0 ? (
              <span className="vc-note">¿No te llegó? Reenviar en {seconds}s</span>
            ) : (
              <button onClick={handleResend} className="text-green-600 font-medium">Reenviar código</button>
            )}
          </div>
        </motion.div>
      </div>

      <footer className="vc-footer">
        © 2025 Sistema de Gestión de Canchas — Proyecto académico
      </footer>
    </div>
  );
}

export default VerifyCodePage;
