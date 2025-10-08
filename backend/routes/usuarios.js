const express = require("express");
const router = express.Router();
const { registrarUsuario } = require("../controllers/usuariosController");

// Rutas
router.post("/register", registrarUsuario);

module.exports = router;
