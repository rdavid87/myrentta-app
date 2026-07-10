import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Button,
  Chip,
} from "@mui/material"
import { getPeriodRangeFromMonthYear } from "../utils/periodoCuota"

function getUnpaidPeriodLabel(contract) {
  const fromApi = contract.unpaidPeriod && String(contract.unpaidPeriod).trim()
  if (fromApi) return fromApi

  const month = contract.mes ?? contract.mes_cuota
  const year = contract.anio ?? contract.anio_cuota
  if (month != null && year != null) {
    const fromNumbers = getPeriodRangeFromMonthYear(Number(month), Number(year))
    if (fromNumbers) return fromNumbers
  }

  const legacy = contract.paymentMonth
  if (legacy != null && typeof legacy === "string" && String(legacy).trim()) return String(legacy).trim()
  return null
}

export default function VerificarMoraResultModal({
  open,
  resultadoMora,
  onClose,
  onEnviarNotificaciones,
  enviandoNotificaciones,
}) {
  if (!open || !resultadoMora) return null

  const badgeColor = resultadoMora.contratos_en_mora > 0 ? "warning" : "success"

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
          }
        }
      }}
    >
      <DialogTitle sx={{ 
        color: "text.primary", 
        fontWeight: 700, 
        display: "flex", 
        alignItems: "center", 
        gap: 1 
      }}>
        <Box component="span" sx={{ fontSize: "1.5rem" }}>
          {resultadoMora.enviado ? "✅" : resultadoMora.contratos_en_mora > 0 ? "⚠️" : "✅"}
        </Box>
        <Box component="span" sx={{ fontSize: "1.25rem" }}>
          {resultadoMora.enviado ? "Notificaciones Enviadas" : "Verificación de Mora"}
        </Box>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Chip
            label={
              resultadoMora.contratos_en_mora === 1
                ? "1 Contrato en mora"
                : resultadoMora.contratos_en_mora === 0
                  ? "Sin mora detectada"
                  : `${resultadoMora.contratos_en_mora} Contratos en mora`
            }
            color={badgeColor}
            variant={resultadoMora.contratos_en_mora > 0 ? "filled" : "outlined"}
          />

          {resultadoMora.contratos_en_mora === 0 && !resultadoMora.enviado && (
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Typography variant="h5" sx={{ mb: 1 }}>
                🎉
              </Typography>
              <Typography variant="body1" color="text.secondary">
                No hay contratos activos con pagos vencidos
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                Entre los contratos en curso, los arrendatarios están al día según esta verificación.
              </Typography>
            </Box>
          )}

          {resultadoMora.contratos_en_mora > 0 && !resultadoMora.enviado && resultadoMora.contratos && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                Pendientes de notificación
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, maxHeight: 200, overflow: "auto" }}>
                {resultadoMora.contratos.map((contract, index) => {
                  const periodLabel = getUnpaidPeriodLabel(contract)
                  return (
                    <Box
                      key={contract.paymentId ?? `${contract.contractId}-${index}`}
                      sx={{ p: 2, borderRadius: 1, bgcolor: "action.hover" }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {contract.tenantName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {contract.apartmentName}
                          </Typography>
                          {periodLabel && (
                            <Typography variant="caption" display="block" sx={{ color: "warning.light", mt: 0.5 }}>
                              Periodo no pagado: {periodLabel}
                            </Typography>
                          )}
                          <Typography variant="caption" color="text.disabled" display="block">
                            {contract.tenantEmail}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${contract.lateDays} ${contract.lateDays === 1 ? "día" : "días"}`}
                          size="small"
                          color="error"
                          variant="outlined"
                        />
                      </Box>
                    </Box>
                  )
                })}
              </Box>
            </Box>
          )}

          {resultadoMora.enviado && (
            <>
              <Box sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h4" color="success.main" fontWeight="bold">
                  {resultadoMora.notificaciones_enviadas || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Notificaciones enviadas
                </Typography>
              </Box>
              {resultadoMora.detalles && resultadoMora.detalles.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" color="success.light" sx={{ mb: 1 }}>
                    Enviados exitosamente
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, maxHeight: 120, overflow: "auto" }}>
                    {resultadoMora.detalles.map((detalle, index) => (
                      <Box key={index} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                        <Typography sx={{ color: "success.main", mt: 0.25 }}>✓</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {detalle}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </>
          )}

          {resultadoMora.errores && resultadoMora.errores.length > 0 && (
            <Box sx={{ p: 2, borderRadius: 1, bgcolor: "error.dark", border: "1px solid", borderColor: "error.main" }}>
              <Typography variant="subtitle2" color="error.light" sx={{ mb: 1 }}>
                Errores
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, maxHeight: 100, overflow: "auto" }}>
                {resultadoMora.errores.map((error, index) => (
                  <Typography key={index} variant="body2" color="error.light">
                    • {error}
                  </Typography>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        {resultadoMora.contratos_en_mora === 0 || resultadoMora.enviado ? (
          <Button onClick={onClose} variant="contained">
            Cerrar
          </Button>
        ) : (
          <>
            <Button
              onClick={onEnviarNotificaciones}
              variant="contained"
              color="success"
              disabled={enviandoNotificaciones}
            >
              {enviandoNotificaciones ? "Enviando..." : "Enviar Notificaciones"}
            </Button>
            <Button onClick={onClose} disabled={enviandoNotificaciones}>
              Cancelar
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  )
}