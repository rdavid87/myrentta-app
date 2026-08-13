export const PHONE_ERROR_MESSAGE =
  "El número de teléfono no es válido. Usa un número de 10 dígitos"

/** Keeps only digits and caps length (default: 10). */
export function sanitizePhoneInput(value, maxDigits = 10) {
  return String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, maxDigits)
}

/**
 * Valid phone: exactly 10 digits,
 * or 12 digits with country code 57.
 */
export function isValidColombianMobile(telefono) {
  if (!telefono) return false
  const digits = String(telefono).replace(/\D/g, "")
  if (digits.length === 10) return true
  if (digits.length === 12 && digits.startsWith("57")) return true
  return false
}
