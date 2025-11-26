const dotenv = require("dotenv");
dotenv.config();

// ============================================
// MODO SIMULACIÓN PARA PROYECTO ACADÉMICO
// ============================================
const MODO_SIMULACION = process.env.STRIPE_SIMULATION_MODE === 'true' || !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes('SIMULACION');

let stripe;
let stripeConfigured = false;

if (MODO_SIMULACION) {
  console.log('🎓 MODO SIMULACIÓN ACTIVADO - Stripe simulado para proyecto académico');
  console.log('   Los pagos se procesarán de forma simulada sin conexión real a Stripe');
  
  // Simulador de Stripe para proyecto académico
  stripe = {
    paymentIntents: {
      create: async (params) => {
        console.log('💳 Creando payment intent SIMULADO:', params);
        // Simular respuesta de Stripe
        const simulatedId = `pi_simulado_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        return {
          id: simulatedId,
          client_secret: `${simulatedId}_secret_simulado`,
          amount: params.amount,
          currency: params.currency,
          status: 'requires_payment_method',
          metadata: params.metadata
        };
      },
      retrieve: async (id) => {
        console.log('🔍 Recuperando payment intent SIMULADO:', id);
        return {
          id: id,
          status: 'succeeded',
          amount: 50000,
          currency: 'cop',
          metadata: {}
        };
      }
    },
    webhooks: {
      constructEvent: () => {
        return { type: 'payment_intent.succeeded' };
      }
    }
  };
  stripeConfigured = true;
} else {
  // Modo real de Stripe
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (stripeSecret && stripeSecret.startsWith('sk_')) {
    try {
      stripe = require('stripe')(stripeSecret);
      stripeConfigured = true;
      console.log('✅ Stripe configurado correctamente (MODO REAL)');
    } catch (error) {
      console.error('❌ Error al inicializar Stripe:', error.message);
      stripeConfigured = false;
    }
  } else {
    console.error('❌ Stripe no configurado y modo simulación desactivado');
    stripeConfigured = false;
  }
}
const pagoModel = require('../models/pagoModel');
const reservasModel = require('../models/reservasModel');
const usuarioModel = require('../models/usuarioModel');
const canchaModel = require('../models/canchaModel');
const { generarFacturaPDF } = require('../utils/factura');
const { enviarCorreo } = require('../utils/mailer');
const db = require("../db.js");
const pool = db.pool || db.default || db;

/**
 * Crear un Payment Intent de Stripe
 */
async function crearPaymentIntent(req, res) {
  try {
    const { reserva_id, monto, metadatos } = req.body;

    if (!reserva_id || !monto) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    // Verificar que la reserva existe
    const reserva = await reservasModel.obtenerReservaPorId(reserva_id);
    if (!reserva) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    if (!stripeConfigured) {
      console.error('❌ Intento de crear payment intent sin Stripe configurado');
      return res.status(500).json({ 
        error: 'Sistema de pagos no disponible'
      });
    }

    const modoTexto = MODO_SIMULACION ? '(SIMULADO)' : '(REAL)';
    console.log(`💳 Creando payment intent ${modoTexto} para reserva:`, reserva_id, 'Monto:', monto);

    // Crear el payment intent en Stripe (monto en centavos)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(monto * 100), // Stripe usa centavos
      currency: 'cop',
      metadata: {
        reserva_id: reserva_id.toString(),
        ...metadatos
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Guardar el pago en la base de datos
    await pagoModel.crearPago({
      reserva_id,
      stripe_payment_intent_id: paymentIntent.id,
      monto,
      estado: 'pending',
      metodo_pago: 'stripe'
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      simulationMode: MODO_SIMULACION
    });
  } catch (error) {
    console.error('Error al crear payment intent:', error);
    res.status(500).json({ error: 'Error al procesar el pago', detail: error.message });
  }
}

/**
 * Confirmar pago y generar factura
 */
async function confirmarPago(req, res) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { payment_intent_id } = req.body;

    if (!payment_intent_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'payment_intent_id requerido' });
    }

    // Obtener información del pago desde Stripe (real o simulado)
    if (!stripeConfigured) {
      await client.query('ROLLBACK');
      return res.status(500).json({ error: 'Sistema de pagos no configurado' });
    }

    const modoTexto = MODO_SIMULACION ? '(SIMULADO)' : '(REAL)';
    console.log(`✅ Confirmando pago ${modoTexto}:`, payment_intent_id);

    const paymentIntent = await stripe.paymentIntents.retrieve(payment_intent_id);

    if (paymentIntent.status !== 'succeeded') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El pago no se ha completado' });
    }

    // Actualizar estado del pago en la base de datos
    const pago = await pagoModel.actualizarEstadoPago(payment_intent_id, 'completed', client);

    if (!pago) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Pago no encontrado en la base de datos' });
    }

    // Obtener información completa de la reserva
    const reserva = await reservasModel.obtenerReservaPorId(pago.reserva_id);
    if (!reserva) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Obtener información del usuario
    const usuario = await usuarioModel.findById(reserva.usuario_id);
    if (!usuario) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Obtener información de la cancha (usando la query directa ya que no está en el modelo exportado)
    const canchaQuery = await client.query('SELECT * FROM canchas WHERE id = $1', [reserva.cancha_id]);
    const cancha = canchaQuery.rows[0];

    if (!cancha) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Cancha no encontrada' });
    }

    // Generar número de factura
    const numeroFactura = await pagoModel.generarNumeroFactura();

    // Calcular impuestos (19% IVA)
    const subtotal = parseFloat(pago.monto) / 1.19;
    const impuestos = parseFloat(pago.monto) - subtotal;

    // Preparar datos de la factura
    const facturaData = {
      pago_id: pago.id,
      reserva_id: reserva.id,
      numero_factura: numeroFactura,
      cliente_nombre: reserva.cliente_nombre,
      cliente_email: usuario.email,
      cliente_telefono: reserva.cliente_telefono,
      subtotal: subtotal,
      impuestos: impuestos,
      total: parseFloat(pago.monto),
      items: [
        {
          descripcion: `Reserva de ${cancha.nombre} - ${cancha.tipo}`,
          detalle: `Fecha: ${formatearFecha(reserva.fecha)} - Horario: ${reserva.inicio} a ${reserva.fin}`,
          precio: subtotal,
          total: parseFloat(pago.monto)
        }
      ],
      fecha_emision: new Date()
    };

    // Crear registro de factura en la base de datos
    const factura = await pagoModel.crearFactura(facturaData, client);

    // Generar PDF de la factura
    const pdfBuffer = await generarFacturaPDF(facturaData);

    // Enviar factura por correo
    await enviarCorreo({
      to: usuario.email,
      subject: `Factura ${numeroFactura} - Reserva Confirmada`,
      html: generarEmailFactura(facturaData, cancha, reserva),
      attachments: [
        {
          filename: `factura-${numeroFactura}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    });

    await client.query('COMMIT');

    console.log(`📧 Factura generada ${modoTexto}:`, numeroFactura);
    console.log(`💾 Pago confirmado exitosamente para reserva:`, reserva.id);

    res.json({
      success: true,
      message: MODO_SIMULACION 
        ? 'Pago confirmado (SIMULADO) y factura generada - Proyecto Académico' 
        : 'Pago confirmado y factura generada',
      pago,
      factura: {
        id: factura.id,
        numero_factura: factura.numero_factura,
        total: factura.total
      },
      simulationMode: MODO_SIMULACION
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al confirmar pago:', error);
    res.status(500).json({ error: 'Error al confirmar el pago', detail: error.message });
  } finally {
    client.release();
  }
}

/**
 * Obtener factura en PDF
 */
async function obtenerFacturaPDF(req, res) {
  try {
    const { id } = req.params;

    // Obtener factura de la base de datos
    const factura = await pagoModel.obtenerFacturaPorReserva(id);
    
    if (!factura) {
      return res.status(404).json({ error: 'Factura no encontrada' });
    }

    // Regenerar PDF
    const facturaData = {
      numero_factura: factura.numero_factura,
      cliente_nombre: factura.cliente_nombre,
      cliente_email: factura.cliente_email,
      cliente_telefono: factura.cliente_telefono,
      subtotal: parseFloat(factura.subtotal),
      impuestos: parseFloat(factura.impuestos),
      total: parseFloat(factura.total),
      items: typeof factura.items === 'string' ? JSON.parse(factura.items) : factura.items,
      fecha_emision: factura.created_at
    };

    const pdfBuffer = await generarFacturaPDF(facturaData);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=factura-${factura.numero_factura}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error al obtener factura PDF:', error);
    res.status(500).json({ error: 'Error al generar la factura', detail: error.message });
  }
}

/**
 * Webhook de Stripe para eventos de pago
 */
async function webhookStripe(req, res) {
  if (MODO_SIMULACION) {
    console.log('⚠️ Webhook recibido en MODO SIMULACIÓN - No se procesará');
    return res.json({ received: true, simulation: true });
  }

  if (!stripeConfigured) {
    return res.status(500).json({ error: 'Stripe no configurado' });
  }

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Error de verificación de webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await pagoModel.actualizarEstadoPago(paymentIntent.id, 'completed');
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await pagoModel.actualizarEstadoPago(failedPayment.id, 'failed');
      break;
    default:
      console.log(`Evento no manejado: ${event.type}`);
  }

  res.json({ received: true });
}

/**
 * Generar HTML del email con la factura - Diseño minimalista y profesional
 */
function generarEmailFactura(factura, cancha, reserva) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6; 
          color: #0f172a;
          background: #f8fafc;
        }
        .container { 
          max-width: 600px; 
          margin: 40px auto; 
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white; 
          padding: 40px 30px;
          text-align: center;
        }
        .header h1 {
          font-size: 24px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .header p {
          font-size: 14px;
          opacity: 0.95;
        }
        .content { 
          padding: 40px 30px;
        }
        .greeting {
          font-size: 16px;
          color: #0f172a;
          margin-bottom: 16px;
        }
        .intro {
          font-size: 14px;
          color: #64748b;
          margin-bottom: 30px;
        }
        .factura-card { 
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 24px;
          margin: 24px 0;
        }
        .factura-title {
          font-size: 12px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 16px;
          font-weight: 600;
        }
        .factura-number {
          font-size: 18px;
          color: #10b981;
          font-weight: 700;
          font-family: 'Courier New', monospace;
          margin-bottom: 20px;
        }
        .detalle-item { 
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e2e8f0;
        }
        .detalle-item:last-child {
          border-bottom: none;
        }
        .detalle-label {
          font-size: 13px;
          color: #64748b;
        }
        .detalle-value {
          font-size: 13px;
          color: #0f172a;
          font-weight: 500;
          text-align: right;
        }
        .total-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 2px solid #e2e8f0;
        }
        .total { 
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .total-label {
          font-size: 14px;
          color: #64748b;
          font-weight: 600;
        }
        .total-value {
          font-size: 24px;
          font-weight: 700;
          color: #10b981;
        }
        .info-box {
          background: #eff6ff;
          border-left: 3px solid #3b82f6;
          padding: 16px;
          border-radius: 4px;
          margin: 24px 0;
        }
        .info-title {
          font-size: 13px;
          font-weight: 600;
          color: #1e40af;
          margin-bottom: 8px;
        }
        .info-list {
          list-style: none;
          padding: 0;
        }
        .info-list li {
          font-size: 13px;
          color: #1e3a8a;
          padding: 4px 0;
          padding-left: 20px;
          position: relative;
        }
        .info-list li:before {
          content: "•";
          position: absolute;
          left: 8px;
          color: #3b82f6;
        }
        .footer { 
          background: #f8fafc;
          text-align: center;
          padding: 30px;
          border-top: 1px solid #e2e8f0;
        }
        .footer-text {
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.8;
        }
        .footer-brand {
          font-weight: 600;
          color: #64748b;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✓ Pago Confirmado</h1>
          <p>Tu reserva ha sido procesada exitosamente</p>
        </div>
        
        <div class="content">
          <div class="greeting">Hola ${factura.cliente_nombre},</div>
          <div class="intro">
            Tu pago ha sido procesado correctamente. Adjuntamos tu factura electrónica como comprobante.
          </div>
          
          <div class="factura-card">
            <div class="factura-title">Factura</div>
            <div class="factura-number">${factura.numero_factura}</div>
            
            <div class="detalle-item">
              <span class="detalle-label">Cancha</span>
              <span class="detalle-value">${cancha.nombre}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Tipo</span>
              <span class="detalle-value">${cancha.tipo}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Fecha</span>
              <span class="detalle-value">${formatearFecha(reserva.fecha)}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Horario</span>
              <span class="detalle-value">${reserva.inicio} - ${reserva.fin}</span>
            </div>
            <div class="detalle-item">
              <span class="detalle-label">Dirección</span>
              <span class="detalle-value">${cancha.direccion || 'Por confirmar'}</span>
            </div>
            
            <div class="total-section">
              <div class="total">
                <span class="total-label">Total Pagado</span>
                <span class="total-value">${formatearPrecio(factura.total)}</span>
              </div>
            </div>
          </div>

          <div class="info-box">
            <div class="info-title">Información importante</div>
            <ul class="info-list">
              <li>Llega 15 minutos antes de tu horario reservado</li>
              <li>Conserva tu número de factura para consultas</li>
              <li>La factura adjunta es válida como comprobante</li>
            </ul>
          </div>
        </div>

        <div class="footer">
          <div class="footer-text">
            <span class="footer-brand">Sistema de Gestión de Escenarios Deportivos</span><br>
            Universidad del Valle · Tuluá<br>
            © 2025 Proyecto Académico
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Formatear precio a COP
 */
function formatearPrecio(precio) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(precio);
}

/**
 * Formatear fecha
 */
function formatearFecha(fecha) {
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

module.exports = {
  crearPaymentIntent,
  confirmarPago,
  obtenerFacturaPDF,
  webhookStripe
};
