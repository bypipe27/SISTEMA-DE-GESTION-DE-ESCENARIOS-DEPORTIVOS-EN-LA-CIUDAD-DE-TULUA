function timeToMinutes(t) {
  if (!t) return 0;
  const [hh, mm] = String(t).split(":");
  return Number(hh) * 60 + Number(mm || 0);
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return !(bEnd <= aStart || bStart >= aEnd);
}

function splitWindow(start, end, slotMinutes = 60) {
  const slots = [];
  let cur = timeToMinutes(String(start).slice(0, 5));
  const finish = timeToMinutes(String(end).slice(0, 5));
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

// Normaliza campos JSONB que pueden venir como string desde la BD
function parseCanchaCalendario(canchaRow) {
  let horarios = canchaRow?.horarios;
  if (typeof horarios === "string") {
    try { horarios = JSON.parse(horarios); } catch { horarios = {}; }
  }
  let cerradosDias = canchaRow?.cerrados_dias;
  if (typeof cerradosDias === "string") {
    try { cerradosDias = JSON.parse(cerradosDias); } catch { cerradosDias = []; }
  }
  let cerradosFechas = canchaRow?.cerrados_fechas;
  if (typeof cerradosFechas === "string") {
    try { cerradosFechas = JSON.parse(cerradosFechas); } catch { cerradosFechas = []; }
  }
  // Asegurar tipos
  cerradosDias = Array.isArray(cerradosDias) ? cerradosDias.map(Number) : [];
  cerradosFechas = Array.isArray(cerradosFechas) ? cerradosFechas.map(String) : [];
  horarios = horarios && typeof horarios === "object" ? horarios : {};
  return { horarios, cerradosDias, cerradosFechas };
}

function isClosedForDate(cerradosDias, cerradosFechas, dateStr) {
  const weekday = new Date(dateStr + "T00:00:00").getDay();
  if ((cerradosDias || []).includes(weekday)) return true;
  if ((cerradosFechas || []).map(String).includes(dateStr)) return true;
  return false;
}

function buildSlotsForDate(horarios, dateStr, slotMinutes = 60) {
  const weekday = new Date(dateStr + "T00:00:00").getDay();
  const weekdayKey = String(weekday);
  const ventanas = (horarios && horarios[weekdayKey]) || [];
  let slots = [];
  ventanas.forEach((w) => {
    if (w?.start && w?.end) {
      slots = slots.concat(splitWindow(w.start, w.end, slotMinutes));
    }
  });
  return slots;
}

function annotateWithReservas(slots, reservas) {
  return slots.map((s) => {
    const sStart = timeToMinutes(s.start);
    const sEnd = timeToMinutes(s.end);
    const isReserved = (reservas || []).some((r) =>
      overlaps(sStart, sEnd, timeToMinutes(String(r.inicio).slice(0, 5)), timeToMinutes(String(r.fin).slice(0, 5)))
    );
    return { ...s, status: isReserved ? "reserved" : "free" };
  });
}

module.exports = {
  timeToMinutes,
  overlaps,
  splitWindow,
  parseCanchaCalendario,
  isClosedForDate,
  buildSlotsForDate,
  annotateWithReservas,
};