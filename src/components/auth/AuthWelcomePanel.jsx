import { Box, Typography } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import Logo from "../Logo"
import { HexLogo } from "../ui"

const AuthWelcomePanel = ({ title, description, features = [] }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === "dark"

  return (
    <Box
      sx={{
        display: { xs: "none", md: "flex" },
        flex: 1,
        flexDirection: "column",
        justifyContent: "center",
        p: { md: 5, lg: 6 },
        position: "relative",
        overflow: "hidden",
        bgcolor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.08),
        backgroundImage: (t) =>
          `radial-gradient(ellipse 90% 70% at 20% 20%, ${alpha(t.palette.primary.main, isDark ? 0.22 : 0.14)} 0%, transparent 55%),
           radial-gradient(ellipse 60% 50% at 80% 80%, ${alpha(t.palette.success.main, isDark ? 0.1 : 0.06)} 0%, transparent 50%)`,
        borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
      }}
    >
      <Box sx={{ position: "relative", zIndex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <HexLogo size={52} />
          <Logo size="large" />
        </Box>

        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            color: "text.primary",
            mb: 1.5,
            lineHeight: 1.2,
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, maxWidth: 380, lineHeight: 1.6 }}
        >
          {description}
        </Typography>

        {features.length > 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
            {features.map((feature) => (
              <Box key={feature.label} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    color: feature.color ?? "primary.main",
                    bgcolor: alpha(
                      theme.palette[feature.colorKey ?? "primary"]?.main ?? theme.palette.primary.main,
                      isDark ? 0.18 : 0.1
                    ),
                    border: `1px solid ${alpha(
                      theme.palette[feature.colorKey ?? "primary"]?.main ?? theme.palette.primary.main,
                      0.35
                    )}`,
                    boxShadow: `0 0 14px ${alpha(
                      theme.palette[feature.colorKey ?? "primary"]?.main ?? theme.palette.primary.main,
                      0.15
                    )}`,
                    "& .MuiSvgIcon-root": { fontSize: 22 },
                  }}
                >
                  {feature.icon}
                </Box>
                <Typography variant="body2" fontWeight={600} color="text.primary">
                  {feature.label}
                </Typography>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}

export default AuthWelcomePanel
