import { Box, Typography, Avatar } from "@mui/material"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { alpha, useTheme } from "@mui/material/styles"

const getInitials = (name) => {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

const formatRelativeTime = (dateString) => {
  if (!dateString) return "—"
  const date = new Date(dateString)
  if (Number.isNaN(date.getTime())) return "—"

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diffDays = Math.round((today - target) / (1000 * 60 * 60 * 24))

  const time = date.toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit", hour12: true })
  if (diffDays === 0) return `Hoy, ${time}`
  if (diffDays === 1) return `Ayer, ${time}`
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
}

const ActivityTag = ({ label, color }) => {
  const theme = useTheme()
  return (
    <Box
      sx={{
        display: "inline-flex",
        px: 1,
        py: 0.35,
        borderRadius: "6px",
        fontSize: "0.68rem",
        fontWeight: 700,
        color,
        bgcolor: alpha(color, theme.palette.mode === "dark" ? 0.15 : 0.1),
        border: `1px solid ${alpha(color, 0.35)}`,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Box>
  )
}

const DashboardActivityRow = ({ pago, variant, formatCurrency, formatPaymentPeriod }) => {
  const theme = useTheme()
  const isPending = variant === "pendiente"
  const isMora = pago.estado === "en_mora"
  const accent = isPending ? (isMora ? theme.palette.error.main : theme.palette.warning.main) : theme.palette.success.main
  const name = pago.arrendatario_nombre || "Arrendatario"
  const apt = pago.apartamento_nombre || "Apartamento"
  const tagLabel = isPending ? (isMora ? "En mora" : "Pendiente") : "Pago de arriendo"
  const subtitle = isPending ? formatPaymentPeriod(pago) : apt

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        py: 1.5,
        px: 1,
        borderRadius: "12px",
        transition: "background-color 0.2s ease",
        "@media (hover: hover)": {
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.06 : 0.04),
          },
        },
      }}
    >
      <Avatar
        sx={{
          width: 44,
          height: 44,
          flexShrink: 0,
          bgcolor: alpha(accent, 0.2),
          color: accent,
          fontWeight: 700,
          fontSize: "0.85rem",
          border: `1px solid ${alpha(accent, 0.35)}`,
        }}
      >
        {getInitials(name)}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.35 }}>
          <Typography variant="body2" fontWeight={700} noWrap sx={{ maxWidth: { xs: 140, sm: 220 } }}>
            {name}
          </Typography>
          <ActivityTag label={tagLabel} color={accent} />
        </Box>
        <Typography variant="caption" color="text.secondary" noWrap display="block">
          {subtitle}
        </Typography>
      </Box>

      <Box sx={{ textAlign: "right", flexShrink: 0 }}>
        <Typography variant="body2" fontWeight={800} sx={{ color: accent }}>
          {formatCurrency(pago.valor)}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
          {isPending ? (isMora ? "Vencido" : "Por cobrar") : formatRelativeTime(pago.fecha_pago)}
        </Typography>
      </Box>

      <ChevronRightIcon sx={{ color: "text.disabled", fontSize: 20, flexShrink: 0, display: { xs: "none", sm: "block" } }} />
    </Box>
  )
}

export default DashboardActivityRow
