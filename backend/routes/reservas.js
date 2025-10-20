const express = require("express");
const router = express.Router();
const { availability, createReserva } = require("../controllers/reservasController"); 

// availability per cancha/date
router.get("/cancha/:id/availability", availability);

// crear reserva
router.post("/", createReserva);

module.exports = router;