/** Respuesta de GET /notificaciones/verificar-mora: unifica claves por si la API varía el formato. */
export function normalizeVerificarMoraResponse(raw) {
  if (raw == null || typeof raw !== "object") {
    return { contratos_en_mora: 0, contratos: [], enviado: false }
  }
  const n = Number(raw.contratos_en_mora ?? raw.contratosEnMora)
  const contratos_en_mora = Number.isFinite(n) ? n : 0
  const contratos = Array.isArray(raw.contratos)
    ? raw.contratos
    : Array.isArray(raw.contratos_en_mora_detalle)
      ? raw.contratos_en_mora_detalle
      : []
  // Each item may include periodo_no_pago (unpaid coverage label from API).
  return { ...raw, contratos_en_mora, contratos }
}
