"use client"

import { useState, useRef, useEffect } from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { styled, useTheme } from "@mui/material/styles"
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
import Avatar from "@mui/material/Avatar"
import Button from "@mui/material/Button"
import useMediaQuery from "@mui/material/useMediaQuery"
import Tooltip from '@mui/material/Tooltip';

const drawerWidth = 256

const Main = styled("main", { shouldForwardProp: (prop) => prop !== "open" && prop !== "isDesktop" })(
  ({ theme, isDesktop }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
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

  const navItems = [
    { path: "/dashboard", label: "Inicio", icon: <HomeIcon /> },
    { path: "/apartamentos", label: "Apartamentos", icon: <ApartmentIcon /> },
    { path: "/arrendatarios", label: "Arrendatarios", icon: <PeopleTwoToneIcon /> },
    { path: "/contratos", label: "Contratos", icon: <DescriptionIcon /> },
    { path: "/pagos", label: "Pagos", icon: <PaymentIcon /> },
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
    <List sx={{ px: 1 }}>
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
                mx: 1,
                mb: 0.5,
                borderRadius: 2,
                "&.Mui-selected": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                },
                "&:hover": {
                  bgcolor: "action.hover",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: isActive ? "inherit" : "text.secondary",
                  minWidth: 40,
                }}
              >
                {icon}
              </ListItemIcon>
              <ListItemText
                primary={label}
                slotProps={{
                  primary: {
                    sx: {
                      fontSize: "0.875rem",
                      fontWeight: isActive ? 600 : 400,
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

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
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
            color="inherit"
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
            <Typography variant="h6" noWrap component="div" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <span style={{ color: "#06b6d4" }}>M</span>
              <span style={{ color: "#94a3b8" }}>yRentta</span>
              <Typography component="span" variant="caption" sx={{ color: "text.disabled", ml: 1 }}>
                in safe hands
              </Typography>
            </Typography>
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
                bgcolor: "background.default",
              }}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: "0.875rem",
                  bgcolor: "primary.main",
                }}
              >
                {user?.full_name?.charAt(0) || "U"}
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                {user?.full_name || "Usuario"}
              </Typography>
            </Box>
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
              width: drawerWidth,
              boxSizing: "border-box",
              bgcolor: "background.paper",
              borderRight: "1px solid",
              borderColor: "divider",
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <DrawerHeader>
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
              width: "85%",
              maxWidth: 320,
              boxSizing: "border-box",
              bgcolor: "background.paper",
            },
          }}
          variant="temporary"
          anchor="left"
          open={open}
          onClose={handleDrawerClose}
        >
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose} aria-label="close drawer">
              {theme.direction === "ltr" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          {renderNavItems(true)}
          <Divider />
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 2,
                px: 1,
                py: 1,
                borderRadius: 2,
                bgcolor: "background.default",
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: "1rem",
                  bgcolor: "primary.main",
                }}
              >
                {user?.full_name?.charAt(0) || "U"}
              </Avatar>
              <Box>
                <Typography variant="body2" color="text.primary" fontWeight={500}>
                  {user?.full_name || "Usuario"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Arrendador
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={() => {
                logout()
                handleDrawerClose()
              }}
              startIcon={<LogoutIcon />}
            >
              Cerrar Sesión
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
          <Box sx={{ maxWidth: "lg", mx: "auto", px: 3 }}>
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