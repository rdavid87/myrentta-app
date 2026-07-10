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
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
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
          {contratoToRenew ? "🔄" : "📝"}
        </Box>
        <Box component="span" sx={{ fontSize: "1.25rem" }}>
          {contratoToRenew ? "Renovar Contrato" : "Nuevo Contrato de Arrendamiento"}
        </Box>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column" }}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Arrendatario */}
            <FormControl size="small" fullWidth>
              <InputLabel sx={{ color: "#9ca3af" }}>
                Arrendatario
              </InputLabel>
              <Select
                value={formData.arrendatario_id}
                  label="Arrendatario"
                onChange={handleChange("arrendatario_id")}
                disabled={contratoToRenew}
                required
              >
                <MenuItem value="">
                  Seleccionar arrendatario
                </MenuItem>
                {contratoToRenew ? (
                  <MenuItem value={contratoToRenew.arrendatario_id}>
                    {contratoToRenew.arrendatario_nombre}
                  </MenuItem>
                ) : (
                  tenants.map((tenant) => (
                    <MenuItem key={tenant.id} value={tenant.id}>
                      {tenant.nombre_completo} - {tenant.documento_identidad}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            {!contratoToRenew && tenants.length === 0 && (
              <Alert severity="warning">
                <Typography variant="caption" >
                  ⚠️ No hay arrendatarios registrados. Crea uno en la sección Arrendatarios.
                </Typography>
              </Alert>
            )}

            {/* Apartamento */}
            <FormControl size="small" fullWidth>
              <InputLabel>🏢 Apartamento</InputLabel>
              <Select
                value={formData.apartamento_id}
                label="🏢 Apartamento"
                onChange={handleChange("apartamento_id")}
                disabled={contratoToRenew}
                required
              >
                <MenuItem value="">
                  Seleccionar apartamento
                </MenuItem>
                {contratoToRenew ? (
                  <MenuItem value={contratoToRenew.apartamento_id}>
                    {contratoToRenew.apartamento_nombre} - {contratoToRenew.apartamento_direccion}
                  </MenuItem>
                ) : (
                  apartamentos.map((apt) => (
                    <MenuItem key={apt.id} value={apt.id}>
                      {getApartamentoDisplayName(apt)} - {formatCurrency(apt.valor_arriendo)}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
            {!contratoToRenew && apartamentos.length === 0 && (
              <Alert severity="warning">
                <Typography variant="caption">
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
               />
               <TextField
                 label="📆 Días de gracia para el pago"
                 type="number"
                 size="small"
                 fullWidth
                 value={formData.paymentDay}
                 onChange={handleChange("paymentDay")}
                 slotProps={{ htmlInput: { min: 0, max: 90 } }}
               />
              <Box sx={{ gridColumn: { xs: "1 / -1", sm: "1 / -1" } }}>
                <Typography variant="caption">
                  Indica cuántos días después del aniversario mensual se establece la fecha límite de pago.
                </Typography>
                <Typography variant="caption">
                  Por ejemplo, si el contrato inicia el 20 y pones 1, la fecha de cobro será el 21.
                </Typography>
              </Box>

              <FormControl size="small" fullWidth>
                <InputLabel>🧾 Modo de cobro del canon</InputLabel>
                <Select
                  value={formData.modo_cobro}
                  label="🧾 Modo de cobro del canon"
                  onChange={handleChange("modo_cobro")}
                >
                  <MenuItem value="anticipado">
                    Cobro Anticipado (Mes Adelantado)
                  </MenuItem>
                  <MenuItem value="fin_mes">
                    Cobro a Mes Vencido (Fin de Mes)
                  </MenuItem>
                </Select>
              </FormControl>
            </Box>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="warning"
            disabled={isDisabled}
          >
            {contratoToRenew ? "🔄 Renovar Contrato" : "Crear Contrato"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default CrearContrato
