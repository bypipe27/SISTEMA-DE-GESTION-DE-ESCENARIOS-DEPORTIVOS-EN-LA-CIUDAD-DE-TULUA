const express = require("express");
const router = express.Router();
const { availability, createReserva , obtenerReservasPorUsuario , cancelarReserva} = require("../controllers/reservasController"); 

router.get("/usuario/:id", obtenerReservasPorUsuario);
// availability per cancha/date
router.get("/cancha/:id/availability", availability);

router.put("/cancelar/:id", cancelarReserva); 
// crear reserva
router.post("/", createReserva);

module.exports = router;