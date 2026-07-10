"use client"

import React, { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
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
  Lock as LockIcon,
  Brightness4,
  Brightness7,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material'
import { useColorMode } from "../hooks/useMode.jsx"
import Logo from "@/components/Logo"

const ValidateOTP = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const userLogin = searchParams.get("user_login")
  const { mode, toggleMode } = useColorMode()

  const [form, setForm] = useState({
    otp: "",
  })
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [isValidUser, setIsValidUser] = useState(null)

  useEffect(() => {
    if (!userLogin) {
      setIsValidUser(false)
    } else {
      setIsValidUser(true)
    }
  }, [userLogin])

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
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setForm((prev) => ({ ...prev, otp: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (form.otp.length !== 6) {
      setError("El código de verificación debe tener 6 dígitos")
      return
    }

    setLoading(true)
    try {
      const response = await api.post("/auth/validate-otp", {
        otp: form.otp,
        user_login: userLogin,
      })

      if (response.data?.status === "success") {
        navigate("/login", {
          state: {
            message: "Cuenta verificada exitosamente. Por favor, inicia sesión."
          }
        })
      } else if (response.data?.message) {
        setError(response.data.message)
      } else {
        setError("Código de verificación inválido")
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Código de verificación inválido")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError("")
    setLoading(true)
    try {
      await api.post("/auth/resend-otp", {
        user_login: userLogin,
      })
      setSuccessMessage("Se ha enviado un nuevo código de verificación a tu teléfono")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      setError(err.response?.data?.error || "Error al reenviar el código de verificación")
    } finally {
      setLoading(false)
    }
  }

  if (isValidUser === false) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
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
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 4,
              boxShadow: '0 10px 25px rgba(239, 68, 68, 0.3)',
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 40, color: 'white' }} />
          </Box>

          <Typography variant="h4" sx={{ fontWeight: 700, color: 'white', mb: 2 }}>
            Error de validación
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 5, maxWidth: 320, mx: 'auto' }}>
            No se proporcionó el usuario para validar el código de verificación.
          </Typography>

          <Button
            component={Link}
            to="/register"
            variant="contained"
            size="large"
            startIcon={<ArrowBackIcon />}
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
            Ir a registro
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

  if (isValidUser === null) {
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
          <CircularProgress sx={{ color: '#0891b2' }} />
          <Typography sx={{ color: 'text.secondary', mt: 4 }}>Cargando...</Typography>
        </Paper>
      </Box>
    )
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
              <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 800, mb: 2 }}>
                Código de verificación de
              </Typography>
              <Logo size="large" />
            </Box>
            <Typography variant="h5" sx={{ color: 'text.secondary', opacity: 0.9, maxWidth: 400 }}>
              Se ha enviado un código de verificación a tu telefono y correo electrónico.
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
              maxWidth: { xs: '100%', sm: 380, md: 400 },
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 2, sm: 2.5 },
            }}
          >
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5, mb: 1 }}>
              <IconButton
                onClick={() => navigate("/login")}
              >
                <ArrowBackIcon />
              </IconButton>
              <Typography sx={{ mt: 1, fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                Verificar cuenta
              </Typography>
            </Box>

            <Typography sx={{ mt: 1, fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1rem' } }}>              Código de verificación
            </Typography>
            <Typography sx={{ mb: { xs: 0.5, md: 1 }, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
              Ingresa el código de 6 dígitos enviado a tu teléfono y correo.
            </Typography>

            {successMessage && (
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                {successMessage}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              required
              label="Código de verificación"
              name="otp"
              value={form.otp}
              onChange={handleChange}
              placeholder="123456"
              variant="filled"
              sx={{
                '& .MuiInputBase-input': {
                  textAlign: 'center',
                  fontSize: '2rem',
                  letterSpacing: '0.5em',
                  fontFamily: 'monospace',
                },
                '& .MuiInputAdornment-root': {
                  mr: { xs: 2, sm: 3 },
                },
              }}
              slotProps={{
                input: {
                  maxLength: 6,
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />

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
                  disabled={loading || form.otp.length !== 6}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} color="inherit" sx={{ opacity: 0.9 }} />
                    ) : (
                      <CheckCircleIcon fontSize="small" />
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
                  {loading ? 'Verificando...' : 'Verificar código'}
                </Button>
              </Grid>
            </Grid>

            <Box sx={{ textAlign: 'center', mt: { xs: 1, sm: 2 } }}>
              <Typography sx={{ fontSize: { xs: '0.85rem', sm: '0.875rem' } }}>
                ¿No recibiste el código?{" "}
                <Button
                  onClick={handleResendOTP}
                  disabled={loading}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: 'inherit',
                    p: 0,
                    minWidth: 'auto',
                  }}
                >
                  Reenviar código
                </Button>
              </Typography>
            </Box>

            <Typography sx={{
              textAlign: 'center',
              mt: { xs: 1, sm: 2 },
              fontSize: { xs: '0.85rem', sm: '0.875rem' }
            }}>
              ¿Algo salió mal?{" "}
              <Button
                component={Link}
                to="/register"
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: 'inherit',
                }}
              >
                Volver a registrar
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

export default ValidateOTP
