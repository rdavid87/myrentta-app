import { useState, useEffect, useMemo } from "react"
import { Link, useSearchParams } from "react-router-dom"
import api from "../services/api"
import VerificarMoraResultModal from "../components/VerificarMoraResultModal"
import { normalizeVerificarMoraResponse } from "../utils/verificarMora"
import {
  getMonthName,
  getPeriodRangeFromMonthYear,
  formatPaymentPeriodForList,
  dedupeInstallmentPeriodOptions,
} from "../utils/periodoCuota"

/** Métodos válidos al registrar el cobro real (API); `por_definir` se reemplaza al confirmar. */
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

  /** Response from GET /pagos/contrato/:id/cuotas (registrar pago modal). */
  const [cuotasAlta, setCuotasAlta] = useState(null)
  const [cuotasAltaLoading, setCuotasAltaLoading] = useState(false)

  // Función para obtener fecha local en formato YYYY-MM-DD (evita problemas de timezone)
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
      // Filtrar solo contratos activos
      const activos = data?.filter(c => c.estado === "activo") || []
      setContratos(activos)
    } catch (error) {
      console.error("Error fetching contratos:", error)
    }
  }

  /** Load installment slots + labels from API (matches backend installment rules). */
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

  // Estado para descarga PDF
  const [descargandoPDF, setDescargandoPDF] = useState(null)

  // Descargar recibo en PDF (html2pdf en iframe aislado)
  const handleReciboPdf = async (pagoId) => {
    setDescargandoPDF(pagoId)
    try {
      const { data: htmlContent } = await api.get(`/recibos/${pagoId}/html`, { responseType: "text" })
      
      // Crear iframe oculto para aislar el proceso
      const iframe = document.createElement("iframe")
      iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:800px;height:1200px;border:none;"
      document.body.appendChild(iframe)
      
      const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
      
      // Escribir HTML completo en el iframe incluyendo la librería
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

      // Esperar a que cargue html2pdf en el iframe
      await new Promise((resolve) => {
        const checkLib = setInterval(() => {
          if (iframe.contentWindow.html2pdf) {
            clearInterval(checkLib)
            resolve()
          }
        }, 100)
        // Timeout de seguridad
        setTimeout(() => { clearInterval(checkLib); resolve() }, 3000)
      })

      // Esperar renderizado
      await new Promise(resolve => setTimeout(resolve, 500))

      const reciboElement = iframeDoc.querySelector(".recibo")
      
      if (!reciboElement) {
        throw new Error("No se encontró el recibo")
      }

      // Generar PDF dentro del iframe
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
      
      // Limpiar iframe
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

  // Autocompletar valor y períodos cuando se selecciona un contrato
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
      /** Slot suggested by API, only if the merged UI row for that mes/año is still available. */
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

  /** Select value for create form: composite key mes|anio */
  const createPeriodSlotValue =
    formData.mes !== "" && formData.anio !== ""
      ? `${formData.mes}|${formData.anio}`
      : ""

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

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case "pagado":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      case "en_mora":
        return "bg-red-500/20 text-red-300 border-red-500/30"
      default:
        return "bg-amber-500/20 text-amber-300 border-amber-500/30"
    }
  }

  const getEstadoIcon = (estado) => {
    switch (estado) {
      case "pagado":
        return "✅"
      case "en_mora":
        return "⚠️"
      default:
        return "⏳"
    }
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

  // Filtrar pagos
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur-xl opacity-20"></div>
          <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sm:p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-2">
                  💳 Gestión de Pagos
                </h1>
                <p className="text-sm sm:text-base text-gray-400 max-w-xl">
                  Registra y confirma pagos.{" "}
                  <Link to="/ayuda" className="text-teal-300/90 hover:text-teal-200 underline-offset-2 hover:underline">
                    Contactar soporte (Ayuda)
                  </Link>
                  .
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleVerificarMora}
                  disabled={verificandoMora}
                  className="group relative w-full sm:w-auto px-4 sm:px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl
                           font-semibold shadow-lg hover:shadow-violet-500/50 transition-all duration-300
                           hover:scale-105 active:scale-95 overflow-hidden text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Contratos activos: revisa canon vencido según día de pago y filas de pagos."
                >
                  <span className="relative flex items-center justify-center gap-2">
                    {verificandoMora ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                    )}
                    {verificandoMora ? "Verificando..." : "Verificar Mora"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCuotasAlta(null)
                    setCuotasAltaLoading(false)
                    setShowModal(true)
                  }}
                  className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl
                           font-semibold shadow-lg hover:shadow-emerald-500/50 transition-all duration-300
                           hover:scale-105 active:scale-95 overflow-hidden text-sm sm:text-base"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-emerald-600 opacity-0 
                                group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Registrar Pago
                  </span>
                </button>
              </div>
            </div>

            {filterContractId && (
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 rounded-xl
                            bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-sm text-emerald-200 flex-1 min-w-0">
                  <span className="text-emerald-400/90 font-medium">Pagos del contrato:</span>{" "}
                  <span className="text-white">{contractFilterLabel}</span>
                </p>
                <button
                  type="button"
                  onClick={clearContractFilter}
                  className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-200
                           border border-emerald-500/40 hover:bg-emerald-500/20 transition-colors"
                >
                  Ver todos los pagos
                </button>
              </div>
            )}

            {/* Barra de búsqueda y filtros */}
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Buscar por arrendatario, apartamento o período..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 
                           transition-all duration-300"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Filtro por estado */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full sm:w-auto sm:min-w-[28rem]">
                <button
                  onClick={() => setFilterEstado("todos")}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                    filterEstado === "todos"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterEstado("pendiente")}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                    filterEstado === "pendiente"
                      ? "bg-amber-600 text-white shadow-lg shadow-amber-500/30"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                  }`}
                >
                  ⏳ Pendientes
                </button>
                <button
                  onClick={() => setFilterEstado("pagado")}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                    filterEstado === "pagado"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                  }`}
                >
                  ✅ Pagados
                </button>
                <button
                  onClick={() => setFilterEstado("en_mora")}
                  className={`w-full px-3 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 ${
                    filterEstado === "en_mora"
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/30"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                  }`}
                >
                  ⚠️ En Mora
                </button>
              </div>
            </div>

            {(searchTerm || filterEstado !== "todos" || filterContractId) && (
              <p className="mt-3 text-sm text-gray-400">
                {filteredPagos.length} pago(s) encontrado(s)
              </p>
            )}
          </div>
        </div>

        {/* Tabla Desktop */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-b border-gray-700">
                <tr>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-emerald-300 uppercase tracking-wider">Arrendatario</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-emerald-300 uppercase tracking-wider">Apartamento</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-emerald-300 uppercase tracking-wider">Período</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-emerald-300 uppercase tracking-wider">Valor</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-emerald-300 uppercase tracking-wider">Método</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                    <span className="block">Fecha pago</span>
                    <span className="block font-normal normal-case text-[10px] text-gray-500 tracking-normal mt-0.5">
                      al confirmar cobro
                    </span>
                  </th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-emerald-300 uppercase tracking-wider whitespace-nowrap">Estado</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-emerald-300 uppercase tracking-wider whitespace-nowrap min-w-[17rem]">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredPagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-emerald-500/5 transition-colors duration-200">
                    <td className="px-4 xl:px-6 py-3 xl:py-4 font-medium text-gray-200 text-sm">{pago.arrendatario_nombre}</td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4 text-gray-300 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium">{pago.apartamento_nombre}</span>
                        <span className="text-xs text-gray-500">{pago.apartamento_direccion}</span>
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4 text-gray-300 text-sm">
                      <span className="px-2 py-1 bg-gray-700/50 rounded text-teal-300">
                        {formatPaymentPeriodForList(pago)}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4 text-emerald-300 font-semibold text-sm">{formatCurrency(pago.valor)}</td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4 text-gray-300 text-sm">{formatMetodoLabel(pago.metodo_pago)}</td>
                    <td
                      className="px-4 xl:px-6 py-3 xl:py-4 text-gray-300 text-sm"
                      title={!pago.fecha_pago ? "Se completa cuando confirmas el pago (no antes)" : undefined}
                    >
                      {formatDate(pago.fecha_pago)}
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4 whitespace-nowrap align-middle">
                      <span
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-semibold border leading-none ${getEstadoBadge(pago.estado)}`}
                      >
                        <span className="shrink-0 text-[0.95em] leading-none" aria-hidden="true">
                          {getEstadoIcon(pago.estado)}
                        </span>
                        <span>{pago.estado === "pagado" ? "Pagado" : pago.estado === "en_mora" ? "En mora" : "Pendiente"}</span>
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4 align-middle min-w-[17rem]">
                      <div className="flex flex-nowrap items-center gap-1.5">
                        {(pago.estado === "pendiente" || pago.estado === "en_mora") && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(pago)}
                              className="shrink-0 whitespace-nowrap px-3 py-1.5 bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-lg
                                       font-medium shadow-lg hover:shadow-cyan-500/50 transition-all duration-300
                                       hover:scale-105 active:scale-95 text-xs"
                            >
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editar
                              </span>
                            </button>
                            <button
                              onClick={() => openConfirmarModal(pago)}
                              className="shrink-0 whitespace-nowrap px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg
                                       font-medium shadow-lg hover:shadow-emerald-500/50 transition-all duration-300
                                       hover:scale-105 active:scale-95 text-xs"
                            >
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                                Confirmar
                              </span>
                            </button>
                            <button
                              onClick={() => handleDelete(pago.id)}
                              className="shrink-0 whitespace-nowrap px-3 py-1.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg
                                       font-medium shadow-lg hover:shadow-red-500/50 transition-all duration-300
                                       hover:scale-105 active:scale-95 text-xs"
                            >
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Eliminar
                              </span>
                            </button>
                          </>
                        )}
                        {pago.estado === "pagado" && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(pago)}
                              className="shrink-0 whitespace-nowrap px-3 py-1.5 bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-lg
                                       font-medium shadow-lg hover:shadow-cyan-500/50 transition-all duration-300
                                       hover:scale-105 active:scale-95 text-xs"
                              title="Revertir o ajustar datos del pago confirmado"
                            >
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Editar
                              </span>
                            </button>
                            <button
                              onClick={() => handleReciboPdf(pago.id)}
                              disabled={descargandoPDF === pago.id}
                              className="shrink-0 whitespace-nowrap px-3 py-1.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg
                                       font-medium shadow-lg hover:shadow-violet-500/50 transition-all duration-300
                                       hover:scale-105 active:scale-95 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Descargar recibo en PDF"
                            >
                              <span className="flex items-center gap-1">
                                {descargandoPDF === pago.id ? (
                                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                )}
                                Recibo PDF
                              </span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPagos.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="text-6xl mb-4">💳</div>
                <p className="text-gray-400 text-lg">
                  {pagos.length === 0 ? "No hay pagos registrados" : "No se encontraron pagos"}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {pagos.length === 0 
                    ? "Usa Registrar pago o contacta a soporte desde Ayuda si necesitas asistencia."
                    : "Intenta con otros términos de búsqueda o filtros"}
                </p>
              </div>
            )}
          </div>

          {/* Cards Mobile */}
          <div className="lg:hidden p-4 space-y-4">
            {filteredPagos.map((pago) => (
              <div 
                key={pago.id}
                className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-4
                         hover:border-emerald-500/50 transition-all duration-300"
              >
                <div>
                  <h3 className="text-white font-semibold text-sm leading-snug break-words">
                    {pago.arrendatario_nombre}
                  </h3>
                  <div className="mt-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border leading-snug ${getEstadoBadge(pago.estado)}`}
                    >
                      <span className="shrink-0 text-[0.95em] leading-none" aria-hidden="true">
                        {getEstadoIcon(pago.estado)}
                      </span>
                      <span>{pago.estado === "pagado" ? "Pagado" : pago.estado === "en_mora" ? "En mora" : "Pendiente"}</span>
                    </span>
                  </div>
                  <p className="text-teal-300 text-sm font-medium mt-2 break-words">{pago.apartamento_nombre}</p>
                  <p className="text-gray-400 text-xs mt-0.5 break-words leading-relaxed">{pago.apartamento_direccion}</p>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-600/50 space-y-2.5 text-sm">
                  <div className="flex gap-3 items-start">
                    <p className="text-gray-500 text-xs w-[4.5rem] shrink-0 pt-0.5">Período</p>
                    <p className="text-gray-200 flex-1 min-w-0 leading-snug break-words">
                      {formatPaymentPeriodForList(pago)}
                    </p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <p className="text-gray-500 text-xs w-[4.5rem] shrink-0 pt-0.5">Valor</p>
                    <p className="text-emerald-300 font-semibold flex-1 min-w-0">{formatCurrency(pago.valor)}</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <p className="text-gray-500 text-xs w-[4.5rem] shrink-0 pt-0.5">Método</p>
                    <p className="text-gray-200 flex-1 min-w-0 break-words">{formatMetodoLabel(pago.metodo_pago)}</p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <div className="w-[4.5rem] shrink-0">
                      <p className="text-gray-500 text-xs leading-tight">Fecha pago</p>
                      <p className="text-gray-500 text-[10px] leading-tight mt-0.5">Al confirmar</p>
                    </div>
                    <p
                      className="text-gray-200 flex-1 min-w-0"
                      title={!pago.fecha_pago ? "Se registra al confirmar el cobro" : undefined}
                    >
                      {formatDate(pago.fecha_pago)}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-600/50">
                  {(pago.estado === "pendiente" || pago.estado === "en_mora") && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditModal(pago)}
                        className="flex-1 min-w-[calc(50%-0.25rem)] px-3 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-lg
                                 font-medium shadow-lg hover:shadow-cyan-500/50 transition-all duration-300
                                 active:scale-95 text-xs"
                      >
                        <span className="flex items-center justify-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </span>
                      </button>
                      <button
                        onClick={() => openConfirmarModal(pago)}
                        className="flex-1 min-w-[calc(50%-0.25rem)] px-3 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg
                                 font-medium shadow-lg hover:shadow-emerald-500/50 transition-all duration-300
                                 active:scale-95 text-xs"
                      >
                        <span className="flex items-center justify-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Confirmar
                        </span>
                      </button>
                      <button
                        onClick={() => handleDelete(pago.id)}
                        className="w-full px-3 py-2.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg
                                 font-medium shadow-lg hover:shadow-red-500/50 transition-all duration-300
                                 active:scale-95 text-xs"
                      >
                        <span className="flex items-center justify-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Eliminar
                        </span>
                      </button>
                    </>
                  )}
                  {pago.estado === "pagado" && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditModal(pago)}
                        className="flex-1 px-3 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-lg
                                 font-medium shadow-lg hover:shadow-cyan-500/50 transition-all duration-300
                                 active:scale-95 text-xs"
                        title="Revertir o ajustar datos del pago confirmado"
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Editar
                        </span>
                      </button>
                      <button
                        onClick={() => handleReciboPdf(pago.id)}
                        disabled={descargandoPDF === pago.id}
                        className="flex-1 px-3 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg
                                 font-medium shadow-lg hover:shadow-violet-500/50 transition-all duration-300
                                 active:scale-95 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Descargar recibo en PDF"
                      >
                        <span className="flex items-center justify-center gap-1.5">
                          {descargandoPDF === pago.id ? (
                            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          )}
                          Recibo PDF
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}

            {filteredPagos.length === 0 && (
              <div className="py-16 text-center">
                <div className="text-6xl mb-4">💳</div>
                <p className="text-gray-400 text-lg">
                  {pagos.length === 0 ? "No hay pagos registrados" : "No se encontraron pagos"}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {pagos.length === 0 
                    ? "Usa Registrar pago o escríbenos desde Ayuda si necesitas soporte."
                    : "Intenta con otros términos de búsqueda o filtros"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Registrar Pago */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-lg w-full 
                        border border-gray-700/50 overflow-hidden my-8">
            <div className="relative bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-b border-gray-700/50 p-4 sm:p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-10"></div>
              <h2 className="relative text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">💵</span>
                <span className="leading-tight">Registrar Nuevo Pago</span>
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Contrato */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  📋 Contrato
                </label>
                <select
                  value={formData.contrato_id}
                  onChange={(e) => handleContratoChange(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 
                           transition-all duration-300"
                  required
                >
                  <option value="" className="bg-gray-800">Seleccionar contrato</option>
                  {contratos.map((contrato) => (
                    <option key={contrato.id} value={contrato.id} className="bg-gray-800">
                      {contrato.arrendatario_nombre} - {contrato.apartamento_nombre} ({formatCurrency(contrato.canon_mensual)}/mes)
                    </option>
                  ))}
                </select>
                {contratos.length === 0 && (
                  <p className="text-amber-400 text-xs sm:text-sm mt-2">⚠️ No hay contratos activos</p>
                )}
              </div>

              {/* Período (mes ancla según backend; etiqueta = rango visible p. ej. Abril-Mayo 2026) */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    📅 Periodo
                  </label>
                  <select
                    value={createPeriodSlotValue}
                    onChange={(e) => {
                      const v = e.target.value
                      if (!v) {
                        setFormData((prev) => ({ ...prev, mes: "", anio: new Date().getFullYear().toString() }))
                        return
                      }
                      const [mesStr, anioStr] = v.split("|")
                      setFormData((prev) => ({
                        ...prev,
                        mes: mesStr,
                        anio: anioStr || prev.anio,
                      }))
                    }}
                    disabled={
                      !formData.contrato_id ||
                      cuotasAltaLoading ||
                      !cuotasAlta?.periodos?.length
                    }
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 
                             transition-all duration-300 disabled:opacity-45 disabled:cursor-not-allowed"
                    required={!!cuotasAlta?.periodos?.length}
                  >
                    <option value="" className="bg-gray-800">
                      {!formData.contrato_id
                        ? "Primero elige contrato"
                        : cuotasAltaLoading
                          ? "Cargando períodos…"
                          : "Seleccionar período"}
                    </option>
                    {dedupeInstallmentPeriodOptions(cuotasAlta?.periodos, cuotasAlta?.siguiente).map((p) => {
                      const disabled = !!p.existe
                      const key = `${p.mes}|${p.anio}`
                      return (
                        <option key={key} value={key} disabled={disabled} className="bg-gray-800">
                          {p.etiqueta}
                          {p.existe ? " (ya existe)" : ""}
                        </option>
                      )
                    })}
                  </select>
                  {formData.contrato_id && cuotasAlta && !cuotasAlta.periodos?.length ? (
                    <p className="text-amber-400 text-xs mt-2">
                      No hay meses de cobro según las fechas del contrato.
                    </p>
                  ) : null}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    📆 Año
                  </label>
                  <input
                    type="number"
                    min="2000"
                    max="2100"
                    readOnly={!!cuotasAlta?.periodos?.length}
                    title={
                      cuotasAlta?.periodos?.length
                        ? "Se toma del periodo seleccionado (coincide con el mes ancla)."
                        : "Año fiscal del período"
                    }
                    value={formData.anio}
                    onChange={(e) => setFormData((prev) => ({ ...prev, anio: e.target.value }))}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 
                             transition-all duration-300 read-only:opacity-80 read-only:cursor-default"
                    required
                  />
                </div>
              </div>

              {/* Valor y Método */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    💰 Valor
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="250000"
                    value={formData.valor}
                    onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 
                             focus:border-emerald-500/50 transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    💳 Método de Pago
                  </label>
                  <select
                    value={formData.metodo_pago}
                    onChange={(e) => setFormData({ ...formData, metodo_pago: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 
                             transition-all duration-300"
                    required
                  >
                    <option value="efectivo" className="bg-gray-800">💵 Efectivo</option>
                    <option value="transferencia" className="bg-gray-800">💳 Transferencia</option>
                    <option value="cheque" className="bg-gray-800">📄 Cheque</option>
                  </select>
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
                <button
                  type="submit"
                  disabled={contratos.length === 0}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl
                           font-semibold shadow-lg hover:shadow-emerald-500/50 transition-all duration-300
                           hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                           disabled:hover:scale-100 text-sm sm:text-base"
                >
                  Registrar Pago
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold
                           transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Pago (pendiente / en mora) */}
      {showEditModal && pagoToEdit && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-lg w-full border border-gray-700/50 overflow-hidden my-8">
            <div className="relative bg-gradient-to-r from-sky-600/20 to-cyan-600/20 border-b border-gray-700/50 p-4 sm:p-6">
              <h2 className="relative text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">✏️</span>
                Editar pago
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {pagoToEdit.arrendatario_nombre} · {pagoToEdit.apartamento_nombre}
              </p>
            </div>
            <form onSubmit={handleEditSubmit} className="p-4 sm:p-6 space-y-4">
              <p className="text-xs text-gray-500 bg-gray-800/40 rounded-lg px-3 py-2 border border-gray-600/40">
                {pagoToEdit.estado === "pagado"
                  ? "Este pago está confirmado. Elige Pendiente o En mora para revertir el cobro (se borrará la fecha de pago en el sistema)."
                  : "El período del pago no se puede cambiar aquí. Ajusta valor, método y estado. Para marcar como Pagado sin usar «Confirmar», elige estado Pagado e indica la fecha."}
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Periodo</label>
                <div className="w-full px-3 py-2.5 bg-gray-800/70 border border-gray-600/50 rounded-xl text-teal-200 text-sm">
                  {formatPaymentPeriodForList(pagoToEdit)}
                </div>
                {pagoToEdit.estado === "pagado" ? (
                  <p className="text-[11px] text-gray-500 mt-1.5">
                    No puedes cambiar mes/año mientras el pago siga marcado como pagado en el servidor.
                  </p>
                ) : null}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Valor</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editFormData.valor}
                  onChange={(e) => setEditFormData({ ...editFormData, valor: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-cyan-500/50"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Método de pago</label>
                <select
                  value={editFormData.metodo_pago}
                  onChange={(e) => setEditFormData({ ...editFormData, metodo_pago: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-cyan-500/50"
                  required
                >
                  <option value="por_definir" className="bg-gray-800">Por definir</option>
                  <option value="efectivo" className="bg-gray-800">💵 Efectivo</option>
                  <option value="transferencia" className="bg-gray-800">💳 Transferencia</option>
                  <option value="cheque" className="bg-gray-800">📄 Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-300 mb-2">Estado</label>
                <select
                  value={editFormData.estado}
                  onChange={(e) => setEditFormData({ ...editFormData, estado: e.target.value })}
                  className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-cyan-500/50"
                >
                  {pagoToEdit.estado === "pagado" ? (
                    <>
                      <option value="pendiente" className="bg-gray-800">
                        Pendiente (revertir cobro)
                      </option>
                      <option value="en_mora" className="bg-gray-800">
                        En mora (revertir cobro)
                      </option>
                    </>
                  ) : (
                    <>
                      <option value="pendiente" className="bg-gray-800">
                        Pendiente
                      </option>
                      <option value="en_mora" className="bg-gray-800">
                        En mora
                      </option>
                      <option value="pagado" className="bg-gray-800">
                        Pagado (sin usar Confirmar)
                      </option>
                    </>
                  )}
                </select>
              </div>

              {pagoToEdit.estado !== "pagado" && editFormData.estado === "pagado" && (
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">Fecha del cobro</label>
                  <input
                    type="date"
                    value={editFormData.fecha_pago}
                    onChange={(e) => setEditFormData({ ...editFormData, fecha_pago: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-cyan-500/50"
                    required={editFormData.estado === "pagado"}
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Obligatorio al pasar el estado a Pagado desde esta pantalla.</p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-xl font-semibold shadow-lg hover:brightness-110 transition-all"
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-all"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Pago */}
      {/* Modal Confirmar Pago - Responsive */}
      <VerificarMoraResultModal
        open={showMoraModal}
        resultadoMora={resultadoMora}
        onClose={closeMoraModal}
        onEnviarNotificaciones={handleEnviarNotificacionesMora}
        enviandoNotificaciones={enviandoNotificaciones}
      />

      {showConfirmarModal && pagoToConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
          <div className="relative bg-gradient-to-br from-gray-900 via-emerald-900/10 to-gray-900 rounded-2xl sm:rounded-3xl shadow-2xl 
                        max-w-md w-full border border-emerald-500/30 overflow-hidden my-auto max-h-[95vh] flex flex-col">
            
            {/* Efecto de brillo superior */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"></div>
            
            {/* Header */}
            <div className="relative bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-b border-gray-700/50 p-4 sm:p-5 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-10"></div>
              <h2 className="relative text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span className="text-xl sm:text-2xl">✅</span>
                <span className="leading-tight">Confirmar Pago</span>
              </h2>
            </div>

            {/* Contenido scrolleable */}
            <form onSubmit={handleConfirmar} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
                {/* Info del pago */}
                <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 space-y-2 border border-gray-700/30">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-gray-400">Arrendatario</p>
                      <p className="text-white font-medium text-sm">{pagoToConfirm.arrendatario_nombre}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Apartamento</p>
                      <p className="text-white font-medium text-sm">{pagoToConfirm.apartamento_nombre}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Período</p>
                      <p className="text-teal-300 font-medium text-sm">
                        {formatPaymentPeriodForList(pagoToConfirm)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Valor a pagar</p>
                      <p className="text-emerald-400 font-bold text-base">{formatCurrency(pagoToConfirm.valor)}</p>
                    </div>
                  </div>
                  {!METODOS_COBRO_CONFIRMADOS.has(pagoToConfirm.metodo_pago) && (
                    <p className="text-xs text-amber-200/90 mt-3">
                      La cuota venía con método <strong className="text-amber-100">por definir</strong>; indica abajo cómo se cobró al confirmar.
                    </p>
                  )}
                </div>

                {/* Fecha de pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    📅 Fecha de Pago
                  </label>
                  <input
                    type="date"
                    value={confirmarData.fecha_pago}
                    onChange={(e) => setConfirmarData({ ...confirmarData, fecha_pago: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 
                             transition-all duration-300"
                    required
                  />
                </div>

                {/* Método de pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    💳 Método de Pago
                  </label>
                  <select
                    value={confirmarData.metodo_pago}
                    onChange={(e) => setConfirmarData({ ...confirmarData, metodo_pago: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 
                             transition-all duration-300"
                    required
                  >
                    <option value="efectivo" className="bg-gray-800">💵 Efectivo</option>
                    <option value="transferencia" className="bg-gray-800">💳 Transferencia</option>
                    <option value="cheque" className="bg-gray-800">📄 Cheque</option>
                  </select>
                </div>
              </div>

              {/* Botones - siempre visibles */}
              <div className="p-4 sm:p-5 border-t border-gray-700/30 flex-shrink-0 bg-gray-900/50">
                <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={closeConfirmarModal}
                    className="w-full sm:w-auto px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold text-sm
                             transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="w-full sm:flex-1 px-5 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl
                             font-semibold shadow-lg hover:shadow-emerald-500/50 transition-all duration-300 text-sm
                             hover:scale-[1.02] active:scale-[0.98]"
                  >
                    ✅ Confirmar Pago
                  </button>
                </div>
              </div>
            </form>

            {/* Efecto de brillo inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pagos
