"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { Typography, Button, Box, CircularProgress, Grid } from "@mui/material"
import {
  Add as AddIcon,
  People as PeopleIcon,
  VpnKey as VpnKeyIcon,
  CheckCircle as CheckCircleIcon,
  WarningAmber as WarningAmberIcon,
  Badge as BadgeIcon,
} from "@mui/icons-material"
import api from "../services/api"
import TenantListItem from "../components/arrendatarios/TenantListItem"
import TenantDetailPanel from "../components/arrendatarios/TenantDetailPanel"
import {
  FinanceStatCard,
  PageHeader,
  SearchField,
  FilterPills,
  GlowButton,
  EmptyState,
  GlassPanel,
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
  return byKeyHeuristic ? byKeyHeuristic[1].trim() : null
}

const getTenantStatus = (tenantId, contracts, pagos) => {
  const activeContracts = contracts.filter((c) => c.arrendatario_id === tenantId && c.estado === "activo")
  if (activeContracts.length === 0) return "sin_contrato"

  const activeIds = new Set(activeContracts.map((c) => c.id))
  const hasMora = pagos.some((p) => activeIds.has(p.contrato_id) && p.estado === "en_mora")
  return hasMora ? "en_mora" : "activo"
}

const Arrendatarios = () => {
  const theme = useTheme()
  const [arrendatarios, setArrendatarios] = useState([])
  const [contracts, setContracts] = useState([])
  const [pagos, setPagos] = useState([])
  const [apartamentos, setApartamentos] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [selectedId, setSelectedId] = useState(null)
  const [formData, setFormData] = useState({
    nombre_completo: "",
    documento_identidad: "",
    telefono: "",
    email: "",
  })

  const filterOptions = [
    { value: "todos", label: "Todos" },
    { value: "activo", label: "Activo" },
    { value: "en_mora", label: "En mora" },
    { value: "sin_contrato", label: "Sin contrato" },
  ]

  const fetchData = useCallback(async () => {
    try {
      const [arrRes, contRes, pagRes, aptRes] = await Promise.all([
        api.get("/arrendatarios"),
        api.get("/contratos"),
        api.get("/pagos"),
        api.get("/apartamentos"),
      ])
      setArrendatarios(arrRes.data || [])
      setContracts(contRes.data || [])
      setPagos(pagRes.data || [])
      setApartamentos(aptRes.data || [])
    } catch (error) {
      console.error("Error fetching arrendatarios data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getActiveContracts = useCallback(
    (tenantId) => contracts.filter((c) => c.arrendatario_id === tenantId && c.estado === "activo"),
    [contracts]
  )

  const getApartmentLabel = useCallback(
    (contract) => {
      const name =
        contract.apartamento_nombre?.trim() ||
        resolveApartamentoNombre(apartamentos.find((a) => a.id === contract.apartamento_id))
      return name || `Apto #${contract.apartamento_id}`
    },
    [apartamentos]
  )

  const tenantStatusMap = useMemo(() => {
    const map = new Map()
    arrendatarios.forEach((t) => {
      map.set(t.id, getTenantStatus(t.id, contracts, pagos))
    })
    return map
  }, [arrendatarios, contracts, pagos])

  const stats = useMemo(() => {
    const total = arrendatarios.length
    const contratosActivos = contracts.filter((c) => c.estado === "activo").length
    let enMora = 0
    let alDia = 0

    arrendatarios.forEach((t) => {
      const status = tenantStatusMap.get(t.id)
      if (status === "en_mora") enMora += 1
      if (status === "activo") alDia += 1
    })

    const pct = (n) => (total > 0 ? `${Math.round((n / total) * 100)}%` : "0%")

    return {
      total,
      contratosActivos,
      alDia,
      enMora,
      trends: {
        total: `${alDia} activos`,
        contratos: `${contratosActivos} vigentes`,
        alDia: `${pct(alDia)} al día`,
        mora: `${pct(enMora)} del total`,
      },
    }
  }, [arrendatarios, contracts, tenantStatusMap])

  const filteredArrendatarios = useMemo(() => {
    return arrendatarios.filter((arr) => {
      const q = searchTerm.toLowerCase()
      const matchesSearch =
        arr.nombre_completo?.toLowerCase().includes(q) ||
        arr.documento_identidad?.toLowerCase().includes(q) ||
        arr.email?.toLowerCase().includes(q) ||
        arr.telefono?.includes(searchTerm)

      const status = tenantStatusMap.get(arr.id)
      const matchesEstado = filterEstado === "todos" || status === filterEstado

      return matchesSearch && matchesEstado
    })
  }, [arrendatarios, searchTerm, filterEstado, tenantStatusMap])

  const selectedTenant = useMemo(
    () => filteredArrendatarios.find((t) => t.id === selectedId) ?? filteredArrendatarios[0] ?? null,
    [filteredArrendatarios, selectedId]
  )

  const selectedStatus = selectedTenant ? tenantStatusMap.get(selectedTenant.id) : null

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api.put(`/arrendatarios/${editingId}`, formData)
      } else {
        await api.post("/arrendatarios", formData)
      }
      closeModal()
      fetchData()
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
        if (selectedId === id) setSelectedId(null)
        fetchData()
      } catch (error) {
        console.error("Error deleting arrendatario:", error)
        alert("Error al eliminar: " + (error.response?.data?.error || error.message))
      }
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingId(null)
    setFormData({ nombre_completo: "", documento_identidad: "", telefono: "", email: "" })
  }

  const openNewModal = () => {
    setEditingId(null)
    setFormData({ nombre_completo: "", documento_identidad: "", telefono: "", email: "" })
    setShowModal(true)
  }

  const getInitials = (name) => {
    if (!name) return "?"
    const parts = name.split(" ")
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
    return name.substring(0, 2).toUpperCase()
  }

  const formatDate = (dateString) => {
    if (!dateString) return "—"
    const d = new Date(dateString)
    if (Number.isNaN(d.getTime())) return dateString
    return d.toLocaleDateString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric" })
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
        <Grid size={{ xs: 6, sm: 3 }}>
          <FinanceStatCard
            value={stats.total}
            label="Total arrendatarios"
            icon={<PeopleIcon />}
            color="primary"
            trend={stats.trends.total}
            sparkId="arr-total"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <FinanceStatCard
            value={stats.contratosActivos}
            label="Contratos activos"
            icon={<VpnKeyIcon />}
            color="success"
            trend={stats.trends.contratos}
            sparkId="arr-contratos"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <FinanceStatCard
            value={stats.alDia}
            label="Pagos al día"
            icon={<CheckCircleIcon />}
            color="success"
            trend={stats.trends.alDia}
            sparkId="arr-al-dia"
          />
        </Grid>
        <Grid size={{ xs: 6, sm: 3 }}>
          <FinanceStatCard
            value={stats.enMora}
            label="En mora"
            icon={<WarningAmberIcon />}
            color="error"
            trend={stats.trends.mora}
            sparkId="arr-mora"
          />
        </Grid>
      </Grid>

      <PageHeader
        title="Arrendatarios"
        subtitle="Gestiona la información de tus inquilinos"
        action={
          <GlowButton startIcon={<AddIcon />} onClick={openNewModal}>
            Nuevo Arrendatario
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
              placeholder="Buscar por nombre, documento, email o teléfono…"
            />
          </Box>
          <FilterPills options={filterOptions} value={filterEstado} onChange={setFilterEstado} />
        </Box>
        {(searchTerm || filterEstado !== "todos") && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            {filteredArrendatarios.length} arrendatario(s) encontrado(s)
          </Typography>
        )}
      </PageHeader>

      {filteredArrendatarios.length === 0 ? (
        <EmptyState
          icon="👤"
          title={arrendatarios.length === 0 ? "No hay arrendatarios registrados" : "No se encontraron arrendatarios"}
          description={
            arrendatarios.length === 0
              ? "Agrega tu primer arrendatario para comenzar"
              : "Intenta con otro término de búsqueda o filtro"
          }
          action={
            arrendatarios.length === 0 ? (
              <GlowButton startIcon={<AddIcon />} onClick={openNewModal}>
                Nuevo Arrendatario
              </GlowButton>
            ) : undefined
          }
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", lg: "row" },
            gap: 2,
            alignItems: "stretch",
            minHeight: { xs: "auto", lg: 420 },
            minWidth: 0,
            width: "100%",
          }}
        >
          <GlassPanel
            sx={{
              width: { xs: "100%", lg: 360 },
              flexShrink: 0,
              p: 1.5,
              maxHeight: { xs: 280, lg: "calc(100vh - 280px)" },
              overflowY: "auto",
              minWidth: 0,
            }}
          >
            {filteredArrendatarios.map((arr) => (
              <TenantListItem
                key={arr.id}
                tenant={arr}
                selected={selectedTenant?.id === arr.id}
                status={tenantStatusMap.get(arr.id)}
                onSelect={(t) => setSelectedId(t.id)}
                getInitials={getInitials}
              />
            ))}
          </GlassPanel>

          <TenantDetailPanel
            tenant={selectedTenant}
            status={selectedStatus}
            activeContracts={selectedTenant ? getActiveContracts(selectedTenant.id) : []}
            getApartmentLabel={getApartmentLabel}
            formatCurrency={formatCurrency}
            formatDate={formatDate}
            getInitials={getInitials}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </Box>
      )}

      <GlassDialog
        open={showModal}
        onClose={closeModal}
        title={editingId ? "Editar Arrendatario" : "Nuevo Arrendatario"}
        subtitle="Datos de contacto e identificación"
        icon={<BadgeIcon />}
        actions={
          <>
            <Button onClick={closeModal} sx={ghostButtonSx(theme)}>
              Cancelar
            </Button>
            <GlowButton type="submit" form="arrendatario-form" color="primary">
              {editingId ? "Actualizar" : "Guardar"}
            </GlowButton>
          </>
        }
      >
        <Box
          component="form"
          id="arrendatario-form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          <FormSection title="Identificación">
            <GlassTextField
              label="Nombre completo"
              placeholder="Ej: Juan Pérez García"
              value={formData.nombre_completo}
              onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
              required
            />
            <GlassTextField
              label="Documento de identidad"
              placeholder="Ej: 1234567890"
              value={formData.documento_identidad}
              onChange={(e) => setFormData({ ...formData, documento_identidad: e.target.value })}
              required
            />
          </FormSection>

          <FormSection title="Contacto">
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <GlassTextField
                label="Teléfono"
                placeholder="Ej: 3001234567"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                required
              />
              <GlassTextField
                label="Email"
                placeholder="correo@ejemplo.com"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Box>
          </FormSection>
        </Box>
      </GlassDialog>
    </Box>
  )
}

export default Arrendatarios
