import test from "node:test"
import assert from "node:assert/strict"
import { isValidColombianMobile, sanitizePhoneInput } from "./phone.js"

test("sanitizePhoneInput keeps only digits and max 10", () => {
  assert.equal(sanitizePhoneInput("300-123-4567"), "3001234567")
  assert.equal(sanitizePhoneInput("32132132"), "32132132")
  assert.equal(sanitizePhoneInput("300123456789"), "3001234567")
})

test("isValidColombianMobile accepts any 10 digits", () => {
  assert.equal(isValidColombianMobile("3001234567"), true)
  assert.equal(isValidColombianMobile("2001234567"), true)
})

test("isValidColombianMobile rejects short numbers", () => {
  assert.equal(isValidColombianMobile("32132132"), false)
  assert.equal(isValidColombianMobile("300123456"), false)
})
