import { useState, useEffect, useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"
import api from "../services/api"
import VerificarMoraResultModal from "../components/VerificarMoraResultModal"
import EditarPago from "../components/pagos/EditarPago"
import RegistrarPago from "../components/pagos/RegistrarPago"
import ConfirmarPago from "../components/pagos/ConfirmarPago"
import { normalizeVerificarMoraResponse } from "../utils/verificarMora"
import {
  getMonthName,
  getPeriodRangeFromMonthYear,
  formatPaymentPeriodForList,
  dedupeInstallmentPeriodOptions,
} from "../utils/periodoCuota"
import {
  Typography,
  Button,
  Box,
  CircularProgress,
  Grid,
} from "@mui/material"
import {
  Add as AddIcon,
} from "@mui/icons-material"
import AttachMoneyIcon from "@mui/icons-material/AttachMoney"
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong"
import {
  FinanceStatCard,
  GlassPanel,
  PageHeader,
  SearchField,
  FilterPills,
  GlowButton,
  EmptyState,
  ListFooter,
  DataListHeader,
} from "../components/ui"
import PaymentListRow, { PAYMENT_LIST_COLUMNS } from "../components/pagos/PaymentListRow"
import { ghostButtonSx } from "../components/ui/glassStyles"
import { useTheme, alpha } from "@mui/material/styles"

const METODOS_COBRO_CONFIRMADOS = new Set(["efectivo", "transferencia", "cheque"])

function metodoAlConfirmarCobro(pago) {
  const m = pago?.metodo_pago
  if (m && METODOS_COBRO_CONFIRMADOS.has(m)) return m
  return "efectivo"
}

const Pagos = () => {
  const theme = useTheme()
  const [searchParams, setSearchParams] = useSearchParams()
  const filterContractId = searchParams.get("contrato")

  const [pagos, setPagos] = useState([])
  const [contratos, setContratos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showConfirmarModal, setShowConfirmarModal] = useState(false)
  const [pagoToConfirm, setPagoToConfirm] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")

  const [showEditModal, setShowEditModal] = useState(false)
  const [pagoToEdit, setPagoToEdit] = useState(null)
  const [editFormData, setEditFormData] = useState({
    mes: "",
    anio: "",
    valor: "",
    metodo_pago: "efectivo",
    estado: "pendiente",
    fecha_pago: "",
  })

  const [formData, setFormData] = useState({
    contrato_id: "",
    mes: "",
    anio: new Date().getFullYear().toString(),
    valor: "",
    metodo_pago: "efectivo",
  })

  const [cuotasAlta, setCuotasAlta] = useState(null)
  const [cuotasAltaLoading, setCuotasAltaLoading] = useState(false)

  const getLocalDateString = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const [confirmarData, setConfirmarData] = useState({
    fecha_pago: getLocalDateString(),
    metodo_pago: "efectivo",
  })

  const [verificandoMora, setVerificandoMora] = useState(false)
  const [showMoraModal, setShowMoraModal] = useState(false)
  const [resultadoMora, setResultadoMora] = useState(null)
  const [enviandoNotificaciones, setEnviandoNotificaciones] = useState(false)
  const [descargandoPDF, setDescargandoPDF] = useState(null)

  useEffect(() => {
    fetchPagos()
    fetchContratos()
  }, [])

  const fetchPagos = async () => {
    try {
      const { data } = await api.get("/pagos")
      setPagos(data || [])
    } catch (error) {
      console.error("Error fetching pagos:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchContratos = async () => {
    try {
      const { data } = await api.get("/contratos")
      const activos = data?.filter(c => c.estado === "activo") || []
      setContratos(activos)
    } catch (error) {
      console.error("Error fetching contratos:", error)
    }
  }

  const fetchCuotasPorContrato = async (contratoId) => {
    const cid = Number(contratoId)
    if (!cid) return null
    const { data } = await api.get(`/pagos/contrato/${cid}/cuotas`)
    return data || null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (!formData.contrato_id || !String(formData.mes) || formData.anio === "") {
        alert("Selecciona contrato y período válidos.")
        return
      }
      const mes = parseInt(formData.mes, 10)
      const anio = parseInt(formData.anio, 10)
      if (cuotasAlta?.periodos?.length) {
        const registrarOpts = dedupeInstallmentPeriodOptions(cuotasAlta.periodos, cuotasAlta.siguiente)
        const opt = registrarOpts.find((p) => p.mes === mes && p.anio === anio)
        if (!opt || opt.existe) {
          alert("Ese período no está disponible para un pago nuevo (ya existe cobro para esa cuota).")
          return
        }
      }

      const dataToSend = {
        ...formData,
        contrato_id: parseInt(formData.contrato_id),
        mes,
        anio,
        valor: parseFloat(formData.valor),
      }

      await api.post("/pagos", dataToSend)
      closeModal()
      fetchPagos()
      alert("✅ Pago registrado exitosamente")
    } catch (error) {
      console.error("Error creating pago:", error)
      alert("Error al registrar pago: " + (error.response?.data?.error || error.message))
    }
  }

  const handleConfirmar = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/pagos/${pagoToConfirm.id}/confirmar`, confirmarData)
      closeConfirmarModal()
      fetchPagos()
      alert("✅ Pago confirmado exitosamente")
    } catch (error) {
      console.error("Error confirmando pago:", error)
      alert("Error al confirmar: " + (error.response?.data?.error || error.message))
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este pago pendiente?")) {
      try {
        await api.delete(`/pagos/${id}`)
        fetchPagos()
      } catch (error) {
        console.error("Error deleting pago:", error)
        alert("Error al eliminar: " + (error.response?.data?.error || error.message))
      }
    }
  }

  const handleVerificarMora = async () => {
    setVerificandoMora(true)
    try {
      const { data } = await api.get("/notificaciones/verificar-mora")
      setResultadoMora(normalizeVerificarMoraResponse(data))
      setShowMoraModal(true)
    } catch (error) {
      console.error("Error verificando mora:", error)
      alert("Error al verificar: " + (error.response?.data?.error || error.message))
    } finally {
      setVerificandoMora(false)
    }
  }

  const handleEnviarNotificacionesMora = async () => {
    setEnviandoNotificaciones(true)
    try {
      const { data } = await api.post("/notificaciones/enviar-mora")
      setResultadoMora((prev) => ({
        ...prev,
        notificaciones_enviadas: data.notificaciones_enviadas,
        detalles: data.detalles,
        errores: data.errores,
        enviado: true,
      }))
      fetchPagos()
    } catch (error) {
      console.error("Error enviando notificaciones:", error)
      alert("Error al enviar: " + (error.response?.data?.error || error.message))
    } finally {
      setEnviandoNotificaciones(false)
    }
  }

  const closeMoraModal = () => {
    setShowMoraModal(false)
    setResultadoMora(null)
  }

  const fechaAPartirDeAPI = (iso) => {
    if (!iso) return ""
    const s = typeof iso === "string" ? iso : String(iso)
    return s.slice(0, 10)
  }

  const openEditModal = (pago) => {
    setPagoToEdit(pago)
    setEditFormData({
      mes: String(pago.mes),
      anio: String(pago.anio),
      valor: String(pago.valor),
      metodo_pago: pago.metodo_pago || "por_definir",
      estado: pago.estado === "pagado" ? "pendiente" : pago.estado || "pendiente",
      fecha_pago: fechaAPartirDeAPI(pago.fecha_pago) || getLocalDateString(),
    })
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setPagoToEdit(null)
    setEditFormData({
      mes: "",
      anio: "",
      valor: "",
      metodo_pago: "efectivo",
      estado: "pendiente",
      fecha_pago: "",
    })
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!pagoToEdit) return
    const mes = parseInt(editFormData.mes, 10)
    const anio = parseInt(editFormData.anio, 10)
    const valor = parseFloat(String(editFormData.valor).replace(",", "."))
    if (Number.isNaN(mes) || mes < 1 || mes > 12) {
      alert("Selecciona un mes válido.")
      return
    }
    if (Number.isNaN(anio) || anio < 2000) {
      alert("Ingresa un año válido.")
      return
    }
    if (Number.isNaN(valor) || valor <= 0) {
      alert("Ingresa un valor válido.")
      return
    }
    try {
      const payload = {
        mes,
        anio,
        valor,
        metodo_pago: editFormData.metodo_pago,
      }

      const eraPagado = pagoToEdit.estado === "pagado"
      if (eraPagado) {
        if (editFormData.estado !== "pendiente" && editFormData.estado !== "en_mora") {
          alert("Para un pago ya confirmado, elige Pendiente o En mora para revertir el cobro.")
          return
        }
        payload.estado = editFormData.estado
      } else {
        if (editFormData.estado === "pagado") {
          if (!editFormData.fecha_pago) {
            alert("Indica la fecha de pago al marcar como pagado.")
            return
          }
          if (editFormData.metodo_pago === "por_definir") {
            alert("Elige un método real (efectivo, transferencia o cheque) al marcar como pagado.")
            return
          }
          payload.estado = "pagado"
          payload.fecha_pago = editFormData.fecha_pago
        } else if (
          editFormData.estado &&
          editFormData.estado !== "pagado" &&
          editFormData.estado !== pagoToEdit.estado
        ) {
          payload.estado = editFormData.estado
        }
      }

await api.put(`/pagos/${pagoToEdit.id}`, payload)
      closeEditModal()
      fetchPagos()
      alert("✅ Pago actualizado")
    } catch (error) {
      console.error("Error editando pago:", error)
      alert("Error al actualizar: " + (error.response?.data?.error || error.message))
    }
  }

  const handleReciboPdf = async (pagoId) => {
    setDescargandoPDF(pagoId)
    try {
      const { data: htmlContent } = await api.get(`/recibos/${pagoId}/html`, { responseType: "text" })
      
      const iframe = document.createElement("iframe")
      iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:800px;height:1200px;border:none;"
      document.body.appendChild(iframe)
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
      
      iframeDoc.open()
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
          ${htmlContent.match(/<style[\s\S]*?<\/style>/gi)?.join("") || ""}
        </head>
        <body style="margin:0;padding:0;background:#f0f0f0;">
          ${htmlContent.match(/<div class="recibo"[\s\S]*?<\/body>/gi)?.[0]?.replace("</body>", "") || ""}
        </body>
        </html>
      `)
      iframeDoc.close()

      await new Promise((resolve) => {
        const checkLib = setInterval(() => {
          if (iframe.contentWindow.html2pdf) {
            clearInterval(checkLib)
            resolve()
          }
        }, 100)
        setTimeout(() => { clearInterval(checkLib); resolve() }, 3000)
      })

      await new Promise(resolve => setTimeout(resolve, 500))

      const reciboElement = iframeDoc.querySelector(".recibo")
      
      if (!reciboElement) {
        throw new Error("No se encontró el recibo")
      }

      const opt = {
        margin: 10,
        filename: `recibo_arriendo_${pagoId}.pdf`,
        image: { type: "jpeg", quality: 0.95 },
        html2canvas: { 
          scale: 2,
          useCORS: true,
          backgroundColor: "#f0f0f0"
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
      }

      await iframe.contentWindow.html2pdf().set(opt).from(reciboElement).save()
      
      setTimeout(() => document.body.removeChild(iframe), 1000)
      
    } catch (error) {
      console.error("Error descargando recibo:", error)
      alert("Error al descargar recibo: " + (error.response?.data?.error || error.message))
    } finally {
      setDescargandoPDF(null)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setCuotasAlta(null)
    setCuotasAltaLoading(false)
    setFormData({
      contrato_id: "",
      mes: "",
      anio: new Date().getFullYear().toString(),
      valor: "",
      metodo_pago: "efectivo",
    })
  }

  const closeConfirmarModal = () => {
    setShowConfirmarModal(false)
    setPagoToConfirm(null)
    setConfirmarData({
      fecha_pago: getLocalDateString(),
      metodo_pago: "efectivo",
    })
  }

  const openConfirmarModal = (pago) => {
    setPagoToConfirm(pago)
    setConfirmarData({
      fecha_pago: getLocalDateString(),
      metodo_pago: metodoAlConfirmarCobro(pago),
    })
    setShowConfirmarModal(true)
  }

  const handleContratoChange = async (contratoId) => {
    setCuotasAlta(null)
    const contrato = contratos.find((c) => String(c.id) === String(contratoId))

    if (!contratoId) {
      setFormData((prev) => ({
        ...prev,
        contrato_id: "",
        mes: "",
        anio: new Date().getFullYear().toString(),
        valor: "",
      }))
      return
    }

    setFormData((prev) => ({
      ...prev,
      contrato_id: contratoId,
      mes: "",
      anio: new Date().getFullYear().toString(),
      valor: contrato ? String(contrato.canon_mensual) : prev.valor,
    }))

    setCuotasAltaLoading(true)
    try {
      const data = await fetchCuotasPorContrato(contratoId)
      setCuotasAlta(data)
      const opts = dedupeInstallmentPeriodOptions(data?.periodos ?? [], data?.siguiente ?? null)
      const sig = data?.siguiente
      const sigUiOpen = sig ? opts.find((p) => p.mes === sig.mes && p.anio === sig.anio && !p.existe) : null
      const primeraLibreUi = opts.find((p) => !p.existe)

      const pickMesAnio =
        sigUiOpen || primeraLibreUi || (sig ? { mes: sig.mes, anio: sig.anio } : null)

      if (pickMesAnio) {
        setFormData((prev) => ({
          ...prev,
          contrato_id: contratoId,
          mes: String(pickMesAnio.mes),
          anio: String(pickMesAnio.anio),
          valor: contrato ? String(contrato.canon_mensual) : prev.valor,
          metodo_pago: prev.metodo_pago,
        }))
      }
    } catch (error) {
      console.error("Error cargando cuotas:", error)
      setCuotasAlta(null)
      alert("No se pudieron cargar los períodos del contrato. Revisa la conexión o el API.")
    } finally {
      setCuotasAltaLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "—"
    const date = new Date(dateString)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    return `${day}/${month}/${year}`
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatMetodoLabel = (m) => {
    if (!m) return "—"
    const map = {
      por_definir: "Por definir",
      efectivo: "Efectivo",
      transferencia: "Transferencia",
      cheque: "Cheque",
    }
    return map[m] || m
  }

  const handleFilterChange = (newValue) => {
    setFilterEstado(newValue)
  }

  const filterOptions = [
    { value: "todos", label: "Todos" },
    { value: "pendiente", label: "Pendientes" },
    { value: "pagado", label: "Pagados" },
    { value: "en_mora", label: "En mora" },
  ]

  const clearContractFilter = () => {
    const next = new URLSearchParams(searchParams)
    next.delete("contrato")
    setSearchParams(next, { replace: true })
  }

  const contractFilterLabel = useMemo(() => {
    if (!filterContractId) return null
    const pago = pagos.find((p) => String(p.contrato_id) === String(filterContractId))
    if (pago) {
      return `${pago.arrendatario_nombre} · ${pago.apartamento_nombre}`
    }
    const contract = contratos.find((c) => String(c.id) === String(filterContractId))
    if (contract) {
      return `${contract.arrendatario_nombre} - ${contract.apartamento_nombre}`
    }
    return `Contrato #${filterContractId}`
  }, [filterContractId, pagos, contratos])

  const filteredPagos = pagos.filter(pago => {
    const matchesContract =
      !filterContractId || String(pago.contrato_id) === String(filterContractId)

    const q = searchTerm.toLowerCase()
    const matchesSearch =
      pago.arrendatario_nombre?.toLowerCase().includes(q) ||
      pago.apartamento_nombre?.toLowerCase().includes(q) ||
      getMonthName(pago.mes).toLowerCase().includes(q) ||
      (pago.periodo && String(pago.periodo).toLowerCase().includes(q)) ||
      formatPaymentPeriodForList(pago).toLowerCase().includes(q)
    
    const matchesEstado = filterEstado === "todos" || pago.estado === filterEstado
    
    return matchesContract && matchesSearch && matchesEstado
  })

  const paymentStats = useMemo(() => {
    const hoy = new Date()
    const mesActual = hoy.getMonth() + 1
    const anioActual = hoy.getFullYear()
    const prevDate = new Date(anioActual, mesActual - 2, 1)
    const mesPrev = prevDate.getMonth() + 1
    const anioPrev = prevDate.getFullYear()

    const pagoCobradoEnMes = (p, mes, anio) => {
      if (p.estado !== "pagado" || !p.fecha_pago) return false
      const fechaStr = String(p.fecha_pago).slice(0, 10)
      const [y, m] = fechaStr.split("-")
      return Number(m) === mes && Number(y) === anio
    }

    const esCuotaMes = (p, mes, anio) => Number(p.mes) === mes && Number(p.anio) === anio
    const sumValor = (arr) => arr.reduce((s, p) => s + (Number(p.valor) || 0), 0)

    const ingresosMes = sumValor(pagos.filter((p) => pagoCobradoEnMes(p, mesActual, anioActual)))
    const ingresosPrev = sumValor(pagos.filter((p) => pagoCobradoEnMes(p, mesPrev, anioPrev)))
    const pendienteMes = sumValor(
      pagos.filter((p) => p.estado === "pendiente" && esCuotaMes(p, mesActual, anioActual))
    )
    const pendientePrev = sumValor(
      pagos.filter((p) => p.estado === "pendiente" && esCuotaMes(p, mesPrev, anioPrev))
    )
    const moraMes = sumValor(
      pagos.filter((p) => p.estado === "en_mora" && esCuotaMes(p, mesActual, anioActual))
    )
    const moraPrev = sumValor(
      pagos.filter((p) => p.estado === "en_mora" && esCuotaMes(p, mesPrev, anioPrev))
    )
    const recibidosMes = pagos.filter((p) => pagoCobradoEnMes(p, mesActual, anioActual)).length
    const recibidosPrev = pagos.filter((p) => pagoCobradoEnMes(p, mesPrev, anioPrev)).length

    const trendPct = (curr, prev) => {
      if (prev === 0) return curr > 0 ? "+100%" : "—"
      const pct = ((curr - prev) / prev) * 100
      return `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`
    }

    const prevLabel = `${getMonthName(mesPrev).slice(0, 3)} ${anioPrev}`

    return {
      mesLabel: `${getMonthName(mesActual)} ${anioActual}`,
      ingresosMes,
      pendienteMes,
      moraMes,
      recibidosMes,
      trends: {
        ingresos: `${trendPct(ingresosMes, ingresosPrev)} vs ${prevLabel}`,
        pendiente: `${trendPct(pendienteMes, pendientePrev)} vs ${prevLabel}`,
        mora: `${trendPct(moraMes, moraPrev)} vs ${prevLabel}`,
        recibidos: `${trendPct(recibidosMes, recibidosPrev)} vs ${prevLabel}`,
      },
    }
  }, [pagos])

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress size={64} sx={{ color: "secondary.main" }} />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", width: "100%", minWidth: 0 }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <FinanceStatCard
            value={formatCurrency(paymentStats.ingresosMes)}
            label="Ingresos del mes"
            icon={<AttachMoneyIcon />}
            color="success"
            trend={paymentStats.trends.ingresos}
            sparkId="pagos-ingresos"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <FinanceStatCard
            value={formatCurrency(paymentStats.pendienteMes)}
            label="Pendiente"
            icon={<HourglassEmptyIcon />}
            color="warning"
            trend={paymentStats.trends.pendiente}
            sparkId="pagos-pendiente"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <FinanceStatCard
            value={formatCurrency(paymentStats.moraMes)}
            label="En mora"
            icon={<WarningAmberIcon />}
            color="error"
            trend={paymentStats.trends.mora}
            sparkId="pagos-mora"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <FinanceStatCard
            value={paymentStats.recibidosMes}
            label="Pagos recibidos"
            icon={<ReceiptLongIcon />}
            color="primary"
            trend={paymentStats.trends.recibidos}
            sparkId="pagos-recibidos"
          />
        </Grid>
      </Grid>

      <PageHeader
        title="Gestión de Pagos"
        subtitle={
          <>
            Módulo de finanzas ·{" "}
            <Link to="/ayuda" style={{ color: "inherit" }}>
              Contactar soporte (Ayuda)
            </Link>
          </>
        }
        action={
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              variant="outlined"
              onClick={handleVerificarMora}
              disabled={verificandoMora}
              sx={ghostButtonSx(theme)}
            >
              {verificandoMora ? "Verificando..." : "Verificar Mora"}
            </Button>
            <GlowButton
              startIcon={<AddIcon />}
              onClick={() => {
                setCuotasAlta(null)
                setCuotasAltaLoading(false)
                setShowModal(true)
              }}
            >
              Registrar Pago
            </GlowButton>
          </Box>
        }
      >
        {filterContractId && (
          <Box
            sx={{
              mb: 2,
              p: 1.5,
              borderRadius: "10px",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              gap: 1,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              Pagos del contrato:{" "}
              <Typography component="span" fontWeight={700} color="text.primary">
                {contractFilterLabel}
              </Typography>
            </Typography>
            <Button size="small" onClick={clearContractFilter}>
              Ver todos los pagos
            </Button>
          </Box>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            alignItems: { md: "center" },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar arrendatario, apartamento o período…"
            />
          </Box>
          <FilterPills options={filterOptions} value={filterEstado} onChange={handleFilterChange} />
        </Box>

        {(searchTerm || filterEstado !== "todos" || filterContractId) && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            {filteredPagos.length} pago(s) encontrado(s)
          </Typography>
        )}
      </PageHeader>

      <GlassPanel sx={{ p: { xs: 1.75, sm: 2 } }}>
          {filteredPagos.length === 0 ? (
            <EmptyState
              icon="💳"
              title={pagos.length === 0 ? "No hay pagos registrados" : "No se encontraron pagos"}
              description={
                pagos.length === 0
                  ? "Usa Registrar pago o contacta soporte desde Ayuda."
                  : "Intenta con otros términos de búsqueda o filtros"
              }
              action={
                pagos.length === 0 ? (
                  <GlowButton
                    startIcon={<AddIcon />}
                    onClick={() => {
                      setCuotasAlta(null)
                      setCuotasAltaLoading(false)
                      setShowModal(true)
                    }}
                  >
                    Registrar Pago
                  </GlowButton>
                ) : undefined
              }
            />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: { xs: 0.25, lg: 0 } }}>
              <DataListHeader columns={PAYMENT_LIST_COLUMNS} />
              {filteredPagos.map((pago, index) => (
                <PaymentListRow
                  key={pago.id}
                  pago={pago}
                  periodLabel={formatPaymentPeriodForList(pago)}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  formatMetodoLabel={formatMetodoLabel}
                  onEdit={openEditModal}
                  onConfirm={openConfirmarModal}
                  onDelete={handleDelete}
                  onPdf={handleReciboPdf}
                  pdfLoading={descargandoPDF}
                  isLast={index === filteredPagos.length - 1}
                />
              ))}
            </Box>
          )}

          {filteredPagos.length > 0 && (
            <ListFooter from={1} to={filteredPagos.length} total={filteredPagos.length} />
          )}
      </GlassPanel>


      <RegistrarPago
        open={showModal}
        onClose={closeModal}
        contratos={contratos}
        formData={formData}
        cuotasAlta={cuotasAlta}
        cuotasAltaLoading={cuotasAltaLoading}
        onFormChange={setFormData}
        onContratoChange={handleContratoChange}
        onSubmit={handleSubmit}
        dedupeInstallmentPeriodOptions={dedupeInstallmentPeriodOptions}
      />

      <EditarPago
        open={showEditModal && !!pagoToEdit}
        onClose={closeEditModal}
        pagoToEdit={pagoToEdit}
        editFormData={editFormData}
        onEditFormChange={setEditFormData}
        onEditSubmit={handleEditSubmit}
      />

      <VerificarMoraResultModal
        open={showMoraModal}
        resultadoMora={resultadoMora}
        onClose={closeMoraModal}
        onEnviarNotificaciones={handleEnviarNotificacionesMora}
        enviandoNotificaciones={enviandoNotificaciones}
      />

      <ConfirmarPago
        open={showConfirmarModal && !!pagoToConfirm}
        onClose={closeConfirmarModal}
        pagoToConfirm={pagoToConfirm}
        confirmarData={confirmarData}
        onConfirmarChange={setConfirmarData}
        onConfirmarSubmit={handleConfirmar}
      />
    </Box>
  )
}

export default Pagos