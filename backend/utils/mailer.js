// mailer.js
const nodemailer = require("nodemailer");

// Configuramos el transporte SMTP de Brevo
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com", // Host SMTP de Brevo
  port: 587,                    // Puerto SMTP (STARTTLS)
  secure: false,                // false porque usamos STARTTLS
  auth: {
    user: process.env.EMAIL_USER, // Tu correo verificado en Brevo
    pass: process.env.EMAIL_PASS, // Tu clave SMTP generada en Brevo
  },
});

// Función para enviar correos
async function enviarCorreo({ to, subject, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"Soporte Reservas UV" <${process.env.EMAIL_USER}>`, // remitente (mismo dominio verificado)
      to,        // destinatario
      subject,   // asunto
      html,      // contenido HTML
    });

    console.log("✅ Correo enviado correctamente:", info.messageId);
    return info;
  } catch (err) {
    console.error("❌ Error al enviar correo:", err);
    throw err;
  }
}

module.exports = { enviarCorreo };
