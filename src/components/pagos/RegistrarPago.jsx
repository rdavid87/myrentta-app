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
  Typography,
  Box,
} from "@mui/material"

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount)
}

const RegistrarPago = ({
  open,
  onClose,
  contratos,
  formData,
  cuotasAlta,
  cuotasAltaLoading,
  onFormChange,
  onContratoChange,
  onSubmit,
  dedupeInstallmentPeriodOptions,
}) => {
  const createPeriodSlotValue =
    formData.mes !== "" && formData.anio !== ""
      ? `${formData.mes}|${formData.anio}`
      : ""

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 1,
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
        <Box component="span" sx={{ fontSize: "1.5rem" }}>💵</Box>
        <Box component="span" sx={{ fontSize: "1.25rem" }}>Registrar Nuevo Pago</Box>
      </DialogTitle>

      <Box component="form" onSubmit={onSubmit} sx={{ display: "flex", flexDirection: "column" }}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="contrato-label">Contrato</InputLabel>
            <Select
              labelId="contrato-label"
              label="Contrato"
              value={formData.contrato_id}
              onChange={(e) => onContratoChange(e.target.value)}
              required
            >
              <MenuItem value="">Seleccionar contrato</MenuItem>
              {contratos.map((contrato) => (
                <MenuItem key={contrato.id} value={contrato.id}>
                  {contrato.arrendatario_nombre} - {contrato.apartamento_nombre} ({formatCurrency(contrato.canon_mensual)}/mes)
                </MenuItem>
              ))}
            </Select>
            {contratos.length === 0 && (
              <Typography variant="caption" color="warning" sx={{ mt: 1 }}>
                No hay contratos activos
              </Typography>
            )}
          </FormControl>

          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "2fr 1fr" }, gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="periodo-label">Periodo</InputLabel>
              <Select
                labelId="periodo-label"
                label="Periodo"
                value={createPeriodSlotValue}
                onChange={(e) => {
                  const v = e.target.value
                  if (!v) {
                    onFormChange({ ...formData, mes: "", anio: new Date().getFullYear().toString() })
                    return
                  }
                  const [mesStr, anioStr] = v.split("|")
                  onFormChange({
                    ...formData,
                    mes: mesStr,
                    anio: anioStr || formData.anio,
                  })
                }}
                disabled={
                  !formData.contrato_id ||
                  cuotasAltaLoading ||
                  !cuotasAlta?.periodos?.length
                }
                required={!!cuotasAlta?.periodos?.length}
              >
                <MenuItem value="">
                  {!formData.contrato_id
                    ? "Primero elige contrato"
                    : cuotasAltaLoading
                      ? "Cargando períodos…"
                      : "Seleccionar período"}
                </MenuItem>
                {dedupeInstallmentPeriodOptions(cuotasAlta?.periodos, cuotasAlta?.siguiente).map((p) => {
                  const disabled = !!p.existe
                  const key = `${p.mes}|${p.anio}`
                  return (
                    <MenuItem key={key} value={key} disabled={disabled}>
                      {p.etiqueta}
                      {p.existe ? " (ya existe)" : ""}
                    </MenuItem>
                  )
                })}
              </Select>
              {formData.contrato_id && cuotasAlta && !cuotasAlta.periodos?.length ? (
                <Typography variant="caption" color="warning" sx={{ mt: 1 }}>
                  No hay meses de cobro según las fechas del contrato.
                </Typography>
              ) : null}
            </FormControl>

            <TextField
              label="Año"
              type="number"
              inputProps={{ min: "2000", max: "2100" }}
              value={formData.anio}
              onChange={(e) => onFormChange({ ...formData, anio: e.target.value })}
              required
              InputProps={{ readOnly: !!cuotasAlta?.periodos?.length }}
            />
          </Box>

          <TextField
            label="Valor"
            type="number"
            inputProps={{ step: "0.01" }}
            placeholder="250000"
            value={formData.valor}
            onChange={(e) => onFormChange({ ...formData, valor: e.target.value })}
            required
            sx={{ width: "100%" }}
          />

          <FormControl fullWidth>
            <InputLabel id="metodo-label">Método de Pago</InputLabel>
            <Select
              labelId="metodo-label"
              label="Método de Pago"
              value={formData.metodo_pago}
              onChange={(e) => onFormChange({ ...formData, metodo_pago: e.target.value })}
              required
            >
              <MenuItem value="efectivo">Efectivo</MenuItem>
              <MenuItem value="transferencia">Transferencia</MenuItem>
              <MenuItem value="cheque">Cheque</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={onClose} sx={{ color: "text.secondary" }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={contratos.length === 0}
          >
            Registrar Pago
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default RegistrarPago