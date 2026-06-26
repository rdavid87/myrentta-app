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
} from '@mui/material'
import {
  Person as PersonIcon,
  LockReset as LockResetIcon,
} from '@mui/icons-material'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const { data } = await api.post("/auth/forgot-password", { identifier })
      navigate(`/reset-password?user_login=${encodeURIComponent(data.user_login)}`)
    } catch (err) {
      console.error("[ForgotPassword] Error:", err.response?.status, err.response?.data || err.message)
      setError(err.response?.data?.error || "No se encontró una cuenta con ese dato")
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
              gap: 2.5,
            }}
          >


            <Typography variant="h4" sx={{ color: 'white', fontWeight: 700, fontSize: { xs: 32, sm: 42 } }}>
              Recuperar contraseña
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.75)', mb: 1 }}>
              Ingresa tu correo o número de cédula y te enviaremos un código de verificación
            </Typography>

            {/* Alertas */}
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
              required={true}
              placeholder="correo@ejemplo.com o número de cédula"
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
                  <LockResetIcon fontSize="small" />
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
              {loading ? 'Enviando código...' : 'Enviar código de verificación'}
            </Button>

            <Typography sx={{ color: 'rgba(255,255,255,0.8)', textAlign: 'center', mt: 1 }}>
              ¿Recordaste tu contraseña?{' '}
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
                Iniciar sesión
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

export default ForgotPassword
