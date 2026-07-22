import { Box, IconButton, Tooltip } from "@mui/material"
import Brightness4Icon from "@mui/icons-material/Brightness4"
import Brightness7Icon from "@mui/icons-material/Brightness7"
import { alpha, useTheme } from "@mui/material/styles"
import { useColorMode } from "../../hooks/useMode.jsx"
import { glassSurface } from "../ui/glassStyles"
import AuthWelcomePanel from "./AuthWelcomePanel"
import { useAuthBackground } from "./useAuthBackground"
import FloatingWhatsApp from "../FloatingWhatsApp"

export const AuthThemeToggle = () => {
  const { mode, toggleMode } = useColorMode()

  return (
    <Tooltip title={mode === "dark" ? "Modo claro" : "Modo oscuro"}>
      <IconButton
        onClick={toggleMode}
        sx={{
          position: "fixed",
          top: 24,
          right: 24,
          zIndex: 20,
          color: "text.secondary",
          bgcolor: (t) => alpha(t.palette.background.paper, 0.6),
          backdropFilter: "blur(8px)",
          border: "1px solid",
          borderColor: "divider",
          "&:hover": {
            color: "primary.main",
            borderColor: "primary.main",
          },
        }}
      >
        {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  )
}

const AuthSplitLayout = ({
  welcomeTitle,
  welcomeDescription,
  features = [],
  children,
  maxFormWidth = 420,
}) => {
  const theme = useTheme()
  const backgroundUrl = useAuthBackground()

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: { xs: "flex-start", md: "center" },
        justifyContent: "center",
        backgroundImage: `url('${backgroundUrl}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
        overflowY: "auto",
        py: { xs: 2, sm: 3, md: 4 },
        px: { xs: 2, sm: 3 },
        boxSizing: "border-box",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          bgcolor: alpha("#000", 0.55),
          zIndex: 0,
        },
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          backgroundImage: (t) =>
            `radial-gradient(ellipse 70% 50% at 50% 0%, ${alpha(t.palette.primary.main, 0.12)} 0%, transparent 60%)`,
          zIndex: 0,
          pointerEvents: "none",
        },
      }}
    >
      <AuthThemeToggle />

      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          width: "100%",
          maxWidth: { xs: 480, md: 1100 },
          minHeight: { md: 640 },
          borderRadius: "16px",
          overflow: "hidden",
          position: "relative",
          zIndex: 1,
          ...glassSurface(theme, { intensity: 1.15 }),
          boxShadow: `0 24px 80px ${alpha("#000", 0.45)}`,
        }}
      >
        <AuthWelcomePanel
          title={welcomeTitle}
          description={welcomeDescription}
          features={features}
        />

        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            p: { xs: 3, sm: 4, md: 5 },
            minWidth: 0,
            bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.35 : 0.5),
          }}
        >
          <Box sx={{ width: "100%", maxWidth: maxFormWidth }}>{children}</Box>
        </Box>
      </Box>
      <FloatingWhatsApp />
    </Box>
  )
}

export default AuthSplitLayout
