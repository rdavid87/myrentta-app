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
  Tooltip,
} from '@mui/material'
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Brightness4,
  Brightness7,
} from '@mui/icons-material'
import { useColorMode } from "../hooks/useMode.jsx"

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const userLogin = searchParams.get("user_login")
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

  const [step, setStep] = useState(1)
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const { mode, toggleMode } = useColorMode()

  useEffect(() => {
    if (!userLogin) navigate("/forgot-password")
  }, [userLogin, navigate])

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setOtp(value)
  }

  const handleNextStep = () => {
    if (otp.length !== 6) {
      setError("El código de verificación debe tener 6 dígitos")
      return
    }
    setError("")
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setLoading(true)
    try {
      await api.post("/auth/reset-password", {
        user_login: userLogin,
        otp,
        new_password: newPassword,
      })
      navigate("/login", {
        state: { message: "Contraseña actualizada exitosamente. Ya puedes iniciar sesión." },
      })
    } catch (err) {
      console.error("[ResetPassword] Error:", err.response?.status, err.response?.data || err.message)
      const msg = err.response?.data?.error || "Error al restablecer la contraseña"
      if (err.response?.status === 400) {
        setError(msg)
        setStep(1)
        setOtp("")
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError("")
    setResendLoading(true)
    try {
      await api.post("/auth/forgot-password", { identifier: userLogin })
      setSuccessMessage("Se reenvió un nuevo código a tu teléfono y correo electrónico")
      setTimeout(() => setSuccessMessage(""), 4000)
    } catch (err) {
      setError(err.response?.data?.error || "Error al reenviar el código")
    } finally {
      setResendLoading(false)
    }
  }

  if (!userLogin) return null

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
              {step === 1 ? "Código de" : "Nueva"}
            </Typography>
            <Typography variant="h2" sx={{ color: 'text.primary', fontWeight: 800, mb: 2 }}>
              {step === 1 ? "verificación" : "contraseña"}
            </Typography>
            <Typography variant="h5" sx={{ color: 'text.secondary', opacity: 0.9, maxWidth: 400 }}>
              {step === 1
                ? "Se envió un código a tu teléfono y correo electrónico"
                : "Elige una contraseña segura para tu cuenta"}
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
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 3 }}>
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 700,
                bgcolor: step >= 1 ? 'primary.main' : 'rgba(55, 65, 81, 0.5)',
                color: step >= 1 ? 'primary.contrastText' : 'text.secondary',
              }}>
                1
              </Box>
              <Box sx={{
                height: '2px',
                width: '24px',
                bgcolor: step >= 2 ? 'primary.main' : 'rgba(55, 65, 81, 0.5)',
              }} />
              <Box sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.875rem',
                fontWeight: 700,
                bgcolor: step >= 2 ? 'primary.main' : 'rgba(55, 65, 81, 0.5)',
                color: step >= 2 ? 'primary.contrastText' : 'text.secondary',
              }}>
                2
              </Box>
            </Box>

            <Typography sx={{ color: { xs: 'primary.contrastText', md: 'text.secondary' }, mt: 1, fontWeight: 700, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
              {step === 1 ? "Código de verificación" : "Nueva contraseña"}
            </Typography>
            <Typography sx={{ mb: 1, fontSize: { xs: '0.85rem', sm: '0.9rem' } }}>
              {step === 1
                ? "Se envió un código a tu teléfono y correo electrónico"
                : "Elige una contraseña segura para tu cuenta"}
            </Typography>

            {successMessage && (
              <Alert severity="success" sx={{ borderRadius: 2, bgcolor: 'rgba(16, 185, 129, 0.15)', color: 'success.main' }}>
                {successMessage}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {step === 1 && (
              <>
                <TextField
                  fullWidth
                  required
                  label="Código de verificación"
                  value={otp}
                  onChange={handleOtpChange}
                  inputProps={{ maxLength: 6, autoComplete: 'one-time-code' }}
                  placeholder="------"
                  variant="filled"
                  sx={{
                    '& input': {
                      textAlign: 'center',
                      fontSize: '1.5rem',
                      letterSpacing: '0.5em',
                      fontFamily: 'monospace',
                    },
                  }}
                />

                <Typography sx={{
                  color: { xs: 'primary.contrastText', md: 'text.secondary' },
                  textAlign: 'center',
                  mt: 1,
                  fontSize: { xs: '0.8rem', sm: '0.85rem' },
                }}>
                  Ingresa los 6 dígitos del código enviado
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    disabled={loading}
                    variant="contained"
                    sx={{
                      flex: 1,
                      py: { xs: 1.2, sm: 1.5 },
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                      bgcolor: 'rgba(55, 65, 81, 0.6)',
                      '&:hover': {
                        bgcolor: 'rgba(55, 65, 81, 0.8)',
                      },
                    }}
                  >
                    Atrás
                  </Button>
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    disabled={otp.length !== 6}
                    variant="contained"
                    sx={{
                      flex: 1,
                      py: { xs: 1.2, sm: 1.5 },
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    Continuar
                  </Button>
                </Box>

                <Typography sx={{
                  color: { xs: 'primary.contrastText', md: 'text.secondary' },
                  textAlign: 'center',
                  mt: 1,
                  fontSize: { xs: '0.85rem', sm: '0.875rem' }
                }}>
                  ¿No recibiste el código?{' '}
                  <Button
                    type="button"
                    onClick={handleResend}
                    disabled={resendLoading}
                    sx={{
                      color: { xs: 'primary.contrastText', md: 'primary.main' },
                      textTransform: 'none',
                      fontWeight: 600,
                      fontSize: 'inherit',
                      minWidth: 0,
                      p: 0,
                    }}
                  >
                    {resendLoading ? "Enviando..." : "Reenviar código"}
                  </Button>
                </Typography>
              </>
            )}

            {step === 2 && (
              <>
                <TextField
                  fullWidth
                  required
                  label="Nueva contraseña"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite la contraseña"
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
                            onClick={() => setShowConfirm(!showConfirm)}
                            edge="end"
                            size="small"
                          >
                            {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                {confirmPassword && newPassword !== confirmPassword && (
                  <Typography sx={{ color: 'error.main', fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
                    Las contraseñas no coinciden
                  </Typography>
                )}

                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Button
                    type="button"
                    onClick={() => { setStep(1); setError("") }}
                    disabled={loading}
                    variant="contained"
                    sx={{
                      flex: 1,
                      py: { xs: 1.2, sm: 1.5 },
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                      bgcolor: 'rgba(55, 65, 81, 0.6)',
                      '&:hover': {
                        bgcolor: 'rgba(55, 65, 81, 0.8)',
                      },
                    }}
                  >
                    Atrás
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading || !newPassword || !confirmPassword}
                    variant="contained"
                    startIcon={
                      loading ? (
                        <CircularProgress size={20} color="inherit" sx={{ opacity: 0.9 }} />
                      ) : (
                        <LockIcon fontSize="small" />
                      )
                    }
                    sx={{
                      flex: 1,
                      py: { xs: 1.2, sm: 1.5 },
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      borderRadius: '8px',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                  </Button>
                </Box>
              </>
            )}

            <Typography sx={{ mt: 2, fontSize: { xs: '0.75rem', sm: '0.8rem' } }}>
              ¿Algo salió mal?{' '}
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
                Volver al inicio
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

export default ResetPassword