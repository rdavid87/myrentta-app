import { useState, useEffect } from "react"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Divider,
  Typography,
  Box,
  Paper,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"

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
  const handleChange = (field) => (e) => {
    if (onEditFormDataChange) {
      onEditFormDataChange({ ...editFormData, [field]: e.target.value })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) {
      onSubmit(e)
    }
  }

  return (
    <Dialog
      open={open && !!contratoToEdit}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            bgcolor: "rgba(17, 24, 39, 0.95)",
            backdropFilter: "blur(24px)",
            border: "1px solid rgba(75, 85, 99, 0.5)",
            borderRadius: 3,
            m: { xs: 1, sm: 2 },
          },
        },
      }}
    >
      <DialogTitle sx={{ pb: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <EditIcon sx={{ color: "#34d399", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Editar contrato
            </Typography>
            <Typography variant="body2" sx={{ color: "#9ca3af", mt: 0.25 }}>
              {contratoToEdit?.arrendatario_nombre} · {contratoToEdit?.apartamento_nombre}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1 }} />
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 1 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Alert
              severity="info"
              sx={{
                borderRadius: 2,
                bgcolor: "rgba(8,145,178,0.1)",
                border: "1px solid rgba(8,145,178,0.2)",
              }}
            >
              <Typography variant="caption" sx={{ color: "#e5e7eb", lineHeight: 1.4 }}>
                Puedes corregir fechas, canon, días extra y modo de cobro (anticipado o fin de mes). Para cambiar
                arrendatario o apartamento, elimina este contrato y crea uno nuevo.
              </Typography>
            </Alert>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="📅 Fecha inicio"
                  type="date"
                  size="small"
                  fullWidth
                  value={editFormData?.fecha_inicio ?? ""}
                  onChange={handleChange("fecha_inicio")}
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="📅 Fecha fin"
                  type="date"
                  size="small"
                  fullWidth
                  value={editFormData?.fecha_fin ?? ""}
                  onChange={handleChange("fecha_fin")}
                  onBlur={onFechaFinBlur}
                  required
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              </Grid>
            </Grid>
            {fechaFinHint && (
              <Typography variant="caption" sx={{ color: "#38bdf8", mt: -1 }}>
                {fechaFinHint}
              </Typography>
            )}
            <Typography variant="caption" sx={{ color: "#6b7280", mt: fechaFinHint ? 0 : -1 }}>
              El contrato termina el último día del periodo mensual (día anterior al aniversario).
            </Typography>
            <TextField
              label="💰 Canon mensual"
              size="small"
              fullWidth
              value={editFormData?.canon_mensual ?? ""}
              onChange={handleChange("canon_mensual")}
              required
              placeholder="Ej: 1.500.000"
            />
            <Typography variant="caption" sx={{ color: "#6b7280", mt: -1 }}>
              Puedes usar puntos como separador de miles.
            </Typography>

            <TextField
              label="📆 Días de gracia para el pago"
              type="number"
              size="small"
              fullWidth
              value={editFormData?.paymentDay ?? 0}
              onChange={handleChange("paymentDay")}
              slotProps={{ htmlInput: { min: 0, max: 90 } }}
            />
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography variant="caption" sx={{ color: "#fbbf24" }}>
                Indica cuántos días después del aniversario mensual se establece la fecha límite de pago.
              </Typography>
              <Typography variant="caption" sx={{ color: "#6b7280" }}>
                Por ejemplo, si el contrato inicia el 20 y pones 1, la fecha de cobro será el 21.
              </Typography>
            </Box>

            <FormControl size="small" fullWidth>
              <InputLabel sx={{ color: "#9ca3af" }}>🧾 Modo de cobro</InputLabel>
              <Select
                value={editFormData?.modo_cobro ?? "anticipado"}
                label="🧾 Modo de cobro"
                onChange={handleChange("modo_cobro")}
                sx={{
                  bgcolor: "rgba(17,24,39,0.6)",
                  "& .MuiSelect-select": { color: "#f9fafb" },
                }}
              >
                <MenuItem value="anticipado">Cobro Anticipado (Mes Adelantado)</MenuItem>
                <MenuItem value="fin_mes">Cobro a Mes Vencido (Fin de Mes)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isEditContractUnchanged}
              fullWidth
              sx={{ borderRadius: 2 }}
            >
              Guardar cambios
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={onClose}
              fullWidth
              sx={{ borderRadius: 2 }}
            >
              Cancelar
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default EditarContrato
