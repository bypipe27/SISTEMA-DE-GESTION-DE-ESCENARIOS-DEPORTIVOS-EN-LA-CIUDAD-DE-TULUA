import { get, post } from './api';

/**
 * Crear un payment intent en Stripe
 */
export async function crearPaymentIntent(reservaId, monto, metadatos = {}) {
  try {
    const response = await post('/api/pagos/create-payment-intent', {
      reserva_id: reservaId,
      monto,
      metadatos
    });
    return response;
  } catch (error) {
    console.error('Error al crear payment intent:', error);
    throw error;
  }
}

/**
 * Confirmar un pago exitoso
 */
export async function confirmarPago(paymentIntentId) {
  try {
    const response = await post('/api/pagos/confirm-payment', {
      payment_intent_id: paymentIntentId
    });
    return response;
  } catch (error) {
    console.error('Error al confirmar pago:', error);
    throw error;
  }
}

/**
 * Obtener factura en PDF
 */
export async function obtenerFacturaPDF(reservaId) {
  try {
    const response = await get(`/api/pagos/factura/${reservaId}/pdf`, {
      responseType: 'blob'
    });
    return response;
  } catch (error) {
    console.error('Error al obtener factura:', error);
    throw error;
  }
}

/**
 * Descargar factura PDF
 */
export async function descargarFactura(reservaId, numeroFactura) {
  try {
    const blob = await obtenerFacturaPDF(reservaId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `factura-${numeroFactura}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al descargar factura:', error);
    throw error;
  }
}
