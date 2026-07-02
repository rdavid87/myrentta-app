import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"

const Logo = () => {
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
        <Box component="span" sx={{ color: "primary.main", fontWeight: 700, fontSize: "1.25rem" }}>
          My
        </Box>
        <Box component="span" sx={{ color: "text.secondary", fontWeight: 700, fontSize: "1.25rem" }}>
          Rentta
        </Box>
      </Box>
      <Typography
        component="span"
        variant="caption"
        sx={{ color: "text.disabled", ml: 0.5, mt: 0.25 }}
      >
        in safe hands
      </Typography>
    </Box>
  )
}

export default Logo
