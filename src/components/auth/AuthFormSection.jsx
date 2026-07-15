import { Box, Typography } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"

const AuthFormSection = ({ step, title, children }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === "dark"

  return (
    <Box
      sx={{
        p: { xs: 1.75, sm: 2 },
        borderRadius: "12px",
        bgcolor: alpha(theme.palette.background.default, isDark ? 0.35 : 0.45),
        border: `1px solid ${alpha(theme.palette.divider, isDark ? 0.55 : 0.65)}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.75 }}>
        {step != null && (
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: "0.75rem",
              fontWeight: 800,
              color: "primary.main",
              bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
            }}
          >
            {step}
          </Box>
        )}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "primary.main",
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>{children}</Box>
    </Box>
  )
}

export default AuthFormSection
