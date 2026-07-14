import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Button,
} from "@mui/material"
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Login as LoginIcon,
  Apartment as ApartmentIcon,
  Payments as PaymentsIcon,
  Description as DescriptionIcon,
} from "@mui/icons-material"
import Logo from "@/components/Logo"
import AuthSplitLayout from "../components/auth/AuthSplitLayout"
import { GlassTextField, GlowButton } from "../components/ui"

const LOGIN_FEATURES = [
  { icon: <ApartmentIcon />, label: "Registro de apartamentos", colorKey: "success" },
  { icon: <PaymentsIcon />, label: "Control de pagos", colorKey: "warning" },
  { icon: <DescriptionIcon />, label: "Gestión de contratos", colorKey: "primary" },
]

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

  useEffect(() => {
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

  return (
    <AuthSplitLayout
      welcomeTitle="Bienvenido a MyRentta"
      welcomeDescription="Accede a tu cuenta para gestionar tus propiedades y administrar tus alquileres de manera eficiente y segura."
      features={LOGIN_FEATURES}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2.25 }}
      >
        <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>
          <Logo size="large" />
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          fontWeight={600}
          sx={{ textAlign: "center", mb: 0.5 }}
        >
          Inicia sesión para continuar
        </Typography>

        {successMessage && (
          <Alert severity="success" sx={{ borderRadius: "10px" }}>
            {successMessage}
          </Alert>
        )}
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

        <GlassTextField
          label="Contraseña"
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
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

        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            component={Link}
            to="/forgot-password"
            sx={{ textTransform: "none", fontWeight: 600, fontSize: "0.85rem", color: "primary.main" }}
          >
            ¿Olvidaste tu contraseña?
          </Button>
        </Box>

        <GlowButton
          type="submit"
          fullWidth
          disabled={loading}
          startIcon={
            loading ? (
              <CircularProgress size={20} color="inherit" sx={{ opacity: 0.9 }} />
            ) : (
              <LoginIcon fontSize="small" />
            )
          }
          sx={{ py: 1.35, mt: 0.5 }}
        >
          {loading ? "Iniciando sesión…" : "Iniciar sesión"}
        </GlowButton>

        <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center" }}>
          ¿No tienes cuenta?{" "}
          <Button
            component={Link}
            to="/register"
            sx={{ textTransform: "none", fontWeight: 700, color: "primary.main", fontSize: "inherit", p: 0, minWidth: 0 }}
          >
            Regístrate aquí
          </Button>
        </Typography>

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

export default Login
