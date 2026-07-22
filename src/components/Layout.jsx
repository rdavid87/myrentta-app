"use client"

import { useState } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { styled, useTheme, alpha } from "@mui/material/styles"
import { useColorMode } from "../hooks/useMode.jsx"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import CssBaseline from "@mui/material/CssBaseline"
import Typography from "@mui/material/Typography"
import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"
import Brightness4Icon from "@mui/icons-material/Brightness4"
import Brightness7Icon from "@mui/icons-material/Brightness7"
import LogoutIcon from "@mui/icons-material/Logout"
import PeopleTwoToneIcon from "@mui/icons-material/PeopleTwoTone"
import HomeIcon from "@mui/icons-material/Home"
import ApartmentIcon from "@mui/icons-material/Apartment"
import DescriptionIcon from "@mui/icons-material/Description"
import PaymentIcon from "@mui/icons-material/Payment"
import HelpIcon from "@mui/icons-material/Help"
import ReceiptIcon from "@mui/icons-material/Receipt"
import Avatar from "@mui/material/Avatar"
import Button from "@mui/material/Button"
import useMediaQuery from "@mui/material/useMediaQuery"
import List from "@mui/material/List"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import Divider from "@mui/material/Divider"
import { HexLogo, NavIconButton } from "./ui"
import { glassSurface } from "./ui/glassStyles"
import FloatingWhatsApp from "./FloatingWhatsApp"

const SIDEBAR_WIDTH = 88
const SIDEBAR_WIDTH_MOBILE = 280

const Main = styled("main")(({ theme }) => ({
  flexGrow: 1,
  flexBasis: 0,
  minWidth: 0,
  width: "100%",
  maxWidth: "100%",
  boxSizing: "border-box",
  overflowX: "hidden",
  minHeight: "100vh",
  padding: theme.spacing(2),
  [theme.breakpoints.up("sm")]: {
    padding: theme.spacing(3),
    marginLeft: SIDEBAR_WIDTH,
  },
}))

const Layout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"))
  const [mobileOpen, setMobileOpen] = useState(false)
  const { mode, toggleMode } = useColorMode()

  const navItems = [
    { path: "/dashboard", label: "Inicio", icon: <HomeIcon /> },
    { path: "/apartamentos", label: "Apartamentos", icon: <ApartmentIcon /> },
    { path: "/arrendatarios", label: "Arrendatarios", icon: <PeopleTwoToneIcon /> },
    { path: "/contratos", label: "Contratos", icon: <DescriptionIcon /> },
    { path: "/pagos", label: "Pagos", icon: <PaymentIcon /> },
    { path: "/suscripcion", label: "Suscripción", icon: <ReceiptIcon /> },
    { path: "/ayuda", label: "Ayuda", icon: <HelpIcon /> },
  ]

  const isActivePath = (path) => location.pathname === path

  const sidebarPaperSx = {
    boxSizing: "border-box",
    ...glassSurface(theme, { intensity: 1.1, glow: true }),
    borderRadius: 0,
    borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
    borderTop: "none",
    borderBottom: "none",
    borderLeft: "none",
    bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.75 : 0.9),
  }

  const renderIconSidebar = () => (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        height: "100%",
        py: 2,
        gap: 0.5,
      }}
    >
      <Box
        component={Link}
        to="/dashboard"
        sx={{
          mb: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.5,
          textDecoration: "none",
        }}
        aria-label="MyRentta inicio"
      >
        <HexLogo size={40} />
        <Typography
          variant="caption"
          sx={{
            fontSize: "0.58rem",
            fontWeight: 800,
            letterSpacing: "0.04em",
            lineHeight: 1.1,
            textAlign: "center",
            color: "primary.main",
            maxWidth: 72,
          }}
        >
          MyRentta
        </Typography>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75, flex: 1 }}>
        {navItems.map(({ path, label, icon }) => (
          <NavIconButton
            key={path}
            to={path}
            label={label}
            icon={icon}
            active={isActivePath(path)}
            onClick={() => setMobileOpen(false)}
          />
        ))}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.75, mt: "auto" }}>
        <NavIconButton
          label={mode === "dark" ? "Modo claro" : "Modo oscuro"}
          icon={mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
          onClick={toggleMode}
        />
        <NavIconButton label="Cerrar sesión" icon={<LogoutIcon />} onClick={logout} />
      </Box>
    </Box>
  )

  const renderMobileNavList = () => (
    <List sx={{ px: 1.5, py: 1 }}>
      {navItems.map(({ path, label, icon }) => {
        const isActive = isActivePath(path)
        return (
          <ListItem key={path} disablePadding sx={{ mb: 0.5 }}>
            <ListItemButton
              component={Link}
              to={path}
              selected={isActive}
              onClick={() => setMobileOpen(false)}
              sx={{
                borderRadius: 2,
                color: isActive ? "primary.main" : "text.secondary",
                bgcolor: isActive ? alpha(theme.palette.primary.main, 0.12) : "transparent",
              }}
            >
              <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>{icon}</ListItemIcon>
              <ListItemText primary={label} primaryTypographyProps={{ fontWeight: isActive ? 700 : 500 }} />
            </ListItemButton>
          </ListItem>
        )
      })}
    </List>
  )

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        bgcolor: "background.default",
        backgroundImage: (t) =>
          t.palette.mode === "dark"
            ? `radial-gradient(ellipse 80% 50% at 50% -20%, ${alpha(t.palette.primary.main, 0.12)} 0%, transparent 60%)`
            : `radial-gradient(ellipse 80% 50% at 50% -20%, ${alpha(t.palette.primary.main, 0.06)} 0%, transparent 60%)`,
      }}
    >
      <CssBaseline />

      {/* Desktop: icon sidebar fijo */}
      {isDesktop && (
        <Box
          component="nav"
          aria-label="Navegación principal"
          sx={{
            width: SIDEBAR_WIDTH,
            flexShrink: 0,
            position: "fixed",
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: theme.zIndex.drawer,
            ...sidebarPaperSx,
          }}
        >
          {renderIconSidebar()}
        </Box>
      )}

      {/* Mobile: drawer con etiquetas */}
      {!isDesktop && (
        <>
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: theme.zIndex.appBar,
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1.5,
              py: 1,
              ...glassSurface(theme),
              borderRadius: 0,
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
            }}
          >
            <IconButton onClick={() => setMobileOpen(true)} aria-label="Abrir menú" edge="start">
              <MenuIcon />
            </IconButton>
            <HexLogo size={36} />
            <Box sx={{ flex: 1 }} />
            <Avatar sx={{ width: 32, height: 32, bgcolor: "primary.main", fontSize: "0.875rem" }}>
              {user?.full_name?.charAt(0) || "U"}
            </Avatar>
          </Box>

          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                ...sidebarPaperSx,
                width: SIDEBAR_WIDTH_MOBILE,
              },
            }}
          >
            <Box sx={{ p: 2, display: "flex", alignItems: "center", gap: 1.5 }}>
              <HexLogo size={40} />
              <Box>
                <Typography variant="subtitle2" fontWeight={800}>
                  MyRentta
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.full_name || "Usuario"}
                </Typography>
              </Box>
            </Box>
            <Divider />
            {renderMobileNavList()}
            <Divider sx={{ mt: 1 }} />
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
              <Button
                fullWidth
                onClick={() => {
                  toggleMode()
                  setMobileOpen(false)
                }}
                startIcon={mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
                sx={{ justifyContent: "flex-start", textTransform: "none", fontWeight: 600 }}
              >
                {mode === "dark" ? "Modo claro" : "Modo oscuro"}
              </Button>
              <Button
                fullWidth
                color="error"
                onClick={() => {
                  logout()
                  setMobileOpen(false)
                }}
                startIcon={<LogoutIcon />}
                sx={{ justifyContent: "flex-start", textTransform: "none", fontWeight: 600 }}
              >
                Cerrar sesión
              </Button>
            </Box>
          </Drawer>
        </>
      )}

      <Main sx={{ pt: { xs: 8, sm: 3 }, display: "flex", flexDirection: "column" }}>
        <Box sx={{ flex: 1 }}>
          <Outlet />
        </Box>
        <Box
          component="footer"
          sx={{
            py: 2,
            mt: 4,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
          }}
        >
          <Typography variant="caption" color="text.disabled" sx={{ display: "block", textAlign: "center" }}>
            © 2026 Sistema de Administración de Apartamentos
          </Typography>
        </Box>
      </Main>
      <FloatingWhatsApp />
    </Box>
  )
}

export default Layout
