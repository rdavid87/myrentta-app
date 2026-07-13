"use client"

import React, { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../services/api"
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
  Grid,
  Tooltip
} from '@mui/material'
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  AssignmentTurnedIn as CheckCircleIcon,
  Brightness4,
  Brightness7,
} from '@mui/icons-material'
import Logo from "@/components/Logo"
import { useColorMode } from "../hooks/useMode.jsx"


const Register = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: "",
    user_login: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [userLogin, setUserLogin] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
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

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleChangeMobile = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10)
    setForm((prev) => ({ ...prev, phone: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setLoading(true)
    try {
      const response = await api.post("/auth/register", {
        full_name: form.full_name,
        user_login: form.user_login,
        email: form.email || undefined,
        phone: "+57" + form.phone,
        password: form.password,
      })

      setUserLogin(form.user_login)
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrarse")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
          p: 2,
        }}
      >
        <Paper
          elevation={24}
          sx={{
            maxWidth: 480,
            width: '100%',
            p: { xs: 4, sm: 6 },
            borderRadius: 4,
            textAlign: 'center',
            border: '1px solid rgba(55, 65, 81, 0.5)',
            background: 'rgba(17, 24, 39, 0.8)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              background: 'linear-gradient(135deg, #10b981, #059669)',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4,
              boxShadow: '0 10px 25px rgba(16, 185, 129, 0.3)',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 2 }}>
            ¡Registro exitoso!
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 5, maxWidth: 320, mx: 'auto' }}>
            Se ha enviado un código de verificación a tu número de teléfono. Por favor, ingrésalo para activar tu cuenta.
          </Typography>

          <Button
            component={Link}
            to={userLogin ? `/validate-otp?user_login=${encodeURIComponent(userLogin)}` : "/login?registered=true"}
            variant="contained"
            size="large"
            startIcon={<CheckCircleIcon />}
            sx={{
              background: 'linear-gradient(135deg, #0891b2 0%, #2563eb 100%)',
              color: 'white',
              px: 4,
              py: 1.5,
              fontWeight: 600,
              '&:hover': {
                background: 'linear-gradient(135deg, #0e7490 0%, #1d4ed8 100%)',
              },
            }}
          >
            Verificar cuenta
          </Button>

          <Box mt={4}>
            <Typography variant="caption" sx={{ color: 'rgba(107, 114, 128, 1)' }}>
              © 2026 Todos los derechos reservados
            </Typography>
          </Box>
        </Paper>
      </Box>
    )
  }


  return (
    <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: { xs: 'flex-start', md: 'center' },
            justifyContent: 'center',
            backgroundImage: `url('${backgroundUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'relative',
            overflowY: 'auto',
            py: { xs: 2, sm: 3, md: 0 },
            boxSizing: 'border-box',
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
          <Tooltip title={mode === 'dark' ? 'Modo claro' : 'Modo oscuro'}>
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
              maxHeight: { xs: 'none', md: 'none' },
              overflow: { xs: 'visible', md: 'hidden' },
              bgcolor: 'background.paper',
              borderRadius: { xs: '8px', sm: '12px' },
              zIndex: 1,
              position: 'relative',
              mx: { xs: 2, sm: 3, md: 'auto' },
              my: { xs: 0, sm: 0, md: 0 },
              p: { xs: 2, sm: 3, md: 4 },
              boxSizing: 'border-box',
            }}
          >
        {/* Panel Izquierdo - Solo branding visible en md+ */}
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
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: { xs: 1.5, sm: 2 }, alignItems: 'center', flexDirection: 'row' }}>
              <Typography variant="h2" sx={{ color: 'text.primary', fontWeight: 800, mb: 2 }}>
                Únete a 
              </Typography>
                <Logo size="large" />
            </Box>
            <Typography variant="h5" sx={{ color: 'text.secondary', opacity: 0.9, maxWidth: 400 }}>
              Crea tu cuenta y comienza a gestionar tus propiedades de manera eficiente y segura.
            </Typography>
          </Box>
        </Box>

        {/* Panel Derecho - Formulario */}
        <Box
          sx={{
            flex: { xs: 'none', md: 1 },
            background: { xs: 'primary.main', md: 'transparent' },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: { xs: 'flex-start', md: 'center' },
            alignItems: 'center',
            p: { xs: 2, sm: 4, md: 8 },
            position: 'relative',
            minWidth: 0,
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              maxWidth: { xs: '100%', sm: 380, md: 420 },
              width: '100%',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 2, sm: 2.5 },
              boxSizing: 'border-box',
              pb: { xs: 1, sm: 0 },
            }}
          >
            <Typography sx={{ color: { xs: 'primary.contrastText', md: 'text.secondary' }, mt: 1, fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Crear cuenta
            </Typography>
            <Typography sx={{  mb: 1, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
              Regístrate para empezar a usar MyRentta
            </Typography>

            {/* Alertas */}
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              required
              label="Nombres completos"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Juan Pérez García"
              variant="filled"
              sx={{}}
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
              required
              label="Número de identificación o usuario"
              name="user_login"
              value={form.user_login}
              onChange={handleChange}
              placeholder="1234567890"
              variant="filled"
              sx={{}}
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
              required
              label="Número de teléfono"
              name="phone"
              value={form.phone}
              onChange={handleChangeMobile}
              placeholder="3001234567"
              variant="filled"
              sx={{}}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              label="Correo electrónico"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              variant="filled"
              sx={{}}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              fullWidth
              required
              label="Contraseña"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={form.password}
              onChange={handleChange}
              placeholder="Mínimo 6 caracteres"
              variant="filled"
              sx={{}}
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

            <TextField
              fullWidth
              required
              label="Confirmar contraseña"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repite tu contraseña"
              variant="filled"
              sx={{}}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Alert
              severity="warning"
              sx={{
                borderRadius: 2,
                alignItems: 'flex-start',
                width: '100%',
                boxSizing: 'border-box',
                '& .MuiAlert-message': {
                  width: '100%',
                  minWidth: 0,
                  overflow: 'visible',
                  whiteSpace: 'normal',
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                  lineHeight: 1.45,
                  whiteSpace: 'normal',
                  overflowWrap: 'anywhere',
                  wordBreak: 'break-word',
                }}
              >
                Tu cuenta quedará pendiente de activación. El administrador la habilitará luego de confirmar tu pago.
              </Typography>
            </Alert>

            <Grid container spacing={{ xs: 1.5, sm: 2 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <Button
                  type="button"
                  onClick={() => navigate("/login")}
                  disabled={loading}
                  variant="outlined"
                  color="neutral"
                  fullWidth
                  sx={{
                py: { xs: 1.2, sm: 1.5 },
                fontSize: { xs: '0.9rem', sm: '1rem' },
                fontWeight: 700,
                letterSpacing: '0.5px',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
              }}
                >
                  Cancelar
                </Button>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" sx={{ opacity: 0.9 }} />
                    ) : (
                      <LockIcon fontSize="small" />
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
                  {loading ? 'Registrando...' : 'Crear cuenta'}
                </Button>
              </Grid>
            </Grid>
            <Typography sx={{ 
                          color: { xs: 'primary.contrastText', md: 'text.secondary' }, 
                          textAlign: 'center', 
                          mt: 1,
                          fontSize: { xs: '0.85rem', sm: '0.875rem' }
                        }}>
              ¿Ya tienes cuenta?{' '}
              <Button
                component={Link}
                to="/login"
                sx={{
                  color: { xs: 'primary.contrastText', md: 'primary.main' },
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 'inherit',
                }}
              >
                Inicia sesión
              </Button>
            </Typography>

            <Typography
              sx={{
                textAlign: 'center',
                mt: { xs: 2, sm: 3 },
                fontSize: { xs: '0.65rem', sm: '0.7rem' },
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

export default Register
