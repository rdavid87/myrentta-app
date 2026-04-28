const MESES = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

export function getMonthName(mes) {
  const m = Number(mes)
  if (!Number.isFinite(m) || m < 1 || m > 12) return ""
  return MESES[m] || String(mes)
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
