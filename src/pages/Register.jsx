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
  Grid
} from '@mui/material'
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  AssignmentTurnedIn as CheckCircleIcon,
} from '@mui/icons-material'


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
        phone: "+57"+form.phone,
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

        {/* Panel Derecho - Formulario */}
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
              gap: 2,
            }}
          >

            <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, fontSize: { xs: 32, sm: 42 } }}>
              Crear cuenta
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.75)', mb: 1 }}>
              Regístrate para empezar a usar MyRentta
            </Typography>

            {/* Alertas */}
            {error && (
              <Alert severity="error" sx={{ borderRadius: 2, bgcolor: 'rgba(244,63,94,0.2)', color: 'white', '& .MuiAlert-icon': { color: 'white' } }}>
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
              sx={inputSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" />
                  </InputAdornment>
                ),
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
              sx={inputSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" />
                  </InputAdornment>
                ),
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
              sx={inputSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PhoneIcon fontSize="small" />
                  </InputAdornment>
                ),
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
              sx={inputSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon fontSize="small" />
                  </InputAdornment>
                ),
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
              sx={inputSx}
              InputProps={{
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
              sx={inputSx}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />

            <Alert severity="warning">
              <Typography variant="caption" sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
                Tu cuenta quedará pendiente de activación. El administrador la habilitará luego de confirmar tu pago.
              </Typography>
            </Alert>


              <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Button
                type="button"
                onClick={() => navigate("/login")}
                disabled={loading}
                variant="outlined"
                fullWidth
                sx={{
                  borderColor: 'rgba(255,255,255,0.3)',
                  color: 'white',
                  py: 1.5,
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: 'white',
                    color: 'white',
                    bgcolor: 'rgba(255,255,255,0.05)',
                  },
                  '&.Mui-disabled': {
                    borderColor: 'rgba(255,255,255,0.2)',
                    color: 'rgba(255,255,255,0.4)',
                  },
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
                size="large"
                startIcon={
                  loading ? (
                    <CircularProgress size={20} color="inherit" sx={{ opacity: 0.9 }} />
                  ) : (
                    <LockIcon fontSize="small" />
                  )
                }
                sx={{
                  background: 'linear-gradient(90deg, #6366f1, #67e8f9)',
                  color: 'white',
                  py: 1.5,
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
                {loading ? 'Registrando...' : 'Crear cuenta'}
              </Button>
            </Grid>
            
          </Grid>
              

             
    

            <Typography sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', mt: 2 }}>
              ¿Ya tienes cuenta?{' '}
              <Button
                component={Link}
                to="/login"
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
                Inicia sesión
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

export default Register
