import { useState, useEffect } from "react"
import api from "../services/api"
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
  Chip,
  Avatar,
  Paper,
  CircularProgress,
} from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import {
  AttachMoney as AttachMoneyIcon,
  Business as BusinessIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  PeopleTwoTone as PeopleTwoToneIcon,
} from "@mui/icons-material"
import PercentIcon from "@mui/icons-material/Percent"
import MoneyOffCsredIcon from "@mui/icons-material/MoneyOffCsred"
import HomeWorkIcon from "@mui/icons-material/HomeWork"

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

      const disponibles = apartamentos.filter(a => a.estado === "disponible").length
      const arrendados = apartamentos.filter(a => a.estado !== "disponible").length
      const contratosActivos = contratos.filter(c => c.estado === "activo").length

      const hoy = new Date()
      const VENTANA_DIAS = 30
      const limitePorVencer = fechaLimiteVentanaDias(hoy, VENTANA_DIAS)
      const porVencer = contratos.filter(
        c => c.estado === "activo" && contratoVenceEnVentana(c.fecha_fin, VENTANA_DIAS, hoy)
      ).length

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

      const pagosOrdenados = [...pagos]
        .filter(p => p.estado === "pagado")
        .sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago))
        .slice(0, 5)
      setRecentPayments(pagosOrdenados)

      const pendientes = pagos
        .filter(p => p.estado === "pendiente" || p.estado === "en_mora")
        .slice(0, 5)
      setUpcomingPayments(pendientes)
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

  const sectionCardSx = (accent) => ({
    height: "100%",
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    borderRadius: 2.5,
    borderColor: "divider",
    borderLeft: 4,
    borderLeftColor: accent,
    bgcolor: "background.default",
    backgroundImage: (t) =>
      `linear-gradient(135deg, ${t.palette.mode === "dark" ? "rgba(82,139,158,0.08)" : "rgba(8,145,178,0.06)"} 0%, transparent 55%)`,
    boxShadow: "none",
    overflow: "hidden",
  })

  const paymentRowSx = (accent) => ({
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 1.5,
    p: { xs: 1.25, sm: 1.5 },
    border: 1,
    borderColor: "divider",
    borderLeft: 4,
    borderLeftColor: accent,
    borderRadius: 2,
    minWidth: 0,
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    bgcolor: (t) =>
      t.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)",
    transition: "background-color 0.15s ease",
    "&:hover": {
      bgcolor: alpha(theme.palette.background.paper, 0.8),
    },
  })

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress size={64} sx={{ color: "primary.main" }} />
      </Box>
    )
  }

  const ocupacion =
    stats.totalApartamentos > 0
      ? Math.round((stats.apartamentosOcupados / stats.totalApartamentos) * 100)
      : 0

  return (
    <Box sx={{ minHeight: "100vh", width: "100%", maxWidth: "100%", overflowX: "hidden", boxSizing: "border-box" }}>
      <Box sx={{ maxWidth: "xl", mx: "auto", width: "100%", minWidth: 0 }}>
        <Box sx={{ mb: { xs: 2, sm: 3 }, minWidth: 0 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700 }}
          >
            Panel general
          </Typography>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, fontSize: { xs: "1.4rem", sm: "2rem" }, mt: 0.25 }}
          >
            Inicio
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Resumen de propiedades, contratos y pagos
          </Typography>
        </Box>

        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <MetricCard
              title="Ingresos del Mes"
              value={formatCurrency(stats.ingresosMes)}
              color="warning"
              badges={[`${stats.pagosDelMes} pagos recibidos`]}
              icon={<AttachMoneyIcon />}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <MetricCard
              title="Apartamentos"
              value={stats.totalApartamentos}
              color="primary"
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
              color="info"
              icon={<PeopleTwoToneIcon />}
              badges={[`${stats.contratosActivos} con contrato activo`]}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <MetricCard
              title="Pagos Pendientes"
              value={stats.pagosEnMora}
              color="error"
              icon={<MoneyOffCsredIcon />}
              badges={[`${formatCurrency(stats.totalMora)} por cobrar`]}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <MetricCard
              title="Contratos Activos"
              value={stats.contratosActivos}
              color="success"
              icon={<DescriptionIcon />}
              badges={
                stats.contratosPorVencer > 0
                  ? [`${stats.contratosPorVencer} por vencer`]
                  : ["Sin vencimientos próximos"]
              }
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <MetricCard
              title="Tasa de Ocupación"
              value={`${ocupacion}%`}
              color="secondary"
              icon={<PercentIcon />}
              badges={[`${stats.apartamentosOcupados}/${stats.totalApartamentos || 0} ocupados`]}
            />
          </Grid>
        </Grid>

        <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: { xs: 0.5, sm: 1 } }}>
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={sectionCardSx("success.main")}>
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  p: { xs: 1.5, sm: 2 },
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  minWidth: 0,
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: alpha(theme.palette.success.main, 0.18),
                    color: "success.main",
                    border: 1,
                    borderColor: alpha(theme.palette.success.main, 0.35),
                  }}
                >
                  <CheckCircleIcon fontSize="small" />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1.15rem" } }}>
                  Últimos Pagos Recibidos
                </Typography>
              </Box>
              <Box sx={{ p: { xs: 1.25, sm: 2 }, minWidth: 0 }}>
                {recentPayments.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="text.secondary">No hay pagos registrados</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    {recentPayments.map((pago, index) => (
                      <Box key={pago.id || index} sx={paymentRowSx("success.main")}>
                        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, minWidth: 0, flex: 1 }}>
                          <Avatar
                            sx={{
                              width: 36,
                              height: 36,
                              flexShrink: 0,
                              bgcolor: alpha(theme.palette.success.main, 0.18),
                              color: "success.main",
                              fontWeight: 700,
                              fontSize: "0.85rem",
                            }}
                          >
                            ✓
                          </Avatar>
                          <Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                            <Typography
                              variant="body2"
                              sx={{ color: "text.primary", fontWeight: 600 }}
                              noWrap
                            >
                              {pago.arrendatario_nombre || "Arrendatario"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: "block", wordBreak: "break-word" }}
                            >
                              {formatPaymentPeriodForList(pago)}
                            </Typography>
                            <Typography variant="caption" color="text.disabled" display="block">
                              {formatDate(pago.fecha_pago)}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "success.main",
                            fontWeight: 700,
                            flexShrink: 0,
                            textAlign: "right",
                          }}
                        >
                          {formatCurrency(pago.valor)}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={sectionCardSx("warning.main")}>
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  p: { xs: 1.5, sm: 2 },
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  minWidth: 0,
                }}
              >
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: alpha(theme.palette.warning.main, 0.18),
                    color: "warning.main",
                    border: 1,
                    borderColor: alpha(theme.palette.warning.main, 0.35),
                  }}
                >
                  <ScheduleIcon fontSize="small" />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1.15rem" } }}>
                  Pagos Pendientes
                </Typography>
              </Box>
              <Box sx={{ p: { xs: 1.25, sm: 2 }, minWidth: 0 }}>
                {upcomingPayments.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography color="text.secondary">No hay pagos pendientes</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                    {upcomingPayments.map((pago, index) => {
                      const isMora = pago.estado === "en_mora"
                      const semanticColor = isMora ? theme.palette.error.main : theme.palette.warning.main
                      const label = isMora ? "En mora" : "Pendiente"

                      return (
                        <Box key={pago.id || index} sx={paymentRowSx(semanticColor)}>
                          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, minWidth: 0, flex: 1 }}>
                            <Avatar
                              sx={{
                                width: 36,
                                height: 36,
                                flexShrink: 0,
                                bgcolor: alpha(semanticColor, 0.18),
                                color: semanticColor,
                                fontWeight: 700,
                              }}
                            >
                              {isMora ? "!" : "⏱"}
                            </Avatar>
                            <Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                              <Typography
                                variant="body2"
                                sx={{ color: "text.primary", fontWeight: 600 }}
                                noWrap
                              >
                                {pago.arrendatario_nombre || "Arrendatario"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: "block", wordBreak: "break-word" }}
                              >
                                {formatPaymentPeriodForList(pago)}
                              </Typography>
                              <Chip
                                label={label}
                                size="small"
                                sx={{
                                  mt: 0.5,
                                  height: 20,
                                  fontSize: "0.7rem",
                                  fontWeight: 600,
                                  bgcolor: alpha(semanticColor, 0.15),
                                  color: semanticColor,
                                  border: "1px solid",
                                  borderColor: alpha(semanticColor, 0.35),
                                }}
                              />
                            </Box>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: semanticColor,
                              fontWeight: 700,
                              flexShrink: 0,
                              textAlign: "right",
                            }}
                          >
                            {formatCurrency(pago.valor)}
                          </Typography>
                        </Box>
                      )
                    })}
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        </Grid>

        <Box sx={{ mt: { xs: 2, sm: 3 } }}>
          <Paper
            variant="outlined"
            sx={{
              ...sectionCardSx("primary.main"),
              p: { xs: 2, sm: 3 },
              textAlign: "center",
            }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                mx: "auto",
                mb: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.18),
                color: "primary.main",
                border: 1,
                borderColor: alpha(theme.palette.primary.main, 0.35),
                boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.08)}`,
              }}
            >
              <HomeWorkIcon />
            </Avatar>
            <Typography
              variant="subtitle1"
              sx={{
                color: "text.primary",
                fontWeight: 700,
                textAlign: "center",
                mb: 1,
                px: 1,
              }}
            >
              Sistema de Administración de Apartamentos
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                textAlign: "justify",
                textAlignLast: "center",
                mx: "auto",
                maxWidth: 520,
                px: { xs: 0.5, sm: 2 },
                mb: 2,
                lineHeight: 1.6,
              }}
            >
              Gestiona tus propiedades, arrendatarios, contratos y pagos de manera eficiente
            </Typography>
            <Chip
              label={`Actualizado: ${new Date().toLocaleString("es-CO")}`}
              size="small"
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "text.secondary",
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.25),
                fontSize: "0.7rem",
                maxWidth: "100%",
              }}
            />
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}

export default Dashboard
