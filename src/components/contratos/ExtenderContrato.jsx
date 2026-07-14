import { useState, useEffect } from "react"
import { Typography, Box, Button } from "@mui/material"
import TimerIcon from "@mui/icons-material/Timer"
import { alpha, useTheme } from "@mui/material/styles"
import {
  GlassDialog,
  GlassTextField,
  GlowButton,
  FormHint,
  FormHintText,
  FormSection,
} from "../ui"
import { ghostButtonSx } from "../ui/glassStyles"

const ExtenderContrato = ({
  open,
  onClose,
  contratoToExtend,
  nuevaFechaFin,
  onNuevaFechaFinChange,
  onSubmit,
  formatDate,
  fechaFinHint,
  onFechaFinBlur,
}) => {
  const theme = useTheme()
  const [localFechaFin, setLocalFechaFin] = useState("")

  useEffect(() => {
    if (open && contratoToExtend) {
      setLocalFechaFin(nuevaFechaFin)
    }
  }, [open, contratoToExtend, nuevaFechaFin])

  const handleFechaChange = (e) => {
    const value = e.target.value
    setLocalFechaFin(value)
    if (onNuevaFechaFinChange) onNuevaFechaFinChange(value)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) onSubmit(e)
  }

  return (
    <GlassDialog
      open={open && !!contratoToExtend}
      onClose={onClose}
      maxWidth="xs"
      title="Extender Contrato"
      subtitle="Solo se modificará la fecha de fin del contrato"
      icon={<TimerIcon />}
      actions={
        <>
          <Button onClick={onClose} sx={ghostButtonSx(theme)}>
            Cancelar
          </Button>
          <GlowButton type="submit" form="extender-contrato-form" color="warning">
            Extender Contrato
          </GlowButton>
        </>
      }
    >
      <Box
        component="form"
        id="extender-contrato-form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 3 }}
      >
        <Box
          sx={{
            p: 2,
            borderRadius: "12px",
            bgcolor: alpha(theme.palette.background.default, 0.45),
            border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Arrendatario
            </Typography>
            <Typography variant="body2" fontWeight={600} textAlign="right">
              {contratoToExtend?.arrendatario_nombre}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Apartamento
            </Typography>
            <Typography variant="body2" fontWeight={600} textAlign="right">
              {contratoToExtend?.apartamento_nombre}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Fecha de fin actual
            </Typography>
            <Typography variant="body2" fontWeight={700} color="success.main" textAlign="right">
              {contratoToExtend && formatDate(contratoToExtend.fecha_fin)}
            </Typography>
          </Box>
        </Box>

        <FormSection title="Nueva vigencia">
          <GlassTextField
            label="Nueva fecha de fin"
            type="date"
            value={localFechaFin}
            onChange={handleFechaChange}
            onBlur={onFechaFinBlur}
            required
          />
          <FormHint tone="info">
            {fechaFinHint && (
              <FormHintText>
                <Box component="span" sx={{ color: "info.main", fontWeight: 600 }}>
                  {fechaFinHint}
                </Box>
              </FormHintText>
            )}
            <FormHintText>
              La fecha debe ser posterior a la fin actual. Si eliges el aniversario del contrato, se
              guardará el día anterior (fin del periodo inclusivo).
            </FormHintText>
          </FormHint>
        </FormSection>
      </Box>
    </GlassDialog>
  )
}

export default ExtenderContrato
