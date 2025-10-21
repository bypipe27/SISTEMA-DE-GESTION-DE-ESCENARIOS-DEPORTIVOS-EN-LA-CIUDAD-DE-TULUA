const db = require("../db.js");

// async function obtenerCanchas(req, res) {
//   try {
//     const result = await db.query("SELECT * FROM canchas ORDER BY id ASC");
//     const filas = (result.rows || result).map((c) => ({
//       ...c,
//       // 🔧 Asegurar tipos correctos
//       cerradosdias: (c.cerradosdias || []).map(Number),
//       cerradosfechas: c.cerradosfechas || [],
//       ocupadas: c.ocupadas || [],
//     }));

//     console.log("✅ Canchas consultadas (controller):", filas.length);
//     res.json(filas);
//   } catch (error) {
//     console.error("❌ Error al obtener canchas (controller):", error);
//     res.status(500).json({ error: "Error al obtener las canchas" });
//   }
// }

async function obtenerCanchas(req, res) {
  try {
    const result = await db.query("SELECT * FROM canchas ORDER BY id ASC");
    const filas = (result.rows || result).map((c) => {
      // normalizar cerradosdias desde cualquier variante y asegurar array de números
      let rawCerrados = c.cerradosdias ?? c.cerrados_dias ?? c.cerradosDias ?? [];
      if (typeof rawCerrados === "string") {
        try { rawCerrados = JSON.parse(rawCerrados); } catch { rawCerrados = []; }
      }
      if (!Array.isArray(rawCerrados)) rawCerrados = [];

      return {
        ...c,
        cerradosdias: rawCerrados.map(n => Number(n)).filter(n => !Number.isNaN(n)),
        cerradosfechas: c.cerradosfechas ?? c.cerrados_fechas ?? [],
        ocupadas: c.ocupadas ?? [],
      };
    });

    console.log("✅ Canchas consultadas (controller):", filas.length);
    res.json(filas);
  } catch (error) {
    console.error("❌ Error al obtener canchas (controller):", error);
    res.status(500).json({ error: "Error al obtener las canchas" });
  }
}

async function obtenerCanchaPorId(req, res) {
  try {
    const id = Number(req.params.id);
    const result = await db.query("SELECT * FROM canchas WHERE id = $1", [id]);
    const fila = (result.rows && result.rows[0]) || null;
    if (!fila) return res.status(404).json({ error: "Cancha no encontrada" });

    let rawCerrados = fila.cerradosdias ?? fila.cerrados_dias ?? fila.cerradosDias ?? [];
    if (typeof rawCerrados === "string") {
      try { rawCerrados = JSON.parse(rawCerrados); } catch { rawCerrados = []; }
    }
    if (!Array.isArray(rawCerrados)) rawCerrados = [];

    const cancha = {
      ...fila,
      cerradosdias: rawCerrados.map(n => Number(n)).filter(n => !Number.isNaN(n)),
      cerradosfechas: fila.cerradosfechas ?? fila.cerrados_fechas ?? [],
      ocupadas: fila.ocupadas ?? [],
    };

    res.json(cancha);
  } catch (error) {
    console.error("❌ Error obtenerCanchaPorId:", error);
    res.status(500).json({ error: "Error al obtener la cancha" });
  }
}

// nueva función: GET /api/canchas/:id (solo lectura -> devuelve map_iframe si existe)
// async function obtenerCanchaPorId(req, res) {
//   try {
//     const id = Number(req.params.id);
//     const result = await db.query("SELECT * FROM canchas WHERE id = $1", [id]);
//     const fila = (result.rows && result.rows[0]) || null;
//     if (!fila) return res.status(404).json({ error: "Cancha no encontrada" });

//     // 🔧 Asegurar tipos también aquí (por consistencia)
//     const cancha = {
//       ...fila,
//       cerradosdias: (fila.cerradosdias || []).map(Number),
//       cerradosfechas: fila.cerradosfechas || [],
//       ocupadas: fila.ocupadas || [],
//     };

//     res.json(cancha);
//   } catch (error) {
//     console.error("❌ Error obtenerCanchaPorId:", error);
//     res.status(500).json({ error: "Error al obtener la cancha" });
//   }
// }

module.exports = { obtenerCanchas, obtenerCanchaPorId };
