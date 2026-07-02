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

const EditarPago = ({ open, onClose, pagoToEdit, editFormData, onEditFormChange, onEditSubmit }) => {

  const handleChange = (field) => (e) => {
    onEditFormChange({ ...editFormData, [field]: e.target.value })
  }

  const renderMetodoOptions = () => [
    <MenuItem key="por_definir" value="por_definir">Por definir</MenuItem>,
    <MenuItem key="efectivo" value="efectivo">💵 Efectivo</MenuItem>,
    <MenuItem key="transferencia" value="transferencia">💳 Transferencia</MenuItem>,
    <MenuItem key="cheque" value="cheque">📄 Cheque</MenuItem>,
  ]

  const renderEstadoOptions = () => {
    if (pagoToEdit?.estado === "pagado") {
      return [
        <MenuItem key="pendiente" value="pendiente">Pendiente (revertir cobro)</MenuItem>,
        <MenuItem key="en_mora" value="en_mora">En mora (revertir cobro)</MenuItem>,
      ]
    }
    return [
      <MenuItem key="pendiente" value="pendiente">Pendiente</MenuItem>,
      <MenuItem key="en_mora" value="en_mora">En mora</MenuItem>,
      <MenuItem key="pagado" value="pagado">Pagado (sin usar Confirmar)</MenuItem>,
    ]
  }

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
        <Box component="span" sx={{ fontSize: "1.5rem" }}>✏️</Box>
        <Box component="span" sx={{ fontSize: "1.25rem" }}>Editar pago</Box>
      </DialogTitle>

      <Box sx={{ px: 3, pt: 0, pb: 1 }}>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {pagoToEdit?.arrendatario_nombre} · {pagoToEdit?.apartamento_nombre}
        </Typography>
      </Box>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {pagoToEdit?.estado === "pagado"
              ? "Este pago está confirmado. Elige Pendiente o En mora para revertir el cobro (se borrará la fecha de pago en el sistema)."
              : "El período del pago no se puede cambiar aquí. Ajusta valor, método y estado. Para marcar como Pagado sin usar «Confirmar», elige estado Pagado e indica la fecha."}
          </Typography>
        </Box>

        <Box>
          <Typography variant="body2" sx={{ mb: 0.5, color: "text.primary", fontWeight: 500 }}>
            Periodo
          </Typography>
          <Box
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: 1,
            }}
          >
            {pagoToEdit ? `${pagoToEdit.mes}/${pagoToEdit.anio}` : ""}
          </Box>
          {pagoToEdit?.estado === "pagado" && (
            <Typography variant="caption" sx={{ mt: 0.5, color: "text.secondary", display: "block" }}>
              No puedes cambiar mes/año mientras el pago siga marcado como pagado en el servidor.
            </Typography>
          )}
        </Box>

        <TextField
          label="Valor"
          type="number"
          inputProps={{ step: "0.01", min: "0" }}
          value={editFormData.valor}
          onChange={handleChange("valor")}
          required
          sx={{ width: "100%" }}
        />

        <FormControl fullWidth>
          <InputLabel id="edit-metodo-label">Método de pago</InputLabel>
          <Select
            labelId="edit-metodo-label"
            label="Método de pago"
            value={editFormData.metodo_pago}
            onChange={handleChange("metodo_pago")}
            required
          >
            {renderMetodoOptions()}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="edit-estado-label">Estado</InputLabel>
          <Select
            labelId="edit-estado-label"
            label="Estado"
            value={editFormData.estado}
            onChange={handleChange("estado")}
          >
            {renderEstadoOptions()}
          </Select>
        </FormControl>

        {pagoToEdit?.estado !== "pagado" && editFormData.estado === "pagado" && (
          <Box>
            <TextField
              label="Fecha del cobro"
              type="date"
              value={editFormData.fecha_pago}
              onChange={handleChange("fecha_pago")}
              required={editFormData.estado === "pagado"}
              sx={{ width: "100%" }}
              InputLabelProps={{ shrink: true }}
            />
            <Typography variant="caption" sx={{ mt: 0.5, color: "text.secondary", display: "block" }}>
              Obligatorio al pasar el estado a Pagado desde esta pantalla.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button onClick={onClose} sx={{ color: "text.secondary" }}>
          Cancelar
        </Button>
        <Button
          onClick={onEditSubmit}
          variant="contained"
          sx={{
            bgcolor: "info.main",
            color: "primary.contrastText",
            "&:hover": {
              bgcolor: "info.dark",
            },
          }}
        >
          Guardar cambios
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditarPago
