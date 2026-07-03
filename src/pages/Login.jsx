import React, { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useColorMode } from "../hooks/useMode.jsx"
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  Tooltip,
} from '@mui/material'
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Brightness4,
  Brightness7,
} from '@mui/icons-material'
import Logo from "@/components/Logo"

const Login = () => {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { mode, toggleMode } = useColorMode()

  // Detect WebP support for background image fallback
  const [backgroundUrl, setBackgroundUrl] = React.useState(import.meta.env.BASE_URL + 'images/background.png')

  React.useEffect(() => {
    const checkWebPSupport = () => {
      const canvas = document.createElement('canvas')
      if (canvas.toDataURL('image/webp').indexOf('webp') > -1) {
        setBackgroundUrl(import.meta.env.BASE_URL + 'images/background.webp')
      }
    }
    checkWebPSupport()
  }, [])

  React.useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [location.state])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(identifier, password)
      navigate("/dashboard")
    } catch (err) {
      console.error("[Login] Error al iniciar sesión:", err.response?.status, err.response?.data || err.message)
      setError(err.response?.data?.error || "Credenciales inválidas")
    } finally {
      setLoading(false)
    }
  }


  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url('${backgroundUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 0,
        },
      }}
    >
      <Tooltip title={mode === 'dark' ? 'Prender la luz' : 'Apagar la luz'}>
        <IconButton
          onClick={toggleMode}
          sx={{
            position: 'absolute',
            top: 24,
            right: 24,
            zIndex: 10,
            color: 'text.secondary',
            border: '1px solid',
            borderColor: 'divider',
            '&:hover': {
              color: 'primary.main',
              borderColor: 'primary.main',
            },
          }}
        >
          {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
      </Tooltip>
      <Paper
        elevation={24}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          width: { xs: 'calc(100% - 32px)', sm: 'calc(100% - 48px)', md: 1100 },
          maxWidth: '100%',
          minHeight: { xs: 'auto', md: 650 },
          maxHeight: { xs: 'calc(100vh - 32px)', sm: 'calc(100vh - 48px)', md: 'auto' },
          overflow: 'hidden',
          bgcolor: 'background.paper',
          borderRadius: { xs: '8px', sm: '12px' },
          zIndex: 1,
          position: 'relative',
          mx: { xs: 2, sm: 3, md: 'auto' },
          my: { xs: 2, sm: 3, md: 0 },
          p: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {/* Sección decorativa - solo visible en md+ */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flex: 1,
            background: 'primary.main',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: 8,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
              zIndex: 0,
            },
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ color: 'text.primary', fontWeight: 800, mb: 2 }}>
              Bienvenido
            </Typography>
            <Typography variant="h5" sx={{ color: 'text.primary', opacity: 0.9, maxWidth: 400 }}>
              Accede a tu cuenta para gestionar tus propiedades y administrar tus alquileres de manera eficiente y segura.
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            flex: { xs: 'none', md: 1 },
            background: { xs: 'primary.main', md: 'transparent' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 3, sm: 6, md: 8 },
            position: 'relative',
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              maxWidth: { xs: '100%', sm: 380, md: 420 },
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 2, sm: 2.5 },
            }}
          >
            {/* Centrar el Logo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: { xs: 1.5, sm: 2 }, alignItems: 'center', flexDirection: 'column' }}>
              <Logo size="large" />
            </Box>
            <Typography sx={{ color: { xs: 'primary.contrastText', md: 'text.secondary' }, mt: 1, fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Inicia sesión para continuar
            </Typography>
            {successMessage && (
              <Alert severity="success" sx={{ 
                borderRadius: 2, 
                bgcolor: 'success.main',
                fontSize: { xs: '0.85rem', sm: '0.875rem' },
              }}>
                {successMessage}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ 
                borderRadius: 2, 
                bgcolor: 'error.main',
                fontSize: { xs: '0.85rem', sm: '0.875rem' },
              }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              label="Correo o Número de identificación"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="correo@ejemplo.com o número de cédula"
              variant="filled"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              variant="filled"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                component={Link}
                to="/forgot-password"
                sx={{
                  color: { xs: 'primary.contrastText', md: 'primary.main' },
                  textTransform: 'none',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
              >
                ¿Olvidaste tu contraseña?
              </Button>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" sx={{ opacity: 0.9 }} />
                ) : (
                  <LoginIcon fontSize="small" />
                )
              }
              sx={{
                py: { xs: 1.2, sm: 1.5 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 700,
                letterSpacing: '0.5px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? 'Iniciando sesión...' : 'INICIAR SESIÓN'}
            </Button>

            <Typography sx={{ 
              color: { xs: 'primary.contrastText', md: 'text.secondary' }, 
              textAlign: 'center', 
              mt: 1,
              fontSize: { xs: '0.85rem', sm: '0.875rem' }
            }}>
              ¿No tienes cuenta?{' '}
              <Button
                component={Link}
                to="/register"
                sx={{
                  color: { xs: 'primary.contrastText', md: 'primary.main' },
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 'inherit',
                }}
              >
                Regístrate aquí
              </Button>
            </Typography>

            <Typography
              sx={{
                color: { xs: 'primary.contrastText', md: 'text.disabled' },
                textAlign: 'center',
                mt: { xs: 3, sm: 4 },
                fontSize: { xs: '0.7rem', sm: '0.75rem' },
              }}
            >
              © 2026 Todos los derechos reservados
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Box>
  )
}

export default Login