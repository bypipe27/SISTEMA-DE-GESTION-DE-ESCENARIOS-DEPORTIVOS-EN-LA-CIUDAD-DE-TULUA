/**
 * Modelo para Reserva
 * Contiene utilidades de formateo y transformación de datos de reservas
 */
export default class Reserva {
  /**
   * Formatea una fecha en español
   * @param {string} fechaStr - Fecha en formato ISO o YYYY-MM-DD
   * @returns {string} Fecha formateada en español
   */
  static formatearFecha(fechaStr) {
    try {
      let fecha;
      
      if (fechaStr.includes('T')) {
        // Formato ISO: "2025-10-21T05:00:00.000Z"
        fecha = new Date(fechaStr);
      } else {
        // Formato simple: "2025-10-21"
        const [year, month, day] = fechaStr.split('-');
        fecha = new Date(year, month - 1, day);
      }
      
      if (isNaN(fecha.getTime())) {
        throw new Error('Fecha inválida');
      }
      
      const fechaFormateada = fecha.toLocaleDateString("es-ES", {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Capitalizar primera letra del día
      return fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
      
    } catch (error) {
      // Intentar mostrar solo la parte de la fecha si es ISO
      if (fechaStr.includes('T')) {
        return fechaStr.split('T')[0]; // Mostrar solo "2025-10-21"
      }
      return fechaStr; // Fallback: mostrar la fecha original
    }
  }

  /**
   * Formatea el precio en formato colombiano
   * @param {number} precio - Precio en COP
   * @returns {string} Precio formateado
   */
  static formatearPrecio(precio) {
    return `$${precio.toLocaleString()} COP`;
  }

  /**
   * Genera el número de reserva formateado
   * @param {number} id - ID de la reserva
   * @returns {string} Número de reserva con ceros a la izquierda
   */
  static formatearNumeroReserva(id) {
    return `#${id.toString().padStart(6, '0')}`;
  }

  /**
   * Genera el mensaje para compartir reserva
   * @param {Object} cancha - Datos de la cancha
   * @param {Object} reserva - Datos de la reserva
   * @param {Object} horario - Horario de la reserva
   * @returns {string} Mensaje formateado para compartir
   */
  static generarMensajeCompartir(cancha, reserva, horario) {
    return `✅ Reserva confirmada en ${cancha.nombre}\n📅 ${this.formatearFecha(reserva.fecha)}\n🕒 ${horario.start} - ${horario.end}`;
  }

  /**
   * Valida que los datos de reserva sean completos
   * @param {Object} reserva - Datos de la reserva
   * @param {Object} cancha - Datos de la cancha
   * @param {Object} horario - Horario de la reserva
   * @returns {boolean} true si los datos son válidos
   */
  static validarDatosReserva(reserva, cancha, horario) {
    return !!(reserva && cancha && horario && reserva.id && cancha.nombre);
  }
}
