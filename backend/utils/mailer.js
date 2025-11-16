const axios = require("axios");

// Función para enviar correos con la API de Brevo (Sendinblue)
async function enviarCorreo({ to, subject, html }) {
  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: { name: "Reservas UV", email: process.env.EMAIL_USER },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      },
      {
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (err) {
    throw err;
  }
}

module.exports = { enviarCorreo };
