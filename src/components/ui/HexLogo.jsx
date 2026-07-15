import { Box } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"

const HexLogo = ({ size = 40 }) => {
  const theme = useTheme()
  const primary = theme.palette.primary.main
  const letterSize = size * 0.28
  const ampSize = size * 0.18

  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        background: `linear-gradient(135deg, ${primary} 0%, ${theme.palette.primary.dark} 100%)`,
        boxShadow: `0 0 20px ${alpha(primary, 0.5)}`,
        border: `1px solid ${alpha(primary, 0.6)}`,
      }}
    >
      <Box
        component="span"
        sx={{
          display: "inline-flex",
          alignItems: "baseline",
          justifyContent: "center",
          fontWeight: 800,
          color: theme.palette.primary.contrastText,
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          lineHeight: 1,
          letterSpacing: "-0.04em",
          userSelect: "none",
        }}
      >
        <Box component="span" sx={{ fontSize: letterSize }}>
          M
        </Box>
        <Box
          component="span"
          sx={{
            fontSize: ampSize,
            fontWeight: 700,
            opacity: 0.9,
            mx: `${Math.max(0.5, size * 0.01)}px`,
            position: "relative",
            top: size * -0.01,
          }}
        >
          &
        </Box>
        <Box component="span" sx={{ fontSize: letterSize }}>
          R
        </Box>
      </Box>
    </Box>
  )
}

export default HexLogo
