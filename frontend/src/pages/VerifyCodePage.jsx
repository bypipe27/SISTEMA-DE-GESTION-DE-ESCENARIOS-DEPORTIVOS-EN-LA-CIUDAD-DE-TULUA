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

// ...existing code...
  useEffect(() => {
    if (!email) {
      // si no viene email en query, regresar al home
      navigate("/", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);

  const onVerify = async (e) => {
    e.preventDefault();
    if (!codigo) {
      setMsg("Ingrese el código recibido.");
      return;
    }

    setLoading(true);
    setMsg("");

    const tipo = q.get("type") || "user"; // 'cancha' o 'user'
    try {
      let endpoint = "";
      let body = {};

      if (tipo === "cancha") {
        endpoint = "http://localhost:5000/api/canchas/verify";
        body = { correo: email, codigo };
      } else {
        endpoint = "http://localhost:5000/api/usuarios/verify";
        body = { email, codigo };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data.error || `Error ${res.status} verificando código.`);
        setLoading(false);
        return;
      }

      // éxito: si era verificación de CANCHA, dirigir a login; si user, también a login
      setMsg(data.mensaje || "Verificación correcta.");
      setTimeout(() => {
        navigate("/login");
      }, 800);
    } catch (err) {
      console.error(err);
      setMsg("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    // reenvío: intenta llamar al endpoint de reenvío según type.
    const tipo = q.get("type") || "user";
    setMsg("");
    setLoading(true);

    try {
      let endpoint = "";
      let body = {};

      if (tipo === "cancha") {
        // si implementaste un endpoint de reenvío para canchas, usa /api/canchas/resend-code
        endpoint = "http://localhost:5000/api/canchas/resend-code";
        body = { correo: email };
      } else {
        endpoint = "http://localhost:5000/api/usuarios/resend-code";
        body = { email };
      }

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg(data.error || `Error ${res.status} al reenviar código.`);
        setLoading(false);
        return;
      }

      setMsg(data.mensaje || "Se reenvió el código al correo.");
      setSeconds(RESEND_SECONDS);
    } catch (err) {
      console.error(err);
      setMsg("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
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
