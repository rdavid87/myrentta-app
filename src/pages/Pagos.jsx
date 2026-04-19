import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import VerificarMoraResultModal from "../components/VerificarMoraResultModal"
import { normalizeVerificarMoraResponse } from "../utils/verificarMora"

/** Métodos válidos al registrar el cobro real (API); `por_definir` se reemplaza al confirmar. */
const METODOS_COBRO_CONFIRMADOS = new Set(["efectivo", "transferencia", "cheque"])

function metodoAlConfirmarCobro(pago) {
  const m = pago?.metodo_pago
  if (m && METODOS_COBRO_CONFIRMADOS.has(m)) return m
  return "efectivo"
}

const Pagos = () => {
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = {
        ...formData,
        contrato_id: parseInt(formData.contrato_id),
        mes: parseInt(formData.mes),
        anio: parseInt(formData.anio),
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

  // Autocompletar valor cuando se selecciona un contrato
  const handleContratoChange = (contratoId) => {
    setFormData({ ...formData, contrato_id: contratoId })
    const contrato = contratos.find(c => c.id === parseInt(contratoId))
    if (contrato) {
      setFormData(prev => ({
        ...prev,
        contrato_id: contratoId,
        valor: contrato.canon_mensual.toString(),
      }))
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

  const getNombreMes = (mes) => {
    const meses = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    return meses[mes] || mes
  }

  // Obtener período completo (mes anterior - mes actual) para pagos anticipados
  const getPeriodo = (mes, anio) => {
    const meses = ["", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
      "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
    
    // Mes anterior
    let mesAnterior = mes - 1
    let anioAnterior = anio
    if (mesAnterior < 1) {
      mesAnterior = 12
      anioAnterior = anio - 1
    }
    
    // Si el año es diferente, mostrar ambos años
    if (anioAnterior !== anio) {
      return `${meses[mesAnterior]} ${anioAnterior} - ${meses[mes]} ${anio}`
    }
    return `${meses[mesAnterior]} - ${meses[mes]} ${anio}`
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

  // Filtrar pagos
  const filteredPagos = pagos.filter(pago => {
    const matchesSearch = 
      pago.arrendatario_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pago.apartamento_numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getNombreMes(pago.mes).toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesEstado = filterEstado === "todos" || pago.estado === filterEstado
    
    return matchesSearch && matchesEstado
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
                  <Link to="/configuraciones" className="text-teal-300/90 hover:text-teal-200 underline-offset-2 hover:underline">
                    Ayuda sobre cuotas automáticas (Configuración)
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
                  onClick={() => setShowModal(true)}
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
                  placeholder="Buscar por arrendatario, apartamento o mes..."
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
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setFilterEstado("todos")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filterEstado === "todos"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterEstado("pendiente")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filterEstado === "pendiente"
                      ? "bg-amber-600 text-white shadow-lg shadow-amber-500/30"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                  }`}
                >
                  ⏳ Pendientes
                </button>
                <button
                  onClick={() => setFilterEstado("pagado")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filterEstado === "pagado"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                  }`}
                >
                  ✅ Pagados
                </button>
                <button
                  onClick={() => setFilterEstado("en_mora")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filterEstado === "en_mora"
                      ? "bg-red-600 text-white shadow-lg shadow-red-500/30"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                  }`}
                >
                  ⚠️ En Mora
                </button>
              </div>
            </div>

            {(searchTerm || filterEstado !== "todos") && (
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
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-emerald-300 uppercase tracking-wider">Estado</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-emerald-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredPagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-emerald-500/5 transition-colors duration-200">
                    <td className="px-4 xl:px-6 py-3 xl:py-4 font-medium text-gray-200 text-sm">{pago.arrendatario_nombre}</td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4 text-gray-300 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium">{pago.apartamento_numero}</span>
                        <span className="text-xs text-gray-500">{pago.apartamento_direccion}</span>
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4 text-gray-300 text-sm">
                      <span className="px-2 py-1 bg-gray-700/50 rounded text-teal-300">
                        {getPeriodo(pago.mes, pago.anio)}
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
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getEstadoBadge(pago.estado)}`}>
                        {getEstadoIcon(pago.estado)} {pago.estado === "pagado" ? "Pagado" : pago.estado === "en_mora" ? "En mora" : "Pendiente"}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {(pago.estado === "pendiente" || pago.estado === "en_mora") && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(pago)}
                              className="px-3 py-1.5 bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-lg
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
                              className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg
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
                              className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg
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
                          <div className="flex flex-wrap gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(pago)}
                              className="px-3 py-1.5 bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-lg
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
                              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg
                                       font-medium shadow-lg hover:shadow-cyan-500/50 transition-all duration-300
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
                            <button
                              type="button"
                              disabled
                              aria-disabled="true"
                              className="px-3 py-1.5 bg-gradient-to-r from-purple-600/50 to-pink-600/50 text-white/80 rounded-lg
                                       font-medium text-xs cursor-not-allowed opacity-70"
                              title="Envío por correo no disponible por ahora"
                            >
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                                Email
                              </span>
                            </button>
                          </div>
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
                    ? "Usa Registrar pago o revisa en Configuración cómo se generan las cuotas al crear contratos."
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
                <div className="flex gap-4">
                  {/* Contenido principal */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold text-lg">{pago.arrendatario_nombre}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getEstadoBadge(pago.estado)}`}>
                          {getEstadoIcon(pago.estado)} {pago.estado === "pagado" ? "Pagado" : pago.estado === "en_mora" ? "Mora" : "Pendiente"}
                        </span>
                      </div>
                      <p className="text-teal-300 text-sm font-medium">{pago.apartamento_numero}</p>
                      <p className="text-gray-400 text-xs">{pago.apartamento_direccion}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Período</p>
                        <p className="text-gray-200">{getPeriodo(pago.mes, pago.anio)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Valor</p>
                        <p className="text-emerald-300 font-semibold">{formatCurrency(pago.valor)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Método</p>
                        <p className="text-gray-200">{formatMetodoLabel(pago.metodo_pago)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Fecha pago (al confirmar)</p>
                        <p className="text-gray-200" title={!pago.fecha_pago ? "Se registra al confirmar el cobro" : undefined}>
                          {formatDate(pago.fecha_pago)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botones a la derecha */}
                  <div className="flex flex-col gap-2">
                    {(pago.estado === "pendiente" || pago.estado === "en_mora") && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEditModal(pago)}
                          className="w-28 px-3 py-2 bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-lg
                                   font-medium shadow-lg hover:shadow-cyan-500/50 transition-all duration-300
                                   active:scale-95 text-xs"
                        >
                          <span className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Editar
                          </span>
                        </button>
                        <button
                          onClick={() => openConfirmarModal(pago)}
                          className="w-28 px-3 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg
                                   font-medium shadow-lg hover:shadow-emerald-500/50 transition-all duration-300
                                   active:scale-95 text-xs"
                        >
                          <span className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                            Confirmar
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(pago.id)}
                          className="w-28 px-3 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg
                                   font-medium shadow-lg hover:shadow-red-500/50 transition-all duration-300
                                   active:scale-95 text-xs"
                        >
                          <span className="flex items-center justify-center gap-1">
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
                          className="min-w-[7.5rem] w-full max-w-[9rem] px-3 py-2 bg-gradient-to-r from-sky-600 to-cyan-600 text-white rounded-lg
                                   font-medium shadow-lg hover:shadow-cyan-500/50 transition-all duration-300
                                   active:scale-95 text-[11px] leading-tight"
                          title="Revertir o ajustar"
                        >
                          <span className="flex flex-col items-center justify-center gap-0.5">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Editar</span>
                          </span>
                        </button>
                        <button
                          onClick={() => handleReciboPdf(pago.id)}
                          disabled={descargandoPDF === pago.id}
                          className="min-w-[7.5rem] w-full max-w-[9rem] px-3 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg
                                   font-medium shadow-lg hover:shadow-cyan-500/50 transition-all duration-300
                                   active:scale-95 text-[11px] leading-tight disabled:opacity-50"
                          title="Descargar recibo en PDF"
                        >
                          <span className="flex flex-col items-center justify-center gap-0.5">
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
                            <span>Recibo PDF</span>
                          </span>
                        </button>
                        <button
                          type="button"
                          disabled
                          aria-disabled="true"
                          className="w-28 px-3 py-2 bg-gradient-to-r from-purple-600/50 to-pink-600/50 text-white/80 rounded-lg
                                   font-medium text-xs cursor-not-allowed opacity-70"
                          title="Envío por correo no disponible por ahora"
                        >
                          <span className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Email
                          </span>
                        </button>
                      </>
                    )}
                  </div>
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
                    ? "Usa Registrar pago o revisa la ayuda en Configuración."
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
                      {contrato.arrendatario_nombre} - {contrato.apartamento_numero} ({formatCurrency(contrato.canon_mensual)}/mes)
                    </option>
                  ))}
                </select>
                {contratos.length === 0 && (
                  <p className="text-amber-400 text-xs sm:text-sm mt-2">⚠️ No hay contratos activos</p>
                )}
              </div>

              {/* Período */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    📅 Mes
                  </label>
                  <select
                    value={formData.mes}
                    onChange={(e) => setFormData({ ...formData, mes: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 
                             transition-all duration-300"
                    required
                  >
                    <option value="" className="bg-gray-800">Mes</option>
                    <option value="1" className="bg-gray-800">Enero</option>
                    <option value="2" className="bg-gray-800">Febrero</option>
                    <option value="3" className="bg-gray-800">Marzo</option>
                    <option value="4" className="bg-gray-800">Abril</option>
                    <option value="5" className="bg-gray-800">Mayo</option>
                    <option value="6" className="bg-gray-800">Junio</option>
                    <option value="7" className="bg-gray-800">Julio</option>
                    <option value="8" className="bg-gray-800">Agosto</option>
                    <option value="9" className="bg-gray-800">Septiembre</option>
                    <option value="10" className="bg-gray-800">Octubre</option>
                    <option value="11" className="bg-gray-800">Noviembre</option>
                    <option value="12" className="bg-gray-800">Diciembre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    📆 Año
                  </label>
                  <input
                    type="number"
                    min="2020"
                    max="2030"
                    value={formData.anio}
                    onChange={(e) => setFormData({ ...formData, anio: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 
                             transition-all duration-300"
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
                {pagoToEdit.arrendatario_nombre} · {pagoToEdit.apartamento_numero}
              </p>
            </div>
            <form onSubmit={handleEditSubmit} className="p-4 sm:p-6 space-y-4">
              <p className="text-xs text-gray-500 bg-gray-800/40 rounded-lg px-3 py-2 border border-gray-600/40">
                {pagoToEdit.estado === "pagado"
                  ? "Este pago está confirmado. Elige Pendiente o En mora para revertir el cobro (se borrará la fecha de pago en el sistema)."
                  : "Ajusta período, valor, método y estado. Para marcar como Pagado sin usar «Confirmar», elige estado Pagado e indica la fecha."}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">Mes del periodo</label>
                  <select
                    value={editFormData.mes}
                    onChange={(e) => setEditFormData({ ...editFormData, mes: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-cyan-500/50"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={String(m)} className="bg-gray-800">
                        {getNombreMes(m)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-2">Año</label>
                  <input
                    type="number"
                    min="2020"
                    max="2040"
                    value={editFormData.anio}
                    onChange={(e) => setEditFormData({ ...editFormData, anio: e.target.value })}
                    className="w-full px-3 py-2.5 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm focus:ring-2 focus:ring-cyan-500/50"
                    required
                  />
                </div>
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
                      <p className="text-white font-medium text-sm">{pagoToConfirm.apartamento_numero}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Período</p>
                      <p className="text-teal-300 font-medium text-sm">{getPeriodo(pagoToConfirm.mes, pagoToConfirm.anio)}</p>
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
