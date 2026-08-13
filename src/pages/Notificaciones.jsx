"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Typography,
  Box,
  CircularProgress,
  Chip,
  Avatar,
  MenuItem,
  Button,
} from "@mui/material"
import EmailIcon from "@mui/icons-material/Email"
import SmsIcon from "@mui/icons-material/Sms"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import ErrorIcon from "@mui/icons-material/Error"
import AccessTimeIcon from "@mui/icons-material/AccessTime"
import RefreshIcon from "@mui/icons-material/Refresh"
import { alpha, useTheme } from "@mui/material/styles"
import api from "../services/api"
import {
  PageHeader,
  SearchField,
  EmptyState,
  GlassPanel,
  GlassSelect,
} from "../components/ui"
import { neonBorder } from "../components/ui/glassStyles"

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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const ERROR_ENVIO = {
  sms: "SMS no enviado",
  email: "Correo no enviado",
  generico: "Envío no realizado",
}

const HINT_INVALIDO = {
  sms: "Número inválido; corrígelo.",
  email: "Email inválido; corrígelo.",
}

const HINT_VERIFICAR = "Verifica que esté bien escrito."
const HINT_CONTACTO = "Revisa los datos de contacto."

const esEmailValido = (email) => Boolean(email && EMAIL_RE.test(String(email).trim()))

const esTelefonoValido = (telefono) => {
  if (!telefono) return false
  const digits = String(telefono).replace(/\D/g, "")
  if (digits.length === 10) return true
  if (digits.length === 12 && digits.startsWith("57")) return true
  return false
}

const mensajeErrorAmigable = (n) => {
  if (n.canal === "sms") {
    const telefono = n.telefono_destino || n.email_destino
    const hint = esTelefonoValido(telefono) ? HINT_VERIFICAR : HINT_INVALIDO.sms
    return `${ERROR_ENVIO.sms}. ${hint}`
  }
  if (n.canal === "email") {
    const hint = esEmailValido(n.email_destino) ? HINT_VERIFICAR : HINT_INVALIDO.email
    return `${ERROR_ENVIO.email}. ${hint}`
  }
  return `${ERROR_ENVIO.generico}. ${HINT_CONTACTO}`
}

const getInitials = (name) => {
  if (!name) return "?"
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase()
  return name.substring(0, 2).toUpperCase()
}

const NotificationCard = ({ n, formatDate }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === "dark"
  const isOk = n.estado === "enviado"
  const destino = n.email_destino || n.telefono_destino || "—"
  const errorAccent = theme.palette.error.main
  const canalAccent = n.canal === "sms" ? theme.palette.secondary.main : theme.palette.info.main

  return (
    <GlassPanel
      sx={{
        overflow: "hidden",
        transition: "transform 0.15s ease, border-color 0.15s ease",
        "@media (hover: hover)": {
          "&:hover": {
            transform: "translateY(-1px)",
            ...neonBorder(theme, isOk ? "primary" : "error", false),
          },
        },
      }}
    >
      <Box sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "stretch", sm: "flex-start" },
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <Box sx={{ display: "flex", gap: 1.5, minWidth: 0, flex: 1 }}>
            <Avatar
              sx={{
                width: 42,
                height: 42,
                flexShrink: 0,
                fontWeight: 700,
                fontSize: "0.8rem",
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.12),
                color: "primary.main",
                border: `1px solid ${alpha(theme.palette.primary.main, 0.35)}`,
              }}
            >
              {getInitials(n.arrendatario_nombre)}
            </Avatar>

            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap", mb: 0.25 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: "0.9rem" }}>
                  {n.arrendatario_nombre || "Sin nombre"}
                </Typography>
                <Chip
                  icon={n.canal === "sms" ? <SmsIcon sx={{ fontSize: 14 }} /> : <EmailIcon sx={{ fontSize: 14 }} />}
                  label={n.canal?.toUpperCase() || "EMAIL"}
                  size="small"
                  variant="outlined"
                  sx={{
                    height: 22,
                    fontWeight: 700,
                    fontSize: "0.65rem",
                    letterSpacing: "0.04em",
                    color: canalAccent,
                    borderColor: alpha(canalAccent, 0.55),
                    bgcolor: alpha(canalAccent, isDark ? 0.12 : 0.08),
                    "& .MuiChip-icon": { color: canalAccent },
                  }}
                />
                {isOk && (
                  <Chip
                    icon={<CheckCircleIcon sx={{ fontSize: 14 }} />}
                    label="Enviado"
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 22,
                      fontWeight: 700,
                      fontSize: "0.65rem",
                      color: "success.main",
                      borderColor: alpha(theme.palette.success.main, 0.55),
                      bgcolor: alpha(theme.palette.success.main, isDark ? 0.12 : 0.08),
                      "& .MuiChip-icon": { color: "inherit" },
                    }}
                  />
                )}
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }} noWrap>
                {n.apartamento_nombre || "Apartamento sin nombre"}
              </Typography>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25, alignItems: "center" }}>
                <Chip
                  label={TIPO_LABELS[n.tipo] || n.tipo || "—"}
                  size="small"
                  variant="filled"
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.72rem",
                    height: 24,
                    textTransform: "capitalize",
                    bgcolor: alpha(theme.palette.text.primary, isDark ? 0.08 : 0.06),
                  }}
                />
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ display: "flex", alignItems: "center", gap: 0.4 }}
                >
                  <AccessTimeIcon sx={{ fontSize: 14 }} />
                  {formatDate(n.fecha_envio)}
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              textAlign: { xs: "left", sm: "right" },
              pl: { xs: 7, sm: 0 },
              minWidth: 0,
              maxWidth: { sm: 240 },
              flex: { sm: "0 1 240px" },
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", mb: 0.35, letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 700 }}
            >
              Enviado a
            </Typography>
            <Typography variant="body2" fontWeight={600} sx={{ wordBreak: "break-all" }}>
              {destino}
            </Typography>
          </Box>
        </Box>

        {n.mensaje_error && (
          <Box
            sx={{
              mt: 1.5,
              px: 1.25,
              py: 1,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "flex-start",
              gap: 1,
              bgcolor: alpha(errorAccent, isDark ? 0.1 : 0.06),
              border: `1px solid ${alpha(errorAccent, isDark ? 0.45 : 0.35)}`,
            }}
          >
            <Box
              sx={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: alpha(errorAccent, 0.2),
                color: "error.main",
                mt: 0.1,
              }}
            >
              <ErrorIcon sx={{ fontSize: 14 }} />
            </Box>
            <Typography
              variant="caption"
              color="error.main"
              sx={{ fontWeight: 600, display: "block", lineHeight: 1.45, pt: 0.15 }}
            >
              {mensajeErrorAmigable(n)}
            </Typography>
          </Box>
        )}
      </Box>
    </GlassPanel>
  )
}

const Notificaciones = () => {
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
        (n.telefono_destino || "").includes(q) ||
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress size={64} sx={{ color: "primary.main" }} />
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1100, mx: "auto", width: "100%", minWidth: 0, overflow: "hidden" }}>
      <PageHeader
        title="Notificaciones"
        subtitle="Historial de envíos"
        action={
          <Button
            variant="outlined"
            size="small"
            onClick={fetchNotificaciones}
            startIcon={<RefreshIcon />}
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Actualizar
          </Button>
        }
      >
        <Box
          sx={{
            display: "grid",
            width: "100%",
            minWidth: 0,
            gap: 1.5,
            gridTemplateColumns: {
              xs: "minmax(0, 1fr) minmax(0, 1fr)",
              sm: "minmax(0, 1fr) minmax(0, 160px) minmax(0, 160px)",
            },
            gridTemplateAreas: {
              xs: `"search search" "canal estado"`,
              sm: `"search canal estado"`,
            },
          }}
        >
          <Box sx={{ gridArea: "search", minWidth: 0 }}>
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar por arrendatario, apartamento, correo o tipo…"
            />
          </Box>
          <GlassSelect
            label="Canal"
            value={filterCanal}
            onChange={(e) => setFilterCanal(e.target.value)}
            sx={{ gridArea: "canal", minWidth: 0, width: "100%" }}
          >
            {CANAL_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </GlassSelect>
          <GlassSelect
            label="Estado"
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            sx={{ gridArea: "estado", minWidth: 0, width: "100%" }}
          >
            {ESTADO_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </GlassSelect>
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
            <NotificationCard key={n.id} n={n} formatDate={formatDate} />
          ))}
        </Box>
      )}
    </Box>
  )
}

export default Notificaciones
