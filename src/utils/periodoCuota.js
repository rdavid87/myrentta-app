const MESES = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

export function getMonthName(mes) {
  const m = Number(mes)
  if (!Number.isFinite(m) || m < 1 || m > 12) return ""
  return MESES[m] || String(mes)
}

/**
 * Lista de pagos / UI: modo anticipado = rango mes ancla → siguiente civil (alineado a cuotas);
 * fin_mes = un solo mes usando `periodo` del API cuando existe.
 */
export function formatPaymentPeriodForList(pago) {
  if (!pago) return "—"
  const modo = String(pago.modo_cobro ?? "anticipado").trim().toLowerCase()
  if (modo === "fin_mes") {
    if (pago.periodo?.trim()) return pago.periodo.trim()
    return `${getMonthName(pago.mes)} ${pago.anio}`
  }
  const rango = getPeriodRangeFromMonthYear(pago.mes, pago.anio)
  if (rango) return rango
  if (pago.periodo?.trim()) return pago.periodo.trim()
  return "—"
}

export function getPeriodRangeFromMonthYear(month, year) {
  const monthNum = Number(month)
  const yearNum = Number(year)
  if (!Number.isFinite(monthNum) || monthNum < 1 || monthNum > 12 || !Number.isFinite(yearNum)) return null
  let nextMonth = monthNum + 1
  let nextYear = yearNum
  if (nextMonth > 12) {
    nextMonth = 1
    nextYear = yearNum + 1
  }
  const startMonthName = getMonthName(monthNum)
  const endMonthName = getMonthName(nextMonth)
  if (nextYear !== yearNum) {
    return `${startMonthName} ${yearNum} - ${endMonthName} ${nextYear}`
  }
  return `${startMonthName} - ${endMonthName} ${yearNum}`
}
