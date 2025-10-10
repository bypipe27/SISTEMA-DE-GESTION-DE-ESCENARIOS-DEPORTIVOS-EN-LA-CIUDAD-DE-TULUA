const express = require("express");
const router = express.Router();

const {
  registrarUsuario,
  verificarCodigo,
  reenviarCodigo,
} = require("../controllers/usuariosController");

router.post("/register", registrarUsuario);     // crea pendiente y envía código
router.post("/verify", verificarCodigo);        // valida código y crea usuario
router.post("/resend-code", reenviarCodigo);    // reenvía código

module.exports = router;
