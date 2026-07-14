import { Box, Typography } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import { glassSurface } from "./glassStyles"

const DonutSegment = ({ segments, size = 128 }) => {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1
  const stroke = 14
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <Box sx={{ position: "relative", width: size, height: size, mx: "auto" }}>
      <Box
        component="svg"
        viewBox={`0 0 ${size} ${size}`}
        sx={{ width: size, height: size, transform: "rotate(-90deg)" }}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          stroke={alpha("#fff", 0.06)}
        />
        {segments.map((seg, i) => {
          const length = (seg.value / total) * circumference
          const dasharray = `${length} ${circumference - length}`
          const dashoffset = -offset
          offset += length
          return (
            <circle
              key={seg.key ?? i}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              strokeWidth={stroke}
              stroke={seg.color}
              strokeDasharray={dasharray}
              strokeDashoffset={dashoffset}
              strokeLinecap="butt"
            />
          )
        })}
      </Box>
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          px: 1,
        }}
      >
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem", lineHeight: 1.2 }}>
          Total mes
        </Typography>
        <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", lineHeight: 1.2 }}>
          {segments[0]?.formatTotal?.(total) ?? total}
        </Typography>
      </Box>
    </Box>
  )
}

const MonthSummaryPanel = ({ title, ingresos, pendiente, formatCurrency }) => {
  const theme = useTheme()
  const total = ingresos + pendiente
  const ingresosPct = total > 0 ? Math.round((ingresos / total) * 100) : 0
  const pendientePct = total > 0 ? 100 - ingresosPct : 0

  const segments = [
    {
      key: "ingresos",
      value: ingresos || 0.001,
      color: theme.palette.success.main,
      formatTotal: () => formatCurrency(total),
    },
    {
      key: "pendiente",
      value: pendiente || 0,
      color: theme.palette.warning.main,
    },
  ]

  if (total === 0) {
    segments[0].value = 1
    segments[1].value = 0
  }

  return (
    <Box
      sx={{
        p: 2,
        height: "fit-content",
        position: { lg: "sticky" },
        top: { lg: 16 },
        ...glassSurface(theme),
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "primary.main",
          display: "block",
          mb: 0.5,
        }}
      >
        Resumen del mes
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {title}
      </Typography>

      <DonutSegment segments={segments} />

      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1.25 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "success.main" }} />
            <Typography variant="caption" color="text.secondary">
              Ingresos
            </Typography>
          </Box>
          <Typography variant="caption" fontWeight={700}>
            {ingresosPct}% · {formatCurrency(ingresos)}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: "2px", bgcolor: "warning.main" }} />
            <Typography variant="caption" color="text.secondary">
              Pendiente
            </Typography>
          </Box>
          <Typography variant="caption" fontWeight={700}>
            {pendientePct}% · {formatCurrency(pendiente)}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default MonthSummaryPanel
