import Button from "@mui/material/Button"
import { useTheme } from "@mui/material/styles"
import { glowButtonSx } from "./glassStyles"

const GlowButton = ({ children, color = "primary", sx = {}, ...props }) => {
  const theme = useTheme()

  return (
    <Button
      variant="contained"
      disableElevation
      sx={{ ...glowButtonSx(theme, color), ...sx }}
      {...props}
    >
      {children}
    </Button>
  )
}

export default GlowButton
