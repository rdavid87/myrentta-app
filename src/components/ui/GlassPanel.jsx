import { Box } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { glassSurface } from "./glassStyles"

const GlassPanel = ({ children, sx = {}, glow = true, ...props }) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        ...glassSurface(theme, { glow }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  )
}

export default GlassPanel
