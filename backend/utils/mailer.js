// mailer.js
const { Resend } = require("resend");

// Creamos el cliente Resend con tu API Key (la agregas en Render como variable de entorno)
const resend = new Resend(process.env.RESEND_API_KEY);

// Función para enviar correos
async function enviarCorreo({ to, subject, html }) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Soporte <onboarding@resend.dev>", // puedes cambiar esto después por tu dominio verificado
      to,
      subject,
      html,
    });

    if (error) {
      console.error("❌ Error al enviar correo:", error);
      throw new Error(error.message || "Fallo al enviar correo");
    }

    console.log("✅ Correo enviado correctamente:", data);
    return data;
  } catch (err) {
    console.error("⚠️ Error general enviando correo:", err);
    throw err;
  }
}

module.exports = { enviarCorreo };
