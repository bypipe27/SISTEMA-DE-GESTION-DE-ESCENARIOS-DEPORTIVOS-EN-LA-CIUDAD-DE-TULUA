import pool from "../db.js";

export const crearUsuario = async (nombre, email, telefono, hash) => {
  const result = await pool.query(
    `INSERT INTO usuarios (nombre, email, telefono, contrasena, verificado)
     VALUES ($1, $2, $3, $4, false) RETURNING *`,
    [nombre, email, telefono, hash]
  );
  return result.rows[0];
};
