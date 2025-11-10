const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const dbModule = require("../db.js");
const {
  crearSolicitudReset,
  obtenerSolicitudPorToken,
  obtenerSolicitudesPorEmail,
  incrementarIntentos,
  eliminarSolicitud,
} = require("../models/passwordResetModel");

const pool = dbModule.pool || dbModule.default || dbModule;

// Usar el helper centralizado para enviar correos (Brevo / API HTTP)
const { enviarCorreo } = require("../utils/mailer");

const RESET_MINUTOS_EXPIRA = 15;
const MAX_INTENTOS = 3;

// 1. Solicitar reset de contraseña
async function solicitarResetPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "El email es obligatorio." });
    }

    // Verificar si el usuario existe
    const usuario = await pool.query(
      "SELECT id, nombre, email FROM usuarios WHERE email = $1",
      [email]
    );
    if (usuario.rowCount === 0) {
      // Por seguridad, no revelamos si el email existe o no
      return res.json({
        mensaje: "Si el email existe, recibirás un enlace para resetear tu contraseña.",
      });
    }

    // Generar token único
    const token = crypto.randomBytes(32).toString("hex");
    const token_hash = await bcrypt.hash(token, 10);
    const expira_en = new Date(Date.now() + RESET_MINUTOS_EXPIRA * 60 * 1000);

    // Guardar solicitud en la base de datos
    await crearSolicitudReset({
      email,
      token_hash,
      expira_en,
    });

    // Enviar email con enlace (no bloqueante)
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #16a34a;">Hola ${usuario.rows[0].nombre},</h2>
        <p>Recibimos una solicitud para restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetLink}" 
             style="background-color: #16a34a; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 8px; font-weight: bold;">
             Restablecer Contraseña
          </a>
        </div>
        <p style="color: #6b7280; font-size: 14px;">
          Este enlace expirará en ${RESET_MINUTOS_EXPIRA} minutos.<br>
          Si no solicitaste este cambio, puedes ignorar este mensaje.
        </p>
      </div>
    `;

    if (process.env.DISABLE_EMAILS === "true") {
      console.log("Envío de emails deshabilitado (DISABLE_EMAILS=true)");
    } else {
      (async () => {
        try {
          await enviarCorreo({
            to: email,
            subject: "Restablecer tu contraseña",
            html: emailHtml,
          });
          console.log("✅ Email de reset enviado a", email);
        } catch (emailErr) {
          console.error("No se pudo enviar reset email (no bloqueante):", emailErr);
        }
      })();
    }

    return res.json({
      mensaje: "Si el email existe, recibirás un enlace para resetear tu contraseña.",
    });
  } catch (error) {
    console.error("❌ Error en solicitarResetPassword:", error);
    return res.status(500).json({ error: "Error en el servidor." });
  }
}

// 2. Verificar token válido 
async function verificarTokenReset(req, res) {
  try {
    const { token, email } = req.body;
    if (!token || !email) {
      return res.status(400).json({ error: "Token y email son obligatorios." });
    }

    //Buscar por email y luego comparar con bcrypt.compare
    const solicitudes = await obtenerSolicitudesPorEmail(email);
    
    if (solicitudes.length === 0) {
      return res.status(400).json({ error: "Token inválido o expirado." });
    }

    let solicitudValida = null;
    
    // Verificar cada token hasheado con bcrypt.compare
    for (const solicitud of solicitudes) {
      const esValido = await bcrypt.compare(token, solicitud.token_hash);
      if (esValido) {
        solicitudValida = solicitud;
        break;
      }
    }

    if (!solicitudValida) {
      return res.status(400).json({ error: "Token inválido o expirado." });
    }

    if (new Date() > new Date(solicitudValida.expira_en)) {
      return res.status(400).json({ error: "El token ha expirado." });
    }

    if (solicitudValida.intentos >= MAX_INTENTOS) {
      return res.status(429).json({ error: "Demasiados intentos fallidos." });
    }

    return res.json({ valido: true });
  } catch (error) {
    console.error("❌ Error en verificarTokenReset:", error);
    return res.status(500).json({ error: "Error en el servidor." });
  }
}

// 3. Resetear contraseña
async function resetearPassword(req, res) {
  try {
    const { token, email, nueva_contrasena } = req.body;
    if (!token || !email || !nueva_contrasena) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    const solicitudes = await obtenerSolicitudesPorEmail(email);
    
    let solicitudValida = null;
    
    // Verificar cada token hasheado con bcrypt.compare
    for (const solicitud of solicitudes) {
      const esValido = await bcrypt.compare(token, solicitud.token_hash);
      if (esValido) {
        solicitudValida = solicitud;
        break;
      }
    }

    if (!solicitudValida) {
      return res.status(400).json({ error: "Token inválido o expirado." });
    }

    if (new Date() > new Date(solicitudValida.expira_en)) {
      return res.status(400).json({ error: "El token ha expirado." });
    }

    if (solicitudValida.intentos >= MAX_INTENTOS) {
      return res.status(429).json({ error: "Demasiados intentos fallidos." });
    }

    // Hash de la nueva contraseña
    const nueva_contrasena_hash = await bcrypt.hash(nueva_contrasena, 10);

    // Actualizar contraseña del usuario
    await pool.query(
      "UPDATE usuarios SET contrasena = $1 WHERE email = $2",
      [nueva_contrasena_hash, email]
    );

    // Eliminar solicitud de reset
    await eliminarSolicitud(email);

    return res.json({
      mensaje: "Contraseña actualizada exitosamente. Ya puedes iniciar sesión.",
    });
  } catch (error) {
    console.error("❌ Error en resetearPassword:", error);
    if (solicitudValida) {
      await incrementarIntentos(solicitudValida.token_hash);
    }
    return res.status(500).json({ error: "Error en el servidor." });
  }
}

module.exports = {
  solicitarResetPassword,
  verificarTokenReset,
  resetearPassword,
};