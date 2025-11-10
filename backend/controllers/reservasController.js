const db = require("../db.js");
const { differenceInHours, parseISO } = require("date-fns");
const dotenv = require("dotenv");
dotenv.config();

// Usamos el helper centralizado de envío de correos (Brevo / API HTTP)
const { enviarCorreo } = require("../utils/mailer");

// utilidades
function timeToMinutes(t) {
  const [hh, mm] = (t || "00:00").split(":").map(Number);
  return hh * 60 + mm;
}
function overlaps(aStart, aEnd, bStart, bEnd) {
  return !(bEnd <= aStart || bStart >= aEnd);
}
function splitWindow(start, end, slotMinutes = 60) {
  const slots = [];
  let cur = timeToMinutes(start);
  const finish = timeToMinutes(end);
  while (cur + slotMinutes <= finish) {
    const sH = String(Math.floor(cur / 60)).padStart(2, "0");
    const sM = String(cur % 60).padStart(2, "0");
    const next = cur + slotMinutes;
    const eH = String(Math.floor(next / 60)).padStart(2, "0");
    const eM = String(next % 60).padStart(2, "0");
    slots.push({ start: `${sH}:${sM}`, end: `${eH}:${eM}` });
    cur = next;
  }
  return slots;
}
async function obtenerReservasPorUsuario(req, res) {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT r.*, c.nombre AS cancha_nombre, c.tipo, c.map_iframe
       FROM reservas r
       JOIN canchas c ON c.id = r.cancha_id
       WHERE r.usuario_id = $1
       ORDER BY r.fecha DESC, r.inicio ASC`,
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("❌ Error al obtener reservas:", err);
    res.status(500).json({ error: "Error al obtener reservas del usuario" });
  }
}

// ✅ Cancelar reserva si faltan más de 3 horas
async function cancelarReserva(req, res) {
  const { id } = req.params;
  try {
    const reservaRes = await db.query("SELECT * FROM reservas WHERE id = $1", [id]);
    if (reservaRes.rows.length === 0)
      return res.status(404).json({ error: "Reserva no encontrada" });

    const reserva = reservaRes.rows[0];

    // Combinar fecha y hora
    const fechaStr = reserva.fecha.toISOString().slice(0, 10);
    const fechaHoraReserva = parseISO(`${fechaStr}T${reserva.hora_inicio}`);
    const ahora = new Date();

    const horasRestantes = differenceInHours(fechaHoraReserva, ahora);
    if (horasRestantes < 3)
      return res.status(400).json({
        error: "No se puede cancelar una reserva con menos de 3 horas de anticipación.",
      });

    await db.query("UPDATE reservas SET estado = 'cancelada' WHERE id = $1", [id]);

    // Enviar correo al propietario informando la cancelación
    try {
      const canchaQ = `
        SELECT c.nombre AS cancha_nombre, c.propietario_id, u.email AS propietario_email, u.nombre AS propietario_nombre
        FROM canchas c
        JOIN usuarios u ON u.id = c.propietario_id
        WHERE c.id = $1
        LIMIT 1
      `;
      const canchaRes = await db.query(canchaQ, [reserva.cancha_id]);
      const canchaInfo = canchaRes.rows[0];
      if (canchaInfo && canchaInfo.propietario_email) {
        (async () => {
          try {
            await enviarCorreo({
              to: canchaInfo.propietario_email,
              subject: `Reserva cancelada - ${canchaInfo.cancha_nombre}`,
              html: `
                <h3>Hola ${canchaInfo.propietario_nombre || "propietario"}</h3>
                <p>La siguiente reserva ha sido cancelada:</p>
                <ul>
                  <li><b>Cancha:</b> ${canchaInfo.cancha_nombre}</li>
                  <li><b>Fecha:</b> ${reserva.fecha.toISOString().slice(0,10)}</li>
                  <li><b>Inicio:</b> ${reserva.inicio || reserva.hora_inicio}</li>
                  <li><b>Fin:</b> ${reserva.fin || reserva.hora_fin}</li>
                  <li><b>Cliente:</b> ${reserva.cliente_nombre || "N/A"}</li>
                  <li><b>Teléfono:</b> ${reserva.cliente_telefono || "N/A"}</li>
                </ul>
                <p>Si no reconoces esta acción, por favor contacta con el soporte.</p>
              `,
            });
            console.log("Correo de cancelación enviado a", canchaInfo.propietario_email);
          } catch (mailErr) {
            console.error("❌ Error enviando correo de cancelación al propietario (no bloqueante):", mailErr);
          }
        })();
      }
    } catch (mailErr) {
      console.error("❌ Error enviando correo de cancelación al propietario:", mailErr);
      // no bloquear el flujo
    }

    res.json({ message: "Reserva cancelada correctamente" });
  } catch (err) {
    console.error("❌ Error al cancelar reserva:", err);
    res.status(500).json({ error: "Error al cancelar reserva" });
  }
}
async function availability(req, res) {
  // ...existing code...
  const canchaId = Number(req.params.id);
  const dateStr = req.query.date;
  const slotMinutes = Number(req.query.slotMinutes) || 60;
  if (!dateStr) return res.status(400).json({ error: "date requerido (YYYY-MM-DD)" });
  
  const cRes = await db.query(
    "SELECT id, horarios, cerrados_dias, cerrados_fechas FROM canchas WHERE id = $1",
    [canchaId]
  );
  const cancha = (cRes.rows && cRes.rows[0]) || null;
  if (!cancha) return res.status(404).json({ error: "Cancha no encontrada" });

  // 🧩 Parsear JSONB si viene como string
  let horarios = cancha.horarios;
  if (typeof horarios === "string") horarios = JSON.parse(horarios);

  let cerradosDias = cancha.cerrados_dias;
  if (typeof cerradosDias === "string") cerradosDias = JSON.parse(cerradosDias);

  let cerradosFechas = cancha.cerrados_fechas;
  if (typeof cerradosFechas === "string") cerradosFechas = JSON.parse(cerradosFechas);

  const weekday = new Date(dateStr + "T00:00:00").getDay();
  const weekdayKey = String(weekday); // importante porque en la BD las claves son "0".."6"
  console.log("🧠 weekdayKey:", weekdayKey);
  console.log("📅 cerradosDias crudo:", cancha.cerrados_dias);
  console.log("📅 cerradosFechas crudo:", cancha.cerrados_fechas);
  // 🛑 Si el día está cerrado
  // if ((cerradosDias || []).map(String).includes(weekdayKey)) {
  //   return res.json({ date: dateStr, closed: true, slots: [] });
  // }
  if ((cerradosDias || []).includes(weekday)) {
   return res.json({ date: dateStr, closed: true, slots: [] });
  }
  if ((cancha.cerrados_fechas || []).map(String).includes(dateStr)) {
  return res.json({ date: dateStr, closed: true, slots: [] });
  }



  // 🕒 Obtener ventanas del día
    const ventanas = (horarios && horarios[weekdayKey]) || [];
  let slots = [];
  ventanas.forEach((w) => {
    slots = slots.concat(splitWindow(w.start, w.end, slotMinutes));
  });

  // 🟦 Reservas del día
  const rRes = await db.query(
      "SELECT inicio::text AS inicio, fin::text AS fin FROM reservas WHERE cancha_id=$1 AND fecha=$2 AND estado != 'cancelada'",
    [canchaId, dateStr]
  );
  const reservas = (rRes.rows || []).map((r) => ({
    inicio: r.inicio.slice(0, 5),
    fin: r.fin.slice(0, 5),
  }));

  // (Se eliminó la consulta a la tabla `bloqueos` porque no existe en la BD)
  // 🟩 Marcar estado de cada slot (solo teniendo en cuenta reservas)
  const annotated = slots.map((s) => {
    const sStart = timeToMinutes(s.start);
    const sEnd = timeToMinutes(s.end);

    const isReserved = reservas.some((r) =>
      overlaps(sStart, sEnd, timeToMinutes(r.inicio), timeToMinutes(r.fin))
    );
    if (isReserved) return { ...s, status: "reserved" };

    return { ...s, status: "free" };
  });

  return res.json({ date: dateStr, closed: false, slots: annotated });
}


// ...existing code...
async function createReserva(req, res) {
  const client = await db.connect();
  try {
    const {
      cancha_id,
      date,
      start,
      end,
      cliente_nombre,
      cliente_telefono,
      metodo_pago = "efectivo",
      total = null,
      usuario_id // 👈 añade este campo
    } = req.body;

    // Validación básica
    if (!cancha_id || !date || !start || !end || !cliente_nombre || !usuario_id) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    await client.query("BEGIN");

    // --- calcular total final: usar total enviado si es válido, si no usar precio de la cancha ---
    const canchaPriceRes = await db.query("SELECT precio FROM canchas WHERE id = $1 LIMIT 1", [cancha_id]);
    const canchaPrecio = canchaPriceRes.rows[0]?.precio ?? null;

    let totalFinal = null;
    if (total !== null && total !== undefined && total !== "") {
      const parsed = Number(total);
      totalFinal = isNaN(parsed) ? null : parsed;
    }
    if (totalFinal === null && canchaPrecio !== null) {
      totalFinal = Number(canchaPrecio);
    }
    // si no hay totalFinal queda null y se insertará como NULL en la BD

    // 1️⃣ Verificar si hay conflicto de horario
    const conflictQ = `
      SELECT 1 FROM reservas
      WHERE cancha_id = $1
      AND fecha = $2
      AND estado != 'cancelada'
      AND NOT (fin <= $3 OR inicio >= $4)
    LIMIT 1
    `;
    const conflict = await client.query(conflictQ, [cancha_id, date, start, end]);

    if (conflict.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({ error: "Horario no disponible (conflicto)" });
    }

    // 2️⃣ Insertar nueva reserva (añade usuario_id) usando totalFinal
    const insertQ = `
      INSERT INTO reservas 
      (cancha_id, fecha, inicio, fin, cliente_nombre, cliente_telefono, metodo_pago, total, usuario_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
    `;
    const inserted = await client.query(insertQ, [
      cancha_id,
      date,
      start,
      end,
      cliente_nombre,
      cliente_telefono,
      metodo_pago,
      totalFinal,
      usuario_id // 👈 aquí también
    ]);

    await client.query("COMMIT");

    const reserva = inserted.rows[0];
    const totalStr = reserva && reserva.total !== null && reserva.total !== undefined
      ? Number(reserva.total).toLocaleString('es-CO') + " COP"
      : "N/A";

    // Enviar correo al propietario informando la nueva reserva
    try {
      const canchaQ = `
        SELECT c.nombre AS cancha_nombre, c.propietario_id, u.email AS propietario_email, u.nombre AS propietario_nombre
        FROM canchas c
        JOIN usuarios u ON u.id = c.propietario_id
        WHERE c.id = $1
        LIMIT 1
      `;
      const canchaRes = await db.query(canchaQ, [cancha_id]);
      const canchaInfo = canchaRes.rows[0];
      if (canchaInfo && canchaInfo.propietario_email) {
        (async () => {
          try {
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
                  <li><b>Total:</b> ${totalStr}</li>
                  <li><b>ID reserva:</b> ${reserva.id}</li>
                </ul>
                <p>Revisa el panel para más detalles.</p>
              `,
            });
            console.log("Correo de nueva reserva enviado a", canchaInfo.propietario_email);
          } catch (mailErr) {
            console.error("❌ Error enviando correo de nueva reserva al propietario (no bloqueante):", mailErr);
          }
        })();
      }
    } catch (mailErr) {
      console.error("❌ Error enviando correo de nueva reserva al propietario:", mailErr);
      // no interrumpir el flujo
    }

    return res.status(201).json({ success: true, reserva });
  } catch (err) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackErr) {
      console.error("Error haciendo ROLLBACK:", rollbackErr);
    }

    console.error("❌ reservas.createReserva error:", err);
    return res.status(500).json({ error: "Error creando reserva" });
  } finally {
    client.release();
  }
}
// ...existing code...
// listar reservas del provider (todas las reservas de canchas que le pertenecen)
async function ProviderListReservas(req, res) {
  try {
    const providerId = req.user?.id;
    if (!providerId) return res.status(401).json({ error: "No autorizado" });

    const q = `
      SELECT r.*, c.nombre AS cancha_nombre, c.propietario_id
      FROM reservas r
      JOIN canchas c ON c.id = r.cancha_id
      WHERE c.propietario_id = $1
      ORDER BY r.fecha DESC, r.inicio ASC
    `;
    const result = await db.query(q, [providerId]);
    return res.json(result.rows || []);
  } catch (err) {
    console.error("ProviderListReservas error:", err);
    return res.status(500).json({ error: "Error listando reservas del provider" });
  }
}

// cancelar reserva por provider (mismo criterio: solo si la cancha pertenece al provider y con >=3 horas de anticipación)

async function ProviderCancelReserva(req, res) {
  const { id } = req.params;
  try {
    const providerId = req.user?.id;
    if (!providerId) return res.status(401).json({ error: "No autorizado" });

    // traer reserva + info de cancha
    const rRes = await db.query(
      `SELECT r.*, c.propietario_id, c.nombre AS cancha_nombre
       FROM reservas r
       JOIN canchas c ON c.id = r.cancha_id
       WHERE r.id = $1
       LIMIT 1`,
      [id]
    );
    if (!rRes.rows.length) return res.status(404).json({ error: "Reserva no encontrada" });
    const reserva = rRes.rows[0];

    if (Number(reserva.propietario_id) !== Number(providerId)) {
      return res.status(403).json({ error: "No eres el propietario de la cancha de esta reserva" });
    }

    // construir fecha+hora de la reserva y calcular horas restantes
    const fechaStr = reserva.fecha && reserva.fecha.toISOString
      ? reserva.fecha.toISOString().slice(0,10)
      : (new Date(reserva.fecha)).toISOString().slice(0,10);
    const inicioTime = (reserva.inicio || reserva.hora_inicio || reserva.start || "").slice(0,5);
    if (!inicioTime) return res.status(400).json({ error: "Hora de inicio inválida en la reserva" });
    let finTime = (reserva.fin || reserva.hora_fin || reserva.end || "").slice(0,5);
    if (!finTime) finTime = inicioTime; // fallback si no hay fin
    
    const fechaHoraReserva = parseISO(`${fechaStr}T${inicioTime}`);
    const ahora = new Date();
    // bloquear si quedan 3 horas o menos: permitir sólo si queda > 3 horas
    const msLeft = fechaHoraReserva - ahora;
    const threeHoursMs = 3 * 60 * 60 * 1000;
    if (msLeft <= threeHoursMs) {
      return res.status(400).json({ error: "No se puede cancelar la reserva: queda menos de 3 horas hasta el inicio." });
    }

    await db.query("UPDATE reservas SET estado = 'cancelada' WHERE id = $1", [id]);

    // Enviar correo al cliente informando la cancelación por parte del proveedor
    try {
      const userQ = `SELECT email AS cliente_email, nombre AS cliente_nombre FROM usuarios WHERE id = $1 LIMIT 1`;
      const userRes = await db.query(userQ, [reserva.usuario_id]);
      const cliente = userRes.rows[0];
      if (cliente && cliente.cliente_email) {
        (async () => {
          try {
            await enviarCorreo({
              to: cliente.cliente_email,
              subject: `Reserva cancelada por el proveedor - ${reserva.cancha_nombre || ''}`,
              html: `
                <h3>Hola ${cliente.cliente_nombre || 'cliente'}</h3>
                <p>Tu reserva ha sido cancelada por el proveedor de la cancha.</p>
                <ul>
                  <li><b>Cancha:</b> ${reserva.cancha_nombre || 'N/A'}</li>
                  <li><b>Fecha:</b> ${fechaStr}</li>
                  <li><b>Inicio:</b> ${inicioTime}</li>
                  <li><b>Fin:</b> ${finTime}</li>
                </ul>
                <p>Si necesitas más información, contacta con el proveedor o con soporte.</p>
              `,
            });
            console.log("Correo al cliente sobre cancelación por provider enviado a", cliente.cliente_email);
          } catch (mailErr) {
            console.error("❌ Error enviando correo al cliente sobre cancelación del provider (no bloqueante):", mailErr);
          }
        })();
      }
    } catch (mailErr) {
      console.error("❌ Error enviando correo al cliente sobre cancelación del provider:", mailErr);
      // no bloquear la respuesta por fallos en el correo
    }

    return res.json({ message: "Reserva cancelada correctamente" });
  } catch (err) {
    console.error("ProviderCancelReserva error:", err);
    return res.status(500).json({ error: "Error al cancelar reserva" });
  }
}
// Nueva: marcar como completada (solo después del fin)
async function ProviderMarkCompleted(req, res) {
  const { id } = req.params;
  try {
    const providerId = req.user?.id;
    if (!providerId) return res.status(401).json({ error: "No autorizado" });

    const rRes = await db.query(
      `SELECT r.*, c.propietario_id, c.nombre AS cancha_nombre
       FROM reservas r
       JOIN canchas c ON c.id = r.cancha_id
       WHERE r.id = $1
       LIMIT 1`,
      [id]
    );
    if (!rRes.rows.length) return res.status(404).json({ error: "Reserva no encontrada" });
    const reserva = rRes.rows[0];

    if (Number(reserva.propietario_id) !== Number(providerId)) {
      return res.status(403).json({ error: "No eres el propietario de la cancha de esta reserva" });
    }

    const fechaStr = reserva.fecha.toISOString?.().slice(0,10) || (new Date(reserva.fecha)).toISOString().slice(0,10);
    const finTime = (reserva.fin || reserva.end || "").slice(0,5);
    const fechaHoraFin = parseISO(`${fechaStr}T${finTime}`);
    const ahora = new Date();

    if (ahora < fechaHoraFin) {
      return res.status(400).json({ error: "No se puede marcar completada antes de que termine la reserva." });
    }

    await db.query("UPDATE reservas SET estado = 'completada' WHERE id = $1", [id]);

    // notificar al cliente que la reserva fue completada (opcional)
    try {
      const userQ = `SELECT email AS cliente_email, nombre AS cliente_nombre FROM usuarios WHERE id = $1 LIMIT 1`;
      const userRes = await db.query(userQ, [reserva.usuario_id]);
      const cliente = userRes.rows[0];
      if (cliente && cliente.cliente_email) {
        (async () => {
          try {
            await enviarCorreo({
              to: cliente.cliente_email,
              subject: `Reserva completada - ${reserva.cancha_nombre || ''}`,
              html: `
                <h3>Hola ${cliente.cliente_nombre || 'cliente'}</h3>
                <p>Tu reserva ha sido marcada como completada por el proveedor.</p>
                <ul>
                  <li><b>Cancha:</b> ${reserva.cancha_nombre || 'N/A'}</li>
                  <li><b>Fecha:</b> ${fechaStr}</li>
                  <li><b>Inicio:</b> ${inicioTime}</li>
                  <li><b>Fin:</b> ${finTime}</li>
                </ul>
              `,
            });
            console.log("Correo al cliente sobre reserva completada enviado a", cliente.cliente_email);
          } catch (mailErr) {
            console.error("❌ Error enviando correo al cliente sobre completado (no bloqueante):", mailErr);
          }
        })();
      }
    } catch (mailErr) {
      console.error("❌ Error enviando correo al cliente sobre completado:", mailErr);
    }

    return res.json({ message: "Reserva marcada como completada" });
  } catch (err) {
    console.error("ProviderMarkCompleted error:", err);
    return res.status(500).json({ error: "Error marcando reserva como completada" });
  }
}

// Nueva: marcar como cancelada por no-show (solo después del fin)
async function ProviderMarkNoShow(req, res) {
  const { id } = req.params;
  try {
    const providerId = req.user?.id;
    if (!providerId) return res.status(401).json({ error: "No autorizado" });

    const rRes = await db.query(
      `SELECT r.*, c.propietario_id, c.nombre AS cancha_nombre
       FROM reservas r
       JOIN canchas c ON c.id = r.cancha_id
       WHERE r.id = $1
       LIMIT 1`,
      [id]
    );
    if (!rRes.rows.length) return res.status(404).json({ error: "Reserva no encontrada" });
    const reserva = rRes.rows[0];

    if (Number(reserva.propietario_id) !== Number(providerId)) {
      return res.status(403).json({ error: "No eres el propietario de la cancha de esta reserva" });
    }

    const fechaStr = reserva.fecha.toISOString?.().slice(0,10) || (new Date(reserva.fecha)).toISOString().slice(0,10);
    const finTime = (reserva.fin || reserva.end || "").slice(0,5);
    const fechaHoraFin = parseISO(`${fechaStr}T${finTime}`);
    const ahora = new Date();

    if (ahora < fechaHoraFin) {
      return res.status(400).json({ error: "No se puede marcar no-show antes de que termine la reserva." });
    }

    await db.query("UPDATE reservas SET estado = 'cancelada' WHERE id = $1", [id]);

    // notificar al cliente que fue marcado como no-show / cancelado
    try {
      const userQ = `SELECT email AS cliente_email, nombre AS cliente_nombre FROM usuarios WHERE id = $1 LIMIT 1`;
      const userRes = await db.query(userQ, [reserva.usuario_id]);
      const cliente = userRes.rows[0];
      if (cliente && cliente.cliente_email) {
        (async () => {
          try {
            await enviarCorreo({
              to: cliente.cliente_email,
              subject: `Reserva marcada como cancelada (no-show) - ${reserva.cancha_nombre || ''}`,
              html: `
                <h3>Hola ${cliente.cliente_nombre || 'cliente'}</h3>
                <p>La reserva fue marcada como cancelada por el proveedor por inasistencia.</p>
                <ul>
                  <li><b>Cancha:</b> ${reserva.cancha_nombre || 'N/A'}</li>
                  <li><b>Fecha:</b> ${fechaStr}</li>
                  <li><b>Inicio:</b> ${inicioTime}</li>
                  <li><b>Fin:</b> ${finTime}</li>
                </ul>
                <p>Si crees que hay un error, contacta con el proveedor o con soporte.</p>
              `,
            });
            console.log("Correo al cliente sobre no-show enviado a", cliente.cliente_email);
          } catch (mailErr) {
            console.error("❌ Error enviando correo al cliente sobre no-show (no bloqueante):", mailErr);
          }
        })();
      }
    } catch (mailErr) {
      console.error("❌ Error enviando correo al cliente sobre no-show:", mailErr);
    }

    return res.json({ message: "Reserva marcada como cancelada (no-show)" });
  } catch (err) {
    console.error("ProviderMarkNoShow error:", err);
    return res.status(500).json({ error: "Error marcando reserva como no-show" });
  }
}
// ...existing code...
async function ProviderReportes(req, res) {
  try {
    const providerId = req.user?.id;
    if (!providerId) return res.status(401).json({ error: "No autorizado" });

    // 1) Totales generales
    const totalsQ = `
      SELECT 
        COALESCE(SUM(CASE WHEN r.estado = 'completada' THEN COALESCE(r.total,0)::numeric ELSE 0 END),0) AS total_ingresos,
        COUNT(*) AS total_reservas
      FROM reservas r
      JOIN canchas c ON c.id = r.cancha_id
      WHERE c.propietario_id = $1
    `;
    const totalsRes = await db.query(totalsQ, [providerId]);
    const totals = totalsRes.rows[0] || { total_ingresos: 0, total_reservas: 0 };

    // 2) Conteo por estado
    const byStateQ = `
      SELECT COALESCE(r.estado,'activa') AS estado, COUNT(*)::int AS cantidad
      FROM reservas r
      JOIN canchas c ON c.id = r.cancha_id
      WHERE c.propietario_id = $1
      GROUP BY COALESCE(r.estado,'activa')
    `;
    const byStateRes = await db.query(byStateQ, [providerId]);
    const por_estado = {};
    byStateRes.rows.forEach(r => { por_estado[r.estado] = Number(r.cantidad); });

    // Asegurar claves comunes
    const estados = ['completada','cancelada','activa'];
    estados.forEach(e => { if (!por_estado[e]) por_estado[e] = 0; });

    // 3) Series últimos 30 días (llenar días faltantes)
    const days = 30;
    const seriesQ = `
      SELECT fecha::date AS dia,
             COUNT(*) FILTER (WHERE r.estado = 'completada') AS completadas,
             COALESCE(SUM(CASE WHEN r.estado = 'completada' THEN r.total ELSE 0 END),0) AS ingresos
      FROM reservas r
      JOIN canchas c ON c.id = r.cancha_id
      WHERE c.propietario_id = $1
        AND fecha >= (CURRENT_DATE - ($2::int - 1) * INTERVAL '1 day')::date
      GROUP BY dia
      ORDER BY dia
    `;
    const seriesRes = await db.query(seriesQ, [providerId, days]);
    // construir array de dias desde (hoy - days +1) hasta hoy
    const labels = [];
    const ingresosArr = [];
    const completadasArr = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dayStr = `${yyyy}-${mm}-${dd}`;
      labels.push(dayStr);
      const found = seriesRes.rows.find(r => String(r.dia) === dayStr);
      ingresosArr.push(found ? Number(found.ingresos) : 0);
      completadasArr.push(found ? Number(found.completadas) : 0);
    }

    return res.json({
      total_ingresos: Number(totals.total_ingresos) || 0,
      total_reservas: Number(totals.total_reservas) || 0,
      por_estado,
      series: { labels, ingresos: ingresosArr, completadas: completadasArr }
    });
  } catch (err) {
    console.error("ProviderReportes error:", err);
    return res.status(500).json({ error: "Error obteniendo reportes del provider" });
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
};
