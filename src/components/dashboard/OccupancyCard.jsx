import { Box, Typography } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import { glassSurface } from "../ui/glassStyles"

const OccupancyDonut = ({ percent, occupied, total, size = 160 }) => {
  const theme = useTheme()
  const accent = theme.palette.success.main
  const stroke = 16
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const occupiedLength = (percent / 100) * circumference
  const emptyLength = circumference - occupiedLength

  return (
    <Box
      component="svg"
      viewBox={`0 0 ${size} ${size}`}
      sx={{
        width: size,
        height: size,
        transform: "rotate(-90deg)",
        filter: `drop-shadow(0 0 12px ${alpha(accent, 0.45)})`,
      }}
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        stroke={alpha(theme.palette.text.primary, 0.08)}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        stroke={accent}
        strokeDasharray={`${occupiedLength} ${emptyLength}`}
        strokeLinecap="round"
      />
    </Box>
  )
}

const OccupancyCard = ({ percent, occupied, total }) => {
  const theme = useTheme()
  const accent = theme.palette.success.main

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
      }}
    >
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          color: accent,
          mb: 2,
        }}
      >
        Ocupación del portafolio
      </Typography>

      <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <OccupancyDonut percent={percent} occupied={occupied} total={total} size={168} />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            pointerEvents: "none",
          }}
        >
          <Typography sx={{ fontWeight: 800, fontSize: "2rem", lineHeight: 1, color: accent }}>
            {percent}%
          </Typography>
          <Typography
            variant="caption"
            sx={{
              mt: 0.5,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "text.secondary",
              fontSize: "0.65rem",
            }}
          >
            Ocupación
          </Typography>
        </Box>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mt: 2, fontWeight: 600 }}>
        {occupied} de {total} ocupados
      </Typography>
    </Box>
  )
}

export default OccupancyCard
