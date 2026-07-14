import test from "node:test"
import assert from "node:assert/strict"
import {
  contractEndAfterMonths,
  normalizeInclusiveContractEnd,
  prepareContractDateRange,
} from "./contractperiod.js"

test("normalizeInclusiveContractEnd converts anniversary to day before", () => {
  assert.equal(
    normalizeInclusiveContractEnd("2026-07-14", "2027-07-14"),
    "2027-07-13"
  )
})

test("normalizeInclusiveContractEnd leaves inclusive end unchanged", () => {
  assert.equal(
    normalizeInclusiveContractEnd("2026-07-14", "2027-07-13"),
    "2027-07-13"
  )
})

test("contractEndAfterMonths one year from July 14", () => {
  assert.equal(contractEndAfterMonths("2026-07-14", 12), "2027-07-13")
})

test("contractEndAfterMonths two months from July 14", () => {
  assert.equal(contractEndAfterMonths("2026-07-14", 2), "2026-09-13")
})

test("prepareContractDateRange flags adjustment", () => {
  const r = prepareContractDateRange("2026-07-14", "2026-09-14")
  assert.equal(r.fecha_fin, "2026-09-13")
  assert.equal(r.adjusted, true)
  assert.equal(r.originalFin, "2026-09-14")
})
