
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
  const mappedContratos = contratos.map((item) => ({
    ...item,
    unpaidPeriod:   item.periodo_no_pago  ?? item.unpaid_period   ?? item.unpaidPeriod   ?? null,
    paymentMonth:   item.mes_pago         ?? item.paymentMonth     ?? null,
    paymentId:      item.pago_id          ?? item.paymentId        ?? null,
    contractId:     item.contrato_id      ?? item.contractId       ?? null,
    tenantName:     item.arrendatario_nombre ?? item.tenantName    ?? null,
    apartmentName:  item.apartamento_nombre  ?? item.apartmentName ?? null,
    tenantEmail:    item.arrendatario_email  ?? item.tenantEmail   ?? null,
    lateDays:       item.dias_mora           ?? item.lateDays      ?? null,
  }))
  return { ...raw, contratos_en_mora, contratos: mappedContratos }
}
