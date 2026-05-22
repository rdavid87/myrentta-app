import test from "node:test"
import assert from "node:assert/strict"
import {
  contratoVenceEnVentana,
  diasCalendarioHasta,
  fechaLimiteVentanaDias,
  formatFechaUTC,
} from "./fechas.js"

const HOY = new Date(Date.UTC(2026, 4, 22))

test("contratoVenceEnVentana incluye contrato a 29 días", () => {
  assert.equal(contratoVenceEnVentana("2026-06-20", 30, HOY), true)
})

test("contratoVenceEnVentana excluye contrato a 31 días", () => {
  assert.equal(contratoVenceEnVentana("2026-06-22", 30, HOY), false)
})

test("fecha límite por vencer es hoy + 30 días calendario", () => {
  const limite = fechaLimiteVentanaDias(HOY, 30)
  assert.equal(formatFechaUTC(limite), "21/06/2026")
  assert.equal(diasCalendarioHasta(HOY, "2026-06-22"), 31)
})
