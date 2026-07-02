"use client"

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

  const inputSx = {
    '& .MuiFilledInput-root': {
      color: 'text.primary',
      backgroundColor: 'rgba(255,255,255,0.12)',
      borderRadius: '8px',
      '& fieldset': { borderColor: 'rgba(255,255,255,0.2)' },
      '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.4)' },
      '&.Mui-focused fieldset': { borderColor: 'primary.contrastText' },
      '& input::placeholder': { color: 'rgba(255,255,255,0.6)', opacity: 0.8 },
    },
    '& .MuiInputLabel-root': {
      color: 'rgba(255,255,255,0.8)',
      '&.Mui-focused': { color: 'primary.contrastText' },
    },
    '& .MuiInputAdornment-root': {
      color: 'rgba(255,255,255,0.8)',
    },
    '& .MuiIconButton-root': {
      color: 'rgba(255,255,255,0.8)',
    },
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'background.default',
      }}
    >
      <Paper
        elevation={24}
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          width: { xs: '100%', md: 1100 },
          maxWidth: '100%',
          minHeight: { xs: 'auto', md: 650 },
          overflow: 'hidden',
          bgcolor: 'background.paper',
          borderRadius: '12px',
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 4, md: 8 },
            bgcolor: 'background.paper',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box className="logo-container-responsive">
            <Logo />
          </Box>
          <Tooltip title={mode === 'dark' ? 'Prender la luz' : 'Apagar la luz'}>
            <IconButton
              onClick={toggleMode}
              sx={{
                mt: 3,
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
        </Box>

        <Box
          sx={{
            flex: 1,
            background: 'primary.main',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            p: { xs: 3, sm: 6, md: 8 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              maxWidth: 420,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2.5,
            }}
          >
            <Logo size="xlarge" />
            <Typography sx={{ 
              color: 'primary.contrastText', 
              mb: 1,
              fontSize: '1rem',
            }}>
              Inicia sesión para continuar
            </Typography>

            {successMessage && (
              <Alert severity="success" sx={{ 
                borderRadius: 2, 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'primary.contrastText',
                '& .MuiAlert-icon': { color: 'primary.contrastText' } 
              }}>
                {successMessage}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ 
                borderRadius: 2, 
                bgcolor: 'error.main', 
                color: 'primary.contrastText',
                '& .MuiAlert-icon': { color: 'primary.contrastText' } 
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
              sx={inputSx}
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
              sx={inputSx}
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
                  color: 'primary.contrastText',
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.contrastText',
                    bgcolor: 'rgba(255,255,255,0.08)',
                    textDecoration: 'underline',
                  },
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
              size="large"
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" sx={{ opacity: 0.9 }} />
                ) : (
                  <LoginIcon fontSize="small" />
                )
              }
              sx={{
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
              }}
            >
              {loading ? 'Iniciando sesión...' : 'INICIAR SESIÓN'}
            </Button>

            <Typography sx={{ 
              color: 'primary.contrastText', 
              textAlign: 'center', 
              mt: 1 
            }}>
              ¿No tienes cuenta?{' '}
              <Button
                component={Link}
                to="/register"
                sx={{
                  color: 'primary.contrastText',
                  textTransform: 'none',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'primary.contrastText',
                    bgcolor: 'rgba(255,255,255,0.08)',
                    textDecoration: 'underline',
                  },
                }}
              >
                Regístrate aquí
              </Button>
            </Typography>

            <Typography
              sx={{
                color: 'primary.contrastText',
                textAlign: 'center',
                mt: 4,
                fontSize: '0.75rem',
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