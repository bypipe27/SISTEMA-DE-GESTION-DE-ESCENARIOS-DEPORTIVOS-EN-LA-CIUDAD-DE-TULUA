const dbModule = require("../db.js");
const pool = dbModule.pool || dbModule.default || dbModule;

async function crearPendienteCancha({
  correo, nombre_cancha, tipo, capacidad, precio,
  descripcion, ubicacion_frame, direccion, contrasena_hash,
  codigo_hash, expira_en
}) {
  const q = `
    INSERT INTO pending_canchas
      (correo, nombre_cancha, tipo, capacidad, precio, descripcion, ubicacion_frame, direccion, contrasena_hash, codigo_hash, expira_en)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    ON CONFLICT (correo)
    DO UPDATE SET
      nombre_cancha = EXCLUDED.nombre_cancha,
      tipo = EXCLUDED.tipo,
      capacidad = EXCLUDED.capacidad,
      precio = EXCLUDED.precio,
      descripcion = EXCLUDED.descripcion,
      ubicacion_frame = EXCLUDED.ubicacion_frame,
      direccion = EXCLUDED.direccion,
      contrasena_hash = EXCLUDED.contrasena_hash,
      codigo_hash = EXCLUDED.codigo_hash,
      expira_en = EXCLUDED.expira_en,
      intentos = 0
    RETURNING *;
  `;
  const vals = [correo, nombre_cancha, tipo, capacidad, precio, descripcion, ubicacion_frame, direccion, contrasena_hash, codigo_hash, expira_en];
  const r = await pool.query(q, vals);
  return r.rows[0];
}

async function obtenerPendienteCanchaPorCorreo(correo) {
  const r = await pool.query(`SELECT * FROM pending_canchas WHERE correo = $1`, [correo]);
  return r.rows[0] || null;
}

async function incrementarIntentoCodigoCancha(correo) {
  await pool.query(`UPDATE pending_canchas SET intentos = intentos + 1 WHERE correo = $1`, [correo]);
}

async function actualizarCodigoCancha(correo, codigo_hash, expira_en) {
  await pool.query(
    `UPDATE pending_canchas SET codigo_hash = $1, expira_en = $2, intentos = 0 WHERE correo = $3`,
    [codigo_hash, expira_en, correo]
  );
}

async function eliminarPendienteCancha(correo) {
  await pool.query(`DELETE FROM pending_canchas WHERE correo = $1`, [correo]);
}

module.exports = {
  crearPendienteCancha,
  obtenerPendienteCanchaPorCorreo,
  incrementarIntentoCodigoCancha,
  actualizarCodigoCancha,
  eliminarPendienteCancha,
};