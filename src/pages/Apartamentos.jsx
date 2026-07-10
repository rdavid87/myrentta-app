"use client"

import { useState, useEffect } from "react"
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
  LocationOn as LocationOnIcon,
  Apartment as ApartmentIcon,
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

  return byKeyHeuristic ? byKeyHeuristic[1].trim() : ""
}

const normalizeApartamento = (apt = {}) => {
  const nombreNormalizado = resolveApartamentoNombre(apt)

  return {
    ...apt,
    nombre: nombreNormalizado,
  }
}

const Apartamentos = () => {
  const [apartamentos, setApartamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    ciudad: "",
    valor_arriendo: "",
  })

  useEffect(() => {
    fetchApartamentos()
  }, [])

  const fetchApartamentos = async () => {
    try {
      const { data } = await api.get("/apartamentos")
      setApartamentos((data || []).map(normalizeApartamento))
    } catch (error) {
      console.error("Error fetching apartamentos:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredApartamentos = apartamentos.filter(apt =>
    apt.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.ciudad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    apt.direccion?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = {
        ...formData,
        valor_arriendo: parseFloat(formData.valor_arriendo.toString().replace(/\./g, "").replace(",", "."))
      }

      if (editingId) {
        await api.put(`/apartamentos/${editingId}`, dataToSend)
      } else {
        await api.post("/apartamentos", dataToSend)
      }

      closeModal()
      fetchApartamentos()
    } catch (error) {
      console.error("Error saving apartamento:", error)
      alert("Error al guardar apartamento: " + (error.response?.data?.error || error.message))
    }
  }

  const handleEdit = (apartamento) => {
    setEditingId(apartamento.id)
    setFormData({
      nombre: apartamento.nombre,
      direccion: apartamento.direccion,
      ciudad: apartamento.ciudad,
      valor_arriendo: apartamento.valor_arriendo.toString(),
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({ nombre: "", direccion: "", ciudad: "", valor_arriendo: "" })
  }

  const openNewModal = () => {
    setEditingId(null)
    setFormData({ nombre: "", direccion: "", ciudad: "", valor_arriendo: "" })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "¿Eliminar apartamento?\nTambién se eliminarán los contratos o pagos que tenga vinculados."
      )
    ) {
      try {
        await api.delete(`/apartamentos/${id}`)
        fetchApartamentos()
      } catch (error) {
        console.error("Error deleting apartamento:", error)
        alert("Error al eliminar: " + (error.response?.data?.error || error.message))
      }
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getEstadoBadge = (estado) => {
    return estado === "disponible"
      ? { color: "success", variant: "filled" }
      : { color: "warning", variant: "filled" }
  }

  const getEstadoLabel = (estado) => {
    return estado === "disponible" ? "Disponible" : "Arrendado"
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
        <CircularProgress size={64} sx={{ color: "primary.main" }} />
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
              <ApartmentIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Apartamentos
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gestiona tus propiedades de arriendo
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openNewModal}
            sx={{ px: 4, py: 1.5, borderRadius: 2 }}
          >
            Nuevo Apartamento
          </Button>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mt: 3 }}>
          <TextField
            fullWidth
            placeholder="Buscar por nombre, ciudad o dirección..."
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
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                bgcolor: "background.default",
              },
            }}
          />
          {searchTerm && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {filteredApartamentos.length} resultado(s) encontrado(s)
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
                  <TableCell sx={{ fontWeight: 600 }}>Dirección</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Ciudad</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Valor Arriendo</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Estado</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredApartamentos.map((apt) => (
                  <TableRow key={apt.id} hover>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Avatar sx={{ bgcolor: "primary.main" }}>
                          {apt.nombre?.charAt(0)?.toUpperCase() || "A"}
                        </Avatar>
                        <Typography variant="body2" fontWeight="medium">
                          {apt.nombre}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{apt.direccion}</TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <LocationOnIcon fontSize="small" color="disabled" />
                        {apt.ciudad}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography color="primary" fontWeight="medium">
                        {formatCurrency(apt.valor_arriendo)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getEstadoLabel(apt.estado)}
                        {...getEstadoBadge(apt.estado)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(apt)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(apt.id)}
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

          {filteredApartamentos.length === 0 && (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                🏢
              </Typography>
              <Typography color="text.secondary">
                {searchTerm ? "No se encontraron apartamentos" : "No hay apartamentos registrados"}
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                {searchTerm ? "Intenta con otro término de búsqueda" : "Agrega tu primer apartamento para comenzar"}
              </Typography>
            </Box>
          )}
        </Box>

        {/* Mobile Cards */}
        <Box sx={{ display: { xs: "block", lg: "none" }, p: 2 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {filteredApartamentos.map((apt) => (
              <Card key={apt.id} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", width: 48, height: 48 }}>
                      {apt.nombre?.charAt(0)?.toUpperCase() || "A"}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                        <Typography variant="subtitle1" fontWeight="medium" noWrap>
                          {apt.nombre}
                        </Typography>
                        <Chip
                          label={getEstadoLabel(apt.estado)}
                          size="small"
                          {...getEstadoBadge(apt.estado)}
                        />
                      </Box>
                      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {apt.direccion}
                        </Typography>
                        <Typography variant="body2" color="primary">
                          {apt.ciudad}
                        </Typography>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          {formatCurrency(apt.valor_arriendo)}/mes
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleEdit(apt)}
                      fullWidth
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleDelete(apt.id)}
                      fullWidth
                    >
                      Eliminar
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>

          {filteredApartamentos.length === 0 && (
            <Box sx={{ py: 8, textAlign: "center" }}>
              <Typography variant="h4" sx={{ mb: 2 }}>
                🏢
              </Typography>
              <Typography color="text.secondary">
                {searchTerm ? "No se encontraron apartamentos" : "No hay apartamentos registrados"}
              </Typography>
              <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                {searchTerm ? "Intenta con otro término de búsqueda" : "Agrega tu primer apartamento para comenzar"}
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>

      {/* Stats Footer */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid size={{ xs: 4 }}>
          <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
            <Typography variant="h4" color="primary">
              {apartamentos.length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
            <Typography variant="h4" color="success.main">
              {apartamentos.filter(a => a.estado === "disponible").length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Disponibles
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 4 }}>
          <Paper sx={{ p: 2, textAlign: "center", borderRadius: 2 }}>
            <Typography variant="h4" color="warning.main">
              {apartamentos.filter(a => a.estado !== "disponible").length}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Arrendados
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
              {editingId ? "Editar Apartamento" : "Nuevo Apartamento"}
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
              label="Nombre del Apartamento"
              placeholder="Ej: Apartamento 101"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Dirección"
              placeholder="Ej: Calle 123 # 45-67"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              margin="normal"
              required
            />
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Ciudad"
                  placeholder="Ej: Bogotá"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Valor Arriendo"
                  placeholder="Ej: 500000 o 500.000"
                  value={formData.valor_arriendo}
                  onChange={(e) => setFormData({ ...formData, valor_arriendo: e.target.value })}
                  required
                />
                <Typography variant="caption" color="text.disabled" sx={{ mt: 0.5, display: "block" }}>
                  Puedes escribir con o sin puntos. Ej: 400000 o 400.000
                </Typography>
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

export default Apartamentos