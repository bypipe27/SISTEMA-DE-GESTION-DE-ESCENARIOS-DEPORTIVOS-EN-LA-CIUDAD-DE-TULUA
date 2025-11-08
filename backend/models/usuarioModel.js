const dbModule = require("../db.js");
const pool = dbModule.pool || dbModule.default || dbModule;

async function crearUsuario(nombre, email, telefono, contrasenaHash, role = "user") {
  const result = await pool.query(
    `INSERT INTO usuarios (nombre, email, telefono, contrasena, verificado, role)
     VALUES ($1, $2, $3, $4, TRUE, $5)
     RETURNING id, nombre, email, telefono, verificado, role`,
    [nombre, email, telefono, contrasenaHash, role]
  );
  return result.rows[0];
}

async function existeUsuarioPorEmail(email) {
  const r = await pool.query(`SELECT 1 FROM usuarios WHERE email = $1 LIMIT 1`, [email]);
  return r.rowCount > 0;
}

module.exports = {
  crearUsuario,
  existeUsuarioPorEmail,
};
