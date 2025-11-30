const db = require("../db.js");
const pool = db.pool || db.default || db;

async function buscarPorProveedorId(providerId) {
  const query = `
    SELECT 
      r.id, 
      r.fecha, 
      r.inicio, 
      r.estado,
      c.nombre as cancha_nombre,
      r.cliente_nombre as cliente_nombre
    FROM reservas r
    JOIN canchas c ON r.cancha_id = c.id
    JOIN usuarios u ON r.usuario_id = u.id
    WHERE c.propietario_id = $1
    ORDER BY r.fecha DESC, r.inicio DESC;
  `;
  // CORRECCIÓN: Se usa { rows } para obtener el array de resultados en PostgreSQL.
  // También corregí el ORDER BY para que use r.inicio, ya que r.hora_inicio no existe en tu SELECT.
  const { rows } = await pool.query(query, [providerId]);
  return rows;
}
// ... código existente ...
async function buscarProximasPorProveedorId(providerId, limit = 5) {
  const query = `
    SELECT 
      r.id, 
      r.fecha, 
      r.inicio,
      c.nombre as cancha_nombre,
      r.cliente_nombre as cliente_nombre
    FROM reservas r
    JOIN canchas c ON r.cancha_id = c.id
    JOIN usuarios u ON r.usuario_id = u.id
    WHERE c.propietario_id = $1 AND r.estado = 'activa' AND r.fecha >= CURRENT_DATE
    ORDER BY r.fecha ASC, r.inicio ASC
    LIMIT $2;
  `;
  const { rows } = await pool.query(query, [providerId, limit]);
  return rows;
}
async function buscarPorUsuarioId(userId) {
  const query = `
    SELECT r.*, c.nombre AS cancha_nombre, c.tipo, c.map_iframe
    FROM reservas r
    JOIN canchas c ON c.id = r.cancha_id
    WHERE r.usuario_id = $1
    ORDER BY r.fecha DESC, r.inicio ASC
  `;
  const { rows } = await pool.query(query, [userId]);
  return rows;
}
async function obtenerCalendarioCancha(canchaId) {
  const q = `
    SELECT id, horarios, cerrados_dias, cerrados_fechas
    FROM canchas
    WHERE id = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [canchaId]);
  return rows[0] || null;
}

async function buscarReservasDelDia(canchaId, dateStr) {
  const q = `
    SELECT inicio::text AS inicio, fin::text AS fin
    FROM reservas
    WHERE cancha_id = $1
      AND fecha = $2
      AND estado != 'cancelada'
  `;
  const { rows } = await pool.query(q, [canchaId, dateStr]);
  return rows;
}

async function obtenerReservaPorId(id) {
  const q = `SELECT * FROM reservas WHERE id = $1 LIMIT 1`;
  const { rows } = await pool.query(q, [id]);
  return rows[0] || null;
}

async function actualizarEstadoReserva(id, estado) {
  const q = `UPDATE reservas SET estado = $2 WHERE id = $1 RETURNING *`;
  const { rows } = await pool.query(q, [id, estado]);
  return rows[0] || null;
}

async function obtenerInfoPropietarioPorCanchaId(canchaId) {
  const q = `
    SELECT 
      c.id AS cancha_id,
      c.nombre AS cancha_nombre, 
      c.propietario_id, 
      u.email AS propietario_email, 
      u.nombre AS propietario_nombre
    FROM canchas c
    JOIN usuarios u ON u.id = c.propietario_id
    WHERE c.id = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [canchaId]);
  return rows[0] || null;
}
async function obtenerPrecioCancha(canchaId, client = pool) {
  const q = `SELECT precio FROM canchas WHERE id = $1 LIMIT 1`;
  const { rows } = await client.query(q, [canchaId]);
  return rows[0]?.precio ?? null;
}

async function existeConflictoReserva(canchaId, date, start, end, client = pool) {
  const q = `
    SELECT 1 FROM reservas
    WHERE cancha_id = $1
      AND fecha = $2
      AND estado IN ('activa', 'programada', 'completada')
      AND NOT (fin <= $3 OR inicio >= $4)
    LIMIT 1
  `;
  const { rows } = await client.query(q, [canchaId, date, start, end]);
  return rows.length > 0;
}

async function insertarReserva(data, client = pool) {
  const q = `
     INSERT INTO reservas
      (cancha_id, fecha, inicio, fin, cliente_nombre, cliente_telefono, metodo_pago, total, usuario_id, estado)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
    RETURNING *
  `;

  const params = [
    data.cancha_id,
    data.date,
    data.start,
    data.end,
    data.cliente_nombre,
    data.cliente_telefono,
    data.metodo_pago,
    data.totalFinal,
    data.usuario_id,
    "activa"
  ];
  const { rows } = await client.query(q, params);
  return rows[0];
}
async function buscarReservasDelPropietario(propietarioId) {
  const q = `
    SELECT r.*, c.nombre AS cancha_nombre, c.propietario_id
    FROM reservas r
    JOIN canchas c ON c.id = r.cancha_id
    WHERE c.propietario_id = $1
    ORDER BY r.fecha DESC, r.inicio ASC
  `;
  const { rows } = await pool.query(q, [propietarioId]);
  return rows;
}
async function obtenerReservaConPropietario(reservaId) {
  const q = `
    SELECT r.*, c.propietario_id, c.nombre AS cancha_nombre
    FROM reservas r
    JOIN canchas c ON c.id = r.cancha_id
    WHERE r.id = $1
    LIMIT 1
  `;
  const { rows } = await pool.query(q, [reservaId]);
  return rows[0] || null;
}

async function obtenerUsuarioPorId(id) {
  const q = `SELECT id, email, nombre FROM usuarios WHERE id = $1 LIMIT 1`;
  const { rows } = await pool.query(q, [id]);
  return rows[0] || null;
}
async function obtenerReportesTotalesPropietario(propietarioId, startDate, endDate) {
  const q = `
    SELECT 
      COALESCE(SUM(CASE WHEN r.estado = 'completada' THEN COALESCE(r.total,0)::numeric ELSE 0 END),0) AS total_ingresos,
      COUNT(*) AS total_reservas
    FROM reservas r
    JOIN canchas c ON c.id = r.cancha_id
    WHERE c.propietario_id = $1 AND r.fecha BETWEEN $2 AND $3
  `;
  const { rows } = await pool.query(q, [propietarioId, startDate, endDate]);
  return rows[0] || { total_ingresos: 0, total_reservas: 0 };
}

async function obtenerReportesEstadosPropietario(propietarioId, startDate, endDate) {
  const q = `
    SELECT COALESCE(r.estado,'activa') AS estado, COUNT(*)::int AS cantidad
    FROM reservas r
    JOIN canchas c ON c.id = r.cancha_id
    WHERE c.propietario_id = $1 AND r.fecha BETWEEN $2 AND $3
    GROUP BY COALESCE(r.estado,'activa')
  `;
  const { rows } = await pool.query(q, [propietarioId, startDate, endDate]);
  return rows;
}

async function obtenerReportesSerieDiariaPropietario(propietarioId, startDate, endDate) {
  const q = `
    SELECT 
      DATE(r.fecha) AS dia,
      COUNT(*) FILTER (WHERE r.estado = 'completada')::int AS completadas,
      COALESCE(SUM(CASE WHEN r.estado = 'completada' THEN r.total ELSE 0 END), 0) AS ingresos
    FROM reservas r
    JOIN canchas c ON c.id = r.cancha_id
    WHERE c.propietario_id = $1
      AND DATE(r.fecha) BETWEEN $2::date AND $3::date
    GROUP BY DATE(r.fecha)
    ORDER BY DATE(r.fecha)
  `;
  const { rows } = await pool.query(q, [propietarioId, startDate, endDate]);
  return rows;
}


module.exports = {
  buscarPorProveedorId,
  buscarProximasPorProveedorId,
  buscarPorUsuarioId,
  obtenerCalendarioCancha,
  buscarReservasDelDia,
  obtenerReservaPorId,
  actualizarEstadoReserva,
  obtenerInfoPropietarioPorCanchaId,
  obtenerPrecioCancha,
  existeConflictoReserva,
  insertarReserva,
  buscarReservasDelPropietario,
  obtenerReservaConPropietario,
  obtenerUsuarioPorId,
  obtenerReportesTotalesPropietario,
  obtenerReportesEstadosPropietario,
  obtenerReportesSerieDiariaPropietario,
};
