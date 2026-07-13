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
  Container,
  Typography,
  Button,
  TextField,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Chip,
  IconButton,
  Avatar,
  Card,
  CardContent,
  Grid,
  Box,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  InputAdornment,
  Tooltip,
} from "@mui/material"
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PictureAsPdf as PdfIcon,
  Home as HomeIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as ConfirmIcon,
} from "@mui/icons-material"
import PaymentIcon from "@mui/icons-material/Payment"

const METODOS_COBRO_CONFIRMADOS = new Set(["efectivo", "transferencia", "cheque"])

function metodoAlConfirmarCobro(pago) {
  const m = pago?.metodo_pago
  if (m && METODOS_COBRO_CONFIRMADOS.has(m)) return m
  return "efectivo"
}

const Pagos = () => {
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

  const handleFilterChange = (_event, newValue) => {
    if (newValue !== null) setFilterEstado(newValue)
  }

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

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "pagado":
        return { color: "success", variant: "filled" }
      case "en_mora":
        return { color: "error", variant: "filled" }
      default:
        return { color: "warning", variant: "outlined" }
    }
  }

  const getEstadoLabel = (estado) => {
    switch (estado) {
      case "pagado": return "Pagado"
      case "en_mora": return "En mora"
      default: return "Pendiente"
    }
  }

  const getEstadoAccent = (estado) => {
    switch (estado) {
      case "pagado":
        return "success.main"
      case "en_mora":
        return "error.main"
      default:
        return "warning.main"
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress size={64} sx={{ color: "secondary.main" }} />
      </Box>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 4 }, px: { xs: 1.5, sm: 3 }, overflowX: "hidden" }}>
      <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, mb: 4, borderRadius: 3, bgcolor: "background.paper", overflow: "hidden" }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, gap: 2 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1, fontSize: { xs: "1.5rem", sm: "2.125rem" } }}>
              <PaymentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Gestión de Pagos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Registra y confirma pagos.{" "}
              <Link to="/ayuda" style={{ color: "inherit" }}>
                Contactar soporte (Ayuda)
              </Link>
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setCuotasAlta(null)
                setCuotasAltaLoading(false)
                setShowModal(true)
              }}
              sx={{ px: { xs: 2, sm: 4 }, py: 1.5, borderRadius: 2, flex: { xs: "1 1 auto", sm: "none" } }}
            >
              Registrar Pago
            </Button>
            <Button
              variant="outlined"
              onClick={handleVerificarMora}
              disabled={verificandoMora}
              sx={{ px: { xs: 2, sm: 3 }, py: 1.5, borderRadius: 2, flex: { xs: "1 1 auto", sm: "none" } }}
            >
              {verificandoMora ? "Verificando..." : "Verificar Mora"}
            </Button>
          </Box>
        </Box>

        {filterContractId && (
          <Box
            sx={{
              mt: 3,
              p: 2,
              borderRadius: 2,
              bgcolor: "primary.light",
              border: "1px solid",
              borderColor: "primary.main",
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              gap: 1,
              minWidth: 0,
            }}
          >
            <Typography variant="body2" sx={{ color: "text.secondary", minWidth: 0 }}>
              Pagos del contrato:{" "}
              <Typography component="span" sx={{ color: "text.primary", fontWeight: 500 }}>
                {contractFilterLabel}
              </Typography>
            </Typography>
            <Button
              size="small"
              onClick={clearContractFilter}
              sx={{ fontSize: "0.75rem", alignSelf: { xs: "flex-start", sm: "center" } }}
            >
              Ver todos los pagos
            </Button>
          </Box>
        )}

        <Box sx={{ mt: 3, display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2, minWidth: 0 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por arrendatario, apartamento o período…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm ? (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchTerm("")} size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ) : undefined,
              },
            }}
          />
          <ToggleButtonGroup
            size="small"
            value={filterEstado}
            exclusive
            onChange={handleFilterChange}
            sx={{
              width: { xs: "100%", sm: "auto" },
              display: "flex",
              flexWrap: "wrap",
              "& .MuiToggleButtonGroup-grouped": {
                flex: { xs: "1 1 calc(50% - 4px)", sm: "0 0 auto" },
                borderRadius: "4px !important",
                border: "1px solid",
                borderColor: "divider",
                m: 0.25,
                px: { xs: 1, sm: 2 },
                py: 1,
              },
            }}
          >
            <ToggleButton value="todos">
              Todos
            </ToggleButton>
            <ToggleButton value="pendiente">
              Pendientes
            </ToggleButton>
            <ToggleButton value="pagado">
              Pagados
            </ToggleButton>
            <ToggleButton value="en_mora">
              En Mora
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {(searchTerm || filterEstado !== "todos" || filterContractId) && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {filteredPagos.length} pago(s) encontrado(s)
          </Typography>
        )}
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", bgcolor: "background.paper", maxWidth: "100%" }}>
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Arrendatario</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Apartamento</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Período</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Valor</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Método</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>
                    <span style={{ display: "block" }}>Fecha pago</span>
                    <span style={{ display: "block", fontWeight: "normal", fontSize: "0.75rem" }}>al confirmar cobro</span>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPagos.map((pago) => (
                  <TableRow key={pago.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {pago.arrendatario_nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography variant="body2" fontWeight="medium">
                          {pago.apartamento_nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {pago.apartamento_direccion}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={formatPaymentPeriodForList(pago)}
                        size="small"
                        sx={{ color: "secondary.main" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" color="warning.main">
                        {formatCurrency(pago.valor)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatMetodoLabel(pago.metodo_pago)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {!pago.fecha_pago ? "—" : formatDate(pago.fecha_pago)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getEstadoLabel(pago.estado)}
                        size="small"
                        color={getEstadoBadge(pago.estado).color}
                        variant={getEstadoBadge(pago.estado).variant}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {(pago.estado === "pendiente" || pago.estado === "en_mora") && (
                          <>
                            <Tooltip title="Editar">
                              <IconButton size="small" onClick={() => openEditModal(pago)} color="primary">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => openConfirmarModal(pago)}
                            >
                              Confirmar
                            </Button>
                            <Tooltip title="Eliminar">
                              <IconButton size="small" onClick={() => handleDelete(pago.id)} color="error">
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </>
                        )}
                        {pago.estado === "pagado" && (
                          <>
                            <Tooltip title="Editar">
                              <IconButton size="small" onClick={() => openEditModal(pago)} color="primary">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<PdfIcon />}
                              onClick={() => handleReciboPdf(pago.id)}
                            >
                              Recibo PDF
                            </Button>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredPagos.length === 0 && (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                💳
              </Typography>
              <Typography color="text.secondary">
                {pagos.length === 0 ? "No hay pagos registrados" : "No se encontraron pagos"}
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                {pagos.length === 0
                  ? "Usa Registrar pago o contacta a soporte desde Ayuda si necesitas asistencia."
                  : "Intenta con otros términos de búsqueda o filtros"}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ display: { xs: "block", md: "none" }, p: { xs: 1.5, sm: 2 }, maxWidth: "100%", boxSizing: "border-box" }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, maxWidth: "100%" }}>
            {filteredPagos.map((pago) => {
              const accent = getEstadoAccent(pago.estado)
              const isPagado = pago.estado === "pagado"
              const isPendienteOrMora = pago.estado === "pendiente" || pago.estado === "en_mora"
              const initial =
                pago.arrendatario_nombre?.trim()?.charAt(0)?.toUpperCase() || "P"

              return (
              <Card
                key={pago.id}
                variant="outlined"
                sx={{
                  width: "100%",
                  maxWidth: "100%",
                  borderRadius: 2.5,
                  borderColor: "divider",
                  borderLeft: 4,
                  borderLeftColor: accent,
                  bgcolor: "background.default",
                  backgroundImage: (theme) =>
                    `linear-gradient(135deg, ${theme.palette.mode === "dark" ? "rgba(82,139,158,0.08)" : "rgba(8,145,178,0.06)"} 0%, transparent 55%)`,
                  boxShadow: "none",
                  overflow: "hidden",
                  transition: "transform 0.15s ease, border-color 0.15s ease",
                  "&:active": { transform: "scale(0.992)" },
                }}
              >
                <CardContent
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    "&:last-child": { pb: { xs: 1.5, sm: 2 } },
                    minWidth: 0,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 1.5, mb: 2, minWidth: 0 }}>
                    <Avatar
                      sx={{
                        bgcolor: accent,
                        color: isPagado
                          ? "success.contrastText"
                          : pago.estado === "en_mora"
                            ? "error.contrastText"
                            : "warning.contrastText",
                        width: 44,
                        height: 44,
                        flexShrink: 0,
                        fontWeight: 700,
                        boxShadow: (theme) =>
                          `0 0 0 3px ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
                      }}
                    >
                      {initial}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight="medium" noWrap sx={{ minWidth: 0, flex: 1 }}>
                          {pago.arrendatario_nombre}
                        </Typography>
                        <Chip
                          label={getEstadoLabel(pago.estado)}
                          size="small"
                          color={getEstadoBadge(pago.estado).color}
                          variant={getEstadoBadge(pago.estado).variant}
                          sx={{ flexShrink: 0 }}
                        />
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.75, minWidth: 0 }}>
                        <HomeIcon sx={{ fontSize: 16, color: "primary.main", flexShrink: 0 }} />
                        <Typography variant="body2" color="primary" fontWeight="medium" noWrap sx={{ minWidth: 0 }}>
                          {pago.apartamento_nombre}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block" noWrap sx={{ mt: 0.25, pl: 2.75, minWidth: 0 }}>
                        {pago.apartamento_direccion}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.25,
                      py: 1.5,
                      px: { xs: 1.25, sm: 1.5 },
                      mb: 2,
                      borderRadius: 2,
                      minWidth: 0,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)",
                      border: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                        <CalendarIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}
                        >
                          Período
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        color="secondary.main"
                        sx={{ minWidth: 0, textAlign: "right", wordBreak: "break-word" }}
                      >
                        {formatPaymentPeriodForList(pago)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexShrink: 0 }}>
                        <PaymentIcon sx={{ fontSize: 16, color: "warning.main" }} />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}
                        >
                          Valor
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold" color="warning.main" sx={{ textAlign: "right" }}>
                        {formatCurrency(pago.valor)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600, flexShrink: 0 }}
                      >
                        Método
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        sx={{ minWidth: 0, textAlign: "right", wordBreak: "break-word" }}
                      >
                        {formatMetodoLabel(pago.metodo_pago)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600, flexShrink: 0 }}
                      >
                        Fecha pago
                      </Typography>
                      <Typography variant="body2" fontWeight="medium" sx={{ textAlign: "right" }}>
                        {!pago.fecha_pago ? "—" : formatDate(pago.fecha_pago)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1,
                      pt: 1.5,
                      borderTop: 1,
                      borderColor: "divider",
                    }}
                  >
                    {isPendienteOrMora && (
                      <>
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          startIcon={<EditIcon />}
                          onClick={() => openEditModal(pago)}
                          fullWidth
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          onClick={() => openConfirmarModal(pago)}
                          fullWidth
                          startIcon={
                            <Box
                              component="span"
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: 1,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: (theme) =>
                                  theme.palette.mode === "dark"
                                    ? "rgba(110,231,183,0.22)"
                                    : "rgba(16,185,129,0.16)",
                                color: "success.main",
                                border: 1,
                                borderColor: (theme) =>
                                  theme.palette.mode === "dark"
                                    ? "rgba(110,231,183,0.45)"
                                    : "rgba(16,185,129,0.35)",
                              }}
                            >
                              <ConfirmIcon sx={{ fontSize: 14 }} />
                            </Box>
                          }
                          sx={{
                            justifyContent: "center",
                            px: 1.5,
                            py: 1,
                            minHeight: 40,
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 700,
                            letterSpacing: "0.02em",
                            color: "success.main",
                            border: 1,
                            borderColor: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(110,231,183,0.4)"
                                : "rgba(16,185,129,0.35)",
                            backgroundImage: (theme) =>
                              `linear-gradient(135deg, ${
                                theme.palette.mode === "dark"
                                  ? "rgba(110,231,183,0.14)"
                                  : "rgba(16,185,129,0.1)"
                              } 0%, transparent 65%)`,
                            bgcolor: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(110,231,183,0.06)"
                                : "rgba(16,185,129,0.04)",
                            boxShadow: "none",
                            "& .MuiButton-startIcon": { mr: 1.25, ml: 0 },
                            "&:hover": {
                              borderColor: "success.main",
                              bgcolor: (theme) =>
                                theme.palette.mode === "dark"
                                  ? "rgba(110,231,183,0.14)"
                                  : "rgba(16,185,129,0.1)",
                              boxShadow: "none",
                            },
                          }}
                        >
                          Confirmar
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDelete(pago.id)}
                          fullWidth
                        >
                          Eliminar
                        </Button>
                      </>
                    )}
                    {isPagado && (
                      <>
                        <Button
                          variant="outlined"
                          size="small"
                          color="primary"
                          startIcon={<EditIcon />}
                          onClick={() => openEditModal(pago)}
                          fullWidth
                        >
                          Editar
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleReciboPdf(pago.id)}
                          fullWidth
                          startIcon={
                            <Box
                              component="span"
                              sx={{
                                width: 22,
                                height: 22,
                                borderRadius: 1,
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: (theme) =>
                                  theme.palette.mode === "dark"
                                    ? "rgba(245,158,11,0.25)"
                                    : "rgba(245,158,11,0.18)",
                                color: "warning.main",
                                border: 1,
                                borderColor: (theme) =>
                                  theme.palette.mode === "dark"
                                    ? "rgba(245,158,11,0.45)"
                                    : "rgba(245,158,11,0.35)",
                              }}
                            >
                              <PdfIcon sx={{ fontSize: 14 }} />
                            </Box>
                          }
                          sx={{
                            justifyContent: "center",
                            px: 1.5,
                            py: 1,
                            minHeight: 40,
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 700,
                            letterSpacing: "0.02em",
                            color: "warning.main",
                            border: 1,
                            borderColor: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(245,158,11,0.4)"
                                : "rgba(245,158,11,0.35)",
                            backgroundImage: (theme) =>
                              `linear-gradient(135deg, ${
                                theme.palette.mode === "dark"
                                  ? "rgba(245,158,11,0.16)"
                                  : "rgba(245,158,11,0.1)"
                              } 0%, transparent 65%)`,
                            bgcolor: (theme) =>
                              theme.palette.mode === "dark"
                                ? "rgba(245,158,11,0.06)"
                                : "rgba(245,158,11,0.04)",
                            boxShadow: "none",
                            "& .MuiButton-startIcon": { mr: 1.25, ml: 0 },
                            "&:hover": {
                              borderColor: "warning.main",
                              bgcolor: (theme) =>
                                theme.palette.mode === "dark"
                                  ? "rgba(245,158,11,0.14)"
                                  : "rgba(245,158,11,0.1)",
                              boxShadow: "none",
                            },
                          }}
                        >
                          Recibo PDF
                        </Button>
                      </>
                    )}
                  </Box>
                </CardContent>
              </Card>
              )
            })}

            {filteredPagos.length === 0 && (
              <Box sx={{ py: 8, textAlign: "center" }}>
                <Typography variant="h4" sx={{ mb: 2 }}>
                  💳
                </Typography>
                <Typography color="text.secondary">
                  {pagos.length === 0 ? "No hay pagos registrados" : "No se encontraron pagos"}
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                  {pagos.length === 0
                    ? "Usa Registrar pago o escríbenos desde Ayuda si necesitas soporte."
                    : "Intenta con otros términos de búsqueda o filtros"}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

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
    </Container>
  )
}

export default Pagos