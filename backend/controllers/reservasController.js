const db = require("../db.js");
const dotenv = require("dotenv");
dotenv.config();
const reservasModel = require("../models/reservasModel"); // asegúrate que esté importado
const {parseCanchaCalendario
, isClosedForDate, buildSlotsForDate, annotateWithReservas} = require("../utils/horarios"); 
const { enviarCorreo } = require("../utils/mailer");
const reservasService = require("../services/reservasServices"); 

// utilidades


async function obtenerReservasPorUsuario(req, res) {
  const { id } = req.params;
  try {
    const results = await reservasModel.buscarPorUsuarioId(id);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener reservas del usuario" });
  }
}

// ...existing code...

async function obtenerReservasProveedor(req, res) {
  try {
    const providerId = req.user?.id || req.user?.userId || req.user?.uid;
    if (!providerId) {
      return res.status(401).json({ error: "No autenticado (sin id de proveedor en token)" });
    }
    const results = await reservasModel.buscarPorProveedorId(providerId);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor", detail: err.message });
  }
}

async function obtenerProximasReservasProveedor(req, res) {
  try {
    const providerId = req.user?.id || req.user?.userId || req.user?.uid;
    if (!providerId) {
      return res.status(401).json({ error: "No autenticado (sin id de proveedor en token)" });
    }
    const results = await reservasModel.buscarProximasPorProveedorId(providerId);
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: "Error interno del servidor", detail: err.message });
  }
}




async function cancelarReserva(req, res) {
  const { id } = req.params;
  try {
    await reservasService.cancelarReservaUsuario(id);
    res.json({ message: "Reserva cancelada correctamente" });
  } catch (err) {
    const status = err.status || 500;
    const msg = err.message || "Error al cancelar reserva";
    if (status >= 500) 
    res.status(status).json({ error: msg });
  }
}


async function availability(req, res) {
  const canchaId = Number(req.params.id);
  const dateStr = req.query.date;
  const slotMinutes = Number(req.query.slotMinutes) || 60;
  if (!dateStr) return res.status(400).json({ error: "date requerido (YYYY-MM-DD)" });

  // 1) Datos de la cancha (modelo)
  const cancha = await reservasModel.obtenerCalendarioCancha(canchaId);
  if (!cancha) return res.status(404).json({ error: "Cancha no encontrada" });

  // 2) Normalizar calendario (util)
  const { horarios, cerradosDias, cerradosFechas } = parseCanchaCalendario(cancha);

  // 3) Cierre por día o fecha (util)
  if (isClosedForDate(cerradosDias, cerradosFechas, dateStr)) {
    return res.json({ date: dateStr, closed: true, slots: [] });
  }

  // 4) Slots del día (util)
  const slots = buildSlotsForDate(horarios, dateStr, slotMinutes);

  // 5) Reservas del día (modelo)
  const reservas = await reservasModel.buscarReservasDelDia(canchaId, dateStr);

  // 6) Anotar disponibilidad (util)
  const annotated = annotateWithReservas(slots, reservas);

  return res.json({ date: dateStr, closed: false, slots: annotated });
}

// ...existing code...
async function createReserva(req, res) {
  try {
    // Validación mínima (mantener si quieres respuestas 400 inmediatas)
    const {
      cancha_id, date, start, end, cliente_nombre, usuario_id,
    } = req.body || {};
    if (!cancha_id || !date || !start || !end || !cliente_nombre || !usuario_id) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    const reserva = await reservasService.crearReserva(req.body);
    return res.status(201).json({ success: true, reserva });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ error: err.message || "Error creando reserva" });
  }
}

// listar reservas del provider (todas las reservas de canchas que le pertenecen)
async function ProviderListReservas(req, res) {
  try {
    const providerId = req.user?.id;
    if (!providerId) return res.status(401).json({ error: "No autorizado" });

    const reservas = await reservasModel.buscarReservasDelPropietario(providerId);
    return res.json(reservas);
  } catch (err) {
    return res.status(500).json({ error: "Error listando reservas del provider" });
  }
}

// cancelar reserva por provider (mismo criterio: solo si la cancha pertenece al provider y con >=3 horas de anticipación)

async function ProviderCancelReserva(req, res) {
  const { id } = req.params;
  try {
    const providerId = req.user?.id;
    if (!providerId) return res.status(401).json({ error: "No autorizado" });

    await reservasService.providerCancelReserva(id, providerId);
    return res.json({ message: "Reserva cancelada correctamente" });
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) 
    return res.status(status).json({ error: err.message || "Error al cancelar reserva" });
  }
}
// Nueva: marcar como completada (solo después del fin)
async function ProviderMarkCompleted(req, res) {
  const { id } = req.params;
  try {
    const providerId = req.user?.id;
    if (!providerId) return res.status(401).json({ error: "No autorizado" });

    await reservasService.providerMarkCompleted(id, providerId);
    return res.json({ message: "Reserva marcada como completada" });
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) 
    return res.status(status).json({ error: err.message || "Error marcando reserva como completada" });
  }
}
// Nueva: marcar como cancelada por no-show (solo después del fin)
async function ProviderMarkNoShow(req, res) {
  const { id } = req.params;
  try {
    const providerId = req.user?.id;
    if (!providerId) return res.status(401).json({ error: "No autorizado" });

    await reservasService.providerMarkNoShow(id, providerId);
    return res.json({ message: "Reserva marcada como cancelada (no-show)" });
  } catch (err) {
    const status = err.status || 500;
    if (status >= 500) 
    return res.status(status).json({ error: err.message || "Error marcando reserva como no-show" });
  }
}

async function ProviderReportes(req, res) {
  try {
    const providerId = req.user?.id;
    if (!providerId) return res.status(401).json({ error: "No autorizado" });

    const year = req.query.year ? parseInt(req.query.year) : undefined;
    const month = req.query.month ? parseInt(req.query.month) : undefined; // 1-12 esperado

    const data = await reservasService.providerReportes(providerId, year, month);
    return res.json(data);
  } catch (err) {
    return res.status(err.status || 500).json({ error: err.message || "Error obteniendo reportes del provider" });
  }
}

module.exports = {
  availability,
  createReserva,
  obtenerReservasPorUsuario,
  cancelarReserva,
  ProviderListReservas,
  ProviderCancelReserva,
  ProviderMarkCompleted,
  ProviderMarkNoShow,
  ProviderReportes,
  obtenerReservasProveedor,
  obtenerProximasReservasProveedor
};
