const express = require("express");
const router = express.Router();

const {
  registrarUsuario,
  verificarCodigo,
  reenviarCodigo,
  iniciarSesion, 
  registrarUsuarioProvider,
} = require("../controllers/usuariosController");

router.post("/register", registrarUsuario); 
router.post("/register-provider", registrarUsuarioProvider);    // crea pendiente y envía código
router.post("/verify", verificarCodigo);        // valida código y crea usuario
router.post("/resend-code", reenviarCodigo); 
router.post("/login", iniciarSesion);             // inicia sesión

module.exports = router;
