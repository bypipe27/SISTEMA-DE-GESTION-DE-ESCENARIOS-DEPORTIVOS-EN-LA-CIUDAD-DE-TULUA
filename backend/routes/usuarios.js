const express = require("express");
const router = express.Router();
const pool = require("../db");

// Obtener todos los usuarios
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM usuarios");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error);
    res.status(500).json({ error: "Error al obtener usuarios" });
  }
});

// Agregar un nuevo usuario
router.post("/", async (req, res) => {
  try {
    const { nombre, email } = req.body;
    const result = await pool.query(
      "INSERT INTO usuarios (nombre, email) VALUES ($1, $2) RETURNING *",
      [nombre, email]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error("❌ Error al insertar usuario:", error);
    res.status(500).json({ error: "Error al insertar usuario" });
  }
});

module.exports = router;
