// ...existing code...
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { crearUsuario } from "../models/usuarioModel.js";
import dbModule from "../db.js";
dotenv.config();

const pool = dbModule.pool || dbModule.default || dbModule; // <-- compatibilidad

// Normalizar credenciales de correo (evita espacios accidentales)
const EMAIL_USER = (process.env.EMAIL_USER || "").trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || "").replace(/\s+/g, "");

export const registrarUsuario = async (req, res) => {
  try {
    const { nombre, email, telefono, contrasena } = req.body;

    // Verificar si ya existe
    const existe = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (existe.rows.length > 0)
      return res.status(400).json({ error: "El correo ya está registrado." });

    // Encriptar contraseña
    const hash = await bcrypt.hash(contrasena, 10);
    const nuevoUsuario = await crearUsuario(nombre, email, telefono, hash);

    // Crear token de verificación
    const token = jwt.sign({ id: nuevoUsuario.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    const url = `${process.env.FRONTEND_URL}/verify/${token}`;

    // Configurar transporte de correo con credenciales normalizadas
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
      },
    });

    // Verificar conexión SMTP (fallará rápido si credenciales inválidas)
    await transporter.verify();
    console.log("✅ SMTP verificado. Enviando correo desde:", EMAIL_USER);

    // Enviar correo y loguear la respuesta
    const info = await transporter.sendMail({
      from: `"Sistema de Canchas" <${EMAIL_USER}>`,
      to: email,
      subject: "Confirma tu cuenta",
      html: `<h3>¡Hola ${nombre}!</h3>
             <p>Gracias por registrarte. Haz clic en el siguiente enlace para confirmar tu cuenta:</p>
             <a href="${url}" target="_blank">${url}</a>`,
    });
    console.log("✅ Correo enviado. messageId:", info.messageId, "response:", info.response);

    res.json({ mensaje: "Usuario registrado. Revisa tu correo para confirmar la cuenta." });
  } catch (error) {
    console.error("❌ Error al registrar:", error);
    res.status(500).json({ error: "Error en el servidor." });
  }
};
