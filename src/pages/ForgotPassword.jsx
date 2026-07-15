"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  InputAdornment,
} from "@mui/material"
import {
  Person as PersonIcon,
  LockReset as LockResetIcon,
  Sms as SmsIcon,
  VerifiedUser as VerifiedUserIcon,
} from "@mui/icons-material"
import Logo from "@/components/Logo"
import AuthSplitLayout from "../components/auth/AuthSplitLayout"
import LoginPromoCTA from "../components/auth/LoginPromoCTA"
import { GlassTextField, GlowButton } from "../components/ui"

const FORGOT_FEATURES = [
  { icon: <LockResetIcon />, label: "Recuperación segura", colorKey: "primary" },
  { icon: <SmsIcon />, label: "Código por SMS", colorKey: "success" },
  { icon: <VerifiedUserIcon />, label: "Verificación de identidad", colorKey: "info" },
]

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

  return (
    <AuthSplitLayout
      welcomeTitle="¿Olvidaste tu contraseña?"
      welcomeDescription="Ingresa tu correo o número de cédula y te enviaremos un código de verificación para restablecer tu contraseña."
      features={FORGOT_FEATURES}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>
          <Logo size="large" />
        </Box>

        <Box sx={{ textAlign: "center", mb: 0.5 }}>
          <Typography variant="h6" fontWeight={800}>
            Recuperar contraseña
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Te enviaremos un código de verificación
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ borderRadius: "10px" }}>
            {error}
          </Alert>
        )}

        <GlassTextField
          label="Correo o Número de identificación"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          placeholder="correo@ejemplo.com o número de cédula"
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

        <GlowButton
          type="submit"
          fullWidth
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" sx={{ opacity: 0.9 }} />
            ) : (
              <LockResetIcon fontSize="small" />
            )
          }
          sx={{ py: 1.35, mt: 0.5 }}
        >
          {loading ? "Enviando código…" : "Enviar código de verificación"}
        </GlowButton>

        <LoginPromoCTA />

        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ textAlign: "center", mt: 2 }}
        >
          © 2026 Todos los derechos reservados
        </Typography>
      </Box>
    </AuthSplitLayout>
  )
}

export default ForgotPassword
