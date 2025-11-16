/**
 * Modelo de Cancha
 * Define transformaciones y utilidades para datos de canchas
 */

export class Cancha {
  /**
   * Nombres de días de la semana
   */
  static DAY_NAMES = {
    0: "Domingo",
    1: "Lunes",
    2: "Martes",
    3: "Miércoles",
    4: "Jueves",
    5: "Viernes",
    6: "Sábado",
  };

  /**
   * Formatea un tiempo a HH:MM
   * @param {string|number} t 
   * @returns {string}
   */
  static formatTime(t) {
    if (!t) return "--:--";
    try {
      const s = String(t).trim();
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(s)) {
        const [hh, mm] = s.split(":");
        return `${hh.padStart(2, "0")}:${mm.slice(0, 2)}`;
      }
      if (/^\d{3,4}$/.test(s)) {
        // 900 -> 09:00, 1230 -> 12:30
        const n = s.padStart(4, "0");
        return `${n.slice(0, 2)}:${n.slice(2, 4)}`;
      }
      if (/^\d{1,2}$/.test(s)) {
        return `${s.padStart(2, "0")}:00`;
      }
      return s;
    } catch (e) {
      return String(t);
    }
  }

  /**
   * Formatea precio en formato colombiano
   * @param {number} v 
   * @returns {string}
   */
  static formatPrice(v) {
    try {
      const n = Number(v) || 0;
      return n.toLocaleString("es-CO") + " COP";
    } catch (e) {
      return String(v) + " COP";
    }
  }

  /**
   * Parsea horarios de diferentes formatos
   * @param {object|string|Array} raw 
   * @returns {Array<{dia: number, start: string, end: string}>}
   */
  static parseHorarios(raw) {
    let obj = raw ?? {};
    if (typeof obj === "string") {
      try {
        obj = JSON.parse(obj);
      } catch {
        obj = {};
      }
    }
    const entries = [];

    if (obj && typeof obj === "object" && !Array.isArray(obj)) {
      for (const [key, arr] of Object.entries(obj)) {
        const diaNum = Number(key);
        if (!Array.isArray(arr) || arr.length === 0) continue;
        for (const slot of arr) {
          const start =
            slot?.start ?? slot?.hora ?? slot?.hora_inicio ?? slot?.from ?? null;
          const end = slot?.end ?? slot?.hora_fin ?? slot?.to ?? null;
          entries.push({ dia: diaNum, start, end });
        }
      }
    } else if (Array.isArray(obj)) {
      for (const item of obj) {
        const dia = item?.dia ?? item?.day ?? item?.d ?? null;
        const diaNum = dia !== null ? Number(dia) : null;
        const start = item?.start ?? item?.hora ?? item?.hora_inicio ?? null;
        const end = item?.end ?? item?.hora_fin ?? item?.to ?? null;
        if (diaNum === null) continue;
        entries.push({ dia: diaNum, start, end });
      }
    }
    return entries;
  }

  /**
   * Parsea días cerrados
   * @param {object} cancha 
   * @returns {Array<number>}
   */
  static parseCerradosDias(cancha) {
    const raw =
      cancha.cerradosdias ?? cancha.cerrados_dias ?? cancha.cerradosDias ?? [];
    let arr = raw;
    if (typeof arr === "string") {
      try {
        arr = JSON.parse(arr);
      } catch {
        arr = [];
      }
    }
    if (!Array.isArray(arr)) arr = [];
    const diasValidos = arr
      .map((n) => Number(n))
      .filter((n) => !Number.isNaN(n) && n >= 0 && n <= 6);
    diasValidos.sort((a, b) => a - b);
    return diasValidos;
  }

  /**
   * Parsea fechas cerradas
   * @param {object} cancha 
   * @returns {Array<string>}
   */
  static parseCerradosFechas(cancha) {
    const rawF =
      cancha.cerradosfechas ?? cancha.cerrados_fechas ?? cancha.cerradosFechas ?? [];
    let arrF = rawF;
    if (typeof arrF === "string") {
      try {
        arrF = JSON.parse(arrF);
      } catch {
        arrF = [];
      }
    }
    if (!Array.isArray(arrF)) return [];
    return arrF;
  }
}
