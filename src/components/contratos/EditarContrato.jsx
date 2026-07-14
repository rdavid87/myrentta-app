import { MenuItem, Typography, Box, Button } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
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

const EditarContrato = ({
  open,
  onClose,
  contratoToEdit,
  editFormData,
  onEditFormDataChange,
  isEditContractUnchanged,
  onSubmit,
  fechaFinHint,
  onFechaFinBlur,
}) => {
  const theme = useTheme()

  const handleChange = (field) => (e) => {
    if (onEditFormDataChange) {
      onEditFormDataChange({ ...editFormData, [field]: e.target.value })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) onSubmit(e)
  }

  return (
    <GlassDialog
      open={open && !!contratoToEdit}
      onClose={onClose}
      title="Editar contrato"
      subtitle={`${contratoToEdit?.arrendatario_nombre ?? ""} · ${contratoToEdit?.apartamento_nombre ?? ""}`}
      icon={<EditIcon />}
      actions={
        <>
          <Button onClick={onClose} sx={ghostButtonSx(theme)}>
            Cancelar
          </Button>
          <GlowButton
            type="submit"
            form="editar-contrato-form"
            color="primary"
            disabled={isEditContractUnchanged}
          >
            Guardar cambios
          </GlowButton>
        </>
      }
    >
      <Box
        component="form"
        id="editar-contrato-form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        <FormHint tone="info">
          <FormHintText>
            Puedes corregir fechas, canon, días extra y modo de cobro. Para cambiar arrendatario o
            apartamento, elimina este contrato y crea uno nuevo.
          </FormHintText>
        </FormHint>

        <FormSection title="Vigencia">
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <GlassTextField
              label="Fecha inicio"
              type="date"
              value={editFormData?.fecha_inicio ?? ""}
              onChange={handleChange("fecha_inicio")}
              required
            />
            <GlassTextField
              label="Fecha fin"
              type="date"
              value={editFormData?.fecha_fin ?? ""}
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
          <GlassTextField
            label="Canon mensual"
            value={editFormData?.canon_mensual ?? ""}
            onChange={handleChange("canon_mensual")}
            required
            placeholder="Ej: 1.500.000"
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: -1 }}>
            Puedes usar puntos como separador de miles.
          </Typography>

          <GlassTextField
            label="Días de gracia para el pago"
            type="number"
            value={editFormData?.paymentDay ?? 0}
            onChange={handleChange("paymentDay")}
            slotProps={{ htmlInput: { min: 0, max: 90 } }}
          />

          <GlassSelect
            label="Modo de cobro"
            value={editFormData?.modo_cobro ?? "anticipado"}
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

export default EditarContrato
