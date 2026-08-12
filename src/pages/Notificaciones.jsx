"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "../context/AuthContext"
import {
  Typography,
  Box,
  CircularProgress,
  Chip,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
} from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import ClearIcon from "@mui/icons-material/Clear"
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone"
import EmailIcon from "@mui/icons-material/Email"
import SmsIcon from "@mui/icons-material/Sms"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import api from "../services/api"
import {
  PageHeader,
  SearchField,
  FilterPills,
  EmptyState,
  GlassPanel,
} from "../components/ui"

const ESTADO_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "enviado", label: "Enviados" },
  { value: "error", label: "Con error" },
]

const CANAL_OPTIONS = [
  { value: "todos", label: "Todos" },
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
]

const TIPO_LABELS = {
  payment_due_soon: "Pago próximo",
  payment_overdue: "Pago vencido",
  mora_dia_1: "Mora día 1",
  mora_dia_3: "Mora día 3",
  mora_dia_4: "Mora día 4",
  mora_periodico: "Mora periódico",
  payment_received: "Pago confirmado",
  sms_payment_received: "SMS pago confirmado",
}

const Notificaciones = () => {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterEstado, setFilterEstado] = useState("todos")
  const [filterCanal, setFilterCanal] = useState("todos")

  useEffect(() => {
    fetchNotificaciones()
  }, [])

  const fetchNotificaciones = async () => {
    setLoading(true)
    try {
      const { data } = await api.get("/notificaciones/historial")
      setItems(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching notificaciones:", error)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim()
    return items.filter((n) => {
      const matchesSearch =
        !q ||
        (n.arrendatario_nombre || "").toLowerCase().includes(q) ||
        (n.apartamento_nombre || "").toLowerCase().includes(q) ||
        (n.email_destino || "").toLowerCase().includes(q) ||
        (n.tipo || "").toLowerCase().includes(q) ||
        (TIPO_LABELS[n.tipo] || "").toLowerCase().includes(q)

      const matchesEstado = filterEstado === "todos" || n.estado === filterEstado
      const matchesCanal = filterCanal === "todos" || n.canal === filterCanal

      return matchesSearch && matchesEstado && matchesCanal
    })
  }, [items, searchTerm, filterEstado, filterCanal])

  const formatDate = (fecha) => {
    if (!fecha) return "—"
    try {
      const d = new Date(fecha)
      return d.toLocaleString("es-CO", {
        dateStyle: "short",
        timeStyle: "short",
        hour12: true,
      })
    } catch {
      return fecha
    }
  }

  const estadoChip = (estado) => {
    const isOk = estado === "enviado"
    return (
      <Chip
        icon={isOk ? <CheckCircleIcon /> : <ErrorIcon />}
        label={isOk ? "Enviado" : "Error"}
        color={isOk ? "success" : "error"}
        variant="outlined"
        size="small"
        sx={{ fontWeight: 600 }}
      />
    )
  }

  const canalIcon = (canal) => {
    if (canal === "sms") return <SmsIcon fontSize="small" />
    return <EmailIcon fontSize="small" />
  }

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress size={64} sx={{ color: "primary.main" }} />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", width: "100%", minWidth: 0 }}>
      <PageHeader
        title="Notificaciones"
        subtitle="Historial de envíos"
        action={
          <Button
            variant="outlined"
            size="small"
            onClick={fetchNotificaciones}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Actualizar
          </Button>
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
              placeholder="Buscar por arrendatario, apartamento, correo o tipo…"
            />
          </Box>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="canal-filter-label">Canal</InputLabel>
            <Select
              labelId="canal-filter-label"
              label="Canal"
              value={filterCanal}
              onChange={(e) => setFilterCanal(e.target.value)}
            >
              {CANAL_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="estado-filter-label">Estado</InputLabel>
            <Select
              labelId="estado-filter-label"
              label="Estado"
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
            >
              {ESTADO_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        {(searchTerm || filterEstado !== "todos" || filterCanal !== "todos") && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
            {filtered.length} notificación(es) encontrada(s)
          </Typography>
        )}
      </PageHeader>

      {filtered.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="Sin notificaciones"
          description={
            searchTerm || filterEstado !== "todos" || filterCanal !== "todos"
              ? "No se encontraron envíos con los filtros actuales."
              : "Aún no hay envíos registrados en el sistema."
          }
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {filtered.map((n) => (
            <Paper
              key={n.id}
              elevation={0}
              sx={{
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.default",
                overflow: "hidden",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
                "&:hover": {
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
                },
              }}
            >
              <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 1,
                    flexWrap: "wrap",
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.9rem" }}>
                        {n.arrendatario_nombre || "Sin nombre"}
                      </Typography>
                      <Chip
                        icon={canalIcon(n.canal)}
                        label={n.canal?.toUpperCase()}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 700, fontSize: "0.7rem", height: 24 }}
                      />
                      {estadoChip(n.estado)}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      {n.apartamento_nombre || "Apartamento sin nombre"}
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
                      <Chip
                        label={TIPO_LABELS[n.tipo] || n.tipo || "—"}
                        size="small"
                        variant="filled"
                        sx={{ fontWeight: 500, fontSize: "0.75rem", height: 26, textTransform: "capitalize" }}
                      />
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ display: "flex", alignItems: "center", gap: 0.3 }}
                      >
                        <AccessTimeIcon sx={{ fontSize: 14 }} />
                        {formatDate(n.fecha_envio)}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: "right", minWidth: 140, flexShrink: 0 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                      Enviado a
                    </Typography>
                    <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-all" }}>
                      {n.email_destino || n.telefono_destino || "—"}
                    </Typography>
                  </Box>
                </Box>

                {n.mensaje_error && (
                  <Box
                    sx={{
                      mt: 1.5,
                      p: 1.25,
                      borderRadius: 1.5,
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(239, 68, 68, 0.08)"
                          : "rgba(239, 68, 68, 0.05)",
                      border: "1px solid",
                      borderColor: "error.light",
                    }}
                  >
                    <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
                      Error:
                    </Typography>
                    <Typography variant="caption" color="error.main" sx={{ ml: 0.5 }}>
                      {n.mensaje_error}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          ))}
        </Box>
      )}
    </Box>
  )
}

export default Notificaciones
