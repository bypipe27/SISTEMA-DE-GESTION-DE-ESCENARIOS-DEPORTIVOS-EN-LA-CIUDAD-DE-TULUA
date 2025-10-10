const dbModule = require("../db.js");
const pool = dbModule.pool || dbModule.default || dbModule;

async function crearRegistroPendiente({
  nombre, email, telefono, contrasena_hash, codigo_hash, expira_en
}) {
  const q = `
    INSERT INTO pending_registros (nombre, email, telefono, contrasena_hash, codigo_hash, expira_en)
    VALUES ($1, $2, $3, $4, $5, $6)
    ON CONFLICT (email)
    DO UPDATE SET
      nombre = EXCLUDED.nombre,
      telefono = EXCLUDED.telefono,
      contrasena_hash = EXCLUDED.contrasena_hash,
      codigo_hash = EXCLUDED.codigo_hash,
      expira_en = EXCLUDED.expira_en,
      intentos = 0
    RETURNING *;
  `;
  const vals = [nombre, email, telefono, contrasena_hash, codigo_hash, expira_en];
  const r = await pool.query(q, vals);
  return r.rows[0];
}

async function obtenerPendientePorEmail(email) {
  const r = await pool.query(`SELECT * FROM pending_registros WHERE email = $1`, [email]);
  return r.rows[0] || null;
}

async function incrementarIntentoCodigo(email) {
  await pool.query(`UPDATE pending_registros SET intentos = intentos + 1 WHERE email = $1`, [email]);
}

async function actualizarCodigo(email, codigo_hash, expira_en) {
  await pool.query(
    `UPDATE pending_registros SET codigo_hash = $1, expira_en = $2, intentos = 0 WHERE email = $3`,
    [codigo_hash, expira_en, email]
  );
}

async function eliminarPendiente(email) {
  await pool.query(`DELETE FROM pending_registros WHERE email = $1`, [email]);
}

module.exports = {
  crearRegistroPendiente,
  obtenerPendientePorEmail,
  incrementarIntentoCodigo,
  actualizarCodigo,
  eliminarPendiente,
};
