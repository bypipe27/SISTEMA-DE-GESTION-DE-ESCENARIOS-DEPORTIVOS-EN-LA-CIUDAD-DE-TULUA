const dbModule = require("../db.js");
const pool = dbModule.pool || dbModule.default || dbModule;

async function crearCancha({
  propietario_id, nombre_cancha, tipo, capacidad, precio, descripcion, ubicacion_frame, direccion, contrasena_hash
}) {
  const q = `
    INSERT INTO canchas
      (propietario_id, nombre, tipo, capacidad, precio, descripcion, map_iframe, direccion, contrasena)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *;
  `;
  const vals = [
    propietario_id,
    nombre_cancha,
    tipo,
    capacidad,
    precio,
    descripcion,
    ubicacion_frame, // en BD se llama map_iframe
    direccion,
    contrasena_hash
  ];
  const r = await pool.query(q, vals);
  return r.rows[0];
}

module.exports = {
  crearCancha,
};

