import { Box } from "@mui/material"
import { alpha } from "@mui/material/styles"

const Sparkline = ({ color, id = "spark" }) => (
  <Box
    component="svg"
    viewBox="0 0 120 40"
    preserveAspectRatio="none"
    aria-hidden
    sx={{
      position: "absolute",
      right: 8,
      bottom: 8,
      width: 72,
      height: 32,
      opacity: 0.55,
      pointerEvents: "none",
    }}
  >
    <defs>
      <linearGradient id={`${id}Fill`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.35" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M0 28 L20 24 L40 30 L60 18 L80 22 L100 12 L120 8 L120 40 L0 40 Z"
      fill={`url(#${id}Fill)`}
    />
    <path
      d="M0 28 L20 24 L40 30 L60 18 L80 22 L100 12 L120 8"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity={0.8}
    />
  </Box>
)

export const sparklineColor = (theme, colorKey = "primary") =>
  theme.palette[colorKey]?.main ?? theme.palette.primary.main

export default Sparkline
