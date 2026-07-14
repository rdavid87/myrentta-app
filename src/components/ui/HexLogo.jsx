import { Box } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"

const HexLogo = ({ size = 40 }) => {
  const theme = useTheme()
  const primary = theme.palette.primary.main

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
          fontWeight: 800,
          fontSize: size * 0.38,
          color: theme.palette.primary.contrastText,
          fontFamily: '"Plus Jakarta Sans", sans-serif',
          lineHeight: 1,
        }}
      >
        M
      </Box>
    </Box>
  )
}

export default HexLogo
