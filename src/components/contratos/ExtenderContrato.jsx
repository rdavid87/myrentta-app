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
} from "@mui/material"
import TimerIcon from "@mui/icons-material/Timer"

const ExtenderContrato = ({
  open,
  onClose,
  contratoToExtend,
  nuevaFechaFin,
  onNuevaFechaFinChange,
  onSubmit,
  formatDate,
}) => {
  const [localFechaFin, setLocalFechaFin] = useState("")

  useEffect(() => {
    if (open && contratoToExtend) {
      setLocalFechaFin(nuevaFechaFin)
    }
  }, [open, contratoToExtend, nuevaFechaFin])

  const handleFechaChange = (e) => {
    const value = e.target.value
    setLocalFechaFin(value)
    if (onNuevaFechaFinChange) {
      onNuevaFechaFinChange(value)
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
      open={open && !!contratoToExtend}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
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
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: "rgba(245, 158, 11, 0.2)",
            }}
          >
            <TimerIcon sx={{ color: "#fbbf24", fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Extender Contrato
            </Typography>
            <Typography variant="body2" sx={{ color: "#9ca3af", mt: 0.25 }}>
              Solo se modificará la fecha de fin del contrato
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", my: 1 }} />

      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Paper
              elevation={0}
              sx={{
                bgcolor: "rgba(55, 65, 81, 0.3)",
                border: "1px solid rgba(75, 85, 99, 0.4)",
                borderRadius: 2,
                p: 2.5,
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  Arrendatario
                </Typography>
                <Typography variant="body2" sx={{ color: "#e5e7eb", fontWeight: 500 }}>
                  {contratoToExtend?.arrendatario_nombre}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  Apartamento
                </Typography>
                <Typography variant="body2" sx={{ color: "#e5e7eb", fontWeight: 500 }}>
                  {contratoToExtend?.apartamento_nombre}
                </Typography>
              </Box>
              <Divider sx={{ borderColor: "rgba(255,255,255,0.06)" }} />
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="caption" sx={{ color: "#9ca3af" }}>
                  Fecha de fin actual
                </Typography>
                <Typography variant="body2" sx={{ color: "#34d399", fontWeight: 600 }}>
                  {contratoToExtend && formatDate(contratoToExtend.fecha_fin)}
                </Typography>
              </Box>
            </Paper>

            <TextField
              label="Nueva Fecha de Fin"
              type="date"
              size="small"
              fullWidth
              value={localFechaFin}
              onChange={handleFechaChange}
              required
              sx={{
                "& .MuiInputBase-root": { bgcolor: "rgba(17,24,39,0.6)" },
                "& .MuiInputLabel-root": { color: "#9ca3af" },
                "& .MuiInputBase-input": { color: "#f9fafb" },
              }}
              slotProps={{ inputLabel: { shrink: true } }}
            />
            <Typography variant="caption" sx={{ color: "#6b7280" }}>
              La fecha debe ser posterior a la fecha de fin actual
            </Typography>
          </Box>
        </DialogContent>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />

        <DialogActions sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", gap: 2, width: "100%" }}>
            <Button
              type="submit"
              variant="contained"
              color="warning"
              fullWidth
            >
              Extender Contrato
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="neutral"
              onClick={onClose}
              fullWidth
            >
              Cancelar
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default ExtenderContrato
