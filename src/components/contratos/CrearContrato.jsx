import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Typography,
  Box,
  Alert,
} from "@mui/material"
import ArrendatarioIcon from "../ArrendatarioIcon"

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
}) => {
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
    if (onSubmit) {
      onSubmit(e)
    }
  }

  return (
    <Dialog
      open={open}
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
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              {contratoToRenew ? "🔄 Renovar Contrato" : "📝 Nuevo Contrato de Arrendamiento"}
            </Typography>
            {contratoToRenew && (
              <Typography variant="body2" sx={{ color: "#9ca3af", mt: 0.25 }}>
                Se finalizará el contrato actual y se creará uno nuevo
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1 }} />

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Arrendatario */}
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ color: "#9ca3af" }}>
                <ArrendatarioIcon className="w-4 h-4 text-fuchsia-400" /> Arrendatario
              </InputLabel>
              <Select
                value={formData.arrendatario_id}
                  label="Arrendatario"
                onChange={handleChange("arrendatario_id")}
                disabled={contratoToRenew}
                required
                sx={{
                  bgcolor: "rgba(17,24,39,0.6)",
                  "& .MuiSelect-select": { color: "#f9fafb" },
                }}
              >
                <MenuItem value="" style={{ backgroundColor: "#1f2937" }}>
                  Seleccionar arrendatario
                </MenuItem>
                {contratoToRenew ? (
                  <MenuItem value={contratoToRenew.arrendatario_id} style={{ backgroundColor: "#1f2937" }}>
                    {contratoToRenew.arrendatario_nombre}
                  </MenuItem>
                ) : (
                  tenants.map((tenant) => (
                    <MenuItem key={tenant.id} value={tenant.id} style={{ backgroundColor: "#1f2937" }}>
                      {tenant.nombre_completo} - {tenant.documento_identidad}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            {!contratoToRenew && tenants.length === 0 && (
              <Alert severity="warning" sx={{ bgcolor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <Typography variant="caption" sx={{ color: "#fbbf24" }}>
                  ⚠️ No hay arrendatarios registrados. Crea uno en la sección Arrendatarios.
                </Typography>
              </Alert>
            )}

            {/* Apartamento */}
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ color: "#9ca3af" }}>🏢 Apartamento</InputLabel>
              <Select
                value={formData.apartamento_id}
                label="🏢 Apartamento"
                onChange={handleChange("apartamento_id")}
                disabled={contratoToRenew}
                required
                sx={{
                  bgcolor: "rgba(17,24,39,0.6)",
                  "& .MuiSelect-select": { color: "#f9fafb" },
                }}
              >
                <MenuItem value="" style={{ backgroundColor: "#1f2937" }}>
                  Seleccionar apartamento
                </MenuItem>
                {contratoToRenew ? (
                  <MenuItem value={contratoToRenew.apartamento_id} style={{ backgroundColor: "#1f2937" }}>
                    {contratoToRenew.apartamento_nombre} - {contratoToRenew.apartamento_direccion}
                  </MenuItem>
                ) : (
                  apartamentos.map((apt) => (
                    <MenuItem key={apt.id} value={apt.id} style={{ backgroundColor: "#1f2937" }}>
                      {getApartamentoDisplayName(apt)} - {formatCurrency(apt.valor_arriendo)}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            {!contratoToRenew && apartamentos.length === 0 && (
              <Alert severity="warning" sx={{ bgcolor: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <Typography variant="caption" sx={{ color: "#fbbf24" }}>
                  ⚠️ No hay apartamentos disponibles
                </Typography>
              </Alert>
            )}

             {/* Fechas */}
             <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
               <TextField
                 label="📅 Fecha Inicio"
                 type="date"
                 size="small"
                 fullWidth
                 value={formData.fecha_inicio}
                 onChange={handleChange("fecha_inicio")}
                 required
                 slotProps={{ inputLabel: { shrink: true } }}
                 sx={{
                   "& .MuiInputBase-root": { bgcolor: "rgba(17,24,39,0.6)" },
                   "& .MuiInputLabel-root": { color: "#9ca3af" },
                   "& .MuiInputBase-input": { color: "#f9fafb" },
                 }}
               />
               <TextField
                 label="📅 Fecha Fin"
                 type="date"
                 size="small"
                 fullWidth
                 value={formData.fecha_fin}
                 onChange={handleChange("fecha_fin")}
                 required
                 slotProps={{ inputLabel: { shrink: true } }}
                 sx={{
                   "& .MuiInputBase-root": { bgcolor: "rgba(17,24,39,0.6)" },
                   "& .MuiInputLabel-root": { color: "#9ca3af" },
                   "& .MuiInputBase-input": { color: "#f9fafb" },
                 }}
               />
             </Box>

             {/* Canon, días extra, modo cobro */}
             <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
               <TextField
                 label="💰 Canon Mensual"
                 size="small"
                 fullWidth
                 value={formData.canon_mensual}
                 onChange={handleChange("canon_mensual")}
                 required
                 placeholder="Ej: 1.500.000"
                 sx={{
                   "& .MuiInputBase-root": { bgcolor: "rgba(17,24,39,0.6)" },
                   "& .MuiInputLabel-root": { color: "#9ca3af" },
                   "& .MuiInputBase-input": { color: "#f9fafb" },
                 }}
               />
               <TextField
                 label="📆 Días de gracia para el pago"
                 type="number"
                 size="small"
                 fullWidth
                 value={formData.paymentDay}
                 onChange={handleChange("paymentDay")}
                 slotProps={{ htmlInput: { min: 0, max: 90 } }}
                 sx={{
                   "& .MuiInputBase-root": { bgcolor: "rgba(17,24,39,0.6)" },
                   "& .MuiInputLabel-root": { color: "#9ca3af" },
                   "& .MuiInputBase-input": { color: "#f9fafb" },
                 }}
               />
              <Box sx={{ gridColumn: { xs: "1 / -1", sm: "1 / -1" } }}>
                <Typography variant="caption" sx={{ color: "#fbbf24", mt: 1, display: "block" }}>
                  Indica cuántos días después del aniversario mensual se establece la fecha límite de pago.
                </Typography>
                <Typography variant="caption" sx={{ color: "#6b7280", mt: 0.5, display: "block" }}>
                  Por ejemplo, si el contrato inicia el 20 y pones 1, la fecha de cobro será el 21.
                </Typography>
              </Box>

              <FormControl size="small" fullWidth>
                <InputLabel sx={{ color: "#9ca3af" }}>🧾 Modo de cobro del canon</InputLabel>
                <Select
                  value={formData.modo_cobro}
                  label="🧾 Modo de cobro del canon"
                  onChange={handleChange("modo_cobro")}
                  sx={{
                    bgcolor: "rgba(17,24,39,0.6)",
                    "& .MuiSelect-select": { color: "#f9fafb" },
                  }}
                >
                  <MenuItem value="anticipado" style={{ backgroundColor: "#1f2937" }}>
                    Cobro Anticipado (Mes Adelantado)
                  </MenuItem>
                  <MenuItem value="fin_mes" style={{ backgroundColor: "#1f2937" }}>
                    Cobro a Mes Vencido (Fin de Mes)
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>
        </DialogContent>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
            <Button
              type="submit"
              variant="contained"
              disabled={isDisabled}
              fullWidth
              sx={{
                textTransform: "none",
                fontWeight: 600,
                background: "linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)",
                color: "#fff",
                boxShadow: "0 10px 15px -3px rgba(245, 158, 11, 0.3)",
                "&:hover": {
                  background: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
                  boxShadow: "0 20px 25px -5px rgba(245, 158, 11, 0.4)",
                },
              }}
            >
              {contratoToRenew ? "🔄 Renovar Contrato" : "Crear Contrato"}
            </Button>
            <Button
              type="button"
              variant="outlined"
              onClick={onClose}
              fullWidth
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderColor: "rgba(75,85,99,0.5)",
                color: "#d1d5db",
                "&:hover": { borderColor: "#6b7280", bgcolor: "rgba(75,85,99,0.1)" },
              }}
            >
              Cancelar
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default CrearContrato
