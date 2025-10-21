const db = require("../db.js");
const { differenceInHours, parseISO } = require("date-fns");

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
    res.json({ message: "Reserva cancelada correctamente" });
  } catch (err) {
    console.error("❌ Error al cancelar reserva:", err);
    res.status(500).json({ error: "Error al cancelar reserva" });
  }
}
async function availability(req, res) {
  try {
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


    // if ((cerradosFechas || []).map(String).includes(dateStr)) {
    //   return res.json({ date: dateStr, closed: true, slots: [] });
    // }

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

    // 🟥 Bloqueos recurrentes (si existe tabla)
    let bloqueos = [];
    try {
      const bRes = await db.query(
        "SELECT inicio::text AS inicio, fin::text AS fin FROM bloqueos WHERE cancha_id=$1 AND weekday=$2",
        [canchaId, weekday]
      );
      bloqueos = (bRes.rows || []).map((b) => ({
        inicio: b.inicio.slice(0, 5),
        fin: b.fin.slice(0, 5),
      }));
    } catch {
      bloqueos = [];
    }

    // 🟩 Marcar estado de cada slot
    const annotated = slots.map((s) => {
      const sStart = timeToMinutes(s.start);
      const sEnd = timeToMinutes(s.end);

      const isBlocked = bloqueos.some((b) =>
        overlaps(sStart, sEnd, timeToMinutes(b.inicio), timeToMinutes(b.fin))
      );
      if (isBlocked) return { ...s, status: "blocked" };

      const isReserved = reservas.some((r) =>
        overlaps(sStart, sEnd, timeToMinutes(r.inicio), timeToMinutes(r.fin))
      );
      if (isReserved) return { ...s, status: "reserved" };

      return { ...s, status: "free" };
    });

    return res.json({ date: dateStr, closed: false, slots: annotated });
  } catch (err) {
    console.error("reservas.availability error:", err);
    return res.status(500).json({ error: "Error calculando disponibilidad" });
  }
}


// POST /api/reservas
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

    // 2️⃣ Insertar nueva reserva (añade usuario_id)
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
      total,
      usuario_id // 👈 aquí también
    ]);

    await client.query("COMMIT");

    return res.status(201).json({ success: true, reserva: inserted.rows[0] });
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


module.exports = { availability, createReserva , obtenerReservasPorUsuario,
  cancelarReserva, };