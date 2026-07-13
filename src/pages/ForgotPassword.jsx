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
  Tooltip,
} from '@mui/material'
import {
  Person as PersonIcon,
  LockReset as LockResetIcon,
  Brightness4,
  Brightness7,
} from '@mui/icons-material'
import { useColorMode } from "../hooks/useMode.jsx"

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { mode, toggleMode } = useColorMode()

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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url('${import.meta.env.BASE_URL + 'images/background.png'}')`,
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
                ¿Olvidaste tu contraseña?
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ color: 'text.secondary', opacity: 0.9, maxWidth: 400 }}>
              Ingresa tu correo o número de cédula y te enviaremos un código de verificación para restablecer tu contraseña.
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

            <Typography sx={{ color: { xs: 'primary.contrastText', md: 'text.secondary' }, mt: 1, fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              Recuperar contraseña
            </Typography>
            <Typography sx={{ mb: 1, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
              Ingresa tu correo o número de cédula y te enviaremos un código de verificación
            </Typography>

            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <TextField
              fullWidth
              required
              label="Correo o Número de identificación"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="correo@ejemplo.com o número de cédula"
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

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={20} color="inherit" sx={{ opacity: 0.9 }} />
                ) : (
                  <LockResetIcon fontSize="small" />
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
              {loading ? 'Enviando código...' : 'Enviar código de verificación'}
            </Button>

            <Typography sx={{
              color: { xs: 'primary.contrastText', md: 'text.secondary' },
              textAlign: 'center',
              mt: 1,
              fontSize: { xs: '0.85rem', sm: '0.875rem' }
            }}>
              ¿Recordaste tu contraseña?{' '}
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
                Iniciar sesión
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

export default ForgotPassword
