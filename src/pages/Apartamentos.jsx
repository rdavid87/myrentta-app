"use client"

import { useState, useEffect, useMemo } from "react"
import { Typography, Button, Box, CircularProgress, Grid } from "@mui/material"
import {
  Add as AddIcon,
  Apartment as ApartmentIcon,
  CheckCircle as CheckCircleIcon,
  VpnKey as VpnKeyIcon,
  People as PeopleIcon,
  AttachMoney as AttachMoneyIcon,
} from "@mui/icons-material"
import api from "../services/api"
import ApartmentCard from "../components/apartamentos/ApartmentCard"
import {
  FinanceStatCard,
  PageHeader,
  SearchField,
  FilterPills,
  GlowButton,
  EmptyState,
  ListFooter,
  GlassDialog,
  GlassTextField,
  FormSection,
} from "../components/ui"
import { ghostButtonSx } from "../components/ui/glassStyles"
import { useTheme } from "@mui/material/styles"

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

const normalizeApartamento = (apt = {}) => ({
  ...apt,
  nombre: resolveApartamentoNombre(apt),
})

const Apartamentos = () => {
  const theme = useTheme()
  const [apartamentos, setApartamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    ciudad: "",
    description: "",
    valor_arriendo: "",
  })

  const filterOptions = [
    { value: "todos", label: "Todos" },
    { value: "disponible", label: "Disponible" },
    { value: "arrendado", label: "Arrendado" },
  ]

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

  const stats = useMemo(() => {
    const total = apartamentos.length
    const disponibles = apartamentos.filter((a) => a.estado === "disponible").length
    const arrendados = total - disponibles
    const ocupacion = total > 0 ? Math.round((arrendados / total) * 100) : 0
    const ingresosMensuales = apartamentos
      .filter((a) => a.estado !== "disponible")
      .reduce((sum, a) => sum + (Number(a.valor_arriendo) || 0), 0)

    const pct = (n) => (total > 0 ? `${Math.round((n / total) * 100)}%` : "0%")

    return {
      total,
      disponibles,
      arrendados,
      ocupacion,
      ingresosMensuales,
      trends: {
        total: `${pct(total)} del portafolio`,
        disponibles: `${pct(disponibles)} disponibles`,
        arrendados: `${pct(arrendados)} ocupados`,
        ocupacion: `${arrendados} de ${total} ocupados`,
        ingresos: "Renta total esperada",
      },
    }
  }, [apartamentos])

  const filteredApartamentos = useMemo(() => {
    return apartamentos.filter((apt) => {
      const q = searchTerm.toLowerCase()
      const matchesSearch =
        apt.nombre?.toLowerCase().includes(q) ||
        apt.ciudad?.toLowerCase().includes(q) ||
        apt.direccion?.toLowerCase().includes(q) ||
        apt.description?.toLowerCase().includes(q)

      const matchesEstado =
        filterEstado === "todos" ||
        (filterEstado === "disponible" && apt.estado === "disponible") ||
        (filterEstado === "arrendado" && apt.estado !== "disponible")

      return matchesSearch && matchesEstado
    })
  }, [apartamentos, searchTerm, filterEstado])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const dataToSend = {
        ...formData,
        valor_arriendo: parseFloat(formData.valor_arriendo.toString().replace(/\./g, "").replace(",", ".")),
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
      description: apartamento.description ?? "",
      valor_arriendo: apartamento.valor_arriendo.toString(),
    })
    setShowModal(true)
  }

  const emptyForm = () => ({
    nombre: "",
    direccion: "",
    ciudad: "",
    description: "",
    valor_arriendo: "",
  })

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData(emptyForm())
  }

  const openNewModal = () => {
    setEditingId(null)
    setFormData(emptyForm())
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

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount)

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress size={64} sx={{ color: "primary.main" }} />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", width: "100%", minWidth: 0 }}>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, sm: 4, lg: 2.4 }}>
          <FinanceStatCard
            value={stats.total}
            label="Total apartamentos"
            icon={<ApartmentIcon />}
            color="primary"
            trend={stats.trends.total}
            sparkId="apt-total"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, lg: 2.4 }}>
          <FinanceStatCard
            value={stats.disponibles}
            label="Disponibles"
            icon={<CheckCircleIcon />}
            color="success"
            trend={stats.trends.disponibles}
            sparkId="apt-disp"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, lg: 2.4 }}>
          <FinanceStatCard
            value={stats.arrendados}
            label="Arrendados"
            icon={<VpnKeyIcon />}
            color="warning"
            trend={stats.trends.arrendados}
            sparkId="apt-arr"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 4, lg: 2.4 }}>
          <FinanceStatCard
            value={`${stats.ocupacion}%`}
            label="Ocupación"
            icon={<PeopleIcon />}
            color="info"
            trend={stats.trends.ocupacion}
            sparkId="apt-ocup"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 8, lg: 2.4 }}>
          <FinanceStatCard
            value={formatCurrency(stats.ingresosMensuales)}
            label="Ingresos mensuales"
            icon={<AttachMoneyIcon />}
            color="warning"
            trend={stats.trends.ingresos}
            sparkId="apt-ing"
          />
        </Grid>
      </Grid>

      <PageHeader
        title="Apartamentos"
        subtitle="Módulo de propiedades"
        action={
          <GlowButton startIcon={<AddIcon />} onClick={openNewModal}>
            Nuevo Apartamento
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
              placeholder="Buscar apartamento, dirección, ciudad o descripción…"
            />
          </Box>
          <FilterPills options={filterOptions} value={filterEstado} onChange={setFilterEstado} />
        </Box>
        {(searchTerm || filterEstado !== "todos") && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            {filteredApartamentos.length} apartamento(s) encontrado(s)
          </Typography>
        )}
      </PageHeader>

      {filteredApartamentos.length === 0 ? (
        <EmptyState
          icon="🏢"
          title={apartamentos.length === 0 ? "No hay apartamentos registrados" : "No se encontraron apartamentos"}
          description={
            apartamentos.length === 0
              ? "Agrega tu primer apartamento para comenzar"
              : "Intenta con otro término de búsqueda o filtro"
          }
          action={
            apartamentos.length === 0 ? (
              <GlowButton startIcon={<AddIcon />} onClick={openNewModal}>
                Nuevo Apartamento
              </GlowButton>
            ) : undefined
          }
        />
      ) : (
        <>
          <Grid container spacing={2}>
            {filteredApartamentos.map((apt) => (
              <Grid key={apt.id} size={{ xs: 12, md: 6 }}>
                <ApartmentCard
                  apartamento={apt}
                  formatCurrency={formatCurrency}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </Grid>
            ))}
          </Grid>
          <ListFooter from={1} to={filteredApartamentos.length} total={filteredApartamentos.length} />
        </>
      )}

      <GlassDialog
        open={showModal}
        onClose={closeModal}
        title={editingId ? "Editar Apartamento" : "Nuevo Apartamento"}
        subtitle="Completa los datos de la propiedad"
        icon={<ApartmentIcon />}
        actions={
          <>
            <Button onClick={closeModal} sx={ghostButtonSx(theme)}>
              Cancelar
            </Button>
            <GlowButton type="submit" form="apartamento-form" color="primary">
              {editingId ? "Actualizar" : "Guardar"}
            </GlowButton>
          </>
        }
      >
        <Box
          component="form"
          id="apartamento-form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <FormSection title="Información general">
            <GlassTextField
              label="Nombre del apartamento"
              placeholder="Ej: Apartamento 101"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              required
            />
            <GlassTextField
              label="Dirección"
              placeholder="Ej: Calle 123 # 45-67"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              required
            />
            <GlassTextField
              label="Descripción"
              placeholder="Ej: Amplio, cerca al metro, 2 habitaciones…"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              slotProps={{ htmlInput: { maxLength: 200 } }}
              helperText={`${formData.description.length}/200`}
            />
          </FormSection>

          <FormSection title="Ubicación y canon">
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <GlassTextField
                label="Ciudad"
                placeholder="Ej: Bogotá"
                value={formData.ciudad}
                onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                required
              />
              <GlassTextField
                label="Valor arriendo"
                placeholder="Ej: 500.000"
                value={formData.valor_arriendo}
                onChange={(e) => setFormData({ ...formData, valor_arriendo: e.target.value })}
                required
              />
            </Box>
            <Typography variant="caption" color="text.secondary">
              Puedes escribir el valor con o sin puntos. Ej: 400000 o 400.000
            </Typography>
          </FormSection>
        </Box>
      </GlassDialog>
    </Box>
  )
}

export default Apartamentos
