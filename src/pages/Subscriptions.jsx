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
} from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import ReceiptIcon from "@mui/icons-material/Receipt"
import EventIcon from "@mui/icons-material/Event"

const Subscriptions = () => {
  const theme = useTheme()
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
    const date = new Date(dateString)
    return date.toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric" })
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

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.background.default})`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Box
            sx={{
              animation: "spin 1s linear infinite",
              borderRadius: "50%",
              height: 64,
              width: 64,
              borderBottom: "3px solid",
              borderColor: "primary.main",
              mx: "auto",
            }}
          />
          <Typography sx={{ mt: 2, color: "text.secondary" }}>Cargando...</Typography>
        </Box>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: "100vh" }}>
      <Box sx={{ maxWidth: "lg", mx: "auto" }}>
        <Typography variant="h4" sx={{ mb: 3, fontWeight: 600, color: "text.primary" }}>
          Mi Suscripción
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!subscription ? (
          <Card
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
            }}
          >
            <CardContent sx={{ textAlign: "center", py: 6 }}>
              <Typography color="text.secondary">
                No se encontró información de suscripción
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 8 }}>
              <Card
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    p: 3,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      color: "primary.main",
                    }}
                  >
                    <ReceiptIcon sx={{ fontSize: 32 }} />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, color: "text.primary" }}>
                      {subscription.plan_name}
                    </Typography>
                    <Chip
                      label={getStatusLabel(subscription.status)}
                      color={getStatusColor(subscription.status)}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Precio del plan
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
                          {formatCurrency(subscription.plan_price)}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Cantidad
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
                          {subscription.quantity}
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Precio total
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600, color: "primary.main" }}>
                          {formatCurrency(subscription.total_price)}
                        </Typography>
                      </Box>
                    </Grid>

                    {subscription.tenant_name && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Tenante
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: "text.primary" }}>
                            {subscription.tenant_name}
                          </Typography>
                        </Box>
                      </Grid>
                    )}

                    {subscription.client_code && (
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            Código de cliente
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: "text.primary" }}>
                            {subscription.client_code}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    p: 3,
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: "text.primary",
                      fontWeight: 600,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                    }}
                  >
                    <EventIcon />
                    Fechas
                  </Typography>
                </Box>

                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Fecha de inicio
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: "text.primary" }}>
                      {formatDate(subscription.start_date)}
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Fecha de fin
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500, color: "text.primary" }}>
                      {formatDate(subscription.end_date)}
                    </Typography>
                  </Box>

                  {subscription.trial_end && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Fin del periodo de prueba
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: "warning.main" }}>
                        {formatDate(subscription.trial_end)}
                      </Typography>
                    </Box>
                  )}

                  {subscription.current_period_end && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Fin del período actual
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500, color: "text.primary" }}>
                        {formatDate(subscription.current_period_end)}
                      </Typography>
                    </Box>
                  )}
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