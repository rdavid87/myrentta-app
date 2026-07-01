"use client"

import { useState, useEffect, useMemo } from "react"
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
  InputAdornment,
  Tooltip,
} from "@mui/material"
import {
  Add as AddIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material"
import api from "../services/api"

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

  return byKeyHeuristic ? byKeyHeuristic[1].trim() : null
}

const Arrendatarios = () => {
  const [arrendatarios, setArrendatarios] = useState([])
  const [contracts, setContracts] = useState([])
  const [apartamentos, setApartamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    nombre_completo: "",
    documento_identidad: "",
    telefono: "",
    email: "",
  })

  useEffect(() => {
    fetchArrendatarios()
    fetchApartamentos()
    fetchContracts()
  }, [])

  const fetchArrendatarios = async () => {
    try {
      const { data } = await api.get("/arrendatarios")
      setArrendatarios(data || [])
    } catch (error) {
      console.error("Error fetching arrendatarios:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchApartamentos = async () => {
    try {
      const { data } = await api.get("/apartamentos")
      setApartamentos(data || [])
    } catch (error) {
      console.error("Error fetching apartamentos:", error)
    }
  }

  const fetchContracts = async () => {
    try {
      const { data } = await api.get("/contratos")
      setContracts(data || [])
    } catch (error) {
      console.error("Error fetching contracts:", error)
    }
  }

  const getActiveContracts = (tenantId) =>
    contracts.filter((c) => c.arrendatario_id === tenantId && c.estado === "activo")

  const getApartmentLabel = (contract) => {
    const name =
      contract.apartamento_nombre?.trim() ||
      resolveApartamentoNombre(apartamentos.find((a) => a.id === contract.apartamento_id))
    return name || `Apto #${contract.apartamento_id}`
  }

  const renderActiveContracts = (tenantId) => {
    const activeContracts = getActiveContracts(tenantId)
    if (activeContracts.length === 0) {
      return (
        <Chip
          label="Sin contrato activo"
          size="small"
          variant="outlined"
          sx={{ color: "text.disabled" }}
        />
      )
    }
    return (
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {activeContracts.map((contract) => (
          <Chip
            key={contract.id}
            label={`🏠 ${getApartmentLabel(contract)}`}
            size="small"
            color="success"
            variant="filled"
          />
        ))}
      </Box>
    )
  }

  const tenantsWithActiveContract = useMemo(() => {
    const ids = new Set(
      contracts.filter((c) => c.estado === "activo").map((c) => c.arrendatario_id)
    )
    return ids.size
  }, [contracts])

  const filteredArrendatarios = arrendatarios.filter(arr =>
    arr.nombre_completo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    arr.documento_identidad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    arr.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    arr.telefono?.includes(searchTerm)
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/arrendatarios/${editingId}`, formData)
      } else {
        await api.post("/arrendatarios", formData)
      }

      closeModal()
      fetchArrendatarios()
      fetchContracts()
    } catch (error) {
      console.error("Error saving arrendatario:", error)
      alert("Error al guardar arrendatario: " + (error.response?.data?.error || error.message))
    }
  }

  const handleEdit = (arrendatario) => {
    setEditingId(arrendatario.id)
    setFormData({
      nombre_completo: arrendatario.nombre_completo,
      documento_identidad: arrendatario.documento_identidad,
      telefono: arrendatario.telefono,
      email: arrendatario.email,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este arrendatario?")) {
      try {
        await api.delete(`/arrendatarios/${id}`)
        fetchArrendatarios()
        fetchContracts()
      } catch (error) {
        console.error("Error deleting arrendatario:", error)
        alert("Error al eliminar: " + (error.response?.data?.error || error.message))
      }
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({
      nombre_completo: "",
      documento_identidad: "",
      telefono: "",
      email: "",
    })
  }

  const openNewModal = () => {
    setEditingId(null)
    setFormData({
      nombre_completo: "",
      documento_identidad: "",
      telefono: "",
      email: "",
    })
    setShowModal(true)
  }

  const getInitials = (name) => {
    if (!name) return "?"
    const parts = name.split(" ")
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

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
            <Typography variant="h3" component="h1" sx={{ fontWeight: "bold", mb: 1 }}>
              <BadgeIcon sx={{ mr: 1, verticalAlign: "middle", color: "secondary.main" }} />
              Arrendatarios
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestiona la información de tus inquilinos
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openNewModal}
            sx={{ px: 4, py: 1.5, borderRadius: 2 }}
          >
            Nuevo Arrendatario
          </Button>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, documento, email o teléfono..."
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
          {searchTerm && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {filteredArrendatarios.length} resultado(s) encontrado(s)
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Content */}
      <Paper elevation={0} sx={{ borderRadius: 3, overflow: "hidden" }}>
        {/* Desktop Table */}
        <Box sx={{ display: { xs: "none", lg: "block" } }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Nombre</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Documento</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Teléfono</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Contratos activos</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredArrendatarios.map((arr) => (
                  <TableRow key={arr.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ bgcolor: "secondary.main" }}>
                          {getInitials(arr.nombre_completo)}
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium">
                          {arr.nombre_completo}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={arr.documento_identidad} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <a href={`tel:${arr.telefono}`} style={{ textDecoration: "none" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "secondary.main" }}>
                          <PhoneIcon fontSize="small" />
                          {arr.telefono}
                        </Box>
                      </a>
                    </TableCell>
                    <TableCell>
                      <a href={`mailto:${arr.email}`} style={{ textDecoration: "none" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "primary.main" }}>
                          <EmailIcon fontSize="small" />
                          {arr.email}
                        </Box>
                      </a>
                    </TableCell>
                    <TableCell>
                      {renderActiveContracts(arr.id)}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(arr)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(arr.id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredArrendatarios.length === 0 && (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                🏢
              </Typography>
              <Typography color="text.secondary">
                {searchTerm ? "No se encontraron arrendatarios" : "No hay arrendatarios registrados"}
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                {searchTerm ? "Intenta con otro término de búsqueda" : "Agrega tu primer arrendatario para comenzar"}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Mobile Cards */}
        <Box sx={{ display: { xs: "block", lg: "none" }, p: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filteredArrendatarios.map((arr) => (
              <Card key={arr.id} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: "secondary.main", width: 48, height: 48 }}>
                      {getInitials(arr.nombre_completo)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="subtitle1" fontWeight="medium" noWrap>
                        {arr.nombre_completo}
                      </Typography>
                      <Box sx={{ mt: 1 }}>
                        {renderActiveContracts(arr.id)}
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          🪪 {arr.documento_identidad}
                        </Typography>
                        <a href={`tel:${arr.telefono}`} style={{ textDecoration: "none" }}>
                          <Typography variant="body2" color="secondary">
                            📞 {arr.telefono}
                          </Typography>
                        </a>
                        <a href={`mailto:${arr.email}`} style={{ textDecoration: "none" }}>
                          <Typography variant="body2" color="primary" noWrap>
                            ✉️ {arr.email}
                          </Typography>
                        </a>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(arr)}
                      fullWidth
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(arr.id)}
                      fullWidth
                    >
                      Eliminar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {filteredArrendatarios.length === 0 && (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                🏢
              </Typography>
              <Typography color="text.secondary">
                {searchTerm ? "No se encontraron arrendatarios" : "No hay arrendatarios registrados"}
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                {searchTerm ? "Intenta con otro término de búsqueda" : "Agrega tu primer arrendatario para comenzar"}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Stats Footer */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
            <Typography variant="h4" color="secondary">
              {arrendatarios.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
            <Typography variant="h4" color="success.main">
              {tenantsWithActiveContract}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Con contrato activo
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
            <Typography variant="h4" color="warning.main">
              {arrendatarios.length - tenantsWithActiveContract}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Sin contrato activo
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
            <Typography variant="h4" color="primary.main">
              {arrendatarios.filter(a => a.email).length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Con Email
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Modal */}
      <Dialog
        open={showModal}
        onClose={closeModal}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { borderRadius: 3 } } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h5" component="div" fontWeight="bold">
              {editingId ? "Editar Arrendatario" : "Nuevo Arrendatario"}
            </Typography>
            <IconButton onClick={closeModal} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Nombre Completo"
              placeholder="Ej: Juan Pérez García"
              value={formData.nombre_completo}
              onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Documento de Identidad"
              placeholder="Ej: 1234567890"
              value={formData.documento_identidad}
              onChange={(e) => setFormData({ ...formData, documento_identidad: e.target.value })}
              margin="normal"
              required
            />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  placeholder="Ej: 3001234567"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Email"
                  placeholder="correo@ejemplo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 2 }}>
            <Button onClick={closeModal} variant="outlined" sx={{ borderRadius: 2 }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" sx={{ borderRadius: 2 }}>
              {editingId ? "Actualizar" : "Guardar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  )
}

export default Arrendatarios