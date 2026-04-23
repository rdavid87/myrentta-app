import { useState, useEffect, useCallback, useMemo } from "react"
import { createPortal } from "react-dom"
import api from "../services/api"

const Contratos = () => {
  const [contratos, setContratos] = useState([])
  const [arrendatarios, setArrendatarios] = useState([])
  const [apartamentos, setApartamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showExtenderModal, setShowExtenderModal] = useState(false)
  const [contratoToExtend, setContratoToExtend] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [contratoToEdit, setContratoToEdit] = useState(null)
  const [editFormData, setEditFormData] = useState({
    fecha_inicio: "",
    fecha_fin: "",
    canon_mensual: "",
    dia_pago: "",
    modo_cobro: "anticipado",
  })
  const [contratoToRenew, setContratoToRenew] = useState(null)
  const [nuevaFechaFin, setNuevaFechaFin] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  
  /** Menú flotante "Más" (portal, posición fija para no recortar en tabla) */
  const [actionsMenu, setActionsMenu] = useState(null)

  const closeActionsMenu = useCallback(() => setActionsMenu(null), [])

  const openMoreMenu = useCallback((e, contrato) => {
    e.stopPropagation()
    const r = e.currentTarget.getBoundingClientRect()
    const menuH = 280
    let top = r.bottom + 8
    if (top + menuH > window.innerHeight - 16) {
      top = Math.max(12, r.top - menuH - 8)
    }
    setActionsMenu((prev) =>
      prev?.contrato?.id === contrato.id ? null : { contrato, top, right: Math.max(12, window.innerWidth - r.right) }
    )
  }, [])

  useEffect(() => {
    if (!actionsMenu) return
    const onKey = (ev) => ev.key === "Escape" && closeActionsMenu()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [actionsMenu, closeActionsMenu])

  const [formData, setFormData] = useState({
    arrendatario_id: "",
    apartamento_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    canon_mensual: "",
    dia_pago: "",
    modo_cobro: "anticipado",
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
        canon_mensual: parseFloat(formData.canon_mensual.toString().replace(/\./g, "").replace(",", ".")),
        dia_pago: parseInt(formData.dia_pago),
        modo_cobro: formData.modo_cobro === "fin_mes" ? "fin_mes" : "anticipado",
      }

      if (
        contratoToRenew?.estado === "finalizado" &&
        tieneContratoActivoMismoAptoMismoArrendatario(contratoToRenew)
      ) {
        alert(
          "Ya existe un contrato activo para este apartamento. El API no permitirá duplicar; revisa el contrato vigente."
        )
        return
      }

      // Renovación desde contrato activo: cerrar el vigente antes de crear el nuevo.
      // Si ya está finalizado, el apartamento ya quedó disponible y no se puede volver a finalizar.
      if (contratoToRenew && contratoToRenew.estado === "activo") {
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

  const toDateInputValue = (dateString) => {
    if (!dateString) return ""
    const d = new Date(dateString)
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, "0")
    const day = String(d.getUTCDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }

  const openEditModal = (contrato) => {
    setContratoToEdit(contrato)
    setEditFormData({
      fecha_inicio: toDateInputValue(contrato.fecha_inicio),
      fecha_fin: toDateInputValue(contrato.fecha_fin),
      canon_mensual: Number(contrato.canon_mensual).toLocaleString("es-CO"),
      dia_pago: contrato.dia_pago.toString(),
      modo_cobro: contrato.modo_cobro === "fin_mes" ? "fin_mes" : "anticipado",
    })
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setContratoToEdit(null)
    setEditFormData({ fecha_inicio: "", fecha_fin: "", canon_mensual: "", dia_pago: "", modo_cobro: "anticipado" })
  }

  const isEditContractUnchanged = useMemo(() => {
    if (!contratoToEdit || !showEditModal) return true
    const canonParsed = parseFloat(
      String(editFormData.canon_mensual || "").replace(/\./g, "").replace(",", ".")
    )
    if (Number.isNaN(canonParsed)) return false
    const dia = parseInt(String(editFormData.dia_pago || ""), 10)
    if (Number.isNaN(dia)) return false
    const modoActual = editFormData.modo_cobro === "fin_mes" ? "fin_mes" : "anticipado"
    const modoContrato = contratoToEdit.modo_cobro === "fin_mes" ? "fin_mes" : "anticipado"
    return (
      editFormData.fecha_inicio === toDateInputValue(contratoToEdit.fecha_inicio) &&
      editFormData.fecha_fin === toDateInputValue(contratoToEdit.fecha_fin) &&
      canonParsed === Number(contratoToEdit.canon_mensual) &&
      dia === Number(contratoToEdit.dia_pago) &&
      modoActual === modoContrato
    )
  }, [contratoToEdit, editFormData, showEditModal])

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    if (!contratoToEdit) return
    if (isEditContractUnchanged) {
      alert("No has modificado ningún dato. No hay cambios que guardar.")
      return
    }
    const canon = parseFloat(editFormData.canon_mensual.toString().replace(/\./g, "").replace(",", "."))
    const dia = parseInt(editFormData.dia_pago, 10)
    if (Number.isNaN(canon) || canon <= 0) {
      alert("Ingresa un canon mensual válido.")
      return
    }
    if (Number.isNaN(dia) || dia < 1 || dia > 31) {
      alert("El día de pago debe estar entre 1 y 31.")
      return
    }
    try {
      await api.put(`/contratos/${contratoToEdit.id}`, {
        fecha_inicio: editFormData.fecha_inicio,
        fecha_fin: editFormData.fecha_fin,
        canon_mensual: canon,
        dia_pago: dia,
        modo_cobro: editFormData.modo_cobro === "fin_mes" ? "fin_mes" : "anticipado",
      })
      closeEditModal()
      fetchContratos()
      alert("✅ Contrato actualizado correctamente")
    } catch (error) {
      console.error("Error editando contrato:", error)
      alert("Error al actualizar: " + (error.response?.data?.error || error.message))
    }
  }

  const handleDelete = async (contrato) => {
    const isActivo = contrato.estado === "activo"
    const msgActivo =
      "¿Eliminar este contrato activo?\n\n" +
      "• Se borrarán todos los pagos registrados de este contrato.\n" +
      "• El apartamento quedará disponible.\n" +
      "• El arrendatario quedará sin contrato asignado.\n\n" +
      "Esta acción no se puede deshacer."
    const msgFinalizado =
      "¿Eliminar este contrato finalizado?\n\n" +
      "• Se borrarán los pagos asociados en el historial.\n\n" +
      "Esta acción no se puede deshacer."

    if (window.confirm(isActivo ? msgActivo : msgFinalizado)) {
      try {
        await api.delete(`/contratos/${contrato.id}`)
        fetchContratos()
        fetchArrendatarios()
        fetchApartamentos()
        alert("✅ Contrato eliminado")
      } catch (error) {
        console.error("Error deleting contrato:", error)
        alert("Error al eliminar: " + (error.response?.data?.error || error.message))
      }
    }
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
      modo_cobro: "anticipado",
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
      modo_cobro: "anticipado",
    })
    setShowModal(true)
  }

  const openRenovarModal = (contrato) => {
    if (
      contrato.estado === "finalizado" &&
      tieneContratoActivoMismoAptoMismoArrendatario(contrato)
    ) {
      alert(
        "Ya existe un contrato activo para este apartamento con ese arrendatario. Gestiona el contrato vigente desde la fila Activo; no hace falta renovar el contrato finalizado."
      )
      return
    }
    setContratoToRenew(contrato)
    // Pre-llenar con los datos del contrato actual
    setFormData({
      arrendatario_id: contrato.arrendatario_id.toString(),
      apartamento_id: contrato.apartamento_id.toString(),
      fecha_inicio: "",
      fecha_fin: "",
      canon_mensual: contrato.canon_mensual.toLocaleString("es-CO"),
      dia_pago: contrato.dia_pago.toString(),
      modo_cobro: contrato.modo_cobro === "fin_mes" ? "fin_mes" : "anticipado",
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

  /** Mismo arrendatario + mismo apartamento ya tienen un contrato activo (evita “renovar” el histórico duplicado). */
  const tieneContratoActivoMismoAptoMismoArrendatario = useCallback(
    (contrato) =>
      contratos.some(
        (a) =>
          a.estado === "activo" &&
          a.apartamento_id === contrato.apartamento_id &&
          a.arrendatario_id === contrato.arrendatario_id
      ),
    [contratos]
  )

  /**
   * Oculta contratos finalizados sustituidos por uno activo (mismo inquilino, misma unidad).
   * Si el inquilino del finalizado fuera otro, la fila se mantiene como historial.
   */
  const contratosVista = useMemo(() => {
    return contratos.filter((c) => {
      if (c.estado !== "finalizado") return true
      const hayActivoMismaLlave = contratos.some(
        (a) =>
          a.estado === "activo" &&
          a.apartamento_id === c.apartamento_id &&
          a.arrendatario_id === c.arrendatario_id
      )
      return !hayActivoMismaLlave
    })
  }, [contratos])

  // Filtrar contratos (lista ya sin “histórico duplicado” del mismo arrendatario/unidad)
  const filteredContratos = contratosVista.filter((contrato) => {
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
      {actionsMenu &&
        typeof document !== "undefined" &&
        createPortal(
          <>
            <button
              type="button"
              className="fixed inset-0 z-[140] bg-slate-950/50 backdrop-blur-[3px] cursor-default"
              aria-label="Cerrar menú"
              onClick={closeActionsMenu}
            />
            <div
              role="menu"
              className="fixed z-[150] w-[min(100vw-1.5rem,17rem)] rounded-2xl border border-cyan-500/20 bg-gray-900/95 backdrop-blur-xl
                       shadow-[0_0_40px_rgba(34,211,238,0.12),0_25px_50px_rgba(0,0,0,0.45)] overflow-hidden
                       ring-1 ring-white/10 transition-[opacity,transform] duration-200"
              style={{ top: actionsMenu.top, right: actionsMenu.right }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-3 py-2 border-b border-white/5 bg-gradient-to-r from-cyan-500/10 to-transparent">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-cyan-300/90">Acciones</p>
                <p className="text-xs text-gray-400 truncate mt-0.5" title={actionsMenu.contrato.arrendatario_nombre}>
                  {actionsMenu.contrato.arrendatario_nombre}
                </p>
              </div>
              <div className="p-1.5 max-h-[min(70vh,22rem)] overflow-y-auto">
                {actionsMenu.contrato.estado === "activo" && (
                  <>
                    <p className="px-2.5 pt-1 pb-0.5 text-[10px] font-medium uppercase tracking-wide text-gray-500">
                      Plazo y contrato
                    </p>
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm text-amber-100
                               hover:bg-amber-500/15 hover:ring-1 hover:ring-amber-400/20 transition-all"
                      onClick={() => {
                        openExtenderModal(actionsMenu.contrato)
                        closeActionsMenu()
                      }}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/20 text-amber-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                      <span>
                        <span className="block font-medium">Extender</span>
                        <span className="block text-[11px] text-gray-500">Solo cambia la fecha de fin</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm text-cyan-100
                               hover:bg-cyan-500/15 hover:ring-1 hover:ring-cyan-400/20 transition-all"
                      onClick={() => {
                        openRenovarModal(actionsMenu.contrato)
                        closeActionsMenu()
                      }}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </span>
                      <span>
                        <span className="block font-medium">Renovar</span>
                        <span className="block text-[11px] text-gray-500">Nuevo contrato al cerrar el actual</span>
                      </span>
                    </button>
                    <p className="px-2.5 pt-2 pb-0.5 text-[10px] font-medium uppercase tracking-wide text-rose-400/80">
                      Zona sensible
                    </p>
                    <button
                      type="button"
                      role="menuitem"
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm text-rose-200
                               hover:bg-rose-600/20 hover:ring-1 hover:ring-rose-400/30 transition-all"
                      onClick={() => {
                        handleDelete(actionsMenu.contrato)
                        closeActionsMenu()
                      }}
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </span>
                      <span>
                        <span className="block font-medium">Eliminar contrato</span>
                        <span className="block text-[11px] text-gray-500">Libera el apartamento si está activo</span>
                      </span>
                    </button>
                  </>
                )}
                {actionsMenu.contrato.estado === "finalizado" && (
                  <button
                    type="button"
                    role="menuitem"
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-sm text-rose-200
                             hover:bg-rose-600/20 hover:ring-1 hover:ring-rose-400/30 transition-all"
                    onClick={() => {
                      handleDelete(actionsMenu.contrato)
                      closeActionsMenu()
                    }}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-300">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </span>
                    <span className="font-medium">Eliminar contrato</span>
                  </button>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
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
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto sm:justify-end">
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
                  placeholder="Buscar arrendatario o apartamento…"
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
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs font-semibold text-amber-300 uppercase tracking-wider">Límite</th>
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
                      <div className="flex flex-col items-center gap-0.5">
                        <span className="px-2 py-1 bg-amber-600/20 text-amber-300 rounded-lg text-xs tabular-nums">
                          Día {contrato.dia_pago}
                        </span>
                        <span className="text-[10px] text-gray-500 leading-tight text-center max-w-[9rem]">
                          {(contrato.modo_cobro || "anticipado") === "fin_mes"
                            ? "Cobro a Mes Vencido (Fin de Mes)"
                            : "Cobro Anticipado (Mes Adelantado)"}
                        </span>
                      </div>
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
                    <td className="px-4 xl:px-6 py-3 xl:py-4 align-top">
                      <div className="flex items-center gap-2 flex-wrap">
                        {contrato.estado === "activo" && (
                          <>
                            <button
                              type="button"
                              onClick={() => openEditModal(contrato)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white
                                       bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/25
                                       hover:shadow-emerald-400/40 hover:brightness-110 active:scale-[0.98] transition-all duration-200"
                            >
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Editar
                            </button>
                            <button
                              type="button"
                              onClick={() => handleFinalizar(contrato.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white
                                       bg-gradient-to-r from-rose-500 to-red-600 shadow-lg shadow-rose-500/25
                                       hover:shadow-rose-400/35 hover:brightness-110 active:scale-[0.98] transition-all duration-200"
                            >
                              <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Finalizar
                            </button>
                            <button
                              type="button"
                              onClick={(e) => openMoreMenu(e, contrato)}
                              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.98]
                                border backdrop-blur-md
                                ${actionsMenu?.contrato?.id === contrato.id
                                  ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                                  : "border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 hover:border-cyan-500/30"}`}
                              aria-expanded={actionsMenu?.contrato?.id === contrato.id}
                              aria-haspopup="menu"
                            >
                              <span className="text-base leading-none tracking-tight">⋯</span>
                              Más
                            </button>
                          </>
                        )}
                        {contrato.estado === "finalizado" && (
                          <>
                            {!tieneContratoActivoMismoAptoMismoArrendatario(contrato) && (
                              <button
                                type="button"
                                onClick={() => openRenovarModal(contrato)}
                                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-white
                                         bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25
                                         hover:brightness-110 active:scale-[0.98] transition-all duration-200"
                              >
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Renovar
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => openMoreMenu(e, contrato)}
                              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.98]
                                border backdrop-blur-md
                                ${actionsMenu?.contrato?.id === contrato.id
                                  ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                                  : "border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 hover:border-cyan-500/30"}`}
                              aria-expanded={actionsMenu?.contrato?.id === contrato.id}
                              aria-haspopup="menu"
                            >
                              <span className="text-base leading-none">⋯</span>
                              Más
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
                {/* Móvil: columna completa (evita solapar fechas/canon con botones laterales) */}
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <h3 className="text-white font-semibold text-lg leading-snug break-words">
                        {contrato.arrendatario_nombre}
                      </h3>
                      <p className="text-yellow-300 text-sm font-medium mt-0.5 break-words">
                        {contrato.apartamento_numero}
                      </p>
                      <p className="text-gray-400 text-xs mt-1 break-words leading-relaxed">
                        {contrato.apartamento_direccion}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${
                        contrato.estado === "activo"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                          : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                      }`}
                    >
                      {contrato.estado === "activo" ? "Activo" : "Finalizado"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div className="min-w-0">
                      <p className="text-gray-500 text-xs mb-0.5">Inicio</p>
                      <p className="text-gray-200 break-words leading-tight tabular-nums">
                        {formatDate(contrato.fecha_inicio)}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-gray-500 text-xs mb-0.5">Fin</p>
                      <p className="text-gray-200 break-words leading-tight tabular-nums">
                        {formatDate(contrato.fecha_fin)}
                      </p>
                    </div>
                    <div className="min-w-0 col-span-2 sm:col-span-1">
                      <p className="text-gray-500 text-xs mb-0.5">Canon mensual</p>
                      <p className="text-emerald-300 font-semibold break-words leading-tight text-[13px] sm:text-sm tabular-nums">
                        {formatCurrency(contrato.canon_mensual)}
                      </p>
                    </div>
                    <div className="min-w-0 col-span-2 sm:col-span-1">
                      <p className="text-gray-500 text-xs mb-0.5">Día límite / cobro</p>
                      <p className="text-amber-300 font-medium leading-tight tabular-nums">Día {contrato.dia_pago}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-snug">
                        {(contrato.modo_cobro || "anticipado") === "fin_mes"
                          ? "Cobro a Mes Vencido (Fin de Mes)"
                          : "Cobro Anticipado (Mes Adelantado)"}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`grid gap-2 pt-1 border-t border-white/5 ${
                      contrato.estado === "activo"
                        ? "grid-cols-3"
                        : tieneContratoActivoMismoAptoMismoArrendatario(contrato)
                          ? "grid-cols-1"
                          : "grid-cols-2"
                    }`}
                  >
                    {contrato.estado === "activo" && (
                      <>
                        <button
                          type="button"
                          onClick={() => openEditModal(contrato)}
                          className="min-h-[40px] px-2 py-2 rounded-xl text-[11px] sm:text-xs font-semibold text-white text-center
                                   bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20
                                   hover:brightness-110 active:scale-[0.98] transition-all"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFinalizar(contrato.id)}
                          className="min-h-[40px] px-2 py-2 rounded-xl text-[11px] sm:text-xs font-semibold text-white text-center
                                   bg-gradient-to-r from-rose-500 to-red-600 shadow-lg shadow-rose-500/20
                                   hover:brightness-110 active:scale-[0.98] transition-all"
                        >
                          Finalizar
                        </button>
                        <button
                          type="button"
                          onClick={(e) => openMoreMenu(e, contrato)}
                          className={`min-h-[40px] px-2 py-2 rounded-xl text-[11px] sm:text-xs font-semibold text-center border backdrop-blur-md
                            transition-all active:scale-[0.98]
                            ${actionsMenu?.contrato?.id === contrato.id
                              ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100"
                              : "border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"}`}
                        >
                          ⋯ Más
                        </button>
                      </>
                    )}
                    {contrato.estado === "finalizado" && (
                      <>
                        {!tieneContratoActivoMismoAptoMismoArrendatario(contrato) && (
                          <button
                            type="button"
                            onClick={() => openRenovarModal(contrato)}
                            className="min-h-[40px] px-2 py-2 rounded-xl text-[11px] sm:text-xs font-semibold text-white text-center
                                     bg-gradient-to-r from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20
                                     hover:brightness-110 active:scale-[0.98] transition-all"
                          >
                            Renovar
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => openMoreMenu(e, contrato)}
                          className={`min-h-[40px] px-2 py-2 rounded-xl text-[11px] sm:text-xs font-semibold text-center border backdrop-blur-md
                            transition-all active:scale-[0.98]
                            ${actionsMenu?.contrato?.id === contrato.id
                              ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100"
                              : "border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"}`}
                        >
                          ⋯ Más
                        </button>
                      </>
                    )}
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
                  onChange={(e) => {
                    const selectedApt = apartamentos.find(apt => apt.id === parseInt(e.target.value))
                    setFormData({
                      ...formData,
                      apartamento_id: e.target.value,
                      canon_mensual: selectedApt ? selectedApt.valor_arriendo.toLocaleString("es-CO") : "",
                    })
                  }}
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
                    className="w-full px-2 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-xs sm:text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 
                             transition-all duration-300 appearance-none"
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
                    className="w-full px-2 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-xs sm:text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 
                             transition-all duration-300 appearance-none"
                    required
                  />
                </div>
              </div>

              {/* Canon, modo de cobro y día límite */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    💰 Canon Mensual
                  </label>
                  <input
                    type="text"
                    placeholder="Selecciona un apartamento"
                    value={formData.canon_mensual}
                    onChange={(e) => setFormData({ ...formData, canon_mensual: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 
                             focus:border-amber-500/50 transition-all duration-300"
                    required
                  />
                  {formData.canon_mensual && !contratoToRenew && (
                    <p className="text-xs text-amber-400/70 mt-1">
                      💡 Tomado del valor del apartamento. Puedes modificarlo si es necesario.
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    📆 Día límite de pago
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Ej: 5"
                    value={formData.dia_pago}
                    onChange={(e) => setFormData({ ...formData, dia_pago: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 
                             focus:border-amber-500/50 transition-all duration-300"
                    required
                  />
                  {formData.dia_pago ? (
                    formData.modo_cobro === "fin_mes" ? (
                      <p className="text-xs text-amber-400/80 mt-1">
                        📅 El canon de cada mes (periodo facturado) vence el día{" "}
                        <span className="font-semibold text-amber-300">{formData.dia_pago}</span> de ese mismo mes.
                      </p>
                    ) : (
                      <p className="text-xs text-amber-400/80 mt-1">
                        📅 Pago anticipado: el canon del mes del periodo vence el día{" "}
                        <span className="font-semibold text-amber-300">{formData.dia_pago}</span> del mes calendario anterior a ese periodo.
                      </p>
                    )
                  ) : (
                    <p className="text-xs text-gray-500 mt-1">
                      Día del mes hasta el cual se acepta el pago sin mora (según el modo de cobro).
                    </p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    🧾 Modo de cobro del canon
                  </label>
                  <select
                    value={formData.modo_cobro}
                    onChange={(e) => setFormData({ ...formData, modo_cobro: e.target.value })}
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all duration-300"
                  >
                    <option value="anticipado" className="bg-gray-800">
                      Cobro Anticipado (Mes Adelantado)
                    </option>
                    <option value="fin_mes" className="bg-gray-800">
                      Cobro a Mes Vencido (Fin de Mes)
                    </option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1.5">
                    Moras, recordatorios y generación automática de pagos usan esta misma regla.
                  </p>
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
                  className="w-full px-2 sm:px-4 py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-xs sm:text-sm
                           focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 
                           transition-all duration-300 appearance-none"
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

      {/* Modal Editar Contrato (activo) */}
      {showEditModal && contratoToEdit && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl max-w-lg w-full 
                        border border-gray-700/50 overflow-hidden my-8">
            <div className="relative bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-b border-gray-700/50 p-4 sm:p-6">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-10"></div>
              <h2 className="relative text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">✏️</span>
                Editar contrato
              </h2>
              <p className="relative text-sm text-gray-400 mt-2">
                {contratoToEdit.arrendatario_nombre} · {contratoToEdit.apartamento_numero}
              </p>
            </div>

            <form onSubmit={handleEditSubmit} className="p-4 sm:p-6 space-y-4">
              <p className="text-xs text-gray-500 bg-gray-800/40 rounded-lg px-3 py-2 border border-gray-600/40">
                Puedes corregir fechas, canon, día límite y modo de cobro (anticipado o fin de mes). Para cambiar arrendatario o apartamento, elimina este contrato y crea uno nuevo.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">📅 Fecha inicio</label>
                  <input
                    type="date"
                    value={editFormData.fecha_inicio}
                    onChange={(e) => setEditFormData({ ...editFormData, fecha_inicio: e.target.value })}
                    className="w-full px-2 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-xs sm:text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all appearance-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">📅 Fecha fin</label>
                  <input
                    type="date"
                    value={editFormData.fecha_fin}
                    onChange={(e) => setEditFormData({ ...editFormData, fecha_fin: e.target.value })}
                    className="w-full px-2 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-xs sm:text-sm
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all appearance-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">💰 Canon mensual</label>
                <input
                  type="text"
                  value={editFormData.canon_mensual}
                  onChange={(e) => setEditFormData({ ...editFormData, canon_mensual: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  placeholder="Ej: 1.500.000"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Puedes usar puntos como separador de miles.</p>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">📆 Día límite de pago</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={editFormData.dia_pago}
                  onChange={(e) => setEditFormData({ ...editFormData, dia_pago: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">🧾 Modo de cobro</label>
                <select
                  value={editFormData.modo_cobro}
                  onChange={(e) => setEditFormData({ ...editFormData, modo_cobro: e.target.value })}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                           focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                >
                  <option value="anticipado" className="bg-gray-800">
                    Cobro Anticipado (Mes Adelantado)
                  </option>
                  <option value="fin_mes" className="bg-gray-800">
                    Cobro a Mes Vencido (Fin de Mes)
                  </option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isEditContractUnchanged}
                  title={
                    isEditContractUnchanged
                      ? "Modifica al menos un campo para poder guardar"
                      : undefined
                  }
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold
                           shadow-lg hover:shadow-emerald-500/50 transition-all hover:scale-[1.02] active:scale-[0.98]
                           disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:scale-100"
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
    </div>
  )
}

export default Contratos
