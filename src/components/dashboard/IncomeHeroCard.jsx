import { Box, Typography, Chip } from "@mui/material"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import { alpha, useTheme } from "@mui/material/styles"
import { glassSurface } from "../ui/glassStyles"

const IncomeSparkline = ({ color }) => (
  <Box
    component="svg"
    viewBox="0 0 200 80"
    preserveAspectRatio="none"
    aria-hidden
    sx={{
      width: "100%",
      maxWidth: 280,
      height: 72,
      opacity: 0.9,
    }}
  >
    <defs>
      <linearGradient id="dashIncomeSparkFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.4" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M0 55 L25 48 L50 52 L75 38 L100 42 L125 28 L150 32 L175 18 L200 22 L200 80 L0 80 Z"
      fill="url(#dashIncomeSparkFill)"
    />
    <path
      d="M0 55 L25 48 L50 52 L75 38 L100 42 L125 28 L150 32 L175 18 L200 22"
      fill="none"
      stroke={color}
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ filter: `drop-shadow(0 0 6px ${color})` }}
    />
  </Box>
)

const IncomeHeroCard = ({ amount, paymentsCount, formatCurrency }) => {
  const theme = useTheme()
  const accent = theme.palette.warning.main

  return (
    <Box
      sx={{
        p: { xs: 2, md: 2.5 },
        height: "100%",
        minHeight: 280,
        display: "flex",
        flexDirection: "column",
        ...glassSurface(theme, { intensity: 1 }),
        borderColor: alpha(accent, 0.35),
        boxShadow: `0 0 32px ${alpha(accent, theme.palette.mode === "dark" ? 0.12 : 0.08)}`,
        backgroundImage: (t) =>
          `radial-gradient(ellipse 80% 60% at 100% 0%, ${alpha(accent, t.palette.mode === "dark" ? 0.12 : 0.08)} 0%, transparent 60%)`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(accent, 0.15),
            color: accent,
            border: `1px solid ${alpha(accent, 0.35)}`,
          }}
        >
          <AttachMoneyIcon sx={{ fontSize: 22 }} />
        </Box>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: accent,
          }}
        >
          Ingresos del mes
        </Typography>
      </Box>

      <Typography
        sx={{
          fontWeight: 800,
          color: accent,
          fontSize: { xs: "2rem", sm: "2.5rem", md: "2.75rem" },
          lineHeight: 1.05,
          mb: 1.5,
          textShadow: `0 0 24px ${alpha(accent, 0.35)}`,
        }}
      >
        {formatCurrency(amount)}
      </Typography>

      <Box sx={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", mb: 1 }}>
        <IncomeSparkline color={accent} />
      </Box>

      <Chip
        label={`${paymentsCount} pagos recibidos`}
        size="small"
        sx={{
          alignSelf: "flex-start",
          height: 28,
          fontWeight: 600,
          fontSize: "0.75rem",
          bgcolor: alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.06 : 0.04),
          color: "text.secondary",
          border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        }}
      />
    </Box>
  )
}

export default IncomeHeroCard
