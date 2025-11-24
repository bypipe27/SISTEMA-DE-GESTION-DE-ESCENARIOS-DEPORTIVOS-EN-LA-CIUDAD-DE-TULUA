const db = require("../db.js");
const pool = db.pool || db.default || db;

/**
 * Crear un registro de pago en la base de datos
 */
async function crearPago(data, client = pool) {
  const query = `
    INSERT INTO pagos 
      (reserva_id, stripe_payment_intent_id, monto, estado, metodo_pago)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;
  const params = [
    data.reserva_id,
    data.stripe_payment_intent_id,
    data.monto,
    data.estado || 'pending',
    data.metodo_pago || 'stripe'
  ];
  const { rows } = await client.query(query, params);
  return rows[0];
}

/**
 * Actualizar estado de pago
 */
async function actualizarEstadoPago(paymentIntentId, estado, client = pool) {
  const query = `
    UPDATE pagos 
    SET estado = $2, updated_at = NOW()
    WHERE stripe_payment_intent_id = $1
    RETURNING *
  `;
  const { rows } = await client.query(query, [paymentIntentId, estado]);
  return rows[0];
}

/**
 * Obtener pago por ID de reserva
 */
async function obtenerPagoPorReserva(reservaId) {
  const query = `SELECT * FROM pagos WHERE reserva_id = $1 LIMIT 1`;
  const { rows } = await pool.query(query, [reservaId]);
  return rows[0] || null;
}

/**
 * Obtener pago por payment intent de Stripe
 */
async function obtenerPagoPorPaymentIntent(paymentIntentId) {
  const query = `SELECT * FROM pagos WHERE stripe_payment_intent_id = $1 LIMIT 1`;
  const { rows } = await pool.query(query, [paymentIntentId]);
  return rows[0] || null;
}

/**
 * Crear factura electrónica
 */
async function crearFactura(data, client = pool) {
  const query = `
    INSERT INTO facturas 
      (pago_id, reserva_id, numero_factura, cliente_nombre, cliente_email, 
       cliente_telefono, subtotal, impuestos, total, items, pdf_url)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *
  `;
  const params = [
    data.pago_id,
    data.reserva_id,
    data.numero_factura,
    data.cliente_nombre,
    data.cliente_email,
    data.cliente_telefono,
    data.subtotal,
    data.impuestos,
    data.total,
    JSON.stringify(data.items),
    data.pdf_url || null
  ];
  const { rows } = await client.query(query, params);
  return rows[0];
}

/**
 * Obtener factura por ID de pago
 */
async function obtenerFacturaPorPago(pagoId) {
  const query = `SELECT * FROM facturas WHERE pago_id = $1 LIMIT 1`;
  const { rows } = await pool.query(query, [pagoId]);
  return rows[0] || null;
}

/**
 * Obtener factura por ID de reserva
 */
async function obtenerFacturaPorReserva(reservaId) {
  const query = `SELECT * FROM facturas WHERE reserva_id = $1 LIMIT 1`;
  const { rows } = await pool.query(query, [reservaId]);
  return rows[0] || null;
}

/**
 * Generar número de factura único
 */
async function generarNumeroFactura() {
  const año = new Date().getFullYear();
  const query = `
    SELECT numero_factura 
    FROM facturas 
    WHERE numero_factura LIKE $1
    ORDER BY created_at DESC 
    LIMIT 1
  `;
  const { rows } = await pool.query(query, [`FAC-${año}-%`]);
  
  if (rows.length === 0) {
    return `FAC-${año}-0001`;
  }
  
  const ultimoNumero = rows[0].numero_factura;
  const partes = ultimoNumero.split('-');
  const secuencia = parseInt(partes[2]) + 1;
  return `FAC-${año}-${secuencia.toString().padStart(4, '0')}`;
}

module.exports = {
  crearPago,
  actualizarEstadoPago,
  obtenerPagoPorReserva,
  obtenerPagoPorPaymentIntent,
  crearFactura,
  obtenerFacturaPorPago,
  obtenerFacturaPorReserva,
  generarNumeroFactura
};
