import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Divider,
} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close"
import { alpha, useTheme } from "@mui/material/styles"
import { glassDialogPaperSx } from "./glassStyles"

const GlassDialog = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  actions,
  maxWidth = "sm",
}) => {
  const theme = useTheme()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={maxWidth}
      slotProps={{
        paper: {
          sx: glassDialogPaperSx(theme),
        },
      }}
    >
      <DialogTitle sx={{ px: 3, pt: 2.5, pb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}>
          {icon && (
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: "10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: "primary.main",
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                boxShadow: `0 0 12px ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              {icon}
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
            <Typography
              variant="h6"
              sx={{ fontWeight: 800, fontFamily: '"Plus Jakarta Sans", sans-serif', lineHeight: 1.25 }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.35 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            aria-label="Cerrar"
            sx={{
              color: "text.secondary",
              border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
              borderRadius: "8px",
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider sx={{ borderColor: alpha(theme.palette.divider, 0.5), mx: 3 }} />

      <DialogContent sx={{ px: 3, py: 2.5, display: "flex", flexDirection: "column", gap: 3 }}>
        {children}
      </DialogContent>

      {actions && (
        <DialogActions sx={{ px: 3, pb: 2.5, pt: 0, gap: 1 }}>{actions}</DialogActions>
      )}
    </Dialog>
  )
}

export default GlassDialog
