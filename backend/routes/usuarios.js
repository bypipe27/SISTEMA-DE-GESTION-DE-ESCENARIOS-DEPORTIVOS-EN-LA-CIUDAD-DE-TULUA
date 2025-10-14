const express = require("express");
const router = express.Router();

const {
  registrarUsuario,
  verificarCodigo,
  reenviarCodigo,
  iniciarSesion, 
} = require("../controllers/usuariosController");

router.post("/register", registrarUsuario);     // crea pendiente y envía código
router.post("/verify", verificarCodigo);        // valida código y crea usuario
router.post("/resend-code", reenviarCodigo); 
router.post("/login", iniciarSesion);             // inicia sesión

module.exports = router;
