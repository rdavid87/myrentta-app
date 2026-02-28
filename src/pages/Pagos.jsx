import { useState, useEffect } from "react"
import api from "../services/api"

const Pagos = () => {
  const [pagos, setPagos] = useState([])
  const [contratos, setContratos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showConfirmarModal, setShowConfirmarModal] = useState(false)
  const [pagoToConfirm, setPagoToConfirm] = useState(null)
  const [enviandoEmail, setEnviandoEmail] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [generandoPagos, setGenerandoPagos] = useState(false)
  const [showGenerarModal, setShowGenerarModal] = useState(false)
  const [resultadoGeneracion, setResultadoGeneracion] = useState(null)

  const [formData, setFormData] = useState({
    contrato_id: "",
    mes: "",
    anio: new Date().getFullYear().toString(),
    valor: "",
    metodo_pago: "transferencia",
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
    metodo_pago: "transferencia",
  })

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

  // Generar pagos automáticos
  const handleGenerarPagos = async () => {
    setGenerandoPagos(true)
    try {
      const { data } = await api.post("/pagos/generar-automaticos")
      setResultadoGeneracion(data)
      setShowGenerarModal(true)
      fetchPagos()
    } catch (error) {
      console.error("Error generando pagos:", error)
      alert("Error: " + (error.response?.data?.error || error.message))
    } finally {
      setGenerandoPagos(false)
    }
  }

  const closeGenerarModal = () => {
    setShowGenerarModal(false)
    setResultadoGeneracion(null)
  }

  // Estado para descarga PDF
  const [descargandoPDF, setDescargandoPDF] = useState(null)

  // Descargar recibo como PDF usando iframe aislado
  const handleDescargarRecibo = async (pagoId) => {
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

  // Ver recibo en nueva ventana (para imprimir)
  const handleVerRecibo = async (pagoId) => {
    try {
      const { data } = await api.get(`/recibos/${pagoId}/html`, { responseType: "text" })
      const ventana = window.open("", "_blank")
      ventana.document.write(data)
      ventana.document.close()
    } catch (error) {
      console.error("Error mostrando recibo:", error)
      alert("Error al mostrar recibo: " + (error.response?.data?.error || error.message))
    }
  }

  // Enviar recibo por email
  const handleEnviarEmail = async (pagoId) => {
    setEnviandoEmail(pagoId)
    try {
      const { data } = await api.post(`/recibos/${pagoId}/enviar`)
      alert(`✅ ${data.message}`)
    } catch (error) {
      console.error("Error enviando email:", error)
      alert("Error al enviar email: " + (error.response?.data?.error || error.message))
    } finally {
      setEnviandoEmail(null)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setFormData({
      contrato_id: "",
      mes: "",
      anio: new Date().getFullYear().toString(),
      valor: "",
      metodo_pago: "transferencia",
    })
  }

  const closeConfirmarModal = () => {
    setShowConfirmarModal(false)
    setPagoToConfirm(null)
    setConfirmarData({
      fecha_pago: getLocalDateString(),
      metodo_pago: "transferencia",
    })
  }

  const openConfirmarModal = (pago) => {
    setPagoToConfirm(pago)
    setConfirmarData({
      fecha_pago: getLocalDateString(),
      metodo_pago: pago.metodo_pago || "transferencia",
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
    if (!dateString) return "-"
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
                <p className="text-sm sm:text-base text-gray-400">Registra y confirma los pagos de arrendamiento</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* Botón Generar Pagos del Mes */}
                <button
                  onClick={handleGenerarPagos}
                  disabled={generandoPagos}
                  className="group relative w-full sm:w-auto px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl
                           font-semibold shadow-lg hover:shadow-purple-500/50 transition-all duration-300
                           hover:scale-105 active:scale-95 overflow-hidden text-sm sm:text-base
                           disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-600 opacity-0 
                                group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    {generandoPagos ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                    {generandoPagos ? "Generando..." : "Generar Pagos"}
                  </span>
                </button>

                {/* Botón Registrar Pago */}
                <button
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
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-emerald-300 uppercase tracking-wider">Fecha Pago</th>
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
                    <td className="px-4 xl:px-6 py-3 xl:py-4 text-gray-300 text-sm capitalize">{pago.metodo_pago}</td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4 text-gray-300 text-sm">{formatDate(pago.fecha_pago)}</td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getEstadoBadge(pago.estado)}`}>
                        {getEstadoIcon(pago.estado)} {pago.estado === "pagado" ? "Pagado" : pago.estado === "en_mora" ? "En mora" : "Pendiente"}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <div className="flex gap-1.5">
                        {(pago.estado === "pendiente" || pago.estado === "en_mora") && (
                          <>
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
                          <div className="flex gap-1.5">
                            <button
                              onClick={() => handleVerRecibo(pago.id)}
                              className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg
                                       font-medium shadow-lg hover:shadow-blue-500/50 transition-all duration-300
                                       hover:scale-105 active:scale-95 text-xs"
                              title="Ver/Imprimir Recibo"
                            >
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                                </svg>
                                Recibo
                              </span>
                            </button>
                            <button
                              onClick={() => handleDescargarRecibo(pago.id)}
                              disabled={descargandoPDF === pago.id}
                              className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg
                                       font-medium shadow-lg hover:shadow-cyan-500/50 transition-all duration-300
                                       hover:scale-105 active:scale-95 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Descargar PDF"
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
                                PDF
                              </span>
                            </button>
                            <button
                              onClick={() => handleEnviarEmail(pago.id)}
                              disabled={enviandoEmail === pago.id}
                              className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg
                                       font-medium shadow-lg hover:shadow-purple-500/50 transition-all duration-300
                                       hover:scale-105 active:scale-95 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Enviar por Email"
                            >
                              <span className="flex items-center gap-1">
                                {enviandoEmail === pago.id ? (
                                  <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                  </svg>
                                ) : (
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                )}
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
                    ? "Registra el primer pago para comenzar"
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
                        <p className="text-gray-200 capitalize">{pago.metodo_pago}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Fecha Pago</p>
                        <p className="text-gray-200">{formatDate(pago.fecha_pago)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Botones a la derecha */}
                  <div className="flex flex-col gap-2">
                    {(pago.estado === "pendiente" || pago.estado === "en_mora") && (
                      <>
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
                          onClick={() => handleVerRecibo(pago.id)}
                          className="w-28 px-3 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg
                                   font-medium shadow-lg hover:shadow-blue-500/50 transition-all duration-300
                                   active:scale-95 text-xs"
                        >
                          <span className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                            </svg>
                            Ver Recibo
                          </span>
                        </button>
                        <button
                          onClick={() => handleDescargarRecibo(pago.id)}
                          disabled={descargandoPDF === pago.id}
                          className="w-28 px-3 py-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white rounded-lg
                                   font-medium shadow-lg hover:shadow-cyan-500/50 transition-all duration-300
                                   active:scale-95 text-xs disabled:opacity-50"
                        >
                          <span className="flex items-center justify-center gap-1">
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
                            PDF
                          </span>
                        </button>
                        <button
                          onClick={() => handleEnviarEmail(pago.id)}
                          disabled={enviandoEmail === pago.id}
                          className="w-28 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg
                                   font-medium shadow-lg hover:shadow-purple-500/50 transition-all duration-300
                                   active:scale-95 text-xs disabled:opacity-50"
                        >
                          <span className="flex items-center justify-center gap-1">
                            {enviandoEmail === pago.id ? (
                              <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                              </svg>
                            ) : (
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                            )}
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
                    ? "Registra el primer pago para comenzar"
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
                    <option value="transferencia" className="bg-gray-800">💳 Transferencia</option>
                    <option value="efectivo" className="bg-gray-800">💵 Efectivo</option>
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

      {/* Modal Confirmar Pago */}
      {/* Modal Confirmar Pago - Responsive */}
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
                    <option value="transferencia" className="bg-gray-800">💳 Transferencia</option>
                    <option value="efectivo" className="bg-gray-800">💵 Efectivo</option>
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
      {/* Modal de Resultado de Generación de Pagos */}
      {showGenerarModal && resultadoGeneracion && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-3xl shadow-2xl 
                        max-w-lg w-full border border-purple-500/30 overflow-hidden my-4 max-h-[90vh] flex flex-col">
            
            {/* Efecto de brillo superior */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-emerald-500"></div>
            
            {/* Header */}
            <div className="relative p-6 sm:p-8 text-center flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-transparent"></div>
              
              <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-3">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute inset-2 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full opacity-30"></div>
                <div className="relative text-3xl sm:text-4xl">
                  {resultadoGeneracion.pagos_generados > 0 ? '✅' : '📋'}
                </div>
              </div>
              
              <h2 className="relative text-xl sm:text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                Generación de Pagos
              </h2>
              <p className="relative text-gray-400 text-xs sm:text-sm">
                {new Date().toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Contenido */}
            <div className="px-6 sm:px-8 pb-4 space-y-4 overflow-y-auto flex-1">
              
              {/* Cards de estadísticas */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/30 rounded-2xl p-4 text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-blue-400 mb-1">
                    {resultadoGeneracion.contratos_activos}
                  </div>
                  <div className="text-xs sm:text-sm text-blue-300/80">Contratos activos</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-1">
                    {resultadoGeneracion.pagos_generados}
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-300/80">Pagos generados</div>
                </div>
              </div>

              {/* Mensaje según resultado */}
              {resultadoGeneracion.pagos_generados === 0 ? (
                <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/30 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-2">ℹ️</div>
                  <p className="text-blue-300 font-medium text-sm sm:text-base">
                    No hay pagos nuevos para generar
                  </p>
                  <p className="text-blue-400/60 text-xs sm:text-sm mt-1">
                    Los pagos del mes ya fueron generados o no hay contratos vigentes
                  </p>
                </div>
              ) : (
                /* Lista de pagos generados */
                resultadoGeneracion.detalles && resultadoGeneracion.detalles.length > 0 && (
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4">
                    <h3 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Pagos creados en estado pendiente
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {resultadoGeneracion.detalles.map((detalle, index) => (
                        <div key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                          <span className="text-emerald-400 mt-0.5">✓</span>
                          <span className="text-gray-300">{detalle}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}

              {/* Errores si hay */}
              {resultadoGeneracion.errores && resultadoGeneracion.errores.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-red-300 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Errores
                  </h3>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {resultadoGeneracion.errores.map((error, index) => (
                      <p key={index} className="text-xs sm:text-sm text-red-300/80">• {error}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2 border-t border-gray-700/30 flex-shrink-0">
              <button
                onClick={closeGenerarModal}
                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 
                         text-white rounded-2xl font-semibold shadow-lg shadow-emerald-500/30
                         hover:shadow-emerald-500/50 transition-all duration-300
                         hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Cerrar
                </span>
              </button>
            </div>

            {/* Efecto de brillo inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Pagos
