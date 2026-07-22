import { useState, useEffect } from "react"
import api from "../services/api"
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material"
import ReceiptIcon from "@mui/icons-material/Receipt"
import EventIcon from "@mui/icons-material/Event"
import PaymentsIcon from "@mui/icons-material/Payments"
import TagIcon from "@mui/icons-material/Tag"
import PersonIcon from "@mui/icons-material/Person"
import NumbersIcon from "@mui/icons-material/Numbers"

const Subscriptions = () => {
  const [subscription, setSubscription] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchSubscription()
  }, [])

  const fetchSubscription = async () => {
    try {
      const response = await api.get("/subscriptions/user/me")
      setSubscription(response.data)
    } catch (error) {
      console.error("Error fetching subscription:", error)
      setError("No se pudo cargar la información de la suscripción")
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const [year, month, day] = dateString.split("-").map(Number)
    if (!year || !month || !day) return "-"
    return new Date(year, month - 1, day).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
  }

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success"
      case "trial":
        return "warning"
      case "canceled":
      case "cancelled":
        return "error"
      case "past_due":
      case "pending":
        return "warning"
      default:
        return "primary"
    }
  }

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "Activo"
      case "trial":
        return "Prueba"
      case "canceled":
      case "cancelled":
        return "Cancelado"
      case "past_due":
      case "pending":
        return "Pendiente"
      default:
        return status || "Desconocido"
    }
  }

  const getStatusAccent = (status) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "success.main"
      case "trial":
      case "past_due":
      case "pending":
        return "warning.main"
      case "canceled":
      case "cancelled":
        return "error.main"
      default:
        return "primary.main"
    }
  }

  const labelSx = {
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    fontWeight: 600,
  }

  const cardSx = (accent) => ({
    borderRadius: 2.5,
    borderColor: "divider",
    borderLeft: 4,
    borderLeftColor: accent,
    bgcolor: "background.default",
    backgroundImage: (theme) =>
      `linear-gradient(135deg, ${theme.palette.mode === "dark" ? "rgba(82,139,158,0.08)" : "rgba(8,145,178,0.06)"} 0%, transparent 55%)`,
    boxShadow: "none",
    overflow: "hidden",
  })

  const panelSx = {
    display: "flex",
    flexDirection: "column",
    gap: 1.25,
    py: 1.5,
    px: 1.5,
    borderRadius: 2,
    bgcolor: (theme) =>
      theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)",
    border: 1,
    borderColor: "divider",
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress size={64} sx={{ color: "primary.main" }} />
      </Box>
    )
  }

  const accent = subscription ? getStatusAccent(subscription.status) : "primary.main"
  const statusColor = subscription ? getStatusColor(subscription.status) : "primary"

  return (
    <Box sx={{ minHeight: "100vh", py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 2 } }}>
      <Box sx={{ maxWidth: "lg", mx: "auto" }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 700, color: "text.primary" }}>
          Mi Suscripción
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {!subscription ? (
          <Card variant="outlined" sx={cardSx("text.disabled")}>
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <Avatar
                sx={{
                  width: 56,
                  height: 56,
                  mx: "auto",
                  mb: 2,
                  bgcolor: (theme) =>
                    theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(15,23,42,0.06)",
                  color: "text.secondary",
                }}
              >
                <ReceiptIcon />
              </Avatar>
              <Typography color="text.secondary">
                No se encontró información de suscripción
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card variant="outlined" sx={cardSx(accent)}>
                <Box
                  sx={{
                    p: 2.5,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    borderBottom: 1,
                    borderColor: "divider",
                  }}
                >
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: accent,
                      color: `${statusColor}.contrastText`,
                      fontWeight: 700,
                      boxShadow: (theme) =>
                        `0 0 0 3px ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
                    }}
                  >
                    <ReceiptIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary" }} noWrap>
                      {subscription.plan_name}
                    </Typography>
                    <Chip
                      label={getStatusLabel(subscription.status)}
                      color={statusColor}
                      size="small"
                      sx={{ mt: 0.75, fontWeight: 600 }}
                    />
                  </Box>
                </Box>

                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                  <Box sx={panelSx}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PaymentsIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography variant="caption" color="text.secondary" sx={labelSx}>
                          Precio del plan
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(subscription.plan_price)}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                        pt: 1,
                        mt: 0.25,
                        borderTop: 1,
                        borderColor: "divider",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PaymentsIcon sx={{ fontSize: 16, color: "warning.main" }} />
                        <Typography variant="caption" color="text.secondary" sx={labelSx}>
                          Precio total
                        </Typography>
                      </Box>
                      <Typography variant="h6" fontWeight="bold" color="warning.main">
                        {formatCurrency(subscription.total_price)}
                      </Typography>
                    </Box>

                    {subscription.tenant_name && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 16, color: "primary.main" }} />
                          <Typography variant="caption" color="text.secondary" sx={labelSx}>
                            Cliente
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="medium" color="primary.main" noWrap>
                          {subscription.tenant_name}
                        </Typography>
                      </Box>
                    )}

                    {subscription.client_code && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <TagIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                          <Typography variant="caption" color="text.secondary" sx={labelSx}>
                            Código
                          </Typography>
                        </Box>
                        <Typography variant="body2" fontWeight="medium">
                          {subscription.client_code}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card variant="outlined" sx={cardSx("primary.main")}>
                <Box
                  sx={{
                    p: 2.5,
                    borderBottom: 1,
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(82,139,158,0.28)" : "rgba(8,145,178,0.14)",
                      color: "primary.main",
                      border: 1,
                      borderColor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(82,139,158,0.5)" : "rgba(8,145,178,0.35)",
                    }}
                  >
                    <EventIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary" }}>
                    Fechas
                  </Typography>
                </Box>

                <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
                  <Box sx={panelSx}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={labelSx}>
                        Inicio
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(subscription.start_date)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={labelSx}>
                        Fin
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(subscription.end_date)}
                      </Typography>
                    </Box>

                    {subscription.trial_end && (
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 2,
                          pt: 1,
                          borderTop: 1,
                          borderColor: "divider",
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" sx={labelSx}>
                          Fin prueba
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="warning.main">
                          {formatDate(subscription.trial_end)}
                        </Typography>
                      </Box>
                    )}

                    {subscription.current_period_end && (
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={labelSx}>
                          Fin período
                        </Typography>
                        <Typography variant="body2" fontWeight="medium" color="primary.main">
                          {formatDate(subscription.current_period_end)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Box>
  )
}

export default Subscriptions
