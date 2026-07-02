import { useState, useEffect } from "react"
import api from "../services/api"
import ArrendatarioIcon from "../components/ArrendatarioIcon"
import MetricCard from "../components/utils/MetricCard"
import { formatPaymentPeriodForList } from "../utils/periodoCuota"
import {
  contratoVenceEnVentana,
  fechaLimiteVentanaDias,
  formatFechaUTC,
} from "../utils/fechas"
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Avatar,
  Paper,
} from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import {
  AttachMoney as AttachMoneyIcon,
  Business as BusinessIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  Description as DescriptionIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PeopleTwoTone as PeopleTwoToneIcon,
} from "@mui/icons-material"
import PercentIcon from '@mui/icons-material/Percent';
import MoneyOffCsredIcon from '@mui/icons-material/MoneyOffCsred';
import InsertEmoticonIcon from '@mui/icons-material/InsertEmoticon';


const Dashboard = () => {
  const theme = useTheme()
  const [stats, setStats] = useState({
    totalApartamentos: 0,
    apartamentosDisponibles: 0,
    apartamentosOcupados: 0,
    totalArrendatarios: 0,
    contratosActivos: 0,
    contratosPorVencer: 0,
    fechaLimitePorVencer: "",
    pagosDelMes: 0,
    ingresosMes: 0,
    pagosEnMora: 0,
    totalMora: 0,
  })
  const [recentPayments, setRecentPayments] = useState([])
  const [upcomingPayments, setUpcomingPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [revenueProgress, setRevenueProgress] = useState(0)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const [apartamentosRes, arrendatariosRes, contratosRes, pagosRes] = await Promise.all([
        api.get("/apartamentos"),
        api.get("/arrendatarios"),
        api.get("/contratos"),
        api.get("/pagos"),
      ])

      const apartamentos = apartamentosRes.data || []
      const arrendatarios = arrendatariosRes.data || []
      const contratos = contratosRes.data || []
      const pagos = pagosRes.data || []

      // Calcular estadísticas
      const disponibles = apartamentos.filter(a => a.estado === "disponible").length
      const arrendados = apartamentos.filter(a => a.estado !== "disponible").length
      const contratosActivos = contratos.filter(c => c.estado === "activo").length

      // Contratos por vencer: fecha_fin entre hoy y hoy+30 (días calendario UTC)
      const hoy = new Date()
      const VENTANA_DIAS = 30
      const limitePorVencer = fechaLimiteVentanaDias(hoy, VENTANA_DIAS)
      const porVencer = contratos.filter(
        c => c.estado === "activo" && contratoVenceEnVentana(c.fecha_fin, VENTANA_DIAS, hoy)
      ).length

      // Ingresos del mes calendario actual (por fecha en que se recibió el pago, no por período de arriendo)
      const mesActual = hoy.getMonth() + 1
      const anioActual = hoy.getFullYear()
      const pagoRecibidoEnMesActual = (p) => {
        if (p.estado !== "pagado" || !p.fecha_pago) return false
        const fechaStr = String(p.fecha_pago).slice(0, 10)
        const [anioStr, mesStr] = fechaStr.split("-")
        return Number(mesStr) === mesActual && Number(anioStr) === anioActual
      }
      const pagosDelMes = pagos.filter(pagoRecibidoEnMesActual)
      const ingresosMes = pagosDelMes.reduce((sum, p) => sum + (Number(p.valor) || 0), 0)

      // Pagos en mora
      const enMora = pagos.filter(p => p.estado === "en_mora" || p.estado === "pendiente")
      const totalMora = enMora.reduce((sum, p) => sum + (p.valor || 0), 0)

      setStats({
        totalApartamentos: apartamentos.length,
        apartamentosDisponibles: disponibles,
        apartamentosOcupados: arrendados,
        totalArrendatarios: arrendatarios.length,
        contratosActivos,
        contratosPorVencer: porVencer,
        fechaLimitePorVencer: formatFechaUTC(limitePorVencer),
        pagosDelMes: pagosDelMes.length,
        ingresosMes,
        pagosEnMora: enMora.length,
        totalMora,
      })

      // Últimos pagos (ordenados por fecha)
      const pagosOrdenados = [...pagos]
        .filter(p => p.estado === "pagado")
        .sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago))
        .slice(0, 5)
      setRecentPayments(pagosOrdenados)

      // Pagos pendientes
      const pendientes = pagos
        .filter(p => p.estado === "pendiente" || p.estado === "en_mora")
        .slice(0, 5)
      setUpcomingPayments(pendientes)

      // Calcular progreso de ingresos basado en el número de pagos del mes vs total de apartamentos ocupados
      const maxExpected = Math.max(arrendados, 1)
      const progress = Math.min((pagosDelMes.length / maxExpected) * 100, 100)
      setRevenueProgress(progress)

    } catch (error) {
      console.error("Error fetching dashboard data:", error)
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

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          background: `linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.grey[900]}, ${theme.palette.background.default})`,
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
    <Box
      sx={{
        minHeight: "100vh",
      }}
    >
      <Box sx={{ maxWidth: "xl", mx: "auto" }}>

        {/* Card */}
        <Grid container spacing={2} sx={{ mt: 3 }}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <MetricCard
            title="Ingresos del Mes"
            value={formatCurrency(stats.ingresosMes)}
            badges={[`${stats.pagosDelMes} pagos recibidos`]}
            icon={<AttachMoneyIcon />}
          />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <MetricCard
            title="Apartamentos"
            value={stats.totalApartamentos}
            icon={<BusinessIcon />}
            badges={[
              `${stats.apartamentosDisponibles} disponibles`,
              `${stats.apartamentosOcupados} arrendados`,
            ]}
          />
        </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <MetricCard
            title="Arrendatarios"
            value={stats.totalArrendatarios}
            icon={<PeopleTwoToneIcon />}
            badges={[`${stats.contratosActivos} con contrato activo`]}
          />
          </Grid>  
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <MetricCard
              title="Pagos Pendientes"
              value={stats.pagosEnMora}
              icon={<MoneyOffCsredIcon />}
              badges={[`${formatCurrency(stats.totalMora)} por cobrar`]}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <MetricCard
              title="Contratos Activos"
              value={stats.contratosActivos}
              icon={<DescriptionIcon />}
              badges={[` `]}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <MetricCard
              title="Tasa de Ocupación"
              value={`${stats.totalApartamentos > 0
                          ? Math.round((stats.apartamentosOcupados / stats.totalApartamentos) * 100)
                          : 0}%`}
              icon={<PercentIcon />}
              badges={[` `]}
            />
          </Grid>

        </Grid>

        {/* Tablas de pagos */}
        <Grid container spacing={2} sx={{ mt: 3 }}>
          {/* Últimos pagos recibidos */}
          <Grid size={{ xs: 12, md: 6, lg: 6 }}>
            <Card
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  background: `linear-gradient(90deg, ${alpha(theme.palette.success.main, 0.2)}, ${alpha(theme.palette.primary.light, 0.2)})`,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  p: { xs: 2, sm: 3 },
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
                  <CheckCircleIcon />
                  Últimos Pagos Recibidos
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {recentPayments.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Box sx={{ fontSize: "2.5rem", mb: 1 }}>💳</Box>
                    <Typography color="text.secondary">No hay pagos registrados</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {recentPayments.map((pago, index) => (
                      <Box
                        key={pago.id || index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 2,
                          bgcolor: alpha(theme.palette.grey[800], 0.3),
                          borderRadius: 2,
                          "&:hover": {
                            bgcolor: alpha(theme.palette.grey[800], 0.5),
                          },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: alpha(theme.palette.success.main, 0.2),
                              color: theme.palette.success.light,
                            }}
                          >
                            ✓
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500 }}>
                              {pago.arrendatario_nombre || "Arrendatario"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: alpha(theme.palette.primary.light, 0.7) }}>
                              {formatPaymentPeriodForList(pago)}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography variant="body2" sx={{ color: theme.palette.success.light, fontWeight: 600 }}>
                            {formatCurrency(pago.valor)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatDate(pago.fecha_pago)}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>

          {/* Pagos pendientes */}
          <Grid size={{ xs: 12, md: 6, lg: 6 }}>
            <Card
              sx={{
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  background: `linear-gradient(90deg, ${alpha(theme.palette.warning.main, 0.2)}, ${alpha(theme.palette.error.main, 0.2)})`,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  p: { xs: 2, sm: 3 },
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
                  <ScheduleIcon />
                  Pagos Pendientes
                </Typography>
              </Box>
              <Box sx={{ p: 2 }}>
                {upcomingPayments.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="text.secondary">No hay pagos pendientes</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {upcomingPayments.map((pago, index) => (
                      <Box
                        key={pago.id || index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          p: 2,
                          bgcolor: alpha(theme.palette.grey[800], 0.3),
                          borderRadius: 2,
                          "&:hover": {
                            bgcolor: alpha(theme.palette.grey[800], 0.5),
                          },
                          transition: "background-color 0.2s",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: pago.estado === "en_mora"
                                ? alpha(theme.palette.error.main, 0.2)
                                : alpha(theme.palette.warning.main, 0.2),
                              color: pago.estado === "en_mora"
                                ? theme.palette.error.light
                                : theme.palette.warning.light,
                            }}
                          >
                            {pago.estado === "en_mora" ? "!" : "⏱"}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 500 }}>
                              {pago.arrendatario_nombre || "Arrendatario"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: alpha(theme.palette.primary.light, 0.7) }}>
                              {formatPaymentPeriodForList(pago)}
                            </Typography>
                          </Box>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: pago.estado === "en_mora"
                                ? theme.palette.error.light
                                : theme.palette.warning.light,
                            }}
                          >
                            {formatCurrency(pago.valor)}
                          </Typography>
                          <Chip
                            label={pago.estado === "en_mora" ? "En mora" : "Pendiente"}
                            size="small"
                            sx={{
                              height: 20,
                              fontSize: "0.7rem",
                              bgcolor: pago.estado === "en_mora"
                                ? alpha(theme.palette.error.main, 0.2)
                                : alpha(theme.palette.warning.main, 0.2),
                              color: pago.estado === "en_mora"
                                ? theme.palette.error.light
                                : theme.palette.warning.light,
                            }}
                          />
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Footer con información */}
        <Box sx={{ mt: 4, position: "relative" }}>
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(90deg, ${alpha(theme.palette.grey[700], 0.3)}, ${alpha(theme.palette.background.default, 0.3)})`,
              borderRadius: 1,
              filter: "blur(30px)",
              opacity: 0.1,
              zIndex: 0,
            }}
          />
          <Paper
            sx={{
              position: "relative",
              zIndex: 1,
              bgcolor: alpha(theme.palette.background.paper, 0.3),
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              p: { xs: 2, sm: 3 },
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box sx={{ textAlign: { xs: "center", sm: "left" } }}>
                <Typography variant="h6" sx={{ color: "text.primary", mb: 0.5 }}>
                  🏠 Sistema de Administración de Apartamentos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Gestiona tus propiedades, arrendatarios, contratos y pagos de manera eficiente
                </Typography>
              </Box>
              <Chip
                label={`Última actualización: ${new Date().toLocaleString("es-CO")}`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.grey[800], 0.5),
                  color: "text.secondary",
                  fontSize: "0.75rem",
                }}
              />
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default Dashboard