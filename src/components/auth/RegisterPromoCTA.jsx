import { Box, Typography } from "@mui/material"
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt"
import ArrowForwardIcon from "@mui/icons-material/ArrowForward"
import { alpha, useTheme } from "@mui/material/styles"
import { neonBorder } from "../ui/glassStyles"

const SITE_URL = "https://myrentta.com/"

const RegisterPromoCTA = ({
  href = SITE_URL,
  title = "¿No tienes cuenta?",
  label = "Elige tu plan",
}) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === "dark"
  const accent = theme.palette.primary.main

  return (
    <Box
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 1.5,
        mt: 0.5,
        p: 1.75,
        borderRadius: "12px",
        textDecoration: "none",
        color: "inherit",
        position: "relative",
        overflow: "hidden",
        bgcolor: alpha(accent, isDark ? 0.08 : 0.06),
        backgroundImage: `linear-gradient(135deg, ${alpha(accent, isDark ? 0.14 : 0.1)} 0%, transparent 55%)`,
        ...neonBorder(theme, "primary", false),
        transition: "all 0.25s ease",
        "@media (hover: hover)": {
          "&:hover": {
            ...neonBorder(theme, "primary", true),
            transform: "translateY(-2px)",
            bgcolor: alpha(accent, isDark ? 0.12 : 0.08),
            "& .register-cta-arrow": {
              transform: "translateX(4px)",
              color: accent,
            },
          },
        },
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          color: accent,
          bgcolor: alpha(accent, isDark ? 0.18 : 0.12),
          border: `1px solid ${alpha(accent, 0.35)}`,
          boxShadow: `0 0 14px ${alpha(accent, 0.2)}`,
        }}
      >
        <PersonAddAltIcon sx={{ fontSize: 22 }} />
      </Box>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.25 }}>
          {title}
        </Typography>
        <Typography variant="body2" fontWeight={800} sx={{ color: accent, lineHeight: 1.2 }}>
          {label}
        </Typography>
      </Box>

      <ArrowForwardIcon
        className="register-cta-arrow"
        sx={{
          fontSize: 22,
          color: alpha(accent, 0.85),
          flexShrink: 0,
          transition: "transform 0.22s ease, color 0.22s ease",
        }}
      />
    </Box>
  )
}

export default RegisterPromoCTA
