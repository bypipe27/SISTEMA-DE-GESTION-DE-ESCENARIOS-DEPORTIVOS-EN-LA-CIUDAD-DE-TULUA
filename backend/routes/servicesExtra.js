const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  listarServiciosPorCancha,
  providerListarServicios,
  providerCrearServicio,
  providerObtenerServicio,
  providerActualizarServicio,
  providerEliminarServicio
} = require("../controllers/servicesExtraController");

// Rutas públicas
router.get("/cancha/:canchaId", listarServiciosPorCancha);

// Rutas del proveedor (requieren autenticación)
router.get("/provider", auth, providerListarServicios);
router.post("/provider", auth, providerCrearServicio);
router.get("/provider/:id", auth, providerObtenerServicio);
router.put("/provider/:id", auth, providerActualizarServicio);
router.delete("/provider/:id", auth, providerEliminarServicio);

module.exports = router;

