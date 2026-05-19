const MESES = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

export function getMonthName(mes) {
  const m = Number(mes)
  if (!Number.isFinite(m) || m < 1 || m > 12) return ""
  return MESES[m] || String(mes)
}

/**
 * Lista de pagos: same label rules as backend `ComputePaymentPeriodDisplay` (`GET /pagos` exposes `periodo`).
 * Always prefer API `periodo` when present so the table matches the registrar dropdown.
 */
export function formatPaymentPeriodForList(pago) {
  if (!pago) return "—"
  const apiPeriodo = pago.periodo?.trim()
  if (apiPeriodo) return apiPeriodo
  const rango = getPeriodRangeFromMonthYear(pago.mes, pago.anio)
  if (rango) return rango
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

const slotKey = (p) => `${p.mes}|${p.anio}`

/**
 * Pick one row per etiqueta for the period select.
 * Same label can map to two calendar slots (e.g. Mayo–Junío as forward anchor 5 vs backward anchor 6).
 * If any slot already has a payment (pendiente o pagado), the option must show existe and stay disabled.
 */
export function dedupeInstallmentPeriodOptions(periodos, siguiente) {
  if (!Array.isArray(periodos) || periodos.length === 0) return []
  const sigKey = siguiente ? slotKey(siguiente) : null

  const byLabel = new Map()
  for (const p of periodos) {
    const label = p.etiqueta || slotKey(p)
    let group = byLabel.get(label)
    if (!group) {
      group = []
      byLabel.set(label, group)
    }
    group.push(p)
  }

  const merged = []
  for (const group of byLabel.values()) {
    const anyExiste = group.some((x) => x.existe)
    const withPayment = group.find((x) => x.existe)
    let base
    if (anyExiste && withPayment) {
      base = { ...withPayment, existe: true, es_siguiente: group.some((x) => x.es_siguiente) }
    } else {
      base = pickOpenRepresentative(group, sigKey)
    }
    merged.push(base)
  }

  return merged.sort((a, b) => (a.anio !== b.anio ? a.anio - b.anio : a.mes - b.mes))
}

function pickOpenRepresentative(group, sigKey) {
  if (group.length === 1) return { ...group[0] }
  const bySig = sigKey ? group.find((p) => slotKey(p) === sigKey) : null
  if (bySig) return { ...bySig }
  const byNext = group.find((p) => p.es_siguiente)
  if (byNext) return { ...byNext }
  const sorted = [...group].sort((a, b) => (a.anio !== b.anio ? a.anio - b.anio : a.mes - b.mes))
  return { ...sorted[0] }
}
