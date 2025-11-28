const dbModule = require("../db.js");
const pool = dbModule.pool || dbModule.default || dbModule;


async function crearServicioExtra(data) {
  const q = `
    INSERT INTO servicios_extra
      (propietario_id, cancha_id, tipo, nombre, descripcion, precio, disponible, duracion_minutos, requiere_anticipacion_horas)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;
  const vals = [
    data.propietario_id,
    data.cancha_id,
    data.tipo,
    data.nombre,
    data.descripcion || null,
    data.precio || null,
    data.disponible ?? true,
    data.duracion_minutos || 60,
    data.requiere_anticipacion_horas || 24
  ];
  const r = await pool.query(q, vals);
  return r.rows[0];
}


async function obtenerServiciosPorCancha(canchaId) {
  const q = `
    SELECT * FROM servicios_extra
    WHERE cancha_id = $1 AND disponible = true
    ORDER BY tipo, nombre
  `;
  const r = await pool.query(q, [canchaId]);
  return r.rows;
}


async function obtenerServiciosPorPropietario(propietarioId) {
  const q = `
    SELECT se.*, c.nombre as cancha_nombre
    FROM servicios_extra se
    JOIN canchas c ON se.cancha_id = c.id
    WHERE se.propietario_id = $1
    ORDER BY c.nombre, se.tipo, se.nombre
  `;
  const r = await pool.query(q, [propietarioId]);
  return r.rows;
}


async function obtenerServicioExtraPorId(id) {
  const q = `SELECT * FROM servicios_extra WHERE id = $1 LIMIT 1`;
  const r = await pool.query(q, [id]);
  return r.rows[0] || null;
}


async function actualizarServicioExtra(id, fields) {
  const allowed = ["tipo", "nombre", "descripcion", "precio", "disponible", "duracion_minutos", "requiere_anticipacion_horas"];
  const sets = [];
  const vals = [];
  let idx = 1;
 
  for (const k of allowed) {
    if (Object.prototype.hasOwnProperty.call(fields, k)) {
      sets.push(`${k} = $${idx++}`);
      vals.push(fields[k]);
    }
  }
 
  if (sets.length === 0) return await obtenerServicioExtraPorId(id);
 
  sets.push(`updated_at = CURRENT_TIMESTAMP`);
  const q = `UPDATE servicios_extra SET ${sets.join(", ")} WHERE id = $${idx} RETURNING *`;
  vals.push(id);
 
  const r = await pool.query(q, vals);
  return r.rows[0] || null;
}


async function eliminarServicioExtra(id) {
  const q = `DELETE FROM servicios_extra WHERE id = $1 RETURNING id`;
  const r = await pool.query(q, [id]);
  return r.rowCount > 0;
}


async function vincularServicioAReserva(reservaId, servicioId, precioAplicado) {
  const q = `
    INSERT INTO reserva_servicios_extra (reserva_id, servicio_extra_id, precio_aplicado)
    VALUES ($1, $2, $3)
    RETURNING *;
  `;
  const r = await pool.query(q, [reservaId, servicioId, precioAplicado]);
  return r.rows[0];
}


async function obtenerServiciosDeReserva(reservaId) {
  const q = `
    SELECT rse.*, se.nombre, se.tipo, se.descripcion
    FROM reserva_servicios_extra rse
    JOIN servicios_extra se ON rse.servicio_extra_id = se.id
    WHERE rse.reserva_id = $1
  `;
  const r = await pool.query(q, [reservaId]);
  return r.rows;
}


module.exports = {
  crearServicioExtra,
  obtenerServiciosPorCancha,
  obtenerServiciosPorPropietario,
  obtenerServicioExtraPorId,
  actualizarServicioExtra,
  eliminarServicioExtra,
  vincularServicioAReserva,
  obtenerServiciosDeReserva
};


