import { useState, useEffect, useCallback, useMemo } from "react"
import { Link } from "react-router-dom"
import api from "../services/api"
import ExtenderContrato from "../components/contratos/ExtenderContrato"
import EditarContrato from "../components/contratos/EditarContrato"
import CrearContrato from "../components/contratos/CrearContrato"
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Avatar,
  Card,
  CardContent,
  Grid,
  Box,
  CircularProgress,
  Menu,
  MenuItem,
  InputAdornment,
  Tooltip,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material"
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  TrendingUp as RenewIcon,
  Schedule as ExtendIcon,
  CheckCircle as FinalizeIcon,
  MoreHoriz as MoreHorizIcon,
  Home as HomeIcon,
  CalendarMonth as CalendarIcon,
  Payments as PaymentsIcon,
} from "@mui/icons-material"
import DescriptionIcon from "@mui/icons-material/Description"

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

  const handleFilterChange = (_event, newValue) => {
    if (newValue !== null) setFilterEstado(newValue)
  }

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
      const dataToSend = {
        ...formData,
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
      await api.put(`/contratos/${contratoToExtend.id}/extender`, { nueva_fecha_fin: nuevaFechaFin })
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 3, bgcolor: "background.paper" }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, justifyContent: "space-between", alignItems: { xs: "stretch", sm: "center" }, gap: 2 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
              <DescriptionIcon x={{ mr: 1, verticalAlign: "middle" }} />
              Contratos de Arrendamiento
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestiona los contratos de renta de apartamentos
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openNewModal}
            sx={{ px: 4, py: 1.5, borderRadius: 2, alignSelf: { xs: "stretch", sm: "auto" } }}
          >
            Nuevo Contrato
          </Button>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ mt: 3, display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar arrendatario o apartamento…"
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
            sx={{ flexShrink: 0 }}
          >
            <ToggleButton value="todos" sx={{ px: 2, py: 1 }}>
              Todos
            </ToggleButton>
            <ToggleButton value="activo" sx={{ px: 2, py: 1 }}>
              Activos
            </ToggleButton>
            <ToggleButton value="finalizado" sx={{ px: 2, py: 1 }}>
              Finalizados
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>

        {(searchTerm || filterEstado !== "todos") && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {filteredContratos.length} contrato(s) encontrado(s)
          </Typography>
        )}
      </Paper>

      {/* Content */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden", bgcolor: "background.paper" }}>
        {/* Desktop Table */}
        <Box sx={{ display: { xs: "none", md: "block" } }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Arrendatario</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Apartamento</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Fecha</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Canon</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Extra días</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredContratos.map((contrato) => (
                  <TableRow key={contrato.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {contrato.arrendatario_nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexDirection: "column" }}>
                        <Typography variant="body2" fontWeight="medium">
                          {contrato.apartamento_nombre}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {contrato.apartamento_direccion}
                        </Typography>
                      </Box>
                    </TableCell>
                     <TableCell>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25 }}>
                        <Typography variant="caption" color="text.secondary">
                          Inicio: {formatDate(contrato.fecha_inicio)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Fin: {formatDate(contrato.fecha_fin)}
                        </Typography>
                      </Box>
                     </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium" color="warning.main">
                        {formatCurrency(contrato.canon_mensual)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, alignItems: "center" }}>
                        <Chip
                          label={Number(contrato.dia_pago) === 0 ? "0 días extra" : `+${contrato.dia_pago} días`}
                          size="small"
                          color="warning"
                          variant="outlined"
                        />
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                          {(contrato.modo_cobro || "anticipado") === "fin_mes" ? "Fin de mes" : "Anticipado"}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={contrato.estado === "activo" ? "🟢 Activo" : "⚫ Finalizado"}
                        size="small"
                        color={contrato.estado === "activo" ? "success" : "default"}
                        variant={contrato.estado === "activo" ? "filled" : "outlined"}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {contrato.estado === "activo" && (
                          <>
                            <Tooltip title="Editar">
                              <IconButton size="small" onClick={() => openEditModal(contrato)} color="primary">
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Button
                              size="small"
                              variant="text"
                              component={Link}
                              to={contractPaymentsHref(contrato.id)}
                              sx={{ color: "text.secondary", fontSize: "0.75rem", minWidth: 0 }}
                            >
                              Pagos
                            </Button>
                            <IconButton
                              size="small"
                              onClick={(e) => openMoreMenu(e, contrato)}
                              aria-expanded={openActionsMenu && menuContrato?.id === contrato.id}
                              aria-haspopup="menu"
                            >
                              <Typography variant="caption" sx={{ fontSize: "1.2rem", lineHeight: 1 }}>⋯</Typography>
                            </IconButton>
                          </>
                        )}
                        {contrato.estado === "finalizado" && (
                          <>
                            {!tieneContratoActivoMismoAptoMismoArrendatario(contrato) && (
                              <Tooltip title="Renovar">
                                <IconButton size="small" onClick={() => openRenovarModal(contrato)} color="info">
                                  <RenewIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                            <Button
                              size="small"
                              variant="text"
                              component={Link}
                              to={contractPaymentsHref(contrato.id)}
                              sx={{ color: "text.secondary", fontSize: "0.75rem", minWidth: 0 }}
                            >
                              Pagos
                            </Button>
                            <IconButton
                              size="small"
                              onClick={(e) => openMoreMenu(e, contrato)}
                              aria-expanded={openActionsMenu && menuContrato?.id === contrato.id}
                              aria-haspopup="menu"
                            >
                              <Typography variant="caption" sx={{ fontSize: "1.2rem", lineHeight: 1 }}>⋯</Typography>
                            </IconButton>
                          </>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredContratos.length === 0 && (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                📋
              </Typography>
              <Typography color="text.secondary">
                {contratos.length === 0 ? "No hay contratos registrados" : "No se encontraron contratos"}
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                {contratos.length === 0 ? "Crea el primer contrato para comenzar" : "Intenta con otros términos de búsqueda o filtros"}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Mobile Cards */}
        <Box sx={{ display: { xs: "block", md: "none" }, p: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {filteredContratos.map((contrato) => {
              const isActivo = contrato.estado === "activo"
              const accent = isActivo ? "success.main" : "text.disabled"
              const initial =
                contrato.arrendatario_nombre?.trim()?.charAt(0)?.toUpperCase() || "C"

              return (
              <Card
                key={contrato.id}
                variant="outlined"
                sx={{
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
                <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: accent,
                        color: isActivo ? "success.contrastText" : "text.primary",
                        width: 48,
                        height: 48,
                        fontWeight: 700,
                        boxShadow: (theme) =>
                          `0 0 0 3px ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
                      }}
                    >
                      {initial}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1 }}>
                        <Typography variant="subtitle1" fontWeight="medium" noWrap>
                          {contrato.arrendatario_nombre}
                        </Typography>
                        <Chip
                          label={isActivo ? "Activo" : "Finalizado"}
                          size="small"
                          color={isActivo ? "success" : "default"}
                          variant={isActivo ? "filled" : "outlined"}
                        />
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.75, minWidth: 0 }}>
                        <HomeIcon sx={{ fontSize: 16, color: "primary.main", flexShrink: 0 }} />
                        <Typography variant="body2" color="primary" fontWeight="medium" noWrap>
                          {contrato.apartamento_nombre}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block" noWrap sx={{ mt: 0.25, pl: 2.75 }}>
                        {contrato.apartamento_direccion}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 1.25,
                      py: 1.5,
                      px: 1.5,
                      mb: 2,
                      borderRadius: 2,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)",
                      border: 1,
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.25 }}>
                      <CalendarIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}
                      >
                        Vigencia
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pl: 3.25 }}>
                      <Typography variant="body2" color="text.secondary">
                        Inicio
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(contrato.fecha_inicio)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pl: 3.25 }}>
                      <Typography variant="body2" color="text.secondary">
                        Fin
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatDate(contrato.fecha_fin)}
                      </Typography>
                    </Box>

                    <Box sx={{ borderTop: 1, borderColor: "divider", my: 0.25 }} />

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PaymentsIcon sx={{ fontSize: 16, color: "warning.main" }} />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}
                        >
                          Canon
                        </Typography>
                      </Box>
                      <Typography variant="body2" fontWeight="bold" color="warning.main">
                        {formatCurrency(contrato.canon_mensual)}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}
                      >
                        Extra días
                      </Typography>
                      <Chip
                        label={Number(contrato.dia_pago) === 0 ? "0 días" : `+${contrato.dia_pago} días`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}
                      >
                        Modo cobro
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {(contrato.modo_cobro || "anticipado") === "fin_mes" ? "Fin de mes" : "Anticipado"}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      gap: 1,
                      pt: 1.5,
                      borderTop: 1,
                      borderColor: "divider",
                      alignItems: "stretch",
                    }}
                  >
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1, minWidth: 0 }}>
                      {isActivo ? (
                        <>
                          <Button
                            variant="outlined"
                            size="small"
                            color="primary"
                            startIcon={<EditIcon />}
                            onClick={() => openEditModal(contrato)}
                            fullWidth
                          >
                            Editar
                          </Button>
                          <Button
                            component={Link}
                            to={contractPaymentsHref(contrato.id)}
                            fullWidth
                            size="small"
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
                                <PaymentsIcon sx={{ fontSize: 14 }} />
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
                            Ver pagos
                          </Button>
                        </>
                      ) : (
                        <>
                          {!tieneContratoActivoMismoAptoMismoArrendatario(contrato) && (
                            <Button
                              variant="outlined"
                              size="small"
                              color="success"
                              startIcon={<RenewIcon />}
                              onClick={() => openRenovarModal(contrato)}
                              fullWidth
                            >
                              Renovar
                            </Button>
                          )}
                          <Button
                            component={Link}
                            to={contractPaymentsHref(contrato.id)}
                            fullWidth
                            size="small"
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
                                <PaymentsIcon sx={{ fontSize: 14 }} />
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
                            Ver pagos
                          </Button>
                        </>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => openMoreMenu(e, contrato)}
                      aria-expanded={openActionsMenu && menuContrato?.id === contrato.id}
                      aria-haspopup="menu"
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1.5,
                        flexShrink: 0,
                        color: "text.secondary",
                        alignSelf: "flex-start",
                        width: 40,
                        height: 40,
                      }}
                    >
                      <MoreHorizIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
              )
            })}

            {filteredContratos.length === 0 && (
              <Box sx={{ py: 8, textAlign: "center" }}>
                <Typography variant="h4" sx={{ mb: 2 }}>
                  📋
                </Typography>
                <Typography color="text.secondary">
                  {contratos.length === 0 ? "No hay contratos registrados" : "No se encontraron contratos"}
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                  {contratos.length === 0 ? "Crea el primer contrato para comenzar" : "Intenta con otros términos de búsqueda o filtros"}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Paper>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
            <Typography variant="h4" color="primary">
              {contratos.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
            <Typography variant="h4" color="success.main">
              {getActiveContractsCount()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Activos
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
            <Typography variant="h4" color="text.secondary">
              {contratos.length - getActiveContractsCount()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Finalizados
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
            <Typography variant="h4" color="warning.main">
              {tenants.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Arrendatarios
            </Typography>
          </Paper>
        </Grid>
      </Grid>

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
      />

      <ExtenderContrato
        open={showExtenderModal && !!contratoToExtend}
        onClose={closeExtenderModal}
        contratoToExtend={contratoToExtend}
        nuevaFechaFin={nuevaFechaFin}
        onNuevaFechaFinChange={setNuevaFechaFin}
        onSubmit={handleExtender}
        formatDate={formatDate}
      />

      <EditarContrato
        open={showEditModal && !!contratoToEdit}
        onClose={closeEditModal}
        contratoToEdit={contratoToEdit}
        editFormData={editFormData}
        onEditFormDataChange={setEditFormData}
        isEditContractUnchanged={isEditContractUnchanged}
        onSubmit={handleEditSubmit}
      />
    </Container>
  )
}

export default Contratos
