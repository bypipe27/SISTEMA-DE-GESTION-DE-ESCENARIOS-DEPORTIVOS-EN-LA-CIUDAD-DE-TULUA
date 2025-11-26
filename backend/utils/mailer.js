const axios = require("axios");

// Función para enviar correos con la API de Brevo (Sendinblue)
// Soporta adjuntos como buffers mediante la propiedad `attachments` [{ filename, content }]
async function enviarCorreo({ to, subject, html, attachments = [] }) {
  try {
    const payload = {
      sender: { name: "Reservas UV", email: process.env.EMAIL_USER },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    };

    if (attachments && attachments.length > 0) {
      payload.attachment = attachments.map((a) => ({
        name: a.filename || "adjunto.pdf",
        content: Buffer.isBuffer(a.content)
          ? a.content.toString("base64")
          : Buffer.from(a.content).toString("base64"),
      }));
    }

    const response = await axios.post("https://api.brevo.com/v3/smtp/email", payload, {
      headers: {
        "api-key": process.env.BREVO_API_KEY,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (err) {
    throw err;
  }
}

module.exports = { enviarCorreo };
