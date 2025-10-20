const express = require("express");
const router = express.Router();
const { availability, createReserva, obtenerReservasUsuario 
} = require("../controllers/reservasController"); 


// availability per cancha/date
router.get("/cancha/:id/availability", availability);

// crear reserva
router.post("/", createReserva);

// obtener reservas del usuario 
router.get("/mis-reservas", obtenerReservasUsuario);

module.exports = router;