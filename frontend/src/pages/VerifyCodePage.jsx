import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import NavBar from "../components/NavBar";
import Button from "../components/Button";

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const RESEND_SECONDS = 40;

function VerifyCodePage() {
  const q = useQuery();
  const navigate = useNavigate();
  const email = q.get("email") || "";
  const [codigo, setCodigo] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (!email) navigate("/register", { replace: true });
  }, [email, navigate]);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const onVerify = async (e) => {
    e.preventDefault();
    if (!codigo) return;

    setLoading(true);
    setMsg("");
    try {
      const r = await fetch("http://localhost:5000/api/usuarios/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, codigo }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "No se pudo verificar");

      if (data?.token) localStorage.setItem("token", data.token);
      navigate("/login", { replace: true });
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (seconds > 0) return;
    setMsg("");
    try {
      const r = await fetch("http://localhost:5000/api/usuarios/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "No se pudo reenviar el código");
      setSeconds(RESEND_SECONDS);
      setMsg("Te enviamos un nuevo código. Revisa tu correo.");
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 to-green-900 text-white flex flex-col">
      <NavBar />

      <div className="flex-grow flex items-center justify-center px-4 py-10">
        <motion.div
          className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-xl"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-2xl font-bold mb-2 text-center">Verifica tu correo</h1>
          <p className="text-center text-white/80 mb-6">
            Ingresá el código que enviamos a <span className="font-semibold">{email}</span>
          </p>

          <form onSubmit={onVerify} className="space-y-4">
            <input
              className="w-full tracking-widest text-center text-2xl px-4 py-3 rounded-xl bg-white/90 text-gray-800 placeholder-gray-500 outline-none"
              placeholder="••••••"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, "").slice(0, 6))}
              inputMode="numeric"
              maxLength={6}
              required
            />

            {msg && <p className="text-red-200 text-sm">{msg}</p>}

            <div className="pt-2">
              <Button color="green" disabled={loading}>
                {loading ? "Verificando..." : "Confirmar código"}
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center text-sm text-white/90">
            {seconds > 0 ? (
              <span>¿No te llegó? Reenviar en {seconds}s</span>
            ) : (
              <button onClick={onResend} className="underline">
                Reenviar código
              </button>
            )}
          </div>
        </motion.div>
      </div>

      <footer className="text-center py-6 text-gray-200 text-sm bg-green-800/30 backdrop-blur-sm">
        © 2025 Sistema de Gestión de Canchas — Proyecto académico
      </footer>
    </div>
  );
}

export default VerifyCodePage;
