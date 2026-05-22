/**
 * Utilidades de fechas en UTC (solo día calendario), alineadas con formatDate en Contratos.
 */

/** @param {string|Date} value */
export function inicioDiaUTC(value) {
  const raw = typeof value === "string" ? value.slice(0, 10) : ""
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
    const [y, m, d] = raw.split("-").map(Number)
    return new Date(Date.UTC(y, m - 1, d))
  }
  const date = value instanceof Date ? value : new Date(value)
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
}

/** Días calendario desde `desde` (excl.) hasta `hasta` (incl. del día `hasta`). */
export function diasCalendarioHasta(desde, hasta) {
  const inicio = inicioDiaUTC(desde)
  const fin = inicioDiaUTC(hasta)
  return Math.round((fin.getTime() - inicio.getTime()) / 86400000)
}

/** Suma días calendario en UTC. */
export function addDiasCalendario(fecha, dias) {
  const base = inicioDiaUTC(fecha)
  base.setUTCDate(base.getUTCDate() + dias)
  return base
}

/**
 * Contrato activo cuya fecha_fin cae entre hoy y hoy + ventanaDias (calendario).
 * @param {string} fechaFinISO
 * @param {number} ventanaDias
 * @param {Date} [hoy]
 */
export function contratoVenceEnVentana(fechaFinISO, ventanaDias = 30, hoy = new Date()) {
  const fin = inicioDiaUTC(fechaFinISO)
  const hoyUTC = inicioDiaUTC(hoy)
  const limite = addDiasCalendario(hoyUTC, ventanaDias)
  const dias = diasCalendarioHasta(hoyUTC, fin)
  return dias >= 0 && fin.getTime() <= limite.getTime()
}

export function fechaLimiteVentanaDias(hoy = new Date(), ventanaDias = 30) {
  return addDiasCalendario(hoy, ventanaDias)
}

/** Formato DD/MM/YYYY en UTC. */
export function formatFechaUTC(date) {
  const d = inicioDiaUTC(date)
  const day = String(d.getUTCDate()).padStart(2, "0")
  const month = String(d.getUTCMonth() + 1).padStart(2, "0")
  const year = d.getUTCFullYear()
  return `${day}/${month}/${year}`
}
