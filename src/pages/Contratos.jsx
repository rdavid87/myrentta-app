import { useState, useEffect } from "react"
import api from "../services/api"

const Contratos = () => {
  const [contratos, setContratos] = useState([])
  const [arrendatarios, setArrendatarios] = useState([])
  const [apartamentos, setApartamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showExtenderModal, setShowExtenderModal] = useState(false)
  const [contratoToExtend, setContratoToExtend] = useState(null)
  const [contratoToRenew, setContratoToRenew] = useState(null)
  const [nuevaFechaFin, setNuevaFechaFin] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  
  // Estados para notificaciones
  const [verificandoMora, setVerificandoMora] = useState(false)
  const [showNotifModal, setShowNotifModal] = useState(false)
  const [contratoNotif, setContratoNotif] = useState(null)
  const [motivoDesactivacion, setMotivoDesactivacion] = useState("")
  
  // Estados para modal de verificación de mora
  const [showMoraModal, setShowMoraModal] = useState(false)
  const [resultadoMora, setResultadoMora] = useState(null)
  const [enviandoNotificaciones, setEnviandoNotificaciones] = useState(false)

  const [formData, setFormData] = useState({
    arrendatario_id: "",
    apartamento_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    canon_mensual: "",
    dia_pago: "",
  })

  useEffect(() => {
    fetchContratos()
    fetchArrendatarios()
    fetchApartamentos()
  }, [])

  const fetchContratos = async () => {
    try {
      const { data } = await api.get("/contratos")
      setContratos(data || [])
    } catch (error) {
      console.error("Error fetching contratos:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchArrendatarios = async () => {
    try {
      const { data } = await api.get("/arrendatarios")
      // Filtrar solo arrendatarios sin contrato activo
      const sinContrato = data.filter(arr => !arr.apartamento_id)
      setArrendatarios(sinContrato || [])
    } catch (error) {
      console.error("Error fetching arrendatarios:", error)
    }
  }

  const fetchApartamentos = async () => {
    try {
      const { data } = await api.get("/apartamentos")
      // Filtrar solo apartamentos disponibles
      const disponibles = data.filter(apt => apt.estado === "disponible")
      setApartamentos(disponibles || [])
    } catch (error) {
      console.error("Error fetching apartamentos:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = {
        ...formData,
        arrendatario_id: parseInt(formData.arrendatario_id),
        apartamento_id: parseInt(formData.apartamento_id),
        canon_mensual: parseFloat(formData.canon_mensual),
        dia_pago: parseInt(formData.dia_pago),
      }

      // Si es renovación, finalizar el contrato anterior primero
      if (contratoToRenew) {
        await api.put(`/contratos/${contratoToRenew.id}/finalizar`)
      }

      await api.post("/contratos", dataToSend)
      closeModal()
      fetchContratos()
      fetchArrendatarios()
      fetchApartamentos()
      
      if (contratoToRenew) {
        alert("✅ Contrato renovado exitosamente")
      }
    } catch (error) {
      console.error("Error saving contrato:", error)
      alert("Error al guardar contrato: " + (error.response?.data?.error || error.message))
    }
  }

  const handleExtender = async (e) => {
    e.preventDefault()
    try {
      await api.put(`/contratos/${contratoToExtend.id}/extender`, {
        nueva_fecha_fin: nuevaFechaFin
      })
      closeExtenderModal()
      fetchContratos()
      alert("✅ Contrato extendido exitosamente")
    } catch (error) {
      console.error("Error extendiendo contrato:", error)
      alert("Error al extender: " + (error.response?.data?.error || error.message))
    }
  }

  const handleFinalizar = async (id) => {
    if (window.confirm("¿Estás seguro de finalizar este contrato? El apartamento quedará disponible.")) {
      try {
        await api.put(`/contratos/${id}/finalizar`)
        fetchContratos()
        fetchArrendatarios()
        fetchApartamentos()
      } catch (error) {
        console.error("Error finalizando contrato:", error)
        alert("Error al finalizar: " + (error.response?.data?.error || error.message))
      }
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este contrato?")) {
      try {
        await api.delete(`/contratos/${id}`)
        fetchContratos()
      } catch (error) {
        console.error("Error deleting contrato:", error)
        alert("Error al eliminar: " + (error.response?.data?.error || error.message))
      }
    }
  }

  // Verificar contratos en mora (sin enviar)
  const handleVerificarRecordatorios = async () => {
    setVerificandoMora(true)
    try {
      const { data } = await api.get("/notificaciones/verificar-mora")
      setResultadoMora(data)
      setShowMoraModal(true)
    } catch (error) {
      console.error("Error verificando:", error)
      alert("Error al verificar: " + (error.response?.data?.error || error.message))
    } finally {
      setVerificandoMora(false)
    }
  }

  // Enviar notificaciones de mora
  const handleEnviarNotificaciones = async () => {
    setEnviandoNotificaciones(true)
    try {
      const { data } = await api.post("/notificaciones/enviar-mora")
      setResultadoMora(prev => ({
        ...prev,
        notificaciones_enviadas: data.notificaciones_enviadas,
        detalles: data.detalles,
        errores: data.errores,
        enviado: true
      }))
    } catch (error) {
      console.error("Error enviando notificaciones:", error)
      alert("Error al enviar: " + (error.response?.data?.error || error.message))
    } finally {
      setEnviandoNotificaciones(false)
    }
  }

  // Cerrar modal de mora
  const closeMoraModal = () => {
    setShowMoraModal(false)
    setResultadoMora(null)
  }

  // Toggle notificaciones de un contrato
  const handleToggleNotificaciones = async (activas) => {
    if (!contratoNotif) return
    
    try {
      await api.put(`/notificaciones/contrato/${contratoNotif.id}/toggle`, {
        activas,
        motivo: activas ? "" : motivoDesactivacion
      })
      
      setShowNotifModal(false)
      setContratoNotif(null)
      setMotivoDesactivacion("")
      fetchContratos()
      
      alert(`✅ Notificaciones ${activas ? 'activadas' : 'desactivadas'} exitosamente`)
    } catch (error) {
      console.error("Error actualizando notificaciones:", error)
      alert("Error: " + (error.response?.data?.error || error.message))
    }
  }

  const openNotifModal = (contrato) => {
    setContratoNotif(contrato)
    setMotivoDesactivacion(contrato.motivo_notificaciones_desactivadas || "")
    setShowNotifModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setContratoToRenew(null)
    setFormData({
      arrendatario_id: "",
      apartamento_id: "",
      fecha_inicio: "",
      fecha_fin: "",
      canon_mensual: "",
      dia_pago: "",
    })
  }

  const closeExtenderModal = () => {
    setShowExtenderModal(false)
    setContratoToExtend(null)
    setNuevaFechaFin("")
  }

  const openNewModal = () => {
    setContratoToRenew(null)
    setFormData({
      arrendatario_id: "",
      apartamento_id: "",
      fecha_inicio: "",
      fecha_fin: "",
      canon_mensual: "",
      dia_pago: "",
    })
    setShowModal(true)
  }

  const openRenovarModal = (contrato) => {
    setContratoToRenew(contrato)
    // Pre-llenar con los datos del contrato actual
    setFormData({
      arrendatario_id: contrato.arrendatario_id.toString(),
      apartamento_id: contrato.apartamento_id.toString(),
      fecha_inicio: "",
      fecha_fin: "",
      canon_mensual: contrato.canon_mensual.toString(),
      dia_pago: contrato.dia_pago.toString(),
    })
    setShowModal(true)
  }

  const openExtenderModal = (contrato) => {
    setContratoToExtend(contrato)
    setNuevaFechaFin("")
    setShowExtenderModal(true)
  }

  const formatDate = (dateString) => {
    // Usar UTC para evitar problemas de zona horaria
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

  // Filtrar contratos
  const filteredContratos = contratos.filter(contrato => {
    const matchesSearch = 
      contrato.arrendatario_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.apartamento_numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.apartamento_direccion?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesEstado = filterEstado === "todos" || contrato.estado === filterEstado
    
    return matchesSearch && matchesEstado
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-amber-900/20 to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header con gradiente futurista */}
        <div className="mb-6 sm:mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-yellow-600 rounded-2xl blur-xl opacity-20"></div>
          <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sm:p-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent mb-2">
                  📋 Contratos de Arrendamiento
                </h1>
                <p className="text-sm sm:text-base text-gray-400">Gestiona los contratos de renta de apartamentos</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={handleVerificarRecordatorios}
                  disabled={verificandoMora}
                  className="group relative w-full sm:w-auto px-4 sm:px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl
                           font-semibold shadow-lg hover:shadow-purple-500/50 transition-all duration-300
                           hover:scale-105 active:scale-95 overflow-hidden text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Verificar contratos en mora y enviar recordatorios"
                >
                  <span className="relative flex items-center justify-center gap-2">
                    {verificandoMora ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    )}
                    {verificandoMora ? "Verificando..." : "Verificar Mora"}
                  </span>
                </button>
                <button
                  onClick={openNewModal}
                  className="group relative w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl
                           font-semibold shadow-lg hover:shadow-amber-500/50 transition-all duration-300
                           hover:scale-105 active:scale-95 overflow-hidden text-sm sm:text-base"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-amber-600 opacity-0 
                                group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Contrato
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
                  placeholder="Buscar por arrendatario o apartamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 
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
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterEstado("todos")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filterEstado === "todos"
                      ? "bg-amber-600 text-white shadow-lg shadow-amber-500/30"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                  }`}
                >
                  Todos
                </button>
                <button
                  onClick={() => setFilterEstado("activo")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filterEstado === "activo"
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/30"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                  }`}
                >
                  🟢 Activos
                </button>
                <button
                  onClick={() => setFilterEstado("finalizado")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filterEstado === "finalizado"
                      ? "bg-gray-600 text-white shadow-lg shadow-gray-500/30"
                      : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50"
                  }`}
                >
                  ⚫ Finalizados
                </button>
              </div>
            </div>

            {(searchTerm || filterEstado !== "todos") && (
              <p className="mt-3 text-sm text-gray-400">
                {filteredContratos.length} contrato(s) encontrado(s)
              </p>
            )}
          </div>
        </div>

        {/* Vista de Tabla para Desktop y Cards para Mobile */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
          {/* Tabla - Oculta en mobile */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border-b border-gray-700">
                <tr>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-amber-300 uppercase tracking-wider">Arrendatario</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-amber-300 uppercase tracking-wider">Apartamento</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-amber-300 uppercase tracking-wider">Fecha Inicio</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-amber-300 uppercase tracking-wider">Fecha Fin</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-amber-300 uppercase tracking-wider">Canon</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-amber-300 uppercase tracking-wider">Día</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-amber-300 uppercase tracking-wider">Estado</th>
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-amber-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredContratos.map((contrato) => (
                  <tr 
                    key={contrato.id} 
                    className="hover:bg-amber-500/5 transition-colors duration-200"
                  >
                    <td className="px-4 xl:px-6 py-3 xl:py-4 font-medium text-gray-200 text-sm">{contrato.arrendatario_nombre}</td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4 text-gray-300 text-sm">
                      <div className="flex flex-col">
                        <span className="font-medium">{contrato.apartamento_numero}</span>
                        <span className="text-xs text-gray-500">{contrato.apartamento_direccion}</span>
                      </div>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4 text-gray-300 text-sm">{formatDate(contrato.fecha_inicio)}</td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4 text-gray-300 text-sm">{formatDate(contrato.fecha_fin)}</td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4 text-yellow-300 font-semibold text-sm">{formatCurrency(contrato.canon_mensual)}</td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4 text-gray-300 text-center">
                      <span className="px-2 py-1 bg-amber-600/20 text-amber-300 rounded-lg text-xs">
                        {contrato.dia_pago}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-block ${
                        contrato.estado === "activo"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                      }`}>
                        {contrato.estado === "activo" ? "🟢 Activo" : "⚫ Fin."}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-3 xl:py-4">
                      <div className="flex gap-1.5 flex-wrap">
                        {contrato.estado === "activo" && (
                          <>
                            <button
                              onClick={() => openRenovarModal(contrato)}
                              className="group relative px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg
                                       font-medium shadow-lg hover:shadow-blue-500/50 transition-all duration-300
                                       hover:scale-105 active:scale-95 text-xs"
                              title="Renovar: Finaliza el contrato actual y crea uno nuevo"
                            >
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Renovar
                              </span>
                            </button>
                            <button
                              onClick={() => openExtenderModal(contrato)}
                              className="group relative px-2.5 py-1.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg
                                       font-medium shadow-lg hover:shadow-orange-500/50 transition-all duration-300
                                       hover:scale-105 active:scale-95 text-xs"
                              title="Extender: Solo modifica la fecha de fin"
                            >
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Extender
                              </span>
                            </button>
                            <button
                              onClick={() => handleFinalizar(contrato.id)}
                              className="group relative px-2.5 py-1.5 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-lg
                                       font-medium shadow-lg hover:shadow-rose-500/50 transition-all duration-300
                                       hover:scale-105 active:scale-95 text-xs"
                              title="Finalizar contrato"
                            >
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Finalizar
                              </span>
                            </button>
                            <button
                              onClick={() => openNotifModal(contrato)}
                              className={`group relative px-2.5 py-1.5 text-white rounded-lg
                                       font-medium shadow-lg transition-all duration-300
                                       hover:scale-105 active:scale-95 text-xs
                                       ${contrato.notificaciones_activas !== false 
                                         ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-500/50' 
                                         : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:shadow-gray-500/50'}`}
                              title={contrato.notificaciones_activas !== false ? "Clic para desactivar notificaciones" : "Clic para activar notificaciones"}
                            >
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                                {contrato.notificaciones_activas !== false ? 'Desactivar' : 'Activar'}
                              </span>
                            </button>
                          </>
                        )}
                        {contrato.estado === "finalizado" && (
                          <>
                            <button
                              onClick={() => openRenovarModal(contrato)}
                              className="group relative px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg
                                       font-medium shadow-lg hover:shadow-blue-500/50 transition-all duration-300
                                       hover:scale-105 active:scale-95 text-xs"
                              title="Renovar contrato"
                            >
                              <span className="flex items-center gap-1">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Renovar
                              </span>
                            </button>
                            <button
                              onClick={() => handleDelete(contrato.id)}
                              className="group relative px-2.5 py-1.5 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg
                                       font-medium shadow-lg hover:shadow-red-500/50 transition-all duration-300
                                       hover:scale-105 active:scale-95 text-xs"
                              title="Eliminar contrato"
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
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredContratos.length === 0 && (
              <div className="px-6 py-16 text-center">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-400 text-lg">
                  {contratos.length === 0 ? "No hay contratos registrados" : "No se encontraron contratos"}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {contratos.length === 0 
                    ? "Crea el primer contrato para comenzar"
                    : "Intenta con otros términos de búsqueda o filtros"}
                </p>
              </div>
            )}
          </div>

          {/* Cards - Visible solo en mobile y tablet */}
          <div className="lg:hidden p-4 space-y-4">
            {filteredContratos.map((contrato) => (
              <div 
                key={contrato.id}
                className="bg-gray-700/30 border border-gray-600/50 rounded-xl p-4
                         hover:border-amber-500/50 transition-all duration-300"
              >
                {/* Layout: Contenido a la izquierda, Badge + Botones a la derecha */}
                <div className="flex gap-4">
                  {/* Contenido principal - Izquierda */}
                  <div className="flex-1 space-y-3">
                    {/* Nombre y apartamento */}
                    <div>
                      <h3 className="text-white font-semibold text-lg">{contrato.arrendatario_nombre}</h3>
                      <p className="text-yellow-300 text-sm font-medium">{contrato.apartamento_numero}</p>
                      <p className="text-gray-400 text-xs">{contrato.apartamento_direccion}</p>
                    </div>

                    {/* Información del contrato */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Inicio</p>
                        <p className="text-gray-200">{formatDate(contrato.fecha_inicio)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Fin</p>
                        <p className="text-gray-200">{formatDate(contrato.fecha_fin)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Canon Mensual</p>
                        <p className="text-emerald-300 font-semibold">{formatCurrency(contrato.canon_mensual)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Día de Pago</p>
                        <p className="text-amber-300 font-medium">Día {contrato.dia_pago}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Badge + Botones - Derecha en columna con espacio */}
                  <div className="flex flex-col items-end gap-4">
                    {/* Badge arriba */}
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                      contrato.estado === "activo"
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                    }`}>
                      {contrato.estado === "activo" ? "🟢 Activo" : "⚫ Finalizado"}
                    </span>
                    
                    {/* Botones abajo con espacio */}
                    <div className="flex flex-col gap-2">
                    {contrato.estado === "activo" && (
                      <>
                        <button
                          onClick={() => openRenovarModal(contrato)}
                          className="w-32 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg
                                   font-medium shadow-lg hover:shadow-blue-500/50 transition-all duration-300
                                   active:scale-95 text-xs"
                        >
                          <span className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Renovar
                          </span>
                        </button>
                        <button
                          onClick={() => openExtenderModal(contrato)}
                          className="w-32 px-3 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg
                                   font-medium shadow-lg hover:shadow-orange-500/50 transition-all duration-300
                                   active:scale-95 text-xs"
                        >
                          <span className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Extender
                          </span>
                        </button>
                        <button
                          onClick={() => handleFinalizar(contrato.id)}
                          className="w-32 px-3 py-2 bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-lg
                                   font-medium shadow-lg hover:shadow-rose-500/50 transition-all duration-300
                                   active:scale-95 text-xs"
                        >
                          <span className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Finalizar
                          </span>
                        </button>
                        <button
                          onClick={() => openNotifModal(contrato)}
                          className={`w-32 px-3 py-2 text-white rounded-lg
                                   font-medium shadow-lg transition-all duration-300
                                   active:scale-95 text-xs
                                   ${contrato.notificaciones_activas !== false 
                                     ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-purple-500/50' 
                                     : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:shadow-gray-500/50'}`}
                        >
                          <span className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            {contrato.notificaciones_activas !== false ? 'Desactivar' : 'Activar'}
                          </span>
                        </button>
                      </>
                    )}
                    {contrato.estado === "finalizado" && (
                      <>
                        <button
                          onClick={() => openRenovarModal(contrato)}
                          className="w-32 px-3 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg
                                   font-medium shadow-lg hover:shadow-blue-500/50 transition-all duration-300
                                   active:scale-95 text-xs"
                        >
                          <span className="flex items-center justify-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Renovar
                          </span>
                        </button>
                        <button
                          onClick={() => handleDelete(contrato.id)}
                          className="w-32 px-3 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg
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
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {filteredContratos.length === 0 && (
              <div className="py-16 text-center">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-gray-400 text-lg">
                  {contratos.length === 0 ? "No hay contratos registrados" : "No se encontraron contratos"}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  {contratos.length === 0 
                    ? "Crea el primer contrato para comenzar"
                    : "Intenta con otros términos de búsqueda o filtros"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Crear Contrato */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full 
                        border border-gray-700/50 overflow-hidden my-8">
            {/* Header del modal con gradiente */}
            <div className="relative bg-gradient-to-r from-amber-600/20 to-yellow-600/20 border-b border-gray-700/50 p-4 sm:p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-yellow-600 opacity-10"></div>
              <h2 className="relative text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">{contratoToRenew ? "🔄" : "📝"}</span>
                <span className="leading-tight">{contratoToRenew ? "Renovar Contrato" : "Nuevo Contrato de Arrendamiento"}</span>
              </h2>
              {contratoToRenew && (
                <p className="relative text-sm text-gray-400 mt-2">
                  Se finalizará el contrato actual y se creará uno nuevo
                </p>
              )}
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5">
              {/* Arrendatario */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  👤 Arrendatario
                </label>
                <select
                  value={formData.arrendatario_id}
                  onChange={(e) => setFormData({ ...formData, arrendatario_id: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 
                           transition-all duration-300"
                  disabled={contratoToRenew}
                  required
                >
                  <option value="" className="bg-gray-800">Seleccionar arrendatario</option>
                  {contratoToRenew ? (
                    <option value={contratoToRenew.arrendatario_id} className="bg-gray-800">
                      {contratoToRenew.arrendatario_nombre}
                    </option>
                  ) : (
                    arrendatarios.map((arr) => (
                      <option key={arr.id} value={arr.id} className="bg-gray-800">
                        {arr.nombre_completo} - {arr.documento_identidad}
                      </option>
                    ))
                  )}
                </select>
                {!contratoToRenew && arrendatarios.length === 0 && (
                  <p className="text-amber-400 text-xs sm:text-sm mt-2">⚠️ No hay arrendatarios disponibles sin contrato activo</p>
                )}
              </div>

              {/* Apartamento */}
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  🏢 Apartamento
                </label>
                <select
                  value={formData.apartamento_id}
                  onChange={(e) => setFormData({ ...formData, apartamento_id: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                           focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 
                           transition-all duration-300"
                  disabled={contratoToRenew}
                  required
                >
                  <option value="" className="bg-gray-800">Seleccionar apartamento</option>
                  {contratoToRenew ? (
                    <option value={contratoToRenew.apartamento_id} className="bg-gray-800">
                      {contratoToRenew.apartamento_numero} - {contratoToRenew.apartamento_direccion}
                    </option>
                  ) : (
                    apartamentos.map((apt) => (
                      <option key={apt.id} value={apt.id} className="bg-gray-800">
                        {apt.numero} - {apt.direccion} - {formatCurrency(apt.valor_arriendo)}
                      </option>
                    ))
                  )}
                </select>
                {!contratoToRenew && apartamentos.length === 0 && (
                  <p className="text-amber-400 text-xs sm:text-sm mt-2">⚠️ No hay apartamentos disponibles</p>
                )}
              </div>

              {/* Fechas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    📅 Fecha Inicio
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_inicio}
                    onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 
                             transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    📅 Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={formData.fecha_fin}
                    onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 
                             transition-all duration-300"
                    required
                  />
                </div>
              </div>

              {/* Canon y Día de Pago */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    💰 Canon Mensual
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="1500000"
                    value={formData.canon_mensual}
                    onChange={(e) => setFormData({ ...formData, canon_mensual: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 
                             focus:border-amber-500/50 transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    📆 Día de Pago
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="5"
                    value={formData.dia_pago}
                    onChange={(e) => setFormData({ ...formData, dia_pago: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 
                             focus:border-amber-500/50 transition-all duration-300"
                    required
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
                <button
                  type="submit"
                  disabled={!contratoToRenew && (arrendatarios.length === 0 || apartamentos.length === 0)}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-yellow-600 text-white rounded-xl
                           font-semibold shadow-lg hover:shadow-amber-500/50 transition-all duration-300
                           hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                           disabled:hover:scale-100 text-sm sm:text-base"
                >
                  {contratoToRenew ? "🔄 Renovar Contrato" : "Crear Contrato"}
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

      {/* Modal de Extender Contrato */}
      {showExtenderModal && contratoToExtend && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-md w-full 
                        border border-gray-700/50 overflow-hidden">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-amber-600/20 to-orange-600/20 border-b border-gray-700/50 p-4 sm:p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-600 to-orange-600 opacity-10"></div>
              <h2 className="relative text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">⏰</span>
                <span className="leading-tight">Extender Contrato</span>
              </h2>
              <p className="relative text-sm text-gray-400 mt-2">
                Solo se modificará la fecha de fin del contrato
              </p>
            </div>

            {/* Contenido */}
            <form onSubmit={handleExtender} className="p-4 sm:p-6 space-y-4">
              {/* Información del contrato */}
              <div className="bg-gray-700/30 rounded-xl p-4 space-y-2">
                <div>
                  <p className="text-xs text-gray-400">Arrendatario</p>
                  <p className="text-white font-medium">{contratoToExtend.arrendatario_nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Apartamento</p>
                  <p className="text-white font-medium">{contratoToExtend.apartamento_numero}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Fecha de fin actual</p>
                  <p className="text-emerald-300 font-medium">{formatDate(contratoToExtend.fecha_fin)}</p>
                </div>
              </div>

              {/* Nueva fecha de fin */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  📅 Nueva Fecha de Fin
                </label>
                <input
                  type="date"
                  value={nuevaFechaFin}
                  onChange={(e) => setNuevaFechaFin(e.target.value)}
                  min={contratoToExtend.fecha_fin.split('T')[0]}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white 
                           focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 
                           transition-all duration-300"
                  required
                />
                <p className="text-xs text-gray-400 mt-2">
                  💡 La fecha debe ser posterior a la fecha de fin actual
                </p>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl
                           font-semibold shadow-lg hover:shadow-orange-500/50 transition-all duration-300
                           hover:scale-105 active:scale-95"
                >
                  ⏰ Extender Contrato
                </button>
                <button
                  type="button"
                  onClick={closeExtenderModal}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold
                           transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Notificaciones */}
      {showNotifModal && contratoNotif && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-md w-full 
                        border border-gray-700/50 overflow-hidden my-4 max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="relative bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-gray-700/50 p-4 sm:p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-10"></div>
              <h2 className="relative text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
                <span className="text-2xl sm:text-3xl">🔔</span>
                <span className="leading-tight">Notificaciones de Pago</span>
              </h2>
            </div>

            <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
              {/* Info del contrato */}
              <div className="bg-gray-700/30 rounded-xl p-3 sm:p-4 space-y-2">
                <div>
                  <p className="text-xs text-gray-400">Arrendatario</p>
                  <p className="text-white font-medium text-sm sm:text-base">{contratoNotif.arrendatario_nombre}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Apartamento</p>
                  <p className="text-white font-medium text-sm sm:text-base">{contratoNotif.apartamento_numero}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Estado de notificaciones</p>
                  <p className={`font-medium text-sm sm:text-base ${contratoNotif.notificaciones_activas !== false ? 'text-green-400' : 'text-red-400'}`}>
                    {contratoNotif.notificaciones_activas !== false ? '✅ Activas' : '❌ Desactivadas'}
                  </p>
                </div>
              </div>

              {/* Explicación - más compacta en móvil */}
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-3 sm:p-4">
                <p className="text-xs sm:text-sm text-purple-200">
                  <strong>📧 Recordatorios automáticos:</strong>
                </p>
                <ul className="text-xs text-purple-300 mt-2 space-y-0.5 ml-4 list-disc">
                  <li>Día 1: Recordatorio amigable</li>
                  <li>Día 3: Aviso urgente</li>
                  <li>Día 5: Último aviso</li>
                  <li>Después: Cada 3 días</li>
                </ul>
              </div>

              {/* Motivo de desactivación */}
              {contratoNotif.notificaciones_activas !== false && (
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    📝 Motivo de desactivación (opcional)
                  </label>
                  <textarea
                    value={motivoDesactivacion}
                    onChange={(e) => setMotivoDesactivacion(e.target.value)}
                    placeholder="Ej: Acuerdo de pago hasta fin de mes..."
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 
                             focus:border-purple-500/50 transition-all duration-300 resize-none"
                    rows="2"
                  />
                </div>
              )}

              {/* Motivo actual si está desactivado */}
              {contratoNotif.notificaciones_activas === false && contratoNotif.motivo_notificaciones_desactivadas && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-amber-200">
                    <strong>📋 Motivo:</strong>
                  </p>
                  <p className="text-xs sm:text-sm text-amber-300 mt-1">{contratoNotif.motivo_notificaciones_desactivadas}</p>
                </div>
              )}
            </div>

            {/* Botones - fuera del scroll para que siempre se vean */}
            <div className="p-4 sm:p-6 pt-0 border-t border-gray-700/50 bg-gray-800/50">
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {contratoNotif.notificaciones_activas !== false ? (
                  <button
                    onClick={() => handleToggleNotificaciones(false)}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl
                             font-semibold shadow-lg hover:shadow-red-500/50 transition-all duration-300
                             hover:scale-105 active:scale-95 text-sm sm:text-base"
                  >
                    🔕 Desactivar Notificaciones
                  </button>
                ) : (
                  <button
                    onClick={() => handleToggleNotificaciones(true)}
                    className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl
                             font-semibold shadow-lg hover:shadow-green-500/50 transition-all duration-300
                             hover:scale-105 active:scale-95 text-sm sm:text-base"
                  >
                    🔔 Activar Notificaciones
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => { setShowNotifModal(false); setContratoNotif(null); setMotivoDesactivacion(""); }}
                  className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold
                           transition-all duration-300 hover:scale-105 active:scale-95 text-sm sm:text-base"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Resultados de Verificación de Mora - Futurista */}
      {showMoraModal && resultadoMora && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-3xl shadow-2xl 
                        max-w-lg w-full border border-purple-500/30 overflow-hidden my-4 max-h-[90vh] flex flex-col">
            
            {/* Efecto de brillo superior */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"></div>
            
            {/* Header futurista */}
            <div className="relative p-6 sm:p-8 text-center flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-transparent"></div>
              
              {/* Icono animado */}
              <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-3">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-30"></div>
                <div className="relative text-3xl sm:text-4xl">
                  {resultadoMora.enviado ? '✅' : resultadoMora.contratos_en_mora > 0 ? '⚠️' : '✅'}
                </div>
              </div>
              
              <h2 className="relative text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-1">
                {resultadoMora.enviado ? 'Notificaciones Enviadas' : 'Verificación de Mora'}
              </h2>
              <p className="relative text-gray-400 text-xs sm:text-sm">
                {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Contenido con estadísticas - scrolleable */}
            <div className="px-6 sm:px-8 pb-4 space-y-4 overflow-y-auto flex-1">
              
              {/* Card de estadística principal */}
              <div className={`border rounded-2xl p-4 sm:p-5 text-center ${
                resultadoMora.contratos_en_mora > 0 
                  ? 'bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/30'
                  : 'bg-gradient-to-br from-emerald-500/20 to-green-500/10 border-emerald-500/30'
              }`}>
                <div className={`text-4xl sm:text-5xl font-bold mb-2 ${
                  resultadoMora.contratos_en_mora > 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}>
                  {resultadoMora.contratos_en_mora}
                </div>
                <div className={`text-sm sm:text-base font-medium ${
                  resultadoMora.contratos_en_mora > 0 ? 'text-amber-300' : 'text-emerald-300'
                }`}>
                  {resultadoMora.contratos_en_mora === 1 ? 'Contrato en mora' : 'Contratos en mora'}
                </div>
              </div>

              {/* Mensaje de éxito si no hay mora */}
              {resultadoMora.contratos_en_mora === 0 && !resultadoMora.enviado && (
                <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
                  <div className="text-2xl mb-2">🎉</div>
                  <p className="text-emerald-300 font-medium text-sm sm:text-base">
                    ¡Excelente! No hay contratos con pagos vencidos
                  </p>
                  <p className="text-emerald-400/60 text-xs sm:text-sm mt-1">
                    Todos los arrendatarios están al día
                  </p>
                </div>
              )}

              {/* Lista de contratos en mora (antes de enviar) */}
              {resultadoMora.contratos_en_mora > 0 && !resultadoMora.enviado && resultadoMora.contratos && (
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Pendientes de notificación
                  </h3>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {resultadoMora.contratos.map((contrato, index) => (
                      <div key={index} className="bg-gray-900/50 rounded-xl p-3 border border-gray-700/30">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-white font-medium text-sm">{contrato.arrendatario_nombre}</p>
                            <p className="text-gray-400 text-xs">{contrato.apartamento_nombre}</p>
                            <p className="text-gray-500 text-xs mt-1">{contrato.arrendatario_email}</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-block px-2 py-1 bg-red-500/20 text-red-300 rounded-lg text-xs font-medium">
                              {contrato.dias_mora} {contrato.dias_mora === 1 ? 'día' : 'días'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Resultado después de enviar */}
              {resultadoMora.enviado && (
                <>
                  {/* Card de enviados */}
                  <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-1">
                      {resultadoMora.notificaciones_enviadas || 0}
                    </div>
                    <div className="text-sm text-emerald-300">Notificaciones enviadas</div>
                  </div>

                  {/* Detalles de envíos */}
                  {resultadoMora.detalles && resultadoMora.detalles.length > 0 && (
                    <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4">
                      <h3 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Enviados exitosamente
                      </h3>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {resultadoMora.detalles.map((detalle, index) => (
                          <div key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                            <span className="text-emerald-400 mt-0.5">✓</span>
                            <span className="text-gray-300">{detalle}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Errores si hay */}
              {resultadoMora.errores && resultadoMora.errores.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-red-300 mb-2 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Errores
                  </h3>
                  <div className="space-y-1 max-h-24 overflow-y-auto">
                    {resultadoMora.errores.map((error, index) => (
                      <p key={index} className="text-xs sm:text-sm text-red-300/80">• {error}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer con botones */}
            <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2 border-t border-gray-700/30 flex-shrink-0">
              {/* Si no hay mora o ya se envió, solo mostrar Cerrar */}
              {(resultadoMora.contratos_en_mora === 0 || resultadoMora.enviado) ? (
                <button
                  onClick={closeMoraModal}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 
                           text-white rounded-2xl font-semibold shadow-lg shadow-purple-500/30
                           hover:shadow-purple-500/50 transition-all duration-300
                           hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
                >
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Cerrar
                  </span>
                </button>
              ) : (
                /* Si hay mora y no se ha enviado, mostrar opciones */
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleEnviarNotificaciones}
                    disabled={enviandoNotificaciones}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 
                             text-white rounded-2xl font-semibold shadow-lg shadow-emerald-500/30
                             hover:shadow-emerald-500/50 transition-all duration-300
                             hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="flex items-center justify-center gap-2">
                      {enviandoNotificaciones ? (
                        <>
                          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                          </svg>
                          Enviando...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          Enviar Notificaciones
                        </>
                      )}
                    </span>
                  </button>
                  <button
                    onClick={closeMoraModal}
                    disabled={enviandoNotificaciones}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl font-semibold
                             transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base
                             disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            {/* Efecto de brillo inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent"></div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Contratos
