import { useTheme, alpha } from "@mui/material/styles"
import Box from "@mui/material/Box"
import Dialog from "@mui/material/Dialog"
import DialogTitle from "@mui/material/DialogTitle"
import DialogContent from "@mui/material/DialogContent"
import DialogActions from "@mui/material/DialogActions"
import Typography from "@mui/material/Typography"
import TextField from "@mui/material/TextField"
import Button from "@mui/material/Button"
import Select from "@mui/material/Select"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import InputLabel from "@mui/material/InputLabel"
import Divider from "@mui/material/Divider"
import { formatPaymentPeriodForList } from "../../utils/periodoCuota"

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(amount)
}

const ConfirmarPago = ({ open, onClose, pagoToConfirm, confirmarData, onConfirmarChange, onConfirmarSubmit }) => {
  const theme = useTheme()

  const handleChange = (field) => (e) => {
    onConfirmarChange({ ...confirmarData, [field]: e.target.value })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: {
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
            display: "flex",
            flexDirection: "column",
            maxHeight: "95vh",
          }
        }
      }}
    >
      <DialogTitle sx={{ 
        color: "text.primary", 
        fontWeight: 700, 
        display: "flex", 
        alignItems: "center", 
        gap: 1,
        borderBottom: "1px solid",
        borderColor: "divider",
        pb: 2,
      }}>
        <Box component="span" sx={{ fontSize: "1.5rem" }}>✅</Box>
        <Box component="span" sx={{ fontSize: "1.25rem" }}>Confirmar Pago</Box>
      </DialogTitle>

      <Box component="form" onSubmit={onConfirmarSubmit} sx={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 3, overflowY: "auto", flex: 1 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: "background.default",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.25 }}>
                  Arrendatario
                </Typography>
                <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500 }}>
                  {pagoToConfirm?.arrendatario_nombre}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.25 }}>
                  Apartamento
                </Typography>
                <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500 }}>
                  {pagoToConfirm?.apartamento_nombre}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.25 }}>
                  Período
                </Typography>
                <Typography variant="body2" sx={{ color: "secondary.light", fontWeight: 500 }}>
                  {formatPaymentPeriodForList(pagoToConfirm)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.25 }}>
                  Valor a pagar
                </Typography>
                <Typography variant="body2" sx={{ color: "success.light", fontWeight: 600 }}>
                  {formatCurrency(pagoToConfirm?.valor)}
                </Typography>
              </Box>
            </Box>
            {pagoToConfirm && !["efectivo", "transferencia", "cheque"].includes(pagoToConfirm.metodo_pago) && (
              <Box sx={{ mt: 2, p: 1.5, borderRadius: 1, bgcolor: alpha(theme.palette.warning.main, 0.15), border: "1px solid", borderColor: alpha(theme.palette.warning.main, 0.3) }}>
                <Typography variant="caption" sx={{ color: "warning.light" }}>
                  La cuota venía con método <strong>por definir</strong>; indica abajo cómo se cobró al confirmar.
                </Typography>
              </Box>
            )}
          </Box>

          <TextField
            label="📅 Fecha de Pago"
            type="date"
            value={confirmarData.fecha_pago}
            onChange={handleChange("fecha_pago")}
            required
            sx={{ width: "100%" }}
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth>
            <InputLabel id="confirmar-metodo-label">💳 Método de Pago</InputLabel>
            <Select
              labelId="confirmar-metodo-label"
              label="💳 Método de Pago"
              value={confirmarData.metodo_pago}
              onChange={handleChange("metodo_pago")}
              required
            >
              <MenuItem value="efectivo">💵 Efectivo</MenuItem>
              <MenuItem value="transferencia">💳 Transferencia</MenuItem>
              <MenuItem value="cheque">📄 Cheque</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <Divider sx={{ borderColor: "divider" }} />

        <DialogActions sx={{ px: 3, py: 2, gap: 1 }}>
          <Button onClick={onClose} sx={{ color: "text.secondary" }}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="success"
          >
            ✅ Confirmar Pago
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default ConfirmarPago
