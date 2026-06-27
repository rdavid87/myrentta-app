"use client"

import React, { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
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
} from '@mui/material'
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
} from '@mui/icons-material'

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
    '& .MuiOutlinedInput-root': {
      color: 'text.primary',
      height: 52,
      bgcolor: 'transparent',
      '& fieldset': { borderColor: 'rgba(0,0,0,0.08)' },
      '&:hover fieldset': { borderColor: 'primary.main' },
      '&.Mui-focused fieldset': { borderColor: 'primary.main' },
      '& input::placeholder': { color: 'text.secondary', opacity: 0.7 },
    },
    '& .MuiInputLabel-root': {
      color: 'text.secondary',
      '&.Mui-focused': { color: 'primary.main' },
    },
    '& .MuiInputAdornment-root': {
      color: 'text.secondary',
    },
    '& .MuiIconButton-root': {
      color: 'text.secondary',
    },
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
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
        }}
      >
        {/* Panel Izquierdo - Solo branding */}
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
            '&::before': {
              content: '""',
              position: 'absolute',
              left: -120,
              bottom: -120,
              width: 350,
              height: 350,
              background: 'rgba(8, 145, 178, 0.05)',
              transform: 'rotate(45deg)',
              pointerEvents: 'none',
            },
          }}
        >
          <Box className="logo-container-responsive">
            <Box className="logo-wrapper">
              <Typography variant="h3" className="brand-text" sx={{ fontSize: { xs: 32, md: 42 } }}>
                <span className="accent-m">M</span>y<span className="light-text">Rentta</span>
              </Typography>
              <Typography className="brand-sub" sx={{ mb: 6 }}>
                in safe hands
              </Typography>
            </Box>
          </Box>

          
          
        </Box>

        {/* Panel Derecho - Login */}
        <Box
          sx={{
            flex: 1,
            background: 'linear-gradient(135deg, #1565c0, #1976d2, #1e88e5)',
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
            <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, fontSize: { xs: 32, sm: 42 } }}>
              Bienvenido
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.75)', mb: 1 }}>
              Inicia sesión para continuar
            </Typography>

            {/* Alertas */}
            {successMessage && (
              <Alert severity="success" sx={{ borderRadius: 2, bgcolor: 'rgba(255,255,255,0.15)', color: 'white', '& .MuiAlert-icon': { color: 'white' } }}>
                {successMessage}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2, bgcolor: 'rgba(244,63,94,0.2)', color: 'white', '& .MuiAlert-icon': { color: 'white' } }}>
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
                  color: 'rgba(255,255,255,0.9)',
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'white',
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
                background: 'linear-gradient(90deg, #6366f1, #67e8f9)',
                color: 'white',
                py: 1.5,
                fontSize: '1rem',
                fontWeight: 700,
                letterSpacing: '0.5px',
                '&:hover': {
                  background: 'linear-gradient(90deg, #4f46e5, #22d3ee)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 25px rgba(99, 102, 241, 0.35)',
                },
                transition: 'all 0.3s ease',
                '&.Mui-disabled': {
                  background: 'linear-gradient(90deg, #6366f1, #67e8f9)',
                  color: 'rgba(255,255,255,0.6)',
                },
              }}
            >
              {loading ? 'Iniciando sesión...' : 'INICIAR SESIÓN'}
            </Button>

            <Typography sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', mt: 1 }}>
              ¿No tienes cuenta?{' '}
              <Button
                component={Link}
                to="/register"
                sx={{
                  color: 'white',
                  textTransform: 'none',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': {
                    color: 'rgba(255,255,255,0.85)',
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
                color: 'rgba(255,255,255,0.45)',
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
