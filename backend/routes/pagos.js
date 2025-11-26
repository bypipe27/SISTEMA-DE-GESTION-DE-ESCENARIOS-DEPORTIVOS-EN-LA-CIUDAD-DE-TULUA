const express = require('express');
const router = express.Router();
const pagosController = require('../controllers/pagosController');
const auth = require('../middleware/auth');

// Verificar configuración de Stripe (para debugging)
router.get('/stripe-status', (req, res) => {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const isConfigured = stripeKey && stripeKey.startsWith('sk_');
  
  res.json({
    configured: isConfigured,
    keyFormat: stripeKey ? `${stripeKey.substring(0, 10)}...` : 'No configurado',
    message: isConfigured 
      ? '✅ Stripe está configurado' 
      : '❌ Stripe NO está configurado. Agrega STRIPE_SECRET_KEY en backend/.env'
  });
});

// Crear payment intent (requiere autenticación)
router.post('/create-payment-intent', auth, pagosController.crearPaymentIntent);

// Confirmar pago y generar factura
router.post('/confirm-payment', auth, pagosController.confirmarPago);

// Obtener factura en PDF
router.get('/factura/:id/pdf', auth, pagosController.obtenerFacturaPDF);

// Webhook de Stripe (no requiere autenticación, usa firma de Stripe)
// El body raw se configura en server.js para esta ruta
router.post('/webhook', pagosController.webhookStripe);

module.exports = router;
