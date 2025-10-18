// ...existing code...
const db = require("../db.js");

async function obtenerCanchas(req, res) {
  try {
    const result = await db.query("SELECT * FROM canchas ORDER BY id ASC");
    const filas = result.rows || result;
    console.log("✅ Canchas consultadas (controller):", filas.length);
    res.json(filas);
  } catch (error) {
    console.error("❌ Error al obtener canchas (controller):", error);
    res.status(500).json({ error: "Error al obtener las canchas" });
  }
}

// nueva función: GET /api/canchas/:id (solo lectura -> devuelve map_iframe si existe)
async function obtenerCanchaPorId(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await db.query("SELECT * FROM canchas WHERE id = $1", [id]);
    const fila = (result.rows && result.rows[0]) || null;
    if (!fila) return res.status(404).json({ error: "Cancha no encontrada" });
    res.json(fila);
  } catch (error) {
    console.error("❌ Error obtenerCanchaPorId:", error);
    res.status(500).json({ error: "Error al obtener la cancha" });
  }
}

module.exports = { obtenerCanchas, obtenerCanchaPorId };