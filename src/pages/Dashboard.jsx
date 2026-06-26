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

const Dashboard = () => {
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="group relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6 sm:mb-8">
          {/* Ingresos del Mes - Diseño nuevo */}
          <div className="flex items-center justify-between">
            <MetricCard
              title="Ingresos del Mes"
              value={formatCurrency(stats.ingresosMes)}
              icon={<span className="text-2xl">💰</span>}
              iconColor="emerald"
              badges={[`${stats.pagosDelMes} pagos recibidos`]}
            />
          </div>

          {/* Total Apartamentos - Diseño nuevo */}
          <div className="flex items-center justify-between">
            <MetricCard
              title="Apartamentos"
              value={stats.totalApartamentos}
              icon={<span className="text-2xl">🏢</span>}
              iconColor="indigo"
              badges={[
                `${stats.apartamentosDisponibles} disponibles`,
                `${stats.apartamentosOcupados} arrendados`,
              ]}
            />
          </div>

          {/* Total Arrendatarios - Diseño nuevo */}
          <div className="flex items-center justify-between">
            <MetricCard
              title="Arrendatarios"
              value={stats.totalArrendatarios}
              icon={<ArrendatarioIcon className="w-5 h-5" />}
              iconColor="fuchsia"
              badges={[`${stats.contratosActivos} con contrato activo`]}
            />
          </div>


          {/* En Mora - Diseño nuevo */}
          <div className="flex items-center justify-between">
            <MetricCard
              title="Pagos Pendientes"
              value={stats.pagosEnMora}
              icon={<span className="text-2xl">⚠️</span>}
              iconColor="rose"
              badges={[`${formatCurrency(stats.totalMora)} por cobrar`]}
            />
          </div>
        </div>
                </div>

        {/* Segunda fila de stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Contratos */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Contratos Activos</p>
                  <p className="text-3xl sm:text-4xl font-bold text-white mt-2">{stats.contratosActivos}</p>
                </div>
                <div className="text-4xl sm:text-5xl opacity-80">📋</div>
              </div>
              {stats.contratosPorVencer > 0 && (
                <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <p className="text-amber-300 text-sm flex items-center gap-2">
                    <span className="text-lg">⏰</span>
                    Hay contratos que vencen antes del {stats.fechaLimitePorVencer}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Ocupación */}
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sm:p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Tasa de Ocupación</p>
                  <p className="text-3xl sm:text-4xl font-bold text-white mt-2">
                    {stats.totalApartamentos > 0 
                      ? Math.round((stats.apartamentosOcupados / stats.totalApartamentos) * 100) 
                      : 0}%
                  </p>
                </div>
                <div className="text-4xl sm:text-5xl opacity-80">📈</div>
              </div>
              {/* Progress bar */}
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${stats.totalApartamentos > 0 
                      ? (stats.apartamentosOcupados / stats.totalApartamentos) * 100 
                      : 0}%` 
                  }}
                ></div>
              </div>
              <div className="mt-2 flex justify-between text-xs text-gray-400">
                <span>{stats.apartamentosOcupados} arrendados</span>
                <span>{stats.apartamentosDisponibles} disponibles</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tablas de pagos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Últimos pagos recibidos */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-b border-gray-700/50 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">✅</span>
                Últimos Pagos Recibidos
              </h2>
            </div>
            <div className="p-4">
              {recentPayments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">💳</div>
                  <p className="text-gray-400">No hay pagos registrados</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPayments.map((pago, index) => (
                    <div 
                      key={pago.id || index}
                      className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400">
                          ✓
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{pago.arrendatario_nombre || "Arrendatario"}</p>
                          <p className="text-teal-300/90 text-xs">{formatPaymentPeriodForList(pago)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-emerald-400 font-semibold text-sm">{formatCurrency(pago.valor)}</p>
                        <p className="text-gray-500 text-xs">{formatDate(pago.fecha_pago)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Pagos pendientes */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-b border-gray-700/50 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">⏳</span>
                Pagos Pendientes
              </h2>
            </div>
            <div className="p-4">
              {upcomingPayments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-gray-400">No hay pagos pendientes</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingPayments.map((pago, index) => (
                    <div 
                      key={pago.id || index}
                      className="flex items-center justify-between p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          pago.estado === "en_mora" 
                            ? "bg-rose-500/20 text-rose-400" 
                            : "bg-amber-500/20 text-amber-400"
                        }`}>
                          {pago.estado === "en_mora" ? "!" : "⏱"}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{pago.arrendatario_nombre || "Arrendatario"}</p>
                          <p className="text-teal-300/90 text-xs">{formatPaymentPeriodForList(pago)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold text-sm ${
                          pago.estado === "en_mora" ? "text-rose-400" : "text-amber-400"
                        }`}>
                          {formatCurrency(pago.valor)}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          pago.estado === "en_mora" 
                            ? "bg-rose-500/20 text-rose-300" 
                            : "bg-amber-500/20 text-amber-300"
                        }`}>
                          {pago.estado === "en_mora" ? "En mora" : "Pendiente"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer con información */}
        <div className="mt-6 sm:mt-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-600 to-gray-600 rounded-2xl blur-xl opacity-10"></div>
          <div className="relative bg-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-white mb-1">
                  🏠 Sistema de Administración de Apartamentos
                </h3>
                <p className="text-gray-400 text-sm">
                  Gestiona tus propiedades, arrendatarios, contratos y pagos de manera eficiente
                </p>
              </div>
              <div className="flex gap-2 text-xs text-gray-500">
                <span className="px-3 py-1 bg-gray-700/50 rounded-lg">
                  Última actualización: {new Date().toLocaleString("es-CO")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
