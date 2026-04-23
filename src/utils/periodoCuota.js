const MESES = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]

export function nombreMes(mes) {
  const m = Number(mes)
  if (!Number.isFinite(m) || m < 1 || m > 12) return ""
  return MESES[m] || String(mes)
}

/** Rango “mes – mes siguiente año” (misma regla que en Pagos). */
export function periodoRangoDesdeMesAnio(mes, anio) {
  const m = Number(mes)
  const a = Number(anio)
  if (!Number.isFinite(m) || m < 1 || m > 12 || !Number.isFinite(a)) return null
  let m2 = m + 1
  let a2 = a
  if (m2 > 12) {
    m2 = 1
    a2 = a + 1
  }
  const n1 = nombreMes(m)
  const n2 = nombreMes(m2)
  if (a2 !== a) {
    return `${n1} ${a} - ${n2} ${a2}`
  }
  return `${n1} - ${n2} ${a}`
}
