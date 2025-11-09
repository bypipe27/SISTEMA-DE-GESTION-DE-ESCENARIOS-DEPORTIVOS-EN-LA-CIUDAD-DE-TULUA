// ...existing code...
const db = require("../db.js");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();
;
const {
  listarCanchas,
  crearCancha,
  obtenerCanchaPorIdProvider,
  actualizarCancha,
  eliminarCancha,
} = require("../models/canchaModel.js");

async function obtenerCanchaPorId(req, res) {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "id inválido" });

    // reutiliza la función del modelo que ya existe
    const cancha = await obtenerCanchaPorIdProvider(id);
    if (!cancha) return res.status(404).json({ error: "Cancha no encontrada" });

    // Normalizar campos para frontend
    // horarios: object (parsear string si viene como JSON)
    cancha.horarios = cancha.horarios
      ? (typeof cancha.horarios === "string" ? (() => { try { return JSON.parse(cancha.horarios); } catch { return {}; } })() : cancha.horarios)
      : {};

    // cerrados_dias / cerradosfechas normalizados como arrays
    cancha.cerrados_dias = cancha.cerrados_dias ?? cancha.cerradosdias ?? cancha.cerradosDias ?? [];
    if (typeof cancha.cerrados_dias === "string") {
      try { cancha.cerrados_dias = JSON.parse(cancha.cerrados_dias); } catch { cancha.cerrados_dias = []; }
    }

    cancha.cerrados_fechas = cancha.cerrados_fechas ?? cancha.cerradosfechas ?? cancha.cerradosFechas ?? [];
    if (typeof cancha.cerrados_fechas === "string") {
      try { cancha.cerrados_fechas = JSON.parse(cancha.cerrados_fechas); } catch { cancha.cerrados_fechas = []; }
    }

    // ocupadas (si aplica)
    cancha.ocupadas = cancha.ocupadas ?? [];
    if (typeof cancha.ocupadas === "string") {
      try { cancha.ocupadas = JSON.parse(cancha.ocupadas); } catch { cancha.ocupadas = []; }
    }

    return res.json(cancha);
  } catch (err) {
    console.error("obtenerCanchaPorId error:", err);
    return res.status(500).json({ error: "Error obteniendo cancha" });
  }
}


async function obtenerCanchas(req, res) {
  try {
    const result = await db.query("SELECT * FROM canchas ORDER BY id ASC");
    const filas = (result.rows || result).map((c) => {
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


async function ProviderListCanchas(req, res) {
  try {
    console.log("ProviderListCanchas -> headers:", req.headers.authorization);
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "No autorizado" });

    const result = await db.query("SELECT * FROM canchas WHERE propietario_id = $1 ORDER BY id DESC", [userId]);
    const rows = result.rows || [];
    const out = rows.map((r) => ({
      ...r,
      horarios: r.horarios ? (typeof r.horarios === "string" ? JSON.parse(r.horarios) : r.horarios) : {},
      cerrados_dias: r.cerrados_dias || [],
      cerrados_fechas: r.cerrados_fechas || [],
    }));
    console.log(`ProviderListCanchas -> provider ${userId} filas:`, out.length);
    return res.json(out);
  } catch (err) {
    console.error("ProviderListCanchas error:", err);
    return res.status(500).json({ error: "Error listando canchas" });
  }
}

async function ProviderCreateCancha(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "No autorizado" });

    const payload = req.body || {};
    if (!payload.nombre || !payload.tipo) return res.status(400).json({ error: "nombre y tipo son obligatorios" });

    // forzar propietario desde el token
    payload.propietario_id = userId;
    // insertar usando crearCancha (modelo) o consulta directa
    const created = await crearCancha(payload);
    created.horarios = created.horarios ? (typeof created.horarios === "string" ? JSON.parse(created.horarios) : created.horarios) : {};
    return res.status(201).json({ cancha: created });
  } catch (err) {
    console.error("ProviderCreateCancha:", err);
    return res.status(500).json({ error: "Error creando cancha" });
  }
}

async function ProviderUpdateCancha(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "No autorizado" });

    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "id inválido" });

    // comprobar propietario
    const ownerQ = await db.query("SELECT propietario_id FROM canchas WHERE id = $1 LIMIT 1", [id]);
    if (!ownerQ.rows.length) return res.status(404).json({ error: "Cancha no encontrada" });
    if (Number(ownerQ.rows[0].propietario_id) !== Number(userId)) return res.status(403).json({ error: "No eres el propietario" });

    const payload = req.body || {};
    const updated = await actualizarCancha(id, payload);
    if (!updated) return res.status(404).json({ error: "No se pudo actualizar" });
    updated.horarios = updated.horarios ? (typeof updated.horarios === "string" ? JSON.parse(updated.horarios) : updated.horarios) : {};
    return res.json({ cancha: updated });
  } catch (err) {
    console.error("ProviderUpdateCancha:", err);
    return res.status(500).json({ error: "Error actualizando cancha" });
  }
}

async function ProviderDeleteCancha(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: "No autorizado" });

    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "id inválido" });

    // comprobar propietario
    const ownerQ = await db.query("SELECT propietario_id FROM canchas WHERE id = $1 LIMIT 1", [id]);
    if (!ownerQ.rows.length) return res.status(404).json({ error: "Cancha no encontrada" });
    if (Number(ownerQ.rows[0].propietario_id) !== Number(userId)) return res.status(403).json({ error: "No eres el propietario" });

    // verificar reservas futuras
    const r = await db.query("SELECT COUNT(*)::int AS total FROM reservas WHERE cancha_id = $1 AND fecha > now()", [id]);
    const futuras = (r.rows && r.rows[0] && Number(r.rows[0].total)) || 0;
    if (futuras > 0) return res.status(400).json({ error: `La cancha tiene ${futuras} reserva(s) futura(s)` });

    const ok = await eliminarCancha(id);
    if (!ok) return res.status(404).json({ error: "No se pudo eliminar" });
    return res.json({ mensaje: "Cancha eliminada" });
  } catch (err) {
    console.error("ProviderDeleteCancha:", err);
    return res.status(500).json({ error: "Error eliminando cancha" });
  }
}
// ...existing exports...


module.exports = {
  obtenerCanchas,
  ProviderListCanchas,
  ProviderCreateCancha,
  ProviderUpdateCancha,
  ProviderDeleteCancha,
  obtenerCanchaPorId, 
};
