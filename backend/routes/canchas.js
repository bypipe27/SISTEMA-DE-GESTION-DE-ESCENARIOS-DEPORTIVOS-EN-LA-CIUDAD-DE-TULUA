const express = require("express");
const router = express.Router();
const { obtenerCanchas, obtenerCanchaPorId } = require("../controllers/canchasController");

// GET /api/canchas
router.get("/", obtenerCanchas);

// GET /api/canchas/:id
router.get("/:id", obtenerCanchaPorId);



module.exports = router;