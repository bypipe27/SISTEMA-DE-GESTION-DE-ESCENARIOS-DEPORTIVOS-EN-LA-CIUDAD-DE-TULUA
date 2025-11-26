const express = require('express');
const router = express.Router();
const metodosPagoController = require('../controllers/metodosPagoController');
const auth = require('../middleware/auth');

// Todas las rutas requieren autenticación

// Crear un nuevo método de pago
router.post('/', auth, metodosPagoController.crearMetodoPago);

// Obtener todos los métodos de pago del usuario
router.get('/', auth, metodosPagoController.obtenerMetodosPago);

// Obtener el método de pago predeterminado
router.get('/predeterminado', auth, metodosPagoController.obtenerMetodoPredeterminado);

// Detectar tipo y marca de tarjeta (auxiliar)
router.post('/detectar', auth, metodosPagoController.detectarTarjeta);

// Actualizar un método de pago
router.put('/:id', auth, metodosPagoController.actualizarMetodoPago);

// Establecer un método de pago como predeterminado
router.patch('/:id/predeterminado', auth, metodosPagoController.establecerPredeterminado);

// Eliminar un método de pago
router.delete('/:id', auth, metodosPagoController.eliminarMetodoPago);

module.exports = router;
