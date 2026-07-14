import { useState, useEffect, useCallback, useMemo } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import {
  inclusiveEndHint,
  normalizeInclusiveContractEnd,
  prepareContractDateRange,
} from "../utils/contractperiod"
import ExtenderContrato from "../components/contratos/ExtenderContrato"
import EditarContrato from "../components/contratos/EditarContrato"
import CrearContrato from "../components/contratos/CrearContrato"
import {
  Typography,
  Box,
  CircularProgress,
  Menu,
  MenuItem,
  Grid,
} from "@mui/material"
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  TrendingUp as RenewIcon,
  Schedule as ExtendIcon,
  CheckCircle as FinalizeIcon,
  Payments as PaymentsIcon,
} from "@mui/icons-material"
import DescriptionIcon from "@mui/icons-material/Description"
import PeopleTwoToneIcon from "@mui/icons-material/PeopleTwoTone"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import HighlightOffIcon from "@mui/icons-material/HighlightOff"
import {
  StatCard,
  GlassPanel,
  PageHeader,
  SearchField,
  FilterPills,
  GlowButton,
  EmptyState,
  ListFooter,
  DataListHeader,
} from "../components/ui"
import ContractListRow from "../components/contratos/ContractListRow"

const resolveApartamentoNombre = (apt = {}) => {
  const directCandidates = [apt.name, apt.nombre]
  for (const value of directCandidates) {
    if (typeof value === "string" && value.trim()) return value.trim()
  }
  const byKeyHeuristic = Object.entries(apt).find(
    ([key, value]) =>
      typeof value === "string" &&
      value.trim() &&
      (key.toLowerCase() === "nombre" || key.toLowerCase() === "name")
  )
  return byKeyHeuristic ? byKeyHeuristic[1].trim() : ""
}

const normalizeApartamento = (apt = {}) => {
  const nombreNormalizado = resolveApartamentoNombre(apt)
  return { ...apt, nombre: nombreNormalizado }
}

const getApartamentoDisplayName = (apt = {}) =>
  apt.nombre?.trim() || `Sin nombre (ID ${apt.id ?? "?"})`

const contractPaymentsHref = (contractId) => `/pagos?contrato=${contractId}`

const Contratos = () => {
  const [contratos, setContratos] = useState([])
  const [tenants, setTenants] = useState([])
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
    paymentDay: "0",
    modo_cobro: "anticipado",
  })
  const [contratoToRenew, setContratoToRenew] = useState(null)
  const [nuevaFechaFin, setNuevaFechaFin] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")

  const [anchorEl, setAnchorEl] = useState(null)
  const [menuContrato, setMenuContrato] = useState(null)
  const openActionsMenu = Boolean(anchorEl)

  const closeActionsMenu = useCallback(() => {
    setAnchorEl(null)
    setMenuContrato(null)
  }, [])

  const openMoreMenu = useCallback((e, contrato) => {
    e.stopPropagation()
    setAnchorEl(e.currentTarget)
    setMenuContrato(contrato)
  }, [])

  const handleFilterChange = (newValue) => {
    setFilterEstado(newValue)
  }

  const filterOptions = [
    { value: "todos", label: "Todos" },
    { value: "activo", label: "Activos" },
    { value: "finalizado", label: "Finalizados" },
  ]

  const listColumns = [
    { key: "arrendatario", label: "Arrendatario", width: "minmax(180px,1.4fr)" },
    { key: "apartamento", label: "Apartamento", width: "minmax(160px,1.2fr)" },
    { key: "periodo", label: "Periodo", width: "minmax(130px,1fr)" },
    { key: "canon", label: "Renta mensual", width: "minmax(110px,0.8fr)" },
    { key: "estado", label: "Estado", width: "minmax(100px,0.7fr)" },
    { key: "acciones", label: "Acciones", width: "auto" },
  ]

  useEffect(() => {
    if (!openActionsMenu) return
    const onKey = (ev) => ev.key === "Escape" && closeActionsMenu()
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [openActionsMenu, closeActionsMenu])

  const [formData, setFormData] = useState({
    arrendatario_id: "",
    apartamento_id: "",
    fecha_inicio: "",
    fecha_fin: "",
    canon_mensual: "",
    paymentDay: "0",
    modo_cobro: "anticipado",
  })

  useEffect(() => {
    fetchContratos()
    fetchTenants()
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

  const fetchTenants = async () => {
    try {
      const { data } = await api.get("/arrendatarios")
      setTenants(data || [])
    } catch (error) {
      console.error("Error fetching tenants:", error)
    }
  }

  const fetchApartamentos = async () => {
    try {
      const { data } = await api.get("/apartamentos")
      const disponibles = (data || [])
        .map(normalizeApartamento)
        .filter((apt) => apt.estado === "disponible")
      setApartamentos(disponibles || [])
    } catch (error) {
      console.error("Error fetching apartamentos:", error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const diaOffset = parseInt(String(formData.paymentDay ?? "0").trim(), 10)
      const dates = prepareContractDateRange(formData.fecha_inicio, formData.fecha_fin)
      const dataToSend = {
        ...formData,
        fecha_inicio: dates.fecha_inicio,
        fecha_fin: dates.fecha_fin,
        arrendatario_id: parseInt(formData.arrendatario_id),
        apartamento_id: parseInt(formData.apartamento_id),
        canon_mensual: parseFloat(formData.canon_mensual.toString().replace(/\./g, "").replace(",", ".")),
        dia_pago: Number.isNaN(diaOffset) ? 0 : Math.min(90, Math.max(0, diaOffset)),
        modo_cobro: formData.modo_cobro === "fin_mes" ? "fin_mes" : "anticipado",
      }

      if (
        contratoToRenew?.estado === "finalizado" &&
        tieneContratoActivoMismoAptoMismoArrendatario(contratoToRenew)
      ) {
        alert("Ya existe un contrato activo para este apartamento. El API no permitirá duplicar; revisa el contrato vigente.")
        return
      }

      if (contratoToRenew && contratoToRenew.estado === "activo") {
        await api.put(`/contratos/${contratoToRenew.id}/finalizar`)
      }
      await api.post("/contratos", dataToSend)
      closeModal()
      fetchContratos()
      fetchTenants()
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
      const fechaInicio = toDateInputValue(contratoToExtend?.fecha_inicio)
      const nuevaFin = normalizeInclusiveContractEnd(fechaInicio, nuevaFechaFin)
      await api.put(`/contratos/${contratoToExtend.id}/extender`, { nueva_fecha_fin: nuevaFin })
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
        fetchTenants()
        fetchApartamentos()
      } catch (error) {
        console.error("Error finalizando contrato:", error)
        alert("Error al finalizar: " + (error.response?.data?.error || error.message))
      }
    }
  }

  const normalizeFormFechaFin = (fechaInicio, fechaFin, applyToForm) => {
    if (!fechaInicio || !fechaFin) return
    const normalized = normalizeInclusiveContractEnd(fechaInicio, fechaFin)
    if (normalized !== fechaFin) {
      applyToForm(normalized)
    }
  }

  const handleCreateFechaFinBlur = () => {
    normalizeFormFechaFin(formData.fecha_inicio, formData.fecha_fin, (fecha_fin) => {
      setFormData((prev) => ({ ...prev, fecha_fin }))
    })
  }

  const handleEditFechaFinBlur = () => {
    normalizeFormFechaFin(editFormData.fecha_inicio, editFormData.fecha_fin, (fecha_fin) => {
      setEditFormData((prev) => ({ ...prev, fecha_fin }))
    })
  }

  const handleExtendFechaFinBlur = () => {
    if (!contratoToExtend) return
    const fechaInicio = toDateInputValue(contratoToExtend.fecha_inicio)
    normalizeFormFechaFin(fechaInicio, nuevaFechaFin, setNuevaFechaFin)
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
      paymentDay: String(contrato.dia_pago ?? 0),
      modo_cobro: contrato.modo_cobro === "fin_mes" ? "fin_mes" : "anticipado",
    })
    setShowEditModal(true)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setContratoToEdit(null)
    setEditFormData({ fecha_inicio: "", fecha_fin: "", canon_mensual: "", paymentDay: "0", modo_cobro: "anticipado" })
  }

  const isEditContractUnchanged = useMemo(() => {
    if (!contratoToEdit || !showEditModal) return true
    const canonParsed = parseFloat(String(editFormData.canon_mensual || "").replace(/\./g, "").replace(",", "."))
    if (Number.isNaN(canonParsed)) return false
    const dia = parseInt(String(editFormData.paymentDay ?? "0").trim(), 10)
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
    const dia = parseInt(String(editFormData.paymentDay ?? "0").trim(), 10)
    if (Number.isNaN(canon) || canon <= 0) {
      alert("Ingresa un canon mensual válido.")
      return
    }
    if (Number.isNaN(dia) || dia < 0 || dia > 90) {
      alert("Los días extra deben estar entre 0 y 90.")
      return
    }
    try {
      const dates = prepareContractDateRange(editFormData.fecha_inicio, editFormData.fecha_fin)
      await api.put(`/contratos/${contratoToEdit.id}`, {
        fecha_inicio: dates.fecha_inicio,
        fecha_fin: dates.fecha_fin,
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
      "• Si era su único contrato activo, el arrendatario quedará sin apartamento asignado en ficha.\n\n" +
      "Esta acción no se puede deshacer."
    const msgFinalizado =
      "¿Eliminar este contrato finalizado?\n\n" +
      "• Se borrarán los pagos asociados en el historial.\n\n" +
      "Esta acción no se puede deshacer."

    if (window.confirm(isActivo ? msgActivo : msgFinalizado)) {
      try {
        await api.delete(`/contratos/${contrato.id}`)
        fetchContratos()
        fetchTenants()
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
      paymentDay: "0",
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
      paymentDay: "0",
      modo_cobro: "anticipado",
    })
    setShowModal(true)
  }

  const openRenovarModal = (contrato) => {
    if (
      contrato.estado === "finalizado" &&
      tieneContratoActivoMismoAptoMismoArrendatario(contrato)
    ) {
      alert("Ya existe un contrato activo para este apartamento con ese arrendatario. Gestiona el contrato vigente desde la fila Activo; no hace falta renovar el contrato finalizado.")
      return
    }
    setContratoToRenew(contrato)
    setFormData({
      arrendatario_id: contrato.arrendatario_id.toString(),
      apartamento_id: contrato.apartamento_id.toString(),
      fecha_inicio: "",
      fecha_fin: "",
      canon_mensual: contrato.canon_mensual.toLocaleString("es-CO"),
      paymentDay: String(contrato.dia_pago ?? 0),
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
    if (!dateString) return ""
    const date = new Date(dateString)
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, "0")
    const day = String(date.getUTCDate()).padStart(2, "0")
    return `${day}/${month}/${year}`
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const createFechaFinHint = useMemo(
    () => inclusiveEndHint(formData.fecha_inicio, formData.fecha_fin),
    [formData.fecha_inicio, formData.fecha_fin]
  )
  const editFechaFinHint = useMemo(
    () => inclusiveEndHint(editFormData.fecha_inicio, editFormData.fecha_fin),
    [editFormData.fecha_inicio, editFormData.fecha_fin]
  )
  const extendFechaFinHint = useMemo(() => {
    if (!contratoToExtend) return null
    return inclusiveEndHint(toDateInputValue(contratoToExtend.fecha_inicio), nuevaFechaFin)
  }, [contratoToExtend, nuevaFechaFin])

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

  const getActiveContractsCount = useCallback(() => {
    return contratos.filter((c) => c.estado === "activo").length
  }, [contratos])

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

  const filteredContratos = contratosVista.filter((contrato) => {
    const matchesSearch =
      contrato.arrendatario_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.apartamento_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contrato.apartamento_direccion?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesEstado = filterEstado === "todos" || contrato.estado === filterEstado
    return matchesSearch && matchesEstado
  })

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress size={64} sx={{ color: "secondary.main" }} />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1280, mx: "auto", width: "100%", minWidth: 0 }}>
      {/* KPIs */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            value={contratos.length}
            label="Contratos en total"
            icon={<DescriptionIcon />}
            color="primary"
            sparkId="contratos-total"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            value={getActiveContractsCount()}
            label="Contratos activos"
            icon={<CheckCircleIcon />}
            color="success"
            sparkId="contratos-activos"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            value={contratos.length - getActiveContractsCount()}
            label="Contratos finalizados"
            icon={<HighlightOffIcon />}
            color="info"
            sparkId="contratos-fin"
          />
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <StatCard
            value={tenants.length}
            label="Arrendatarios"
            icon={<PeopleTwoToneIcon />}
            color="warning"
            sparkId="contratos-arrend"
          />
        </Grid>
      </Grid>

      <PageHeader
        title="Contratos de Arrendamiento"
        subtitle="Gestiona los contratos de renta de apartamentos"
        action={
          <GlowButton startIcon={<AddIcon />} onClick={openNewModal}>
            Nuevo Contrato
          </GlowButton>
        }
      >
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
              placeholder="Buscar contratos, arrendatarios o apartamentos…"
            />
          </Box>
          <FilterPills options={filterOptions} value={filterEstado} onChange={handleFilterChange} />
        </Box>
        {(searchTerm || filterEstado !== "todos") && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            {filteredContratos.length} contrato(s) encontrado(s)
          </Typography>
        )}
      </PageHeader>

      <GlassPanel sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        <DataListHeader columns={listColumns} />

        {filteredContratos.length === 0 ? (
          <EmptyState
            title={contratos.length === 0 ? "No hay contratos registrados" : "No se encontraron contratos"}
            description={
              contratos.length === 0
                ? "Crea el primer contrato para comenzar"
                : "Intenta con otros términos de búsqueda o filtros"
            }
            action={
              contratos.length === 0 ? (
                <GlowButton startIcon={<AddIcon />} onClick={openNewModal}>
                  Crear contrato
                </GlowButton>
              ) : undefined
            }
          />
        ) : (
          <Box>
            {filteredContratos.map((contrato) => (
              <ContractListRow
                key={contrato.id}
                contrato={contrato}
                formatDate={formatDate}
                formatCurrency={formatCurrency}
                onEdit={openEditModal}
                onMore={openMoreMenu}
                onRenew={openRenovarModal}
                showRenew={!tieneContratoActivoMismoAptoMismoArrendatario(contrato)}
                paymentsHref={contractPaymentsHref(contrato.id)}
                isMenuOpen={openActionsMenu && menuContrato?.id === contrato.id}
              />
            ))}
          </Box>
        )}

        {filteredContratos.length > 0 && (
          <ListFooter
            from={1}
            to={filteredContratos.length}
            total={filteredContratos.length}
          />
        )}
      </GlassPanel>

      {/* Menu Actions */}
      <Menu
        anchorEl={anchorEl}
        open={openActionsMenu}
        onClose={closeActionsMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 300,
              maxWidth: 340,
              borderRadius: 2.5,
              border: 1,
              borderColor: "divider",
              bgcolor: "background.paper",
              backgroundImage: (theme) =>
                `linear-gradient(160deg, ${theme.palette.mode === "dark" ? "rgba(82,139,158,0.1)" : "rgba(8,145,178,0.06)"} 0%, transparent 45%)`,
              boxShadow: (theme) =>
                theme.palette.mode === "dark"
                  ? "0 12px 40px rgba(0,0,0,0.45)"
                  : "0 12px 32px rgba(15,23,42,0.12)",
              overflow: "hidden",
            },
          },
        }}
      >
        {menuContrato && (
          <Box sx={{ p: 1.25 }}>
            <Box
              sx={{
                px: 1.5,
                py: 1.25,
                mb: 1,
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "primary.main",
                }}
              >
                Acciones
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }} noWrap title={menuContrato.arrendatario_nombre}>
                {menuContrato.arrendatario_nombre}
              </Typography>
            </Box>

            {menuContrato.estado === "activo" && (
              <>
                <MenuItem
                  onClick={() => {
                    openExtenderModal(menuContrato)
                    closeActionsMenu()
                  }}
                  sx={{
                    gap: 1.5,
                    py: 1.25,
                    px: 1.25,
                    mb: 0.75,
                    borderRadius: 2,
                    border: 1,
                    borderColor: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(245,158,11,0.35)" : "rgba(245,158,11,0.4)",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(245,158,11,0.08)" : "rgba(245,158,11,0.06)",
                    "&:hover": {
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(245,158,11,0.16)" : "rgba(245,158,11,0.12)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(245,158,11,0.22)" : "rgba(245,158,11,0.15)",
                      color: "warning.main",
                      border: 1,
                      borderColor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(245,158,11,0.4)" : "rgba(245,158,11,0.35)",
                    }}
                  >
                    <ExtendIcon fontSize="small" />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight="bold" color="warning.main">
                      Extender
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Solo cambia la fecha de fin
                    </Typography>
                  </Box>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    openRenovarModal(menuContrato)
                    closeActionsMenu()
                  }}
                  sx={{
                    gap: 1.5,
                    py: 1.25,
                    px: 1.25,
                    mb: 0.75,
                    borderRadius: 2,
                    border: 1,
                    borderColor: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(82,139,158,0.45)" : "rgba(8,145,178,0.35)",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(82,139,158,0.1)" : "rgba(8,145,178,0.06)",
                    "&:hover": {
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(82,139,158,0.2)" : "rgba(8,145,178,0.12)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(82,139,158,0.28)" : "rgba(8,145,178,0.14)",
                      color: "primary.main",
                      border: 1,
                      borderColor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(82,139,158,0.5)" : "rgba(8,145,178,0.35)",
                    }}
                  >
                    <RenewIcon fontSize="small" />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight="bold" color="primary.main">
                      Renovar
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Nuevo contrato al cerrar el actual
                    </Typography>
                  </Box>
                </MenuItem>

                <Box sx={{ px: 0.5, pt: 0.75, pb: 0.75 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "0.68rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "error.light",
                    }}
                  >
                    Zona sensible
                  </Typography>
                </Box>

                <MenuItem
                  onClick={() => {
                    closeActionsMenu()
                    handleFinalizar(menuContrato.id)
                  }}
                  sx={{
                    gap: 1.5,
                    py: 1.25,
                    px: 1.25,
                    mb: 0.75,
                    borderRadius: 2,
                    border: 1,
                    borderColor: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(255,110,110,0.35)" : "rgba(239,68,68,0.3)",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(255,110,110,0.06)" : "rgba(239,68,68,0.04)",
                    "&:hover": {
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(255,110,110,0.14)" : "rgba(239,68,68,0.1)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(255,110,110,0.18)" : "rgba(239,68,68,0.12)",
                      color: "error.main",
                      border: 1,
                      borderColor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(255,110,110,0.4)" : "rgba(239,68,68,0.3)",
                    }}
                  >
                    <FinalizeIcon fontSize="small" />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight="bold" color="error.main">
                      Finalizar
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Cierra el contrato activo
                    </Typography>
                  </Box>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleDelete(menuContrato)
                    closeActionsMenu()
                  }}
                  sx={{
                    gap: 1.5,
                    py: 1.25,
                    px: 1.25,
                    borderRadius: 2,
                    border: 1,
                    borderColor: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(255,110,110,0.55)" : "rgba(185,28,28,0.45)",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(185,28,28,0.22)" : "rgba(239,68,68,0.1)",
                    "&:hover": {
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(185,28,28,0.34)" : "rgba(239,68,68,0.16)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      bgcolor: "error.main",
                      color: "error.contrastText",
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight="bold" color="error.main">
                      Eliminar contrato
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Libera el apartamento si está activo
                    </Typography>
                  </Box>
                </MenuItem>
              </>
            )}

            {menuContrato.estado === "finalizado" && (
              <>
                <MenuItem
                  component={Link}
                  to={contractPaymentsHref(menuContrato.id)}
                  onClick={closeActionsMenu}
                  sx={{
                    gap: 1.5,
                    py: 1.25,
                    px: 1.25,
                    mb: 0.75,
                    borderRadius: 2,
                    border: 1,
                    borderColor: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(110,231,183,0.35)" : "rgba(16,185,129,0.35)",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(110,231,183,0.08)" : "rgba(16,185,129,0.06)",
                    "&:hover": {
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(110,231,183,0.16)" : "rgba(16,185,129,0.12)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(110,231,183,0.2)" : "rgba(16,185,129,0.14)",
                      color: "success.main",
                      border: 1,
                      borderColor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(110,231,183,0.4)" : "rgba(16,185,129,0.35)",
                    }}
                  >
                    <PaymentsIcon fontSize="small" />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight="bold" color="success.main">
                      Ver pagos
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Historial de cobros del contrato
                    </Typography>
                  </Box>
                </MenuItem>

                <MenuItem
                  onClick={() => {
                    handleDelete(menuContrato)
                    closeActionsMenu()
                  }}
                  sx={{
                    gap: 1.5,
                    py: 1.25,
                    px: 1.25,
                    borderRadius: 2,
                    border: 1,
                    borderColor: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(255,110,110,0.55)" : "rgba(185,28,28,0.45)",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(185,28,28,0.22)" : "rgba(239,68,68,0.1)",
                    "&:hover": {
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(185,28,28,0.34)" : "rgba(239,68,68,0.16)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      bgcolor: "error.main",
                      color: "error.contrastText",
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight="bold" color="error.main">
                      Eliminar contrato
                    </Typography>
                  </Box>
                </MenuItem>
              </>
            )}
          </Box>
        )}
      </Menu>

      {/* Modals */}
      <CrearContrato
        open={showModal}
        onClose={closeModal}
        contratoToRenew={contratoToRenew}
        formData={formData}
        onFormDataChange={setFormData}
        tenants={tenants}
        apartamentos={apartamentos}
        isDisabled={!contratoToRenew && (tenants.length === 0 || apartamentos.length === 0)}
        onSubmit={handleSubmit}
        formatCurrency={formatCurrency}
        getApartamentoDisplayName={getApartamentoDisplayName}
        fechaFinHint={createFechaFinHint}
        onFechaFinBlur={handleCreateFechaFinBlur}
      />

      <ExtenderContrato
        open={showExtenderModal && !!contratoToExtend}
        onClose={closeExtenderModal}
        contratoToExtend={contratoToExtend}
        nuevaFechaFin={nuevaFechaFin}
        onNuevaFechaFinChange={setNuevaFechaFin}
        onSubmit={handleExtender}
        formatDate={formatDate}
        fechaFinHint={extendFechaFinHint}
        onFechaFinBlur={handleExtendFechaFinBlur}
      />

      <EditarContrato
        open={showEditModal && !!contratoToEdit}
        onClose={closeEditModal}
        contratoToEdit={contratoToEdit}
        editFormData={editFormData}
        onEditFormDataChange={setEditFormData}
        isEditContractUnchanged={isEditContractUnchanged}
        onSubmit={handleEditSubmit}
        fechaFinHint={editFechaFinHint}
        onFechaFinBlur={handleEditFechaFinBlur}
      />
    </Box>
  )
}

export default Contratos
