"use client"

import { useState, useRef, useEffect } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { styled, useTheme, alpha } from "@mui/material/styles"
import { useColorMode } from "../hooks/useMode.jsx"
import Box from "@mui/material/Box"
import Drawer from "@mui/material/Drawer"
import CssBaseline from "@mui/material/CssBaseline"
import MuiAppBar from "@mui/material/AppBar"
import Toolbar from "@mui/material/Toolbar"
import List from "@mui/material/List"
import Typography from "@mui/material/Typography"
import Divider from "@mui/material/Divider"
import IconButton from "@mui/material/IconButton"
import MenuIcon from "@mui/icons-material/Menu"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import Brightness4Icon from "@mui/icons-material/Brightness4"
import Brightness7Icon from "@mui/icons-material/Brightness7"
import ListItem from "@mui/material/ListItem"
import ListItemButton from "@mui/material/ListItemButton"
import ListItemIcon from "@mui/material/ListItemIcon"
import ListItemText from "@mui/material/ListItemText"
import PeopleTwoToneIcon from '@mui/icons-material/PeopleTwoTone';
import LogoutIcon from "@mui/icons-material/Logout"
import HomeIcon from "@mui/icons-material/Home"
import ApartmentIcon from "@mui/icons-material/Apartment"
import DescriptionIcon from "@mui/icons-material/Description"
import PaymentIcon from "@mui/icons-material/Payment"
import HelpIcon from "@mui/icons-material/Help"
import ReceiptIcon from "@mui/icons-material/Receipt"
import Avatar from "@mui/material/Avatar"
import Button from "@mui/material/Button"
import useMediaQuery from "@mui/material/useMediaQuery"
import Tooltip from '@mui/material/Tooltip';
import Logo from "./Logo"

const drawerWidth = 256

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" && prop !== "isDesktop" })(
  ({ theme, isDesktop }) => ({
    flexGrow: 1,
    flexBasis: 0,
    minWidth: 0,
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    overflowX: "hidden",
    padding: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(3),
    },
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(isDesktop && {
      marginLeft: `-${drawerWidth}px`,
    }),
    minHeight: "100vh",
    variants: [
      {
        props: ({ open, isDesktop }) => open && isDesktop,
        style: {
          transition: theme.transitions.create("margin", {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginLeft: 0,
        },
      },
    ],
  })
)

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme }) => ({
  transition: theme.transitions.create(["margin", "width"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(["margin", "width"], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}))

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: "flex-end",
}))

const HoverDetectionZone = styled("div")(({ theme }) => ({
  position: "fixed",
  left: 0,
  top: 0,
  bottom: 0,
  width: "12px",
  zIndex: 1200,
}))

const Layout = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"))
  const [open, setOpen] = useState(false)
  const hoverTimeoutRef = useRef(null)
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

  const handleDrawerOpen = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setOpen(true)
  }

  const handleDrawerClose = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setOpen(false)
  }

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    setOpen(true)
  }

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 300)
  }

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Render navigation list items
  const renderNavItems = (closeOnClick = false) => (
    <List sx={{ px: 1.5, py: 1.5, display: "flex", flexDirection: "column", gap: 0.5 }}>
      {navItems.map(({ path, label, icon }) => {
        const isActive = isActivePath(path)
        return (
          <ListItem key={path} disablePadding>
            <ListItemButton
              component={Link}
              to={path}
              selected={isActive}
              onClick={closeOnClick ? handleDrawerClose : undefined}
              sx={{
                position: "relative",
                px: 1.5,
                py: 1.15,
                borderRadius: 2.5,
                border: "none",
                bgcolor: isActive
                  ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.16 : 0.1)
                  : "transparent",
                color: isActive ? "primary.main" : "text.secondary",
                transition: "background-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease",
                WebkitTapHighlightColor: "transparent",
                // Soft left glow bar for active
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 6,
                  top: "22%",
                  bottom: "22%",
                  width: 3,
                  borderRadius: 2,
                  bgcolor: isActive ? "primary.main" : "transparent",
                  boxShadow: isActive
                    ? `0 0 10px ${alpha(theme.palette.primary.main, 0.7)}`
                    : "none",
                  transition: "background-color 0.25s ease, box-shadow 0.25s ease, opacity 0.25s ease",
                },
                "&.Mui-selected": {
                  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.16 : 0.1),
                  color: "primary.main",
                },
                "@media (hover: hover) and (pointer: fine)": {
                  "&:hover": {
                    transform: "translateX(3px)",
                    bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.14 : 0.08),
                    color: "primary.main",
                    boxShadow: theme.palette.mode === "dark"
                      ? `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.35)}, 0 0 24px ${alpha(theme.palette.primary.main, 0.12)}`
                      : `inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.22)}, 0 8px 20px ${alpha(theme.palette.primary.main, 0.1)}`,
                    "&::before": {
                      bgcolor: "primary.main",
                      boxShadow: `0 0 12px ${alpha(theme.palette.primary.main, 0.75)}`,
                    },
                    "& .nav-icon-badge": {
                      color: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.22 : 0.12),
                    },
                    "& .nav-item-label": {
                      color: theme.palette.primary.main,
                      fontWeight: 700,
                    },
                  },
                },
                "&:active": {
                  bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.22 : 0.14),
                  color: "primary.main",
                  "&::before": {
                    bgcolor: "primary.main",
                    boxShadow: `0 0 12px ${alpha(theme.palette.primary.main, 0.7)}`,
                  },
                  "& .nav-icon-badge": {
                    color: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.22),
                  },
                  "& .nav-item-label": {
                    color: theme.palette.primary.main,
                    fontWeight: 700,
                  },
                },
                "&:focus-visible": {
                  outline: "none",
                  boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.4)}`,
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: "inherit",
                }}
              >
                <Box
                  className="nav-icon-badge"
                  sx={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "inherit",
                    bgcolor: isActive
                      ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.22 : 0.12)
                      : alpha(theme.palette.text.secondary, 0.06),
                    transition: "background-color 0.25s ease, color 0.25s ease",
                    "& .MuiSvgIcon-root": { fontSize: 20 },
                  }}
                >
                  {icon}
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={label}
                slotProps={{
                  primary: {
                    className: "nav-item-label",
                    sx: {
                      fontSize: "0.9rem",
                      fontWeight: isActive ? 700 : 500,
                      letterSpacing: "0.01em",
                      transition: "color 0.25s ease, font-weight 0.25s ease",
                    },
                  },
                }}
              />
            </ListItemButton>
          </ListItem>
        )
      })}
    </List>
  )

  const drawerPaperSx = {
    boxSizing: "border-box",
    borderRight: "1px solid",
    borderColor: "divider",
    bgcolor: "background.paper",
    backgroundImage: (t) =>
      `linear-gradient(180deg, ${alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.1 : 0.05)} 0%, transparent 28%)`,
  }

  const themeToggleLabel = mode === "dark" ? "Modo claro" : "Modo oscuro"
  const themeToggleHint =
    mode === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        maxWidth: "100%",
        overflowX: "hidden",
        bgcolor: "background.default",
      }}
    >
      <CssBaseline />
      
      {/* Hover detection zone for auto-open on desktop */}
      {isDesktop && (
        <HoverDetectionZone
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          aria-hidden="true"
        />
      )}
      
      <AppBar
        position="fixed"
        open={open}
        sx={{
          bgcolor: "background.paper",
          borderBottom: "1px solid",
          borderColor: "divider",
          width: {
            xs: "100%",
            sm: open ? `calc(100% - ${drawerWidth}px)` : "100%",
          },
          marginLeft: {
            xs: 0,
            sm: open ? `${drawerWidth}px` : 0,
          },
        }}
      >
        <Toolbar>
          <IconButton
            aria-label={open ? "close drawer" : "open drawer"}
            onClick={handleDrawerOpen}
            edge="start"
            sx={[
              { mr: 2 },
              open && { display: "none" },
            ]}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }}>
            <Logo />
          </Box>
          <Box sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2,
                py: 1,
                borderRadius: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                }}
              >
                {user?.full_name?.charAt(0) || "U"}
              </Avatar>
              <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                <Typography sx={{ color: "text.secondary" }}>
                  {user?.full_name || "Usuario"}
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.75rem" }}>
                  Arrendador
                </Typography>
              </Box>
            </Box>
            <Tooltip title={themeToggleHint}>
              <IconButton onClick={toggleMode} aria-label={themeToggleHint}>
                {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>
            <Tooltip title="Cerrar sesión">
              <IconButton onClick={logout} >
                <LogoutIcon color="error" />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Desktop: Persistent drawer with hover-to-show */}
      {isDesktop && (
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              ...drawerPaperSx,
              width: drawerWidth,
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <DrawerHeader>
            <Box sx={{ flex: 1, px: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "primary.main",
                }}
              >
                Navegación
              </Typography>
            </Box>
            <IconButton onClick={handleDrawerClose} aria-label="close drawer">
              {theme.direction === "ltr" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          {renderNavItems()}
        </Drawer>
      )}

      {/* Mobile: Temporary drawer with full overlay */}
      {!isDesktop && (
        <Drawer
          sx={{
            "& .MuiDrawer-paper": {
              ...drawerPaperSx,
              width: "85%",
              maxWidth: 320,
            },
          }}
          variant="temporary"
          anchor="left"
          open={open}
          onClose={handleDrawerClose}
        >
          <DrawerHeader>
            <Box sx={{ flex: 1, px: 2 }}>
              <Typography
                variant="caption"
                sx={{
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  color: "primary.main",
                }}
              >
                Menú
              </Typography>
            </Box>
            <IconButton onClick={handleDrawerClose} aria-label="close drawer">
              {theme.direction === "ltr" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          {renderNavItems(true)}
          <Divider sx={{ mt: 1, opacity: 0.5 }} />
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 2,
                px: 1.25,
                py: 1,
              }}
            >
              <Avatar
                sx={{
                  width: 42,
                  height: 42,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  fontWeight: 700,
                  boxShadow: (t) => `0 0 0 3px ${alpha(t.palette.primary.main, 0.25)}`,
                }}
              >
                {user?.full_name?.charAt(0) || "U"}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" fontWeight={700} noWrap>
                  {user?.full_name || "Usuario"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Arrendador
                </Typography>
              </Box>
            </Box>

            <Button
              fullWidth
              onClick={() => {
                toggleMode()
                handleDrawerClose()
              }}
              startIcon={mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
              sx={{
                mb: 1,
                justifyContent: "flex-start",
                py: 1.2,
                px: 1.5,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 600,
                color: "primary.main",
                border: "none",
                bgcolor: (t) => alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.12 : 0.08),
                boxShadow: "none",
                "&:hover": {
                  bgcolor: (t) => alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.2 : 0.14),
                  boxShadow: (t) => `0 0 18px ${alpha(t.palette.primary.main, 0.2)}`,
                },
              }}
            >
              {themeToggleLabel}
            </Button>

            <Button
              fullWidth
              onClick={() => {
                logout()
                handleDrawerClose()
              }}
              startIcon={<LogoutIcon />}
              sx={{
                justifyContent: "flex-start",
                py: 1.2,
                px: 1.5,
                borderRadius: 2.5,
                textTransform: "none",
                fontWeight: 600,
                color: "error.main",
                border: "none",
                bgcolor: (t) => alpha(t.palette.error.main, t.palette.mode === "dark" ? 0.12 : 0.08),
                boxShadow: "none",
                "&:hover": {
                  bgcolor: (t) => alpha(t.palette.error.main, t.palette.mode === "dark" ? 0.2 : 0.14),
                  boxShadow: (t) => `0 0 18px ${alpha(t.palette.error.main, 0.18)}`,
                },
              }}
            >
              Cerrar sesión
            </Button>
          </Box>
        </Drawer>
      )}

      <Main open={open} isDesktop={isDesktop}>
        <DrawerHeader />
        <Outlet />
        <Box
          component="footer"
          sx={{
            py: 2,
            mt: 4,
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ maxWidth: "lg", mx: "auto", width: "100%", minWidth: 0 }}>
            <Typography
              variant="caption"
              color="text.disabled"
              sx={{ display: "block", textAlign: "center" }}
            >
              © 2026 Sistema de Administración de Apartamentos
            </Typography>
          </Box>
        </Box>
      </Main>
    </Box>
  )
}

export default Layout