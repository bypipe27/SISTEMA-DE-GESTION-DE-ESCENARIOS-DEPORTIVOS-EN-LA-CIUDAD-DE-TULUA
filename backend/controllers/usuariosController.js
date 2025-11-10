const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const dbModule = require("../db.js");
const {
  crearUsuario,
  existeUsuarioPorEmail,
} = require("../models/usuarioModel");
const {
  crearRegistroPendiente,
  obtenerPendientePorEmail,
  incrementarIntentoCodigo,
  actualizarCodigo,
  eliminarPendiente,
} = require("../models/pendingModel");

dotenv.config();

const pool = dbModule.pool || dbModule.default || dbModule;

// Normalizar credenciales de correo (aún disponibles si se necesitan)
const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

// Usamos Resend a través del helper `enviarCorreo` en utils/mailer.js
const { enviarCorreo } = require("../utils/mailer");

const CODIGO_MINUTOS_EXPIRA = 10;
const MAX_INTENTOS = 5;

// ...existing code...
const generarCodigo6 = () => Math.floor(100000 + Math.random() * 900000).toString();

// Helper: autentica credenciales (usa pool, bcrypt, jwt)
// ...existing code...
// Helper: autentica credenciales (usa pool, bcrypt, jwt)
async function autenticarUsuarioPorCredenciales(email, contrasena) {
  try {
    const result = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (result.rowCount === 0) throw new Error("Usuario no encontrado");

    const user = result.rows[0];

    // Soportar nombres de columna distintos; la BD tiene el hash en 'contrasena'
    const hash = user.contrasena || user.contrasena_hash || user.password || user.hash;
    if (!hash) {
      console.error("No se encontró hash de contraseña para el usuario:", { id: user.id, email: user.email });
      throw new Error("Hash de contraseña no encontrado en la base de datos");
    }

    const contrasenaValida = await bcrypt.compare(contrasena, hash);
    if (!contrasenaValida) throw new Error("Contraseña incorrecta");

    const token = jwt.sign({ id: user.id, email: user.email ,role:user.role}, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return { usuario: user, token };
  } catch (err) {
    console.error("Error en autenticarUsuarioPorCredenciales:", err);
    throw err;
  }
}

// Handler HTTP: inicia sesión (usa el helper)
async function iniciarSesion(req, res) {
  try {
    const { email, contrasena } = req.body || {};
    if (!email || !contrasena) return res.status(400).json({ error: "Email y contraseña son obligatorios." });

    const { usuario, token } = await autenticarUsuarioPorCredenciales(email, contrasena);
    return res.json({ usuario, token });
  } catch (error) {
    console.error("❌ Error login:", error);
    const status = error.message === "Usuario no encontrado" || error.message === "Contraseña incorrecta" ? 401 : 500;
    return res.status(status).json({ error: error.message || "Error en el servidor." });
  }
}
// ...existing code...

// =============== REGISTRO: crea pendiente y envía código ==================
async function registrarUsuario(req, res) {
  try {
    const { nombre, email, telefono, contrasena, role="user" } = req.body;

    // Verificar si ya existe en usuarios
    const existe = await pool.query("SELECT 1 FROM usuarios WHERE email = $1 LIMIT 1", [email]);
    if (existe.rowCount > 0)
      return res.status(400).json({ error: "El correo ya está registrado." });

    if (!nombre || !email || !contrasena) {
      return res.status(400).json({ error: "Faltan campos obligatorios." });
    }

    // Hash de contraseña y código
    const contrasenaHash = await bcrypt.hash(contrasena, 10);
    const codigo = generarCodigo6();
    const codigoHash = await bcrypt.hash(codigo, 10);
    const expira_en = new Date(Date.now() + CODIGO_MINUTOS_EXPIRA * 60 * 1000);

    // Guardar/actualizar pendiente
    await crearRegistroPendiente({
      nombre,
      email,
      telefono: telefono || null,
      contrasena_hash: contrasenaHash,
      codigo_hash: codigoHash,
      expira_en,
      role,
    });
    // Responder inmediatamente (registro pendiente creado)
    res.json({
      mensaje: "Registro en espera. Te enviamos un código al correo para confirmar.",
      next: "/verify",
    });

    // Enviar correo de forma asíncrona (no bloquear la respuesta)
    if (process.env.DISABLE_EMAILS === "true") {
      console.log("Envío de emails deshabilitado (DISABLE_EMAILS=true)");
      return;
    }

    (async () => {
      try {
        await enviarCorreo({
          to: email,
          subject: "Tu código de verificación",
          html: `
            <h3>¡Hola ${nombre}!</h3>
            <p>Usa este código para confirmar tu cuenta:</p>
            <div style="font-size:28px;font-weight:bold;letter-spacing:4px">${codigo}</div>
            <p>Caduca en <b>${CODIGO_MINUTOS_EXPIRA} minutos</b>.</p>
          `,
        });
        console.log("Código de verificación enviado a", email);
      } catch (mailErr) {
        console.error("No se pudo enviar código por email (no bloqueante):", mailErr);
      }
    })();
    return;
  } catch (error) {
    console.error("❌ Error al registrar:", error);
    return res.status(500).json({ error: "Error en el servidor." });
  }
}

// =============== VERIFICAR CÓDIGO: inserta en usuarios y devuelve token ===
// ...existing code...
async function verificarCodigo(req, res) {
  try {
    const { email, codigo } = req.body;

    if (!email || !codigo) {
      return res.status(400).json({ error: "Email y código son obligatorios." });
    }

    const pend = await obtenerPendientePorEmail(email);
    if (!pend) return res.status(400).json({ error: "No hay registro pendiente para este correo." });

    if (pend.intentos >= MAX_INTENTOS)
      return res.status(429).json({ error: "Demasiados intentos. Solicita un nuevo código." });

    if (new Date() > new Date(pend.expira_en))
      return res.status(400).json({ error: "El código ha expirado. Solicita uno nuevo." });

    const ok = await bcrypt.compare(codigo, pend.codigo_hash);
    if (!ok) {
      await incrementarIntentoCodigo(email);
      return res.status(400).json({ error: "Código incorrecto." });
    }

    // Crear usuario definitivo usando el role guardado en el pendiente (si existe)
    const roleToAssign = pend.role || "user";
    const user = await crearUsuario(pend.nombre, pend.email, pend.telefono, pend.contrasena_hash, roleToAssign);
    await eliminarPendiente(email);

    // login inmediato: devolver token y usuario en JSON (no hacer return de objeto)
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Enviar correo de confirmación de registro de forma asíncrona (no bloquear si falla)
    if (process.env.DISABLE_EMAILS === "true") {
      console.log("Envío de emails deshabilitado (DISABLE_EMAILS=true)");
    } else {
      (async () => {
        try {
          await enviarCorreo({
            to: user.email,
            subject: "Cuenta confirmada - Registro exitoso",
            html: `
              <h3>¡Hola ${user.nombre}!</h3>
              <p>Tu cuenta en el Sistema de Gestión de Canchas ha sido confirmada correctamente.</p>
              <p>Ya puedes iniciar sesión y comenzar a usar la plataforma.</p>
              <hr />
              <p>Si no reconoces esta acción, por favor contacta con el soporte.</p>
            `,
          });
          console.log("Email de confirmación enviado a", user.email);
        } catch (mailErr) {
          console.error("❌ Error enviando correo de confirmación (no bloqueante):", mailErr);
        }
      })();
    }

    return res.json({
      mensaje: "Correo verificado. Cuenta creada.",
      usuario: user,
      token,
    });
  } catch (err) {
    console.error("❌ Error verificarCodigo:", err);
    return res.status(500).json({ error: "Error en el servidor." });
  }
}
// =============== REENVIAR CÓDIGO ==========================================
async function reenviarCodigo(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email es obligatorio." });

    const pend = await obtenerPendientePorEmail(email);
    if (!pend) return res.status(400).json({ error: "No hay registro pendiente para este correo." });

    const codigo = generarCodigo6();
    const codigoHash = await bcrypt.hash(codigo, 10);
    const expira_en = new Date(Date.now() + CODIGO_MINUTOS_EXPIRA * 60 * 1000);

    await actualizarCodigo(email, codigoHash, expira_en);

    // Responder inmediatamente
    res.json({ mensaje: "Nuevo código enviado." });

    if (process.env.DISABLE_EMAILS === "true") {
      console.log("Envío de emails deshabilitado (DISABLE_EMAILS=true)");
      return;
    }

    (async () => {
      try {
        await enviarCorreo({
          to: email,
          subject: "Nuevo código de verificación",
          html: `
            <p>Tu nuevo código:</p>
            <div style="font-size:28px;font-weight:bold;letter-spacing:4px">${codigo}</div>
            <p>Caduca en <b>${CODIGO_MINUTOS_EXPIRA} minutos</b>.</p>
          `,
        });
        console.log("Nuevo código enviado a", email);
      } catch (mailErr) {
        console.error("No se pudo enviar nuevo código por email (no bloqueante):", mailErr);
      }
    })();
    return;
  } catch (error) {
    console.error("❌ Error al reenviar código:", error);
    return res.status(500).json({ error: "Error en el servidor." });
  }
}
async function registrarUsuarioProvider(req, res) {
  // forzar role a provider aunque el cliente no lo envíe
  try {
    req.body = req.body || {};
    req.body.role = "provider";
    return await registrarUsuario(req, res);
  } catch (err) {
    console.error("❌ Error registrarUsuarioProvider:", err);
    return res.status(500).json({ error: "Error en el servidor." });
  }
}


module.exports = {
  registrarUsuarioProvider,
  registrarUsuario,
  verificarCodigo,
  reenviarCodigo,
  iniciarSesion, 
};

