const nodemailer = require("nodemailer");

const {
  EMAIL_SERVICE,
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_SECURE,
  EMAIL_USER,
  EMAIL_PASS,
} = process.env;

const port = EMAIL_PORT ? Number(EMAIL_PORT) : (EMAIL_SECURE === "true" ? 465 : 587);
const secure = EMAIL_SECURE === "true";

const options = {};

// si configuraste EMAIL_SERVICE (ej. 'gmail' o 'SendGrid') úsalo, si no usar host/port
if (EMAIL_SERVICE) {
  options.service = EMAIL_SERVICE;
} else {
  options.host = EMAIL_HOST || "smtp.gmail.com";
  options.port = port;
  options.secure = secure;
}

options.auth = {
  user: EMAIL_USER,
  pass: EMAIL_PASS,
};

// timeouts y TLS (tls.rejectUnauthorized = false para diagnóstico; en producción revisa esto)
options.connectionTimeout = 20000;
options.greetingTimeout = 20000;
options.socketTimeout = 20000;
options.tls = { rejectUnauthorized: false };

const transporter = nodemailer.createTransport(options);

// verify() ayuda a ver en los logs si la conexión SMTP está OK
transporter.verify()
  .then(() => console.log("✅ Mailer listo"))
  .catch((err) => console.error("⚠️ Mailer verify error:", err));

module.exports = transporter;