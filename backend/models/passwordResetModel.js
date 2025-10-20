const dbModule = require("../db.js");
const pool = dbModule.pool || dbModule.default || dbModule;

async function crearSolicitudReset({ email, token_hash, expira_en }) {
  const q = `
    INSERT INTO password_resets (email, token_hash, expira_en)
    VALUES ($1, $2, $3)
    ON CONFLICT (email)
    DO UPDATE SET
      token_hash = EXCLUDED.token_hash,
      expira_en = EXCLUDED.expira_en,
      intentos = 0,
      created_at = CURRENT_TIMESTAMP
    RETURNING *;
  `;
  const vals = [email, token_hash, expira_en];
  const r = await pool.query(q, vals);
  return r.rows[0];
}

async function obtenerSolicitudPorToken(token_hash) {
  const r = await pool.query(
    `SELECT * FROM password_resets WHERE token_hash = $1`,
    [token_hash]
  );
  return r.rows[0] || null;
}

// Buscar solicitudes por email
async function obtenerSolicitudesPorEmail(email) {
  const r = await pool.query(
    `SELECT * FROM password_resets WHERE email = $1`,
    [email]
  );
  return r.rows;
}

async function incrementarIntentos(token_hash) {
  await pool.query(
    `UPDATE password_resets SET intentos = intentos + 1 WHERE token_hash = $1`,
    [token_hash]
  );
}

async function eliminarSolicitud(email) {
  await pool.query(`DELETE FROM password_resets WHERE email = $1`, [email]);
}

async function limpiarSolicitudesExpiradas() {
  const result = await pool.query(
    `DELETE FROM password_resets WHERE expira_en < NOW() RETURNING email`
  );
  return result.rowCount;
}

module.exports = {
  crearSolicitudReset,
  obtenerSolicitudPorToken,
  obtenerSolicitudesPorEmail, 
  incrementarIntentos,
  eliminarSolicitud,
  limpiarSolicitudesExpiradas,
};