const { differenceInHours, parseISO } = require("date-fns");
const reservasModel = require("../models/reservasModel");
const { enviarCorreo } = require("../utils/mailer");
const db = require("../db"); 
function toISODateOnly(dateLike) {
  try {
    if (dateLike?.toISOString) return dateLike.toISOString().slice(0, 10);
    return new Date(dateLike).toISOString().slice(0, 10);
  } catch {
    return null;
  }
}

function sliceHHMM(t) {
  return String(t || "").slice(0, 5); // "HH:MM"
}

async function providerMarkCompleted(reservaId, providerId) {
  const reserva = await reservasModel.obtenerReservaConPropietario(reservaId);
  if (!reserva) {
    const err = new Error("Reserva no encontrada");
    err.status = 404;
    throw err;
  }
  if (Number(reserva.propietario_id) !== Number(providerId)) {
    const err = new Error("No eres el propietario de la cancha de esta reserva");
    err.status = 403;
    throw err;
  }

  const fechaStr = reserva.fecha?.toISOString?.().slice(0,10) || new Date(reserva.fecha).toISOString().slice(0,10);
  const finTime = hhmm(reserva.fin || reserva.end);
  if (!finTime) {
    const err = new Error("Hora de fin inválida");
    err.status = 400;
    throw err;
  }
  const fechaHoraFin = parseISO(`${fechaStr}T${finTime}`);
  if (new Date() < fechaHoraFin) {
    const err = new Error("No se puede marcar completada antes de que termine");
    err.status = 400;
    throw err;
  }

  await reservasModel.actualizarEstadoReserva(reservaId, "completada");

  // correo al cliente (no bloqueante)
  (async () => {
    try {
      const cliente = await reservasModel.obtenerUsuarioPorId(reserva.usuario_id);
      if (cliente?.email) {
        const inicioTime = hhmm(reserva.inicio);
        await enviarCorreo({
          to: cliente.email,
          subject: `Reserva completada - ${reserva.cancha_nombre || ""}`,
          html: `
            <h3>Hola ${cliente.nombre || "cliente"}</h3>
            <p>Tu reserva fue marcada como completada por el proveedor.</p>
            <ul>
              <li><b>Cancha:</b> ${reserva.cancha_nombre || "N/A"}</li>
              <li><b>Fecha:</b> ${fechaStr}</li>
              <li><b>Inicio:</b> ${inicioTime}</li>
              <li><b>Fin:</b> ${finTime}</li>
            </ul>
          `,
        });
      }
    } catch (e) {
    }
  })();
}

async function cancelarReservaUsuario(id) {
  const reserva = await reservasModel.obtenerReservaPorId(id);
  if (!reserva) {
    const err = new Error("Reserva no encontrada");
    err.status = 404;
    throw err;
  }

  // fecha + hora de inicio (usar columnas inicio/fin)
  const fechaStr = toISODateOnly(reserva.fecha);
  const inicioTime = sliceHHMM(reserva.inicio);
  if (!fechaStr || !inicioTime) {
    const err = new Error("Datos de fecha/hora inválidos en la reserva");
    err.status = 400;
    throw err;
  }

  const fechaHoraReserva = parseISO(`${fechaStr}T${inicioTime}`);
  const ahora = new Date();
  const horasRestantes = differenceInHours(fechaHoraReserva, ahora);

  if (horasRestantes < 3) {
    const err = new Error("No se puede cancelar una reserva con menos de 3 horas de anticipación.");
    err.status = 400;
    throw err;
  }

  const updated = await reservasModel.actualizarEstadoReserva(id, "cancelada");

  // enviar correo al propietario (no bloqueante)
  (async () => {
    try {
      const canchaInfo = await reservasModel.obtenerInfoPropietarioPorCanchaId(reserva.cancha_id);
      if (canchaInfo?.propietario_email) {
        await enviarCorreo({
          to: canchaInfo.propietario_email,
          subject: `Reserva cancelada - ${canchaInfo.cancha_nombre}`,
          html: `
            <h3>Hola ${canchaInfo.propietario_nombre || "propietario"}</h3>
            <p>La siguiente reserva ha sido cancelada:</p>
            <ul>
              <li><b>Cancha:</b> ${canchaInfo.cancha_nombre}</li>
              <li><b>Fecha:</b> ${fechaStr}</li>
              <li><b>Inicio:</b> ${inicioTime}</li>
              <li><b>Fin:</b> ${sliceHHMM(reserva.fin)}</li>
              <li><b>Cliente:</b> ${reserva.cliente_nombre || "N/A"}</li>
              <li><b>Teléfono:</b> ${reserva.cliente_telefono || "N/A"}</li>
            </ul>
          `,
        });
      }
    } catch (mailErr) {
    }
  })();

  return updated;
}
function toCurrencyCOP(n) {
  if (n === null || n === undefined) return "N/A";
  const num = Number(n);
  if (Number.isNaN(num)) return "N/A";
  return num.toLocaleString("es-CO") + " COP";
}

async function crearReserva(payload) {
  const {
    cancha_id,
    date,
    start,
    end,
    cliente_nombre,
    cliente_telefono,
    metodo_pago = "efectivo",
    total = null,
    usuario_id,
  } = payload || {};

  // Validación básica
  if (!cancha_id || !date || !start || !end || !cliente_nombre || !usuario_id) {
    const err = new Error("Faltan datos requeridos");
    err.status = 400;
    throw err;
  }

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    // Precio de la cancha
    const canchaPrecio = await reservasModel.obtenerPrecioCancha(cancha_id, client);

    // Calcular total final
    let totalFinal = null;
    if (total !== null && total !== undefined && total !== "") {
      const parsed = Number(total);
      totalFinal = Number.isNaN(parsed) ? null : parsed;
    }
    if (totalFinal === null && canchaPrecio !== null) {
      totalFinal = Number(canchaPrecio);
    }

    // Verificar conflicto de horario
    const hayConflicto = await reservasModel.existeConflictoReserva(
      cancha_id,
      date,
      start,
      end,
      client
    );
    if (hayConflicto) {
      await client.query("ROLLBACK");
      const err = new Error("Horario no disponible (conflicto)");
      err.status = 409;
      throw err;
    }

    // Insertar reserva
    const reserva = await reservasModel.insertarReserva(
      {
        cancha_id,
        date,
        start,
        end,
        cliente_nombre,
        cliente_telefono,
        metodo_pago,
        totalFinal,
        usuario_id,
      },
      client
    );

    await client.query("COMMIT");

    // Enviar correo al propietario (no bloqueante)
    (async () => {
      try {
        const canchaInfo = await reservasModel.obtenerInfoPropietarioPorCanchaId(cancha_id);
        if (canchaInfo?.propietario_email) {
          await enviarCorreo({
            to: canchaInfo.propietario_email,
            subject: `Nueva reserva - ${canchaInfo.cancha_nombre}`,
            html: `
              <h3>Hola ${canchaInfo.propietario_nombre || "propietario"}</h3>
              <p>Se ha realizado una nueva reserva en tu cancha:</p>
              <ul>
                <li><b>Cancha:</b> ${canchaInfo.cancha_nombre}</li>
                <li><b>Fecha:</b> ${date}</li>
                <li><b>Inicio:</b> ${start}</li>
                <li><b>Fin:</b> ${end}</li>
                <li><b>Cliente:</b> ${cliente_nombre}</li>
                <li><b>Teléfono:</b> ${cliente_telefono || "N/A"}</li>
                <li><b>Método pago:</b> ${metodo_pago}</li>
                <li><b>Total:</b> ${toCurrencyCOP(reserva.total)}</li>
                <li><b>ID reserva:</b> ${reserva.id}</li>
              </ul>
              <p>Revisa el panel para más detalles.</p>
            `,
          });
        }
      } catch (mailErr) {
      }
    })();

    return reserva;
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (rbErr) {
    }
    throw err;
  } finally {
    client.release();
  }
}
async function cancelarReservaUsuario(id) {
  const reserva = await reservasModel.obtenerReservaPorId(id);
  if (!reserva) {
    const err = new Error("Reserva no encontrada");
    err.status = 404;
    throw err;
  }

  const fechaStr = (reserva.fecha?.toISOString?.() || new Date(reserva.fecha).toISOString()).slice(0, 10);
  const inicio = String(reserva.inicio || "").slice(0, 5);
  if (!inicio) {
    const err = new Error("Datos de fecha/hora inválidos en la reserva");
    err.status = 400;
    throw err;
  }

  const fechaHoraReserva = parseISO(`${fechaStr}T${inicio}`);
  const ahora = new Date();
  const horasRestantes = differenceInHours(fechaHoraReserva, ahora);

  if (horasRestantes < 3) {
    const err = new Error("No se puede cancelar una reserva con menos de 3 horas de anticipación.");
    err.status = 400;
    throw err;
  }

  const updated = await reservasModel.actualizarEstadoReserva(id, "cancelada");

  // correo al propietario (no bloqueante)
  (async () => {
    try {
      const canchaInfo = await reservasModel.obtenerInfoPropietarioPorCanchaId(reserva.cancha_id);
      if (canchaInfo?.propietario_email) {
        await enviarCorreo({
          to: canchaInfo.propietario_email,
          subject: `Reserva cancelada - ${canchaInfo.cancha_nombre}`,
          html: `
            <h3>Hola ${canchaInfo.propietario_nombre || "propietario"}</h3>
            <p>La siguiente reserva ha sido cancelada:</p>
            <ul>
              <li><b>Cancha:</b> ${canchaInfo.cancha_nombre}</li>
              <li><b>Fecha:</b> ${fechaStr}</li>
              <li><b>Inicio:</b> ${inicio}</li>
              <li><b>Fin:</b> ${String(reserva.fin || "").slice(0, 5)}</li>
              <li><b>Cliente:</b> ${reserva.cliente_nombre || "N/A"}</li>
              <li><b>Teléfono:</b> ${reserva.cliente_telefono || "N/A"}</li>
            </ul>
          `,
        });
      }
    } catch (mailErr) {
    }
  })();

  return updated;
}


async function providerCancelReserva(reservaId, providerId) {
  const reserva = await reservasModel.obtenerReservaConPropietario(reservaId);
  if (!reserva) {
    const err = new Error("Reserva no encontrada");
    err.status = 404;
    throw err;
  }
  if (Number(reserva.propietario_id) !== Number(providerId)) {
    const err = new Error("No eres el propietario de la cancha de esta reserva");
    err.status = 403;
    throw err;
  }

  const fechaStr = reserva.fecha?.toISOString?.().slice(0,10) || new Date(reserva.fecha).toISOString().slice(0,10);
  const inicioTime = sliceHHMM(reserva.inicio);
  if (!inicioTime) {
    const err = new Error("Hora de inicio inválida en la reserva");
    err.status = 400;
    throw err;
  }
  const fechaHoraInicio = parseISO(`${fechaStr}T${inicioTime}`);
  const horasRestantes = differenceInHours(fechaHoraInicio, new Date());
  if (horasRestantes <= 3) {
    const err = new Error("No se puede cancelar: menos de 3 horas para iniciar");
    err.status = 400;
    throw err;
  }

  const updated = await reservasModel.actualizarEstadoReserva(reservaId, "cancelada");

  // correo al cliente (no bloqueante)
  (async () => {
    try {
      const cliente = await reservasModel.obtenerUsuarioPorId(reserva.usuario_id);
      if (cliente?.email) {
        const finTime = sliceHHMM(reserva.fin);
        await enviarCorreo({
          to: cliente.email,
            subject: `Reserva cancelada por el proveedor - ${reserva.cancha_nombre || ""}`,
            html: `
              <h3>Hola ${cliente.nombre || "cliente"}</h3>
              <p>Tu reserva fue cancelada por el proveedor.</p>
              <ul>
                <li><b>Cancha:</b> ${reserva.cancha_nombre || "N/A"}</li>
                <li><b>Fecha:</b> ${fechaStr}</li>
                <li><b>Inicio:</b> ${inicioTime}</li>
                <li><b>Fin:</b> ${finTime}</li>
              </ul>
              <p>Si necesitas más información, responde este correo.</p>
            `,
        });
      }
    } catch (e) {
    }
  })();

  return updated;
}

async function providerMarkNoShow(reservaId, providerId) {
  const reserva = await reservasModel.obtenerReservaConPropietario(reservaId);
  if (!reserva) {
    const err = new Error("Reserva no encontrada"); err.status = 404; throw err;
  }
  if (Number(reserva.propietario_id) !== Number(providerId)) {
    const err = new Error("No eres el propietario de la cancha de esta reserva"); err.status = 403; throw err;
  }

  const fechaStr = reserva.fecha?.toISOString?.().slice(0,10) || new Date(reserva.fecha).toISOString().slice(0,10);
  const finTime = hhmm(reserva.fin || reserva.end);
  if (!finTime) { const err = new Error("Hora fin inválida"); err.status = 400; throw err; }
  const fechaHoraFin = parseISO(`${fechaStr}T${finTime}`);
  if (new Date() < fechaHoraFin) {
    const err = new Error("No se puede marcar no-show antes de que termine la reserva"); err.status = 400; throw err;
  }

  // Se mantiene estado 'cancelada' (podrías usar 'no-show' si tu esquema lo soporta)
  await reservasModel.actualizarEstadoReserva(reservaId, "cancelada");

  (async () => {
    try {
      const cliente = await reservasModel.obtenerUsuarioPorId(reserva.usuario_id);
      if (cliente?.email) {
        const inicioTime = hhmm(reserva.inicio);
        await enviarCorreo({
          to: cliente.email,
          subject: `Reserva marcada como no-show - ${reserva.cancha_nombre || ""}`,
          html: `
            <h3>Hola ${cliente.nombre || "cliente"}</h3>
            <p>La reserva fue cancelada por inasistencia (no-show).</p>
            <ul>
              <li><b>Cancha:</b> ${reserva.cancha_nombre || "N/A"}</li>
              <li><b>Fecha:</b> ${fechaStr}</li>
              <li><b>Inicio:</b> ${inicioTime}</li>
              <li><b>Fin:</b> ${finTime}</li>
            </ul>
            <p>Si crees que es un error, contacta soporte.</p>
          `,
        });
      }
    } catch(e) {
    }})();
}

function buildMonthRange(year, monthZeroBased) {
  const startDate = new Date(year, monthZeroBased, 1);
  const endDate = new Date(year, monthZeroBased + 1, 0);
  return {
    startStr: startDate.toISOString().slice(0,10),
    endStr: endDate.toISOString().slice(0,10),
    daysInMonth: endDate.getDate(),
  };
}

async function providerReportes(providerId, yearInput, monthInput) {
  const today = new Date();
  const year = Number.isInteger(yearInput) ? yearInput : today.getFullYear();
  // monthInput llega 1-12; internamente usar 0-11
  const monthZero = (Number.isInteger(monthInput) ? monthInput : (today.getMonth() + 1)) - 1;
  const { startStr, endStr, daysInMonth } = buildMonthRange(year, monthZero);

  const totals = await reservasModel.obtenerReportesTotalesPropietario(providerId, startStr, endStr);
  const estadosRows = await reservasModel.obtenerReportesEstadosPropietario(providerId, startStr, endStr);
  const serieRows = await reservasModel.obtenerReportesSerieDiariaPropietario(providerId, startStr, endStr);

  // Estados
  const por_estado = {};
  estadosRows.forEach(r => { por_estado[r.estado] = Number(r.cantidad); });
  ["completada","cancelada","activa"].forEach(e => { if (!por_estado[e]) por_estado[e] = 0; });

  // Serie diaria
  const dataMap = {};
  serieRows.forEach(r => {
    const key = new Date(r.dia).toISOString().slice(0,10);
    dataMap[key] = { ingresos: Number(r.ingresos), completadas: Number(r.completadas) };
  });

  const series = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const fecha = `${year}-${String(monthZero + 1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    series.push({
      fecha,
      ingresos: dataMap[fecha]?.ingresos || 0,
      completadas: dataMap[fecha]?.completadas || 0,
    });
  }

  return {
    total_ingresos: Number(totals.total_ingresos) || 0,
    total_reservas: Number(totals.total_reservas) || 0,
    por_estado,
    series
  };
} 

module.exports = {
  cancelarReservaUsuario,
  crearReserva,
  providerCancelReserva,
  providerMarkCompleted,
  providerMarkNoShow,
  providerReportes,
};