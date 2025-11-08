// ...existing code...
const db = require("../db.js");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// modelos nuevos/auxiliares (asegúrate de crear estos archivos según lo propuesto)
const {
  crearPendienteCancha,
  obtenerPendienteCanchaPorCorreo,
  incrementarIntentoCodigoCancha,
  actualizarCodigoCancha,
  eliminarPendienteCancha,
} = require("../models/pendingCanchaModel");
const { crearCancha } = require("../models/canchaModel");
const { existeUsuarioPorEmail, crearUsuario } = require("../models/usuarioModel");
const { reenviarCodigo } = require("./usuariosController.js");

const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: EMAIL_USER, pass: EMAIL_PASS },
});

const CODIGO_MINUTOS_EXPIRA = 10;
const MAX_INTENTOS = 5;
const generarCodigo6 = () => Math.floor(100000 + Math.random() * 900000).toString();

async function obtenerCanchas(req, res) {
  try {
    const result = await db.query("SELECT * FROM canchas ORDER BY id ASC");
    const filas = (result.rows || result).map((c) => {
      let rawCerrados = c.cerradosdias ?? c.cerrados_dias ?? c.cerradosDias ?? [];
      if (typeof rawCerrados === "string") {
        try { rawCerrados = JSON.parse(rawCerrados); } catch { rawCerrados = []; }
      }
      if (!Array.isArray(rawCerrados)) rawCerrados = [];

      return {
        ...c,
        cerradosdias: rawCerrados.map(n => Number(n)).filter(n => !Number.isNaN(n)),
        cerradosfechas: c.cerradosfechas ?? c.cerrados_fechas ?? [],
        ocupadas: c.ocupadas ?? [],
      };
    });

    console.log("✅ Canchas consultadas (controller):", filas.length);
    res.json(filas);
  } catch (error) {
    console.error("❌ Error al obtener canchas (controller):", error);
    res.status(500).json({ error: "Error al obtener las canchas" });
  }
}

async function obtenerCanchaPorId(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await db.query("SELECT * FROM canchas WHERE id = $1", [id]);
    const fila = (result.rows && result.rows[0]) || null;
    if (!fila) return res.status(404).json({ error: "Cancha no encontrada" });

    let rawCerrados = fila.cerradosdias ?? fila.cerrados_dias ?? fila.cerradosDias ?? [];
    if (typeof rawCerrados === "string") {
      try { rawCerrados = JSON.parse(rawCerrados); } catch { rawCerrados = []; }
    }
    if (!Array.isArray(rawCerrados)) rawCerrados = [];

    const cancha = {
      ...fila,
      cerradosdias: rawCerrados.map(n => Number(n)).filter(n => !Number.isNaN(n)),
      cerradosfechas: fila.cerradosfechas ?? fila.cerrados_fechas ?? [],
      ocupadas: fila.ocupadas ?? [],
    };

    res.json(cancha);
  } catch (error) {
    console.error("❌ Error obtenerCanchaPorId:", error);
    res.status(500).json({ error: "Error al obtener la cancha" });
  }
}

// =============== NUEVO: registro pendiente de cancha (envía código) ===========
async function registrarCanchaPendiente(req, res) {
  try {
    const {
      correo,
      nombre,
      tipo,
      capacidad,
      precio,
      descripcion,
      ubicacion_frame,
      direccion,
      contrasena,
    } = req.body || {};

    if (!correo || !nombre || !tipo || !capacidad || !precio || !contrasena) {
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }

    const capacidadNum = Number(capacidad);
    const precioNum = Number(precio);
    if (Number.isNaN(capacidadNum) || Number.isNaN(precioNum)) {
      return res.status(400).json({ error: "Capacidad y precio deben ser números válidos." });
    }

    const contrasena_hash = await bcrypt.hash(contrasena, 10);
    const codigo = generarCodigo6();
    const codigo_hash = await bcrypt.hash(codigo, 10);
    const expira_en = new Date(Date.now() + CODIGO_MINUTOS_EXPIRA * 60 * 1000);

    await crearPendienteCancha({
      correo,
      nombre_cancha: nombre,
      tipo,
      capacidad: capacidadNum,
      precio: precioNum,
      descripcion: descripcion || null,
      ubicacion_frame: ubicacion_frame || null,
      direccion: direccion || null,
      contrasena_hash,
      codigo_hash,
      expira_en,
    });

    try {
      await transporter.verify();
      await transporter.sendMail({
        from: `"Sistema de Canchas" <${EMAIL_USER}>`,
        to: correo,
        subject: "Código para confirmar registro de cancha",
        html: `
          <h3>Registrar cancha: ${nombre}</h3>
          <p>Usa este código para confirmar el registro de la cancha:</p>
          <div style="font-size:28px;font-weight:bold;letter-spacing:4px">${codigo}</div>
          <p>Caduca en <b>${CODIGO_MINUTOS_EXPIRA} minutos</b>.</p>
        `,
      });
    } catch (mailErr) {
      console.warn("⚠️ No se pudo enviar correo (pero se guardó pendiente):", mailErr.message || mailErr);
      // no fallamos completamente: informamos que el pendiente existe pero correo falló
      return res.status(200).json({ mensaje: "Registro pendiente creado, pero no se pudo enviar el correo: " + (mailErr.message || "error de email") });
    }

    return res.json({ mensaje: "Se envió un código al correo para confirmar el registro de la cancha.", next: "/verify?type=cancha" });
  } catch (err) {
    console.error("❌ Error registrarCanchaPendiente:", err);
    return res.status(500).json({ error: "Error en el servidor." });
  }
}

// =============== NUEVO: verificar código y crear cancha definitiva ===========
async function verificarCancha(req, res) {
  try {
    const { correo, codigo } = req.body || {};
    if (!correo || !codigo) return res.status(400).json({ error: "Correo y código son obligatorios." });

    const pend = await obtenerPendienteCanchaPorCorreo(correo);
    if (!pend) return res.status(400).json({ error: "No hay registro pendiente para este correo." });

    if ((pend.intentos || 0) >= MAX_INTENTOS) return res.status(429).json({ error: "Demasiados intentos. Solicita un nuevo código." });
    if (new Date() > new Date(pend.expira_en)) return res.status(400).json({ error: "El código ha expirado. Solicita uno nuevo." });

    const ok = await bcrypt.compare(codigo, pend.codigo_hash);
    if (!ok) {
      await incrementarIntentoCodigoCancha(correo);
      return res.status(400).json({ error: "Código incorrecto." });
    }

    // 1) obtener o crear usuario proveedor (no crear duplicados)
    let propietarioId = null;
    // buscar usuario existente por email y obtener id
    const userRes = await db.query("SELECT id FROM usuarios WHERE lower(email) = lower($1) LIMIT 1", [pend.correo]);
    if (userRes.rows && userRes.rows.length > 0) {
      propietarioId = userRes.rows[0].id;
    } else {
      // crear usuario proveedor; crearUsuario devuelve el objeto con id
      const nuevoUsuario = await crearUsuario(
        pend.nombre_cancha || pend.correo.split("@")[0],
        pend.correo,
        null,
        pend.contrasena_hash,
        "provider" // rol provider
      );
      propietarioId = nuevoUsuario.id;
    }

    // 2) crear cancha usando propietario_id
    const cancha = await crearCancha({
      propietario_id: propietarioId,
      nombre_cancha: pend.nombre_cancha,
      tipo: pend.tipo,
      capacidad: pend.capacidad,
      precio: pend.precio,
      descripcion: pend.descripcion,
      ubicacion_frame: pend.ubicacion_frame,
      direccion: pend.direccion,
      contrasena_hash: pend.contrasena_hash,
    });

    await eliminarPendienteCancha(pend.correo);

    return res.json({ mensaje: "Cancha registrada y verificada.", cancha });
  } catch (err) {
    console.error("❌ Error verificarCancha:", err);
    return res.status(500).json({ error: "Error en el servidor." });
  }
}
// REENVIAR CÓDIGO PARA CANCHA
async function reenviarCodigoCancha(req, res) {
  try {
    const { correo } = req.body || {};
    if (!correo) return res.status(400).json({ error: "Correo es obligatorio." });

    const pend = await obtenerPendienteCanchaPorCorreo(correo);
    if (!pend) return res.status(400).json({ error: "No hay registro pendiente para este correo." });

    if ((pend.intentos || 0) >= MAX_INTENTOS) {
      return res.status(429).json({ error: "Demasiados intentos. Solicita un nuevo registro." });
    }

    const codigo = generarCodigo6();
    const codigo_hash = await bcrypt.hash(codigo, 10);
    const expira_en = new Date(Date.now() + CODIGO_MINUTOS_EXPIRA * 60 * 1000);

    await actualizarCodigoCancha(correo, codigo_hash, expira_en);

    try {
      await transporter.verify();
      await transporter.sendMail({
        from: `"Sistema de Canchas" <${EMAIL_USER}>`,
        to: correo,
        subject: "Reenvío: código para confirmar registro de cancha",
        html: `
          <h3>Reenvío - Registrar cancha: ${pend.nombre_cancha || ""}</h3>
          <p>Usa este código para confirmar el registro de la cancha:</p>
          <div style="font-size:28px;font-weight:bold;letter-spacing:4px">${codigo}</div>
          <p>Caduca en <b>${CODIGO_MINUTOS_EXPIRA} minutos</b>.</p>
        `,
      });
    } catch (mailErr) {
      console.warn("⚠️ No se pudo enviar correo al reenviar código:", mailErr.message || mailErr);
      return res.status(500).json({ error: "No se pudo enviar el correo." });
    }

    return res.json({ mensaje: "Código re-enviado al correo." });
  } catch (err) {
    console.error("❌ Error reenviarCodigoCancha:", err);
    return res.status(500).json({ error: "Error en el servidor." });
  }
}


module.exports = {
  obtenerCanchas,
  obtenerCanchaPorId,
  registrarCanchaPendiente,
  verificarCancha,
  reenviarCodigoCancha, 
};
