import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

const Logo = ({ size = "medium" }) => {
  const sizeConfig = {
    small: { fontSize: "1rem", subFontSize: "0.7rem", ml: 0.25, mt: 0.1 },
    medium: { fontSize: "1.25rem", subFontSize: "0.8rem", ml: 0.5, mt: 0.25 },
    large: { fontSize: "1.5rem", subFontSize: "0.875rem", ml: 0.75, mt: 0.3 },
    xlarge: { fontSize: "3rem", subFontSize: "1.5rem", ml: 1, mt: 0.4 },
  }

  const { fontSize, subFontSize, ml, mt } = sizeConfig[size] || sizeConfig.medium

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        lineHeight: 1,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <Box component="span" sx={{ color: "primary.main", fontWeight: 700, fontSize }}>
          My
        </Box>
        <Box component="span" sx={{ color: "text.secondary", fontWeight: 700, fontSize }}>
          Rentta
        </Box>
      </Box>
      <Typography
        component="span"
        variant="caption"
        sx={{ color: "text.disabled", ml, mt, fontSize: subFontSize }}
      >
        in safe hands
      </Typography>
    </Box>
  )
}

export default Logo