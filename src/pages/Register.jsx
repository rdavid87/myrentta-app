"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../services/api"
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Button,
  Grid,
} from "@mui/material"
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Badge as BadgeIcon,
  CheckCircle as CheckCircleIcon,
  PersonAddAlt as PersonAddAltIcon,
  Sms as SmsIcon,
  Security as SecurityIcon,
} from "@mui/icons-material"
import Logo from "@/components/Logo"
import AuthSplitLayout, { AuthThemeToggle } from "../components/auth/AuthSplitLayout"
import AuthFormSection from "../components/auth/AuthFormSection"
import LoginPromoCTA from "../components/auth/LoginPromoCTA"
import { GlassTextField, GlowButton, FormHint, FormHintText } from "../components/ui"
import { ghostButtonSx, glassSurface } from "../components/ui/glassStyles"
import { alpha, useTheme } from "@mui/material/styles"
import { useAuthBackground } from "../components/auth/useAuthBackground"

const REGISTER_FEATURES = [
  { icon: <PersonAddAltIcon />, label: "Registro rápido y sencillo", colorKey: "primary" },
  { icon: <SmsIcon />, label: "Verificación por SMS", colorKey: "success" },
  { icon: <SecurityIcon />, label: "Gestión segura de propiedades", colorKey: "warning" },
]

const Register = () => {
  const theme = useTheme()
  const navigate = useNavigate()
  const backgroundUrl = useAuthBackground()
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

    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return
    }

    setLoading(true)
    try {
      await api.post("/auth/register", {
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
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: `url('${backgroundUrl}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          p: 2,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            bgcolor: alpha("#000", 0.55),
            zIndex: 0,
          },
        }}
      >
        <AuthThemeToggle />
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: 480,
            width: "100%",
            p: { xs: 3, sm: 5 },
            textAlign: "center",
            borderRadius: "16px",
            ...glassSurface(theme, { intensity: 1.2 }),
          }}
        >
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "14px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mx: "auto",
              mb: 3,
              bgcolor: alpha(theme.palette.success.main, 0.15),
              color: "success.main",
              border: `1px solid ${alpha(theme.palette.success.main, 0.4)}`,
              boxShadow: `0 0 24px ${alpha(theme.palette.success.main, 0.25)}`,
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 40 }} />
          </Box>

          <Typography variant="h5" fontWeight={800} sx={{ mb: 1.5 }}>
            ¡Registro exitoso!
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 4, lineHeight: 1.6 }}>
            Se envió un código de verificación a tu teléfono. Ingrésalo para activar tu cuenta.
          </Typography>

          <GlowButton
            component={Link}
            to={
              userLogin
                ? `/validate-otp?user_login=${encodeURIComponent(userLogin)}`
                : "/login?registered=true"
            }
            fullWidth
            startIcon={<CheckCircleIcon />}
            color="primary"
          >
            Verificar cuenta
          </GlowButton>

          <Typography variant="caption" color="text.disabled" sx={{ display: "block", mt: 3 }}>
            © 2026 Todos los derechos reservados
          </Typography>
        </Box>
      </Box>
    )
  }

  return (
    <AuthSplitLayout
      welcomeTitle="Únete a MyRentta"
      welcomeDescription="Crea tu cuenta y comienza a gestionar tus propiedades de manera eficiente y segura."
      features={REGISTER_FEATURES}
      maxFormWidth={500}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <Box sx={{ textAlign: "center", mb: 0.25 }}>
          <Box sx={{ display: "flex", justifyContent: "center", mb: 1 }}>
            <Logo size="large" />
          </Box>
          <Typography variant="h6" fontWeight={800}>
            Crear cuenta
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Completa los 3 pasos para registrarte
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ borderRadius: "10px" }}>
            {error}
          </Alert>
        )}

        <AuthFormSection step={1} title="Datos personales">
          <GlassTextField
            label="Nombres completos"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Juan Pérez García"
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon fontSize="small" sx={{ color: "primary.main" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <GlassTextField
            label="Número de identificación o usuario"
            name="user_login"
            value={form.user_login}
            onChange={handleChange}
            placeholder="1234567890"
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <BadgeIcon fontSize="small" sx={{ color: "primary.main" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
        </AuthFormSection>

        <AuthFormSection step={2} title="Contacto">
          <Grid container spacing={1.75}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <GlassTextField
                label="Número de teléfono"
                name="phone"
                value={form.phone}
                onChange={handleChangeMobile}
                placeholder="3001234567"
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography
                          variant="caption"
                          fontWeight={700}
                          sx={{ color: "text.secondary", mr: 0.5 }}
                        >
                          +57
                        </Typography>
                        <PhoneIcon fontSize="small" sx={{ color: "primary.main" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <GlassTextField
                label="Correo electrónico (opcional)"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="correo@ejemplo.com"
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon fontSize="small" sx={{ color: "primary.main" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
          </Grid>
        </AuthFormSection>

        <AuthFormSection step={3} title="Credenciales">
          <Grid container spacing={1.75}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <GlassTextField
                label="Contraseña"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                placeholder="Mínimo 6 caracteres"
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon fontSize="small" sx={{ color: "primary.main" }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="small"
                          aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <GlassTextField
                label="Confirmar contraseña"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repite tu contraseña"
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockIcon fontSize="small" sx={{ color: "primary.main" }} />
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
          </Grid>
        </AuthFormSection>

        <FormHint tone="warning">
          <FormHintText>
            Tu cuenta quedará pendiente de activación. El administrador la habilitará después de confirmar tu pago.
          </FormHintText>
        </FormHint>

        <GlowButton
          type="submit"
          fullWidth
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" sx={{ opacity: 0.9 }} />
            ) : (
              <PersonAddAltIcon fontSize="small" />
            )
          }
          sx={{ py: 1.35 }}
        >
          {loading ? "Registrando…" : "Crear cuenta"}
        </GlowButton>

        <Button
          type="button"
          onClick={() => navigate("/login")}
          disabled={loading}
          fullWidth
          sx={{ ...ghostButtonSx(theme), py: 1.1 }}
        >
          Cancelar
        </Button>

        <LoginPromoCTA to="/login" title="¿Ya tienes cuenta?" label="Iniciar sesión" />

        <Typography variant="caption" color="text.disabled" sx={{ textAlign: "center", pt: 0.5 }}>
          © 2026 Todos los derechos reservados
        </Typography>
      </Box>
    </AuthSplitLayout>
  )
}

export default Register
