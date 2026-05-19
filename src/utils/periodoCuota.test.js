import test from "node:test"
import assert from "node:assert/strict"
import {
  dedupeInstallmentPeriodOptions,
  formatPaymentPeriodForList,
  getPeriodRangeFromMonthYear,
} from "./periodoCuota.js"

test("formatPaymentPeriodForList prefers API periodo when present", () => {
  assert.equal(
    formatPaymentPeriodForList({
      mes: 5,
      anio: 2026,
      modo_cobro: "anticipado",
      periodo: "  Mayo - Junio 2026  ",
    }),
    "Mayo - Junio 2026",
  )
})

test("formatPaymentPeriodForList falls back to forward range when periodo missing", () => {
  assert.equal(
    formatPaymentPeriodForList({ mes: 5, anio: 2026, modo_cobro: "anticipado" }),
    getPeriodRangeFromMonthYear(5, 2026),
  )
})

test("formatPaymentPeriodForList uses same range fallback for fin_mes when periodo missing", () => {
  assert.equal(
    formatPaymentPeriodForList({ mes: 4, anio: 2026, modo_cobro: "fin_mes" }),
    getPeriodRangeFromMonthYear(4, 2026),
  )
})

test("dedupeInstallmentPeriodOptions marks existe when any duplicate label has a payment", () => {
  const periodos = [
    { mes: 5, anio: 2026, etiqueta: "Mayo - Junio 2026", existe: true, es_siguiente: false },
    { mes: 6, anio: 2026, etiqueta: "Mayo - Junio 2026", existe: false, es_siguiente: true },
  ]
  const siguiente = { mes: 6, anio: 2026 }
  const out = dedupeInstallmentPeriodOptions(periodos, siguiente)
  assert.equal(out.length, 1)
  assert.equal(out[0].existe, true)
  assert.equal(out[0].mes, 5)
})

test("dedupeInstallmentPeriodOptions prefers siguiente when nobody has payment", () => {
  const periodos = [
    { mes: 5, anio: 2026, etiqueta: "Mayo - Junio 2026", existe: false, es_siguiente: false },
    { mes: 6, anio: 2026, etiqueta: "Mayo - Junio 2026", existe: false, es_siguiente: true },
  ]
  const siguiente = { mes: 6, anio: 2026 }
  const out = dedupeInstallmentPeriodOptions(periodos, siguiente)
  assert.equal(out.length, 1)
  assert.equal(out[0].mes, 6)
  assert.equal(out[0].existe, false)
})
