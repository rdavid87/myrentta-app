/**
 * Monthly lease period rules (aligned with backend internal/contractperiod).
 * Inclusive period end = anniversary day minus one calendar day.
 */
import { addDiasCalendario, formatFechaUTC, inicioDiaUTC } from "./fechas.js"

/** @param {string|Date} date */
export function formatDateInput(date) {
  const d = inicioDiaUTC(date)
  const y = d.getUTCFullYear()
  const m = String(d.getUTCMonth() + 1).padStart(2, "0")
  const day = String(d.getUTCDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

/** @param {string|Date} contractStart @param {number} year @param {number} month 1-12 */
export function billingDayInMonth(contractStart, year, month) {
  const base = inicioDiaUTC(contractStart).getUTCDate()
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return Math.min(base, lastDay)
}

/** @param {string|Date} contractStart @param {number} year @param {number} month 1-12 */
export function anniversaryDate(contractStart, year, month) {
  const day = billingDayInMonth(contractStart, year, month)
  return new Date(Date.UTC(year, month - 1, day))
}

/** @param {string|Date} contractStart @param {number} year @param {number} month 1-12 */
export function periodEndDate(contractStart, year, month) {
  return addDiasCalendario(anniversaryDate(contractStart, year, month), -1)
}

/**
 * If fecha_fin lands on the contract anniversary, return the inclusive end (day before).
 * @param {string} fechaInicio YYYY-MM-DD
 * @param {string} fechaFin YYYY-MM-DD
 * @returns {string} YYYY-MM-DD
 */
export function normalizeInclusiveContractEnd(fechaInicio, fechaFin) {
  if (!fechaInicio || !fechaFin) return fechaFin || ""
  const start = inicioDiaUTC(fechaInicio)
  const end = inicioDiaUTC(fechaFin)
  const anniv = anniversaryDate(start, end.getUTCFullYear(), end.getUTCMonth() + 1)
  if (end.getTime() === anniv.getTime()) {
    return formatDateInput(addDiasCalendario(anniv, -1))
  }
  return formatDateInput(end)
}

/**
 * @param {string} fechaInicio
 * @param {string} fechaFin
 */
export function prepareContractDateRange(fechaInicio, fechaFin) {
  const originalFin = formatDateInput(fechaFin)
  const normalizedFin = normalizeInclusiveContractEnd(fechaInicio, fechaFin)
  return {
    fecha_inicio: formatDateInput(fechaInicio),
    fecha_fin: normalizedFin,
    adjusted: normalizedFin !== originalFin,
    originalFin,
  }
}

/**
 * Inclusive contract end after N full monthly periods from start.
 * @param {string} fechaInicio
 * @param {number} months
 */
export function contractEndAfterMonths(fechaInicio, months) {
  const start = inicioDiaUTC(fechaInicio)
  if (months < 1) return formatDateInput(start)
  const y = start.getUTCFullYear()
  const m = start.getUTCMonth() + months
  const d = start.getUTCDate()
  const target = new Date(Date.UTC(y, m, d))
  return formatDateInput(addDiasCalendario(target, -1))
}

/**
 * UX hint when the typed end date will be normalized on save.
 * @param {string} fechaInicio
 * @param {string} fechaFin
 * @returns {string|null}
 */
export function inclusiveEndHint(fechaInicio, fechaFin) {
  if (!fechaInicio || !fechaFin) return null
  const { adjusted, fecha_fin } = prepareContractDateRange(fechaInicio, fechaFin)
  if (!adjusted) return null
  return `El periodo inclusivo termina el día anterior al aniversario: se guardará como ${formatFechaUTC(fecha_fin)}.`
}
