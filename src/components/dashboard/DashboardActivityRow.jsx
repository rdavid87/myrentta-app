import { Box, Typography } from "@mui/material"
import SouthWestIcon from "@mui/icons-material/SouthWest"
import ScheduleIcon from "@mui/icons-material/Schedule"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import { alpha, useTheme } from "@mui/material/styles"

const formatPaymentDate = (dateString) => {
  if (!dateString) return "—"
  const raw = String(dateString).slice(0, 10)
  const [year, month, day] = raw.split("-").map(Number)
  if (!year || !month || !day) {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return "—"
    return date.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })
  }
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })
}

const statusConfig = (pago, isPending, theme) => {
  const isMora = pago.estado === "en_mora"
  if (!isPending) {
    return {
      accent: theme.palette.success.main,
      icon: <SouthWestIcon sx={{ fontSize: 22 }} />,
      thirdLine: `Pago ${formatPaymentDate(pago.fecha_pago)}`,
    }
  }
  if (isMora) {
    return {
      accent: theme.palette.error.main,
      icon: <WarningAmberIcon sx={{ fontSize: 22 }} />,
      thirdLine: "En mora",
    }
  }
  return {
    accent: theme.palette.warning.main,
    icon: <ScheduleIcon sx={{ fontSize: 22 }} />,
    thirdLine: "Pendiente",
  }
}

const DashboardActivityRow = ({ pago, variant, formatCurrency, formatPaymentPeriod }) => {
  const theme = useTheme()
  const isPending = variant === "pendiente"
  const name = pago.arrendatario_nombre || "Arrendatario"
  const periodo = formatPaymentPeriod(pago)
  const { accent, icon, thirdLine } = statusConfig(pago, isPending, theme)

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
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
      <Box
        sx={{
          width: 44,
          height: 44,
          flexShrink: 0,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(accent, theme.palette.mode === "dark" ? 0.18 : 0.12),
          color: accent,
          border: `1px solid ${alpha(accent, 0.35)}`,
          mt: 0.15,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 1.25,
            mb: 0.35,
          }}
        >
          <Typography
            variant="body2"
            fontWeight={700}
            sx={{
              lineHeight: 1.35,
              minWidth: 0,
              flex: 1,
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
          >
            {name}
          </Typography>
          <Typography
            variant="body2"
            fontWeight={800}
            sx={{
              color: accent,
              flexShrink: 0,
              whiteSpace: "nowrap",
              fontSize: { xs: "0.9rem", sm: "0.95rem" },
              lineHeight: 1.35,
            }}
          >
            {formatCurrency(pago.valor)}
          </Typography>
        </Box>

        <Typography
          variant="caption"
          title={periodo}
          sx={{
            display: "block",
            fontWeight: 600,
            color: "text.secondary",
            lineHeight: 1.4,
            mb: 0.2,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontSize: { xs: "0.72rem", sm: "0.75rem" },
          }}
        >
          {periodo}
        </Typography>

        <Typography
          variant="caption"
          color="text.disabled"
          sx={{
            display: "block",
            lineHeight: 1.35,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {thirdLine}
        </Typography>
      </Box>
    </Box>
  )
}

export default DashboardActivityRow
