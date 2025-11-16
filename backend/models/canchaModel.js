const dbModule = require("../db.js");
const pool = dbModule.pool || dbModule.default || dbModule;



async function listarCanchas() {
  const q = `SELECT * FROM canchas ORDER BY id DESC`;
  const r = await pool.query(q);
  return r.rows;
}


async function crearCancha(data) {
  const q = `
    INSERT INTO canchas
      (propietario_id, nombre, tipo, capacidad, precio, descripcion, disponible, map_iframe, cerrados_dias, cerrados_fechas, horarios, direccion, imagen_url)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *;
  `;
  const vals = [
    data.propietario_id || null,
    data.nombre || null,
    data.tipo || null,
    data.capacidad ?? null,
    data.precio ?? null,
    data.descripcion ?? null,
    typeof data.disponible === "boolean" ? data.disponible : true,
    data.map_iframe || null,
    data.cerrados_dias || null,
    data.cerrados_fechas || null,
    data.horarios ? JSON.stringify(data.horarios) : null,
    data.direccion || null,
    data.imagen_url || null,
  ];
  const r = await pool.query(q, vals);
  return r.rows[0];
}

/**
 * Obtener por id
 */
async function obtenerCanchaPorIdProvider(id) {
  const q = `SELECT * FROM canchas WHERE id = $1 LIMIT 1`;
  const r = await pool.query(q, [id]);
  return r.rows[0] || null;
}

/**
 * Actualizar cancha (fields puede contener cualquiera de las columnas)
 * Construcción dinámica segura (mapear sólo campos permitidos)
 */
async function actualizarCancha(id, fields = {}) {
  const allowed = ["nombre","tipo","capacidad","precio","descripcion","disponible","map_iframe","cerrados_dias","cerrados_fechas","horarios","direccion","propietario_id","imagen_url"];
  const sets = [];
  const vals = [];
  let idx = 1;
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(fields, k)) {
      sets.push(`${k} = $${idx++}`);
      if (k === "horarios") vals.push(fields[k] ? JSON.stringify(fields[k]) : null);
      else vals.push(fields[k]);
    }
  }
  if (sets.length === 0) return await obtenerCanchaPorIdProvider(id); // nothing to update
  const q = `UPDATE canchas SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`;
  vals.push(id);
  const r = await pool.query(q, vals);
  return r.rows[0] || null;
}

/**
 * Eliminar cancha por id
 */
async function eliminarCancha(id) {
  const q = `DELETE FROM canchas WHERE id = $1 RETURNING id`;
  const r = await pool.query(q, [id]);
  return r.rowCount > 0;
}

module.exports = {
  listarCanchas,
  crearCancha,
  obtenerCanchaPorIdProvider,
  actualizarCancha,
  eliminarCancha,
};

