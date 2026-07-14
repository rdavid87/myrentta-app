import { Box, Typography } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"

const STATUS_MAP = {
  activo: { label: "Activo", color: "success" },
  finalizado: { label: "Finalizado", color: "text" },
  disponible: { label: "Disponible", color: "info" },
  arrendado: { label: "Arrendado", color: "warning" },
  pendiente: { label: "Pendiente", color: "warning" },
  en_mora: { label: "En mora", color: "error" },
  pagado: { label: "Pagado", color: "success" },
  sin_contrato: { label: "Sin contrato", color: "text" },
}

const StatusBadge = ({ status, label: labelOverride }) => {
  const theme = useTheme()
  const config = STATUS_MAP[status] ?? { label: status, color: "text" }
  const label = labelOverride ?? config.label
  const isNeutral = config.color === "text"
  const isDark = theme.palette.mode === "dark"
  const accent = isNeutral
    ? theme.palette.text.disabled
    : theme.palette[config.color].main

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: 1.25,
        py: 0.55,
        minHeight: 28,
        borderRadius: "6px",
        bgcolor: isDark ? alpha("#0a1210", 0.85) : alpha(accent, 0.06),
        border: `1px solid ${alpha(accent, isDark ? 0.5 : 0.4)}`,
        boxShadow: isDark
          ? `0 0 14px ${alpha(accent, 0.22)}, inset 0 0 10px ${alpha(accent, 0.08)}`
          : `0 0 8px ${alpha(accent, 0.1)}`,
      }}
    >
      <Box
        sx={{
          width: 7,
          height: 7,
          borderRadius: "2px",
          bgcolor: accent,
          flexShrink: 0,
          boxShadow: `0 0 6px ${accent}, 0 0 12px ${alpha(accent, 0.7)}`,
        }}
      />
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          color: accent,
          lineHeight: 1,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          fontSize: "0.7rem",
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

export default StatusBadge
