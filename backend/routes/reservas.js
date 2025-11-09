// ...existing code...
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { ProviderReportes,ProviderMarkNoShow,ProviderMarkCompleted,availability, createReserva, obtenerReservasPorUsuario, cancelarReserva, ProviderListReservas, ProviderCancelReserva } = require("../controllers/reservasController");

// usuario
router.get("/usuario/:id", obtenerReservasPorUsuario);
// availability per cancha/date
router.get("/cancha/:id/availability", availability);
// provider: listar reservas de sus canchas
router.get("/provider", auth, ProviderListReservas);
// provider cancelar reserva
router.put("/provider/cancelar/:id", auth, ProviderCancelReserva);
// provider marcar como completada
router.put("/provider/completar/:id", auth, ProviderMarkCompleted);
// provider marcar no-show
router.put("/provider/no-show/:id", auth, ProviderMarkNoShow);
router.get("/provider/reportes", auth, ProviderReportes);
// cancelar por usuario (si implementado)
router.put("/cancelar/:id", cancelarReserva);
// crear reserva
router.post("/", createReserva);

// obtener reservas del usuario 
router.get("/mis-reservas", obtenerReservasUsuario);

module.exports = router;