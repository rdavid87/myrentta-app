import { Box, Typography } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import Sparkline from "./Sparkline"
import { glassSurface } from "./glassStyles"

const FinanceStatCard = ({ value, label, icon, color = "primary", trend, sparkId }) => {
  const theme = useTheme()
  const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(color)
  const mainColor = isHex ? color : theme.palette[color]?.main ?? theme.palette.primary.main
  const uniqueId = sparkId ?? `fin-${label}`.replace(/\s/g, "-").toLowerCase()
  const trendUp = trend?.startsWith("+")
  const trendDown = trend?.startsWith("-")

  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        p: 2,
        height: "100%",
        minHeight: 112,
        ...glassSurface(theme, { intensity: 0.9 }),
        transition: "transform 0.2s ease, box-shadow 0.25s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: `0 0 28px ${alpha(mainColor, theme.palette.mode === "dark" ? 0.18 : 0.12)}`,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: mainColor,
            bgcolor: alpha(mainColor, theme.palette.mode === "dark" ? 0.18 : 0.1),
            border: `1px solid ${alpha(mainColor, 0.35)}`,
            "& .MuiSvgIcon-root": { fontSize: 22 },
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 800,
              lineHeight: 1.1,
              color: "text.primary",
              fontSize: { xs: "1.35rem", sm: "1.65rem" },
            }}
          >
            {value}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, fontWeight: 500 }}>
            {label}
          </Typography>
          {trend && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 0.35,
                fontWeight: 600,
                color: trendUp ? "success.main" : trendDown ? "error.main" : "text.disabled",
              }}
            >
              {trend}
            </Typography>
          )}
        </Box>
      </Box>
      <Sparkline color={mainColor} id={uniqueId} />
    </Box>
  )
}

export default FinanceStatCard
