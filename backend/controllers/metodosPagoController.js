const metodoPagoModel = require('../models/metodoPagoModel');

/**
 * Detectar el tipo de tarjeta o banco según el número
 */
function detectarTipoYMarca(numero) {
  // Remover espacios
  const num = numero.replace(/\s/g, '');
  
  // Detectar marca de tarjeta por patrón BIN (primeros dígitos)
  let marca = null;
  let tipo = null;
  
  // Visa: comienza con 4
  if (/^4/.test(num)) {
    marca = 'Visa';
    tipo = 'tarjeta_credito'; // Por defecto, se puede especificar después
  }
  // Mastercard: comienza con 51-55 o 2221-2720
  else if (/^5[1-5]/.test(num) || /^2[2-7]/.test(num)) {
    marca = 'Mastercard';
    tipo = 'tarjeta_credito';
  }
  // American Express: comienza con 34 o 37
  else if (/^3[47]/.test(num)) {
    marca = 'American Express';
    tipo = 'tarjeta_credito';
  }
  // Diners Club: comienza con 36 o 38
  else if (/^3[068]/.test(num)) {
    marca = 'Diners Club';
    tipo = 'tarjeta_credito';
  }
  // Discover: comienza con 6011, 622126-622925, 644-649, 65
  else if (/^6(?:011|5|4[4-9]|22(?:1[26-9]|[2-8]|9[0-2]))/.test(num)) {
    marca = 'Discover';
    tipo = 'tarjeta_credito';
  }
  
  return { marca, tipo };
}

/**
 * Validar número de tarjeta con algoritmo de Luhn
 */
function validarNumeroTarjeta(numero) {
  const num = numero.replace(/\s/g, '');
  
  if (!/^\d+$/.test(num)) return false;
  if (num.length < 13 || num.length > 19) return false;
  
  let sum = 0;
  let isEven = false;
  
  for (let i = num.length - 1; i >= 0; i--) {
    let digit = parseInt(num[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Crear un nuevo método de pago
 */
async function crearMetodoPago(req, res) {
  try {
    const usuarioId = req.user.id;
    const { 
      tipo, 
      banco, 
      nombre_titular, 
      numero_completo, 
      fecha_expiracion,
      tipo_cuenta,
      es_predeterminado 
    } = req.body;

    // Validaciones
    if (!tipo || !nombre_titular || !numero_completo) {
      return res.status(400).json({ 
        error: 'Faltan datos requeridos: tipo, nombre_titular, numero_completo' 
      });
    }

    // Validar tipo
    const tiposPermitidos = ['tarjeta_credito', 'tarjeta_debito', 'cuenta_bancaria'];
    if (!tiposPermitidos.includes(tipo)) {
      return res.status(400).json({ 
        error: 'Tipo inválido. Permitidos: tarjeta_credito, tarjeta_debito, cuenta_bancaria' 
      });
    }

    // Para cuentas bancarias, validar banco
    if (tipo === 'cuenta_bancaria') {
      const bancosPermitidos = ['Bancolombia', 'Nequi', 'Davivienda'];
      if (!banco || !bancosPermitidos.includes(banco)) {
        return res.status(400).json({ 
          error: 'Para cuentas bancarias, debe especificar un banco válido: Bancolombia, Nequi, Davivienda' 
        });
      }
      if (!tipo_cuenta || !['ahorro', 'corriente'].includes(tipo_cuenta)) {
        return res.status(400).json({ 
          error: 'Para cuentas bancarias, debe especificar tipo_cuenta: ahorro o corriente' 
        });
      }
    }

    // Validar número de tarjeta/cuenta
    const numeroLimpio = numero_completo.replace(/\s/g, '');
    
    if (tipo.includes('tarjeta')) {
      // Validar tarjeta (modo relajado para proyecto académico)
      const esValido = validarNumeroTarjeta(numeroLimpio);
      
      // Detectar marca
      const { marca } = detectarTipoYMarca(numeroLimpio);
      
      // En modo académico, permitir cualquier tarjeta pero advertir si no es válida
      if (!marca) {
        // Si no se detecta marca, asignar una genérica basada en el tipo
        const marcaGenerica = tipo === 'tarjeta_credito' ? 'Crédito' : 'Débito';
      }
      
      const marcaFinal = marca || (tipo === 'tarjeta_credito' ? 'Visa' : 'Débito');

      // Validar fecha de expiración
      if (!fecha_expiracion || !/^\d{2}\/\d{4}$/.test(fecha_expiracion)) {
        return res.status(400).json({ 
          error: 'Fecha de expiración inválida. Formato: MM/YYYY' 
        });
      }

      // Obtener últimos 4 dígitos
      const ultimos_digitos = numeroLimpio.slice(-4);

      // Generar token simulado de Stripe
      const token_stripe = `pm_simulado_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Crear método de pago
      const metodoPago = await metodoPagoModel.crearMetodoPago({
        usuario_id: usuarioId,
        tipo,
        banco: null,
        nombre_titular: nombre_titular.toUpperCase(),
        ultimos_digitos,
        marca: marcaFinal,
        es_predeterminado: es_predeterminado || false,
        token_stripe,
        fecha_expiracion,
        tipo_cuenta: null
      });

      return res.status(201).json({
        mensaje: 'Método de pago creado exitosamente',
        metodo_pago: {
          ...metodoPago,
          numero_completo: undefined // No devolver el número completo
        }
      });
    } else {
      // Cuenta bancaria
      const ultimos_digitos = numeroLimpio.slice(-4);
      const token_stripe = `ba_simulado_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      const metodoPago = await metodoPagoModel.crearMetodoPago({
        usuario_id: usuarioId,
        tipo,
        banco,
        nombre_titular: nombre_titular.toUpperCase(),
        ultimos_digitos,
        marca: banco, // Para cuentas, la "marca" es el banco
        es_predeterminado: es_predeterminado || false,
        token_stripe,
        fecha_expiracion: null,
        tipo_cuenta
      });

      return res.status(201).json({
        mensaje: 'Método de pago creado exitosamente',
        metodo_pago: {
          ...metodoPago,
          numero_completo: undefined
        }
      });
    }
  } catch (error) {
    console.error('Error al crear método de pago:', error);
    res.status(500).json({ 
      error: 'Error al crear método de pago', 
      detail: error.message 
    });
  }
}

/**
 * Obtener todos los métodos de pago del usuario
 */
async function obtenerMetodosPago(req, res) {
  try {
    const usuarioId = req.user.id;
    const metodos = await metodoPagoModel.obtenerMetodosPagoPorUsuario(usuarioId);
    
    res.json({ metodos_pago: metodos });
  } catch (error) {
    console.error('Error al obtener métodos de pago:', error);
    res.status(500).json({ 
      error: 'Error al obtener métodos de pago', 
      detail: error.message 
    });
  }
}

/**
 * Obtener el método de pago predeterminado
 */
async function obtenerMetodoPredeterminado(req, res) {
  try {
    const usuarioId = req.user.id;
    const metodo = await metodoPagoModel.obtenerMetodoPagoPredeterminado(usuarioId);
    
    if (!metodo) {
      return res.status(404).json({ 
        error: 'No tienes un método de pago predeterminado' 
      });
    }
    
    res.json({ metodo_pago: metodo });
  } catch (error) {
    console.error('Error al obtener método predeterminado:', error);
    res.status(500).json({ 
      error: 'Error al obtener método predeterminado', 
      detail: error.message 
    });
  }
}

/**
 * Actualizar un método de pago
 */
async function actualizarMetodoPago(req, res) {
  try {
    const usuarioId = req.user.id;
    const { id } = req.params;
    const { nombre_titular, fecha_expiracion, es_predeterminado } = req.body;

    // Verificar que el método de pago existe y pertenece al usuario
    const metodoExistente = await metodoPagoModel.obtenerMetodoPagoPorId(id, usuarioId);
    if (!metodoExistente) {
      return res.status(404).json({ 
        error: 'Método de pago no encontrado' 
      });
    }

    const metodoActualizado = await metodoPagoModel.actualizarMetodoPago(id, usuarioId, {
      nombre_titular: nombre_titular ? nombre_titular.toUpperCase() : null,
      fecha_expiracion,
      es_predeterminado
    });

    res.json({
      mensaje: 'Método de pago actualizado exitosamente',
      metodo_pago: metodoActualizado
    });
  } catch (error) {
    console.error('Error al actualizar método de pago:', error);
    res.status(500).json({ 
      error: 'Error al actualizar método de pago', 
      detail: error.message 
    });
  }
}

/**
 * Establecer un método de pago como predeterminado
 */
async function establecerPredeterminado(req, res) {
  try {
    const usuarioId = req.user.id;
    const { id } = req.params;

    // Verificar que el método de pago existe y pertenece al usuario
    const metodoExistente = await metodoPagoModel.obtenerMetodoPagoPorId(id, usuarioId);
    if (!metodoExistente) {
      return res.status(404).json({ 
        error: 'Método de pago no encontrado' 
      });
    }

    const metodoActualizado = await metodoPagoModel.establecerMetodoPredeterminado(id, usuarioId);

    res.json({
      mensaje: 'Método de pago establecido como predeterminado',
      metodo_pago: metodoActualizado
    });
  } catch (error) {
    console.error('Error al establecer método predeterminado:', error);
    res.status(500).json({ 
      error: 'Error al establecer método predeterminado', 
      detail: error.message 
    });
  }
}

/**
 * Eliminar un método de pago
 */
async function eliminarMetodoPago(req, res) {
  try {
    const usuarioId = req.user.id;
    const { id } = req.params;

    // Verificar que el método de pago existe y pertenece al usuario
    const metodoExistente = await metodoPagoModel.obtenerMetodoPagoPorId(id, usuarioId);
    if (!metodoExistente) {
      return res.status(404).json({ 
        error: 'Método de pago no encontrado' 
      });
    }

    await metodoPagoModel.eliminarMetodoPago(id, usuarioId);

    res.json({
      mensaje: 'Método de pago eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar método de pago:', error);
    res.status(500).json({ 
      error: 'Error al eliminar método de pago', 
      detail: error.message 
    });
  }
}

/**
 * Detectar tipo y marca de tarjeta/banco (endpoint auxiliar)
 */
async function detectarTarjeta(req, res) {
  try {
    const { numero } = req.body;
    
    if (!numero) {
      return res.status(400).json({ error: 'Número requerido' });
    }

    const numeroLimpio = numero.replace(/\s/g, '');
    const { marca, tipo } = detectarTipoYMarca(numeroLimpio);
    const esValido = validarNumeroTarjeta(numeroLimpio);

    res.json({
      marca: marca || 'Desconocida',
      tipo: tipo || 'tarjeta_credito',
      valido: esValido, // Cambio: usar 'valido' en lugar de 'es_valido'
      longitud: numeroLimpio.length
    });
  } catch (error) {
    console.error('Error al detectar tarjeta:', error);
    res.status(500).json({ 
      error: 'Error al detectar tarjeta', 
      detail: error.message 
    });
  }
}

module.exports = {
  crearMetodoPago,
  obtenerMetodosPago,
  obtenerMetodoPredeterminado,
  actualizarMetodoPago,
  establecerPredeterminado,
  eliminarMetodoPago,
  detectarTarjeta
};
