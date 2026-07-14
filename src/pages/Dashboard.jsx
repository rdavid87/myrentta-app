import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import { useAuth } from "../context/AuthContext"
import { formatPaymentPeriodForList } from "../utils/periodoCuota"
import {
  contratoVenceEnVentana,
  fechaLimiteVentanaDias,
  formatFechaUTC,
} from "../utils/fechas"
import {
  Box,
  Typography,
  Avatar,
  CircularProgress,
  Grid,
} from "@mui/material"
import {
  Business as BusinessIcon,
  PeopleTwoTone as PeopleTwoToneIcon,
  Description as DescriptionIcon,
  ShowChart as ShowChartIcon,
} from "@mui/icons-material"
import MoneyOffCsredIcon from "@mui/icons-material/MoneyOffCsred"
import OccupancyCard from "../components/dashboard/OccupancyCard"
import IncomeHeroCard from "../components/dashboard/IncomeHeroCard"
import DashboardActivityRow from "../components/dashboard/DashboardActivityRow"
import {
  FinanceStatCard,
  PageHeader,
  FilterPills,
  GlassPanel,
  EmptyState,
} from "../components/ui"
import { alpha, useTheme } from "@mui/material/styles"

const Dashboard = () => {
  const theme = useTheme()
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalApartamentos: 0,
    apartamentosDisponibles: 0,
    apartamentosOcupados: 0,
    totalArrendatarios: 0,
    arrendatariosConContrato: 0,
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
  const [activityTab, setActivityTab] = useState("recibidos")

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
      const arrendatariosConContrato = new Set(
        contratos.filter((c) => c.estado === "activo").map((c) => c.arrendatario_id)
      ).size

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
        arrendatariosConContrato,
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
        .sort((a, b) => {
          if (a.estado === "en_mora" && b.estado !== "en_mora") return -1
          if (b.estado === "en_mora" && a.estado !== "en_mora") return 1
          return 0
        })
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

  const activityFilterOptions = [
    { value: "recibidos", label: "Recibidos" },
    { value: "pendientes", label: "Pendientes" },
  ]

  const activityItems = activityTab === "recibidos" ? recentPayments : upcomingPayments

  const userInitials = (() => {
    const name = user?.full_name || "Usuario"
    const parts = name.split(" ")
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  })()

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", width: "100%", minWidth: 0 }}>
      <PageHeader
        title="Inicio"
        subtitle="Panel general"
        action={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography variant="body2" fontWeight={700}>
                {user?.full_name || "Usuario"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Administrador
              </Typography>
            </Box>
            <Avatar
              sx={{
                width: 40,
                height: 40,
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                color: "primary.main",
                fontWeight: 700,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
              }}
            >
              {userInitials}
            </Avatar>
          </Box>
        }
      />

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <OccupancyCard
            percent={ocupacion}
            occupied={stats.apartamentosOcupados}
            total={stats.totalApartamentos}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <IncomeHeroCard
            amount={stats.ingresosMes}
            paymentsCount={stats.pagosDelMes}
            formatCurrency={formatCurrency}
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <FinanceStatCard
            value={stats.totalApartamentos}
            label="Apartamentos"
            icon={<BusinessIcon />}
            color="success"
            trend={`${stats.apartamentosDisponibles} disp. · ${stats.apartamentosOcupados} arr.`}
            sparkId="dash-apt"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <FinanceStatCard
            value={stats.arrendatariosConContrato}
            label="Arrendatarios"
            icon={<PeopleTwoToneIcon />}
            color="primary"
            trend={`${stats.arrendatariosConContrato} con contrato`}
            sparkId="dash-arr"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <FinanceStatCard
            value={formatCurrency(stats.totalMora)}
            label="Pendientes del mes"
            icon={<MoneyOffCsredIcon />}
            color="warning"
            trend={`${stats.pagosEnMora} cuota(s)`}
            sparkId="dash-pend"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <FinanceStatCard
            value={stats.contratosActivos}
            label="Contratos activos"
            icon={<DescriptionIcon />}
            color="info"
            trend={
              stats.contratosPorVencer > 0
                ? `${stats.contratosPorVencer} por vencer`
                : "Sin vencimientos"
            }
            sparkId="dash-cont"
          />
        </Grid>
      </Grid>

      <GlassPanel sx={{ p: { xs: 2, md: 2.5 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            gap: 2,
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <ShowChartIcon sx={{ color: "primary.main", fontSize: 22 }} />
            <Typography variant="h6" fontWeight={800}>
              Actividad reciente
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
            }}
          >
            <FilterPills
              options={activityFilterOptions}
              value={activityTab}
              onChange={setActivityTab}
            />
            <Typography
              component={Link}
              to="/pagos"
              variant="body2"
              sx={{
                fontWeight: 600,
                color: "primary.main",
                textDecoration: "none",
                whiteSpace: "nowrap",
                "&:hover": { textDecoration: "underline" },
              }}
            >
              Ver todo
            </Typography>
          </Box>
        </Box>

        {activityItems.length === 0 ? (
          <EmptyState
            icon={activityTab === "recibidos" ? "💰" : "⏳"}
            title={activityTab === "recibidos" ? "No hay pagos registrados" : "No hay pagos pendientes"}
            description={
              activityTab === "recibidos"
                ? "Los pagos confirmados aparecerán aquí"
                : "No tienes cuotas pendientes por cobrar"
            }
          />
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {activityItems.map((pago) => (
              <DashboardActivityRow
                key={pago.id}
                pago={pago}
                variant={activityTab === "pendientes" ? "pendiente" : "recibido"}
                formatCurrency={formatCurrency}
                formatPaymentPeriod={formatPaymentPeriodForList}
              />
            ))}
          </Box>
        )}
      </GlassPanel>
    </Box>
  )
}

export default Dashboard
