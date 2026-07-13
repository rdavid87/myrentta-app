import { useState, useEffect } from "react"
import api from "../services/api"
import { formatPaymentPeriodForList } from "../utils/periodoCuota"
import {
  contratoVenceEnVentana,
  fechaLimiteVentanaDias,
  formatFechaUTC,
} from "../utils/fechas"
import {
  Box,
  Typography,
  Card,
  Chip,
  Avatar,
  CircularProgress,
  Tabs,
  Tab,
  LinearProgress,
} from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import {
  AttachMoney as AttachMoneyIcon,
  Description as DescriptionIcon,
  PeopleTwoTone as PeopleTwoToneIcon,
  Business as BusinessIcon,
  ChevronRight as ChevronRightIcon,
  SouthWest as SouthWestIcon,
  Schedule as ScheduleIcon,
} from "@mui/icons-material"
import MoneyOffCsredIcon from "@mui/icons-material/MoneyOffCsred"
import HomeWorkIcon from "@mui/icons-material/HomeWork"

const IncomeSparkline = ({ color }) => (
  <Box
    component="svg"
    viewBox="0 0 120 56"
    preserveAspectRatio="none"
    aria-hidden
    sx={{
      width: { xs: 64, sm: 100, md: 124 },
      maxWidth: { xs: "28%", sm: 120 },
      height: { xs: 40, sm: 52 },
      flexShrink: 1,
      minWidth: 48,
      opacity: 0.95,
      alignSelf: "center",
    }}
  >
    <defs>
      <linearGradient id="incomeSparkFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.35" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
    </defs>
    <path
      d="M0 40 L18 36 L36 42 L54 28 L72 32 L90 18 L108 22 L120 12 L120 56 L0 56 Z"
      fill="url(#incomeSparkFill)"
    />
    <path
      d="M0 40 L18 36 L36 42 L54 28 L72 32 L90 18 L108 22 L120 12"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Box>
)

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
  const [activityTab, setActivityTab] = useState(0)

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

      const disponibles = apartamentos.filter((a) => a.estado === "disponible").length
      const arrendados = apartamentos.filter((a) => a.estado !== "disponible").length
      const contratosActivos = contratos.filter((c) => c.estado === "activo").length

      const hoy = new Date()
      const VENTANA_DIAS = 30
      const limitePorVencer = fechaLimiteVentanaDias(hoy, VENTANA_DIAS)
      const porVencer = contratos.filter(
        (c) => c.estado === "activo" && contratoVenceEnVentana(c.fecha_fin, VENTANA_DIAS, hoy)
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

      const esCuotaDelMesActual = (p) =>
        Number(p.mes) === mesActual && Number(p.anio) === anioActual
      const pendientesDelMes = pagos.filter(
        (p) =>
          (p.estado === "en_mora" || p.estado === "pendiente") && esCuotaDelMesActual(p)
      )
      const totalMora = pendientesDelMes.reduce((sum, p) => sum + (Number(p.valor) || 0), 0)

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
        pagosEnMora: pendientesDelMes.length,
        totalMora,
      })

      const pagosOrdenados = [...pagos]
        .filter((p) => p.estado === "pagado")
        .sort((a, b) => new Date(b.fecha_pago) - new Date(a.fecha_pago))
        .slice(0, 5)
      setRecentPayments(pagosOrdenados)

      const pendientes = pagos
        .filter((p) => p.estado === "pendiente" || p.estado === "en_mora")
        .slice(0, 5)
      setUpcomingPayments(pendientes)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount || 0)

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress size={56} sx={{ color: "primary.main" }} />
      </Box>
    )
  }

  const ocupacion =
    stats.totalApartamentos > 0
      ? Math.round((stats.apartamentosOcupados / stats.totalApartamentos) * 100)
      : 0

  const isDark = theme.palette.mode === "dark"
  const orange = theme.palette.warning.main
  const teal = theme.palette.success.main
  const cyan = theme.palette.primary.main
  const cardBg = isDark ? alpha("#1a1f24", 0.95) : theme.palette.background.paper
  const surfaceBorder = isDark ? alpha("#fff", 0.08) : "divider"

  const metricTiles = [
    {
      key: "aptos",
      label: "Apartamentos",
      value: stats.totalApartamentos,
      icon: <BusinessIcon />,
      color: orange,
      hint: `${stats.apartamentosDisponibles} disp. · ${stats.apartamentosOcupados} arr.`,
    },
    {
      key: "arrend",
      label: "Arrendatarios",
      value: stats.totalArrendatarios,
      icon: <PeopleTwoToneIcon />,
      color: teal,
      hint: `${stats.contratosActivos} con contrato`,
    },
    {
      key: "pend",
      label: "Pendientes del mes",
      value: stats.pagosEnMora,
      icon: <MoneyOffCsredIcon />,
      color: orange,
      hint: formatCurrency(stats.totalMora),
    },
    {
      key: "contratos",
      label: "Contratos activos",
      value: stats.contratosActivos,
      icon: <DescriptionIcon />,
      color: teal,
      hint:
        stats.contratosPorVencer > 0
          ? `${stats.contratosPorVencer} por vencer`
          : "Sin vencimientos",
    },
  ]

  const activityItems = activityTab === 0 ? recentPayments : upcomingPayments

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "100%",
        minWidth: 0,
        overflowX: "hidden",
        boxSizing: "border-box",
        pb: { xs: 2, sm: 3 },
      }}
    >
      <Box
        sx={{
          maxWidth: { xs: "100%", sm: 560, md: 720, lg: 820 },
          mx: "auto",
          width: "100%",
          minWidth: 0,
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <Box sx={{ mb: { xs: 2, sm: 2.5 } }}>
          <Typography
            sx={{
              fontWeight: 800,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              fontSize: { xs: "0.95rem", sm: "1.05rem" },
              color: "text.primary",
            }}
          >
            Panel general
          </Typography>
          <Typography
            color="text.secondary"
            sx={{ mt: 0.25, fontSize: { xs: "0.95rem", sm: "1.05rem" }, fontWeight: 500 }}
          >
            Inicio
          </Typography>
        </Box>

        {/* Hero: Ingresos del mes + ocupación */}
        <Card
          elevation={0}
          sx={{
            mb: { xs: 1.5, sm: 2 },
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            borderRadius: { xs: 3, sm: 3.5 },
            border: 1,
            borderColor: surfaceBorder,
            bgcolor: cardBg,
            overflow: "hidden",
            backgroundImage: (t) =>
              `radial-gradient(120% 80% at 100% 0%, ${alpha(orange, t.palette.mode === "dark" ? 0.14 : 0.1)} 0%, transparent 55%)`,
          }}
        >
          <Box sx={{ p: { xs: 1.5, sm: 2.5 }, minWidth: 0, boxSizing: "border-box" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                gap: { xs: 1, sm: 2 },
                minWidth: 0,
                width: "100%",
              }}
            >
              <Box sx={{ display: "flex", gap: { xs: 1, sm: 1.5 }, minWidth: 0, flex: "1 1 auto", overflow: "hidden" }}>
                <Avatar
                  sx={{
                    width: { xs: 36, sm: 48 },
                    height: { xs: 36, sm: 48 },
                    bgcolor: alpha(teal, isDark ? 0.2 : 0.14),
                    color: teal,
                    border: 1,
                    borderColor: alpha(teal, 0.35),
                    flexShrink: 0,
                  }}
                >
                  <AttachMoneyIcon />
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                  <Typography
                    variant="caption"
                    sx={{
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: "text.secondary",
                      fontSize: { xs: "0.65rem", sm: "0.72rem" },
                    }}
                  >
                    Ingresos del mes
                  </Typography>
                  <Typography
                    sx={{
                      mt: 0.35,
                      fontWeight: 800,
                      color: orange,
                      fontSize: { xs: "1.55rem", sm: "2.25rem", md: "2.4rem" },
                      lineHeight: 1.05,
                      wordBreak: "break-word",
                      overflowWrap: "anywhere",
                    }}
                  >
                    {formatCurrency(stats.ingresosMes)}
                  </Typography>
                  <Chip
                    label={`${stats.pagosDelMes} pagos recibidos`}
                    size="small"
                    sx={{
                      mt: 1,
                      height: 26,
                      maxWidth: "100%",
                      fontWeight: 600,
                      fontSize: "0.72rem",
                      bgcolor: alpha(theme.palette.text.primary, isDark ? 0.06 : 0.04),
                      color: "text.secondary",
                      border: 1,
                      borderColor: surfaceBorder,
                      "& .MuiChip-label": {
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        px: 1,
                      },
                    }}
                  />
                </Box>
              </Box>
              <IncomeSparkline color={teal} />
            </Box>

            <Box sx={{ mt: { xs: 2, sm: 2.5 } }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 1,
                  mb: 0.75,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 600, color: "text.secondary", fontSize: { xs: "0.8rem", sm: "0.85rem" } }}
                >
                  Ocupación {ocupacion}% · {stats.apartamentosOcupados}/{stats.totalApartamentos || 0}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={ocupacion}
                sx={{
                  height: 8,
                  borderRadius: 999,
                  bgcolor: alpha(teal, isDark ? 0.15 : 0.12),
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 999,
                    bgcolor: teal,
                  },
                }}
              />
            </Box>
          </Box>
        </Card>

        {/* Grid 2x2 métricas */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
            gap: { xs: 1, sm: 1.5 },
            mb: { xs: 1.5, sm: 2 },
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          {metricTiles.map((tile) => (
            <Card
              key={tile.key}
              elevation={0}
              sx={{
                borderRadius: { xs: 2.5, sm: 3 },
                border: 1,
                borderColor: surfaceBorder,
                bgcolor: cardBg,
                minWidth: 0,
                width: "100%",
                maxWidth: "100%",
                boxSizing: "border-box",
                overflow: "hidden",
              }}
            >
              <Box sx={{ p: { xs: 1.25, sm: 2 }, minWidth: 0, boxSizing: "border-box" }}>
                <Avatar
                  sx={{
                    width: { xs: 32, sm: 38 },
                    height: { xs: 32, sm: 38 },
                    mb: 1,
                    bgcolor: alpha(tile.color, isDark ? 0.18 : 0.12),
                    color: tile.color,
                  }}
                >
                  {tile.icon}
                </Avatar>
                <Typography
                  sx={{
                    color: "text.secondary",
                    fontWeight: 600,
                    fontSize: { xs: "0.68rem", sm: "0.82rem" },
                    lineHeight: 1.25,
                    mb: 0.5,
                    overflowWrap: "anywhere",
                    wordBreak: "break-word",
                  }}
                >
                  {tile.label}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 800,
                    color: "text.primary",
                    fontSize: { xs: "1.35rem", sm: "1.85rem" },
                    lineHeight: 1.1,
                    overflowWrap: "anywhere",
                  }}
                >
                  {tile.value}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    fontSize: { xs: "0.62rem", sm: "0.7rem" },
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tile.hint}
                </Typography>
              </Box>
            </Card>
          ))}
        </Box>

        {/* Actividad reciente con tabs */}
        <Card
          elevation={0}
          sx={{
            borderRadius: { xs: 3, sm: 3.5 },
            border: 1,
            borderColor: surfaceBorder,
            bgcolor: cardBg,
            overflow: "hidden",
            width: "100%",
            maxWidth: "100%",
            boxSizing: "border-box",
            mb: { xs: 1.5, sm: 2 },
          }}
        >
          <Box sx={{ px: { xs: 2, sm: 2.5 }, pt: { xs: 1.75, sm: 2 }, pb: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: { xs: "1rem", sm: "1.1rem" } }}>
              Actividad reciente
            </Typography>
            <Tabs
              value={activityTab}
              onChange={(_, v) => setActivityTab(v)}
              variant="standard"
              sx={{
                minHeight: 40,
                mt: 0.5,
                "& .MuiTab-root": {
                  minHeight: 40,
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: { xs: "0.88rem", sm: "0.95rem" },
                  color: "text.secondary",
                  px: { xs: 1, sm: 1.5 },
                },
                "& .Mui-selected": { color: `${orange} !important` },
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: 2,
                  bgcolor: orange,
                },
              }}
            >
              <Tab label="Recibidos" />
              <Tab label="Pendientes" />
            </Tabs>
          </Box>

          <Box sx={{ px: { xs: 1.25, sm: 1.75 }, py: { xs: 1.25, sm: 1.5 }, minWidth: 0 }}>
            {activityItems.length === 0 ? (
              <Box sx={{ textAlign: "center", py: 3.5, px: 2 }}>
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    mx: "auto",
                    mb: 1,
                    bgcolor: alpha(cyan, 0.12),
                    color: "text.secondary",
                  }}
                >
                  {activityTab === 0 ? <AttachMoneyIcon /> : <ScheduleIcon />}
                </Avatar>
                <Typography variant="body2" color="text.secondary">
                  {activityTab === 0 ? "No hay pagos registrados" : "No hay pagos pendientes"}
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {activityItems.map((pago, index) => {
                  const isPendingTab = activityTab === 1
                  const isMora = pago.estado === "en_mora"
                  const amountColor = isPendingTab
                    ? isMora
                      ? theme.palette.error.main
                      : orange
                    : teal
                  const iconColor = isPendingTab
                    ? isMora
                      ? theme.palette.error.main
                      : orange
                    : teal
                  const periodo = formatPaymentPeriodForList(pago)

                  return (
                    <Box
                      key={pago.id || index}
                      sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: { xs: 1.1, sm: 1.35 },
                        py: { xs: 1.15, sm: 1.25 },
                        px: { xs: 0.75, sm: 1 },
                        borderRadius: 2,
                        minWidth: 0,
                        width: "100%",
                        boxSizing: "border-box",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.text.primary, isDark ? 0.04 : 0.03),
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          width: { xs: 36, sm: 40 },
                          height: { xs: 36, sm: 40 },
                          flexShrink: 0,
                          mt: 0.15,
                          bgcolor: alpha(iconColor, isDark ? 0.18 : 0.12),
                          color: iconColor,
                        }}
                      >
                        {isPendingTab ? (
                          isMora ? "!" : <ScheduleIcon fontSize="small" />
                        ) : (
                          <SouthWestIcon fontSize="small" />
                        )}
                      </Avatar>

                      <Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 1,
                            minWidth: 0,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 700,
                              fontSize: { xs: "0.9rem", sm: "0.95rem" },
                              minWidth: 0,
                              flex: 1,
                            }}
                            noWrap
                          >
                            {pago.arrendatario_nombre || "Arrendatario"}
                          </Typography>
                          <Typography
                            sx={{
                              fontWeight: 700,
                              color: amountColor,
                              fontSize: { xs: "0.88rem", sm: "0.95rem" },
                              flexShrink: 0,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {formatCurrency(pago.valor)}
                          </Typography>
                        </Box>

                        <Typography
                          variant="body2"
                          sx={{
                            display: "block",
                            mt: 0.35,
                            color: "text.secondary",
                            fontWeight: 600,
                            fontSize: { xs: "0.78rem", sm: "0.82rem" },
                            lineHeight: 1.35,
                            overflowWrap: "anywhere",
                            wordBreak: "break-word",
                            whiteSpace: "normal",
                          }}
                        >
                          {periodo}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 0.25,
                            fontSize: { xs: "0.68rem", sm: "0.72rem" },
                            lineHeight: 1.35,
                            fontWeight: isPendingTab ? 600 : 400,
                            color: isPendingTab ? amountColor : "text.secondary",
                          }}
                        >
                          {isPendingTab
                            ? isMora
                              ? "En mora"
                              : "Pendiente"
                            : pago.fecha_pago
                              ? `Pago ${formatDate(pago.fecha_pago)}`
                              : "Pago"}
                        </Typography>
                      </Box>

                      <ChevronRightIcon
                        sx={{
                          color: "text.disabled",
                          fontSize: 20,
                          flexShrink: 0,
                          mt: 0.35,
                          display: { xs: "none", sm: "block" },
                        }}
                      />
                    </Box>
                  )
                })}
              </Box>
            )}
          </Box>
        </Card>

        {/* Footer compacto */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            pt: 0.5,
            px: 1,
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: alpha(cyan, 0.14),
              color: cyan,
            }}
          >
            <HomeWorkIcon fontSize="small" />
          </Avatar>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: "center", maxWidth: 360, lineHeight: 1.4 }}
          >
            Sistema de Administración de Apartamentos
          </Typography>
          <Chip
            label={`Actualizado: ${new Date().toLocaleString("es-CO")}`}
            size="small"
            sx={{
              bgcolor: alpha(cyan, 0.1),
              color: "text.secondary",
              border: 1,
              borderColor: alpha(cyan, 0.22),
              fontSize: "0.68rem",
              maxWidth: "100%",
            }}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default Dashboard
