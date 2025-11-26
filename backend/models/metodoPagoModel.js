const db = require("../db.js");
const pool = db.pool || db.default || db;

/**
 * Crear un método de pago
 */
async function crearMetodoPago(data) {
  const query = `
    INSERT INTO metodos_pago 
      (usuario_id, tipo, banco, nombre_titular, ultimos_digitos, marca, 
       es_predeterminado, token_stripe, fecha_expiracion, tipo_cuenta)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;
  const params = [
    data.usuario_id,
    data.tipo,
    data.banco || null,
    data.nombre_titular,
    data.ultimos_digitos,
    data.marca || null,
    data.es_predeterminado || false,
    data.token_stripe || null,
    data.fecha_expiracion || null,
    data.tipo_cuenta || null
  ];
  const { rows } = await pool.query(query, params);
  return rows[0];
}

/**
 * Obtener todos los métodos de pago de un usuario
 */
async function obtenerMetodosPagoPorUsuario(usuarioId) {
  const query = `
    SELECT * FROM metodos_pago 
    WHERE usuario_id = $1 
    ORDER BY es_predeterminado DESC, created_at DESC
  `;
  const { rows } = await pool.query(query, [usuarioId]);
  return rows;
}

/**
 * Obtener un método de pago por ID
 */
async function obtenerMetodoPagoPorId(id, usuarioId) {
  const query = `
    SELECT * FROM metodos_pago 
    WHERE id = $1 AND usuario_id = $2
  `;
  const { rows } = await pool.query(query, [id, usuarioId]);
  return rows[0] || null;
}

/**
 * Obtener el método de pago predeterminado de un usuario
 */
async function obtenerMetodoPagoPredeterminado(usuarioId) {
  const query = `
    SELECT * FROM metodos_pago 
    WHERE usuario_id = $1 AND es_predeterminado = TRUE
    LIMIT 1
  `;
  const { rows } = await pool.query(query, [usuarioId]);
  return rows[0] || null;
}

/**
 * Actualizar un método de pago
 */
async function actualizarMetodoPago(id, usuarioId, data) {
  const query = `
    UPDATE metodos_pago 
    SET 
      nombre_titular = COALESCE($3, nombre_titular),
      fecha_expiracion = COALESCE($4, fecha_expiracion),
      es_predeterminado = COALESCE($5, es_predeterminado),
      updated_at = NOW()
    WHERE id = $1 AND usuario_id = $2
    RETURNING *
  `;
  const params = [
    id,
    usuarioId,
    data.nombre_titular,
    data.fecha_expiracion,
    data.es_predeterminado
  ];
  const { rows } = await pool.query(query, params);
  return rows[0] || null;
}

/**
 * Establecer un método de pago como predeterminado
 */
async function establecerMetodoPredeterminado(id, usuarioId) {
  const query = `
    UPDATE metodos_pago 
    SET es_predeterminado = TRUE, updated_at = NOW()
    WHERE id = $1 AND usuario_id = $2
    RETURNING *
  `;
  const { rows } = await pool.query(query, [id, usuarioId]);
  return rows[0] || null;
}

/**
 * Eliminar un método de pago
 */
async function eliminarMetodoPago(id, usuarioId) {
  const query = `
    DELETE FROM metodos_pago 
    WHERE id = $1 AND usuario_id = $2
    RETURNING *
  `;
  const { rows } = await pool.query(query, [id, usuarioId]);
  return rows[0] || null;
}

module.exports = {
  crearMetodoPago,
  obtenerMetodosPagoPorUsuario,
  obtenerMetodoPagoPorId,
  obtenerMetodoPagoPredeterminado,
  actualizarMetodoPago,
  establecerMetodoPredeterminado,
  eliminarMetodoPago
};
