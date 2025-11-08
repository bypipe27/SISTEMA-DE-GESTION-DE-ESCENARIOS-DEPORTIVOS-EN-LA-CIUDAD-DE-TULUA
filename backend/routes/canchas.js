const express = require("express");
const router = express.Router();
const { obtenerCanchas, 
    obtenerCanchaPorId, 
    registrarCanchaPendiente,
    verificarCancha,
    reenviarCodigoCancha
} = require("../controllers/canchasController");

// GET /api/canchas
router.get("/", obtenerCanchas);

// GET /api/canchas/:id
router.get("/:id", obtenerCanchaPorId);

router.post("/", registrarCanchaPendiente);

// Endpoint para verificar código
router.post("/verify", verificarCancha);

// (Opcional) si prefieres /register en vez de /, añade también:
router.post("/register", registrarCanchaPendiente);

// REENVIAR CÓDIGO (agregar)
router.post("/resend-code", reenviarCodigoCancha);


module.exports = router;