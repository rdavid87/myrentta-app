import { MenuItem, Typography, Box, Button } from "@mui/material"
import DescriptionIcon from "@mui/icons-material/Description"
import AutorenewIcon from "@mui/icons-material/Autorenew"
import { useTheme } from "@mui/material/styles"
import {
  GlassDialog,
  GlassTextField,
  GlassSelect,
  GlowButton,
  FormHint,
  FormHintText,
  FormSection,
} from "../ui"
import { ghostButtonSx } from "../ui/glassStyles"

const CrearContrato = ({
  open,
  onClose,
  contratoToRenew,
  formData,
  onFormDataChange,
  tenants,
  apartamentos,
  isDisabled,
  onSubmit,
  formatCurrency,
  getApartamentoDisplayName,
  fechaFinHint,
  onFechaFinBlur,
}) => {
  const theme = useTheme()

  const handleChange = (field) => (e) => {
    const value = e.target.value

    if (field === "apartamento_id") {
      const selectedApt = apartamentos.find((apt) => apt.id === parseInt(value))
      onFormDataChange({
        ...formData,
        apartamento_id: value,
        canon_mensual: selectedApt ? selectedApt.valor_arriendo.toLocaleString("es-CO") : "",
      })
      return
    }

    onFormDataChange({ ...formData, [field]: value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) onSubmit(e)
  }

  const isRenew = Boolean(contratoToRenew)

  return (
    <GlassDialog
      open={open}
      onClose={onClose}
      title={isRenew ? "Renovar Contrato" : "Nuevo Contrato de Arrendamiento"}
      subtitle={
        isRenew
          ? `${contratoToRenew.arrendatario_nombre} · ${contratoToRenew.apartamento_nombre}`
          : "Completa los datos para registrar el arrendamiento"
      }
      icon={isRenew ? <AutorenewIcon /> : <DescriptionIcon />}
      actions={
        <>
          <Button onClick={onClose} sx={ghostButtonSx(theme)}>
            Cancelar
          </Button>
          <GlowButton type="submit" form="crear-contrato-form" color="success" disabled={isDisabled}>
            {isRenew ? "Renovar Contrato" : "Crear Contrato"}
          </GlowButton>
        </>
      }
    >
      <Box
        component="form"
        id="crear-contrato-form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        <FormSection title="Arrendatario e inmueble">
          <GlassSelect
            label="Arrendatario"
            value={formData.arrendatario_id}
            onChange={handleChange("arrendatario_id")}
            disabled={isRenew}
            required
          >
            <MenuItem value="">Seleccionar arrendatario</MenuItem>
            {isRenew ? (
              <MenuItem value={contratoToRenew.arrendatario_id}>
                {contratoToRenew.arrendatario_nombre}
              </MenuItem>
            ) : (
              tenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.nombre_completo} — {tenant.documento_identidad}
                </MenuItem>
              ))
            )}
          </GlassSelect>
          {!isRenew && tenants.length === 0 && (
            <Typography variant="caption" color="warning.main">
              No hay arrendatarios registrados. Crea uno en la sección Arrendatarios.
            </Typography>
          )}

          <GlassSelect
            label="Apartamento"
            value={formData.apartamento_id}
            onChange={handleChange("apartamento_id")}
            disabled={isRenew}
            required
          >
            <MenuItem value="">Seleccionar apartamento</MenuItem>
            {isRenew ? (
              <MenuItem value={contratoToRenew.apartamento_id}>
                {contratoToRenew.apartamento_nombre} — {contratoToRenew.apartamento_direccion}
              </MenuItem>
            ) : (
              apartamentos.map((apt) => (
                <MenuItem key={apt.id} value={apt.id}>
                  {getApartamentoDisplayName(apt)} — {formatCurrency(apt.valor_arriendo)}
                </MenuItem>
              ))
            )}
          </GlassSelect>
          {!isRenew && apartamentos.length === 0 && (
            <Typography variant="caption" color="warning.main">
              No hay apartamentos disponibles
            </Typography>
          )}
        </FormSection>

        <FormSection title="Vigencia del contrato">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <GlassTextField
              label="Fecha inicio"
              type="date"
              value={formData.fecha_inicio}
              onChange={handleChange("fecha_inicio")}
              required
            />
            <GlassTextField
              label="Fecha fin"
              type="date"
              value={formData.fecha_fin}
              onChange={handleChange("fecha_fin")}
              onBlur={onFechaFinBlur}
              required
            />
          </Box>

          <FormHint tone="info">
            {fechaFinHint && (
              <FormHintText>
                <Box component="span" sx={{ color: "info.main", fontWeight: 600 }}>
                  {fechaFinHint}
                </Box>
              </FormHintText>
            )}
            <FormHintText>
              El contrato termina el último día del periodo mensual (día anterior al aniversario).
            </FormHintText>
          </FormHint>
        </FormSection>

        <FormSection title="Condiciones de cobro">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <GlassTextField
              label="Canon mensual"
              value={formData.canon_mensual}
              onChange={handleChange("canon_mensual")}
              required
              placeholder="Ej: 1.500.000"
            />
            <GlassTextField
              label="Días de gracia"
              type="number"
              value={formData.paymentDay}
              onChange={handleChange("paymentDay")}
              slotProps={{ htmlInput: { min: 0, max: 90 } }}
            />
          </Box>

          <GlassSelect
            label="Modo de cobro del canon"
            value={formData.modo_cobro}
            onChange={handleChange("modo_cobro")}
          >
            <MenuItem value="anticipado">Cobro anticipado (mes adelantado)</MenuItem>
            <MenuItem value="fin_mes">Cobro a mes vencido (fin de mes)</MenuItem>
          </GlassSelect>

          <FormHint>
            <FormHintText>
              Indica cuántos días después del aniversario mensual se establece la fecha límite de pago.
            </FormHintText>
            <FormHintText>
              Ejemplo: si el contrato inicia el 20 y pones 1, la fecha de cobro será el 21.
            </FormHintText>
          </FormHint>
        </FormSection>
      </Box>
    </GlassDialog>
  )
}

export default CrearContrato
