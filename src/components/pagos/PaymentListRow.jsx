import { Box, Typography, Avatar, IconButton, Tooltip, Button } from "@mui/material"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"
import CheckCircleIcon from "@mui/icons-material/CheckCircle"
import PaymentsIcon from "@mui/icons-material/Payments"
import AccountBalanceIcon from "@mui/icons-material/AccountBalance"
import DescriptionIcon from "@mui/icons-material/Description"
import HelpIcon from "@mui/icons-material/Help"
import ScheduleIcon from "@mui/icons-material/Schedule"
import WarningAmberIcon from "@mui/icons-material/WarningAmber"
import { alpha, useTheme } from "@mui/material/styles"
import { ghostButtonSx, neonBorder } from "../ui/glassStyles"

/** Timeline spacer + 6 content columns — shared with header */
export const PAYMENT_GRID =
  "20px minmax(170px,1.4fr) minmax(150px,1.1fr) minmax(110px,0.8fr) minmax(120px,0.9fr) 112px 188px"

export const PAYMENT_LIST_COLUMNS = [
  { key: "spacer", label: "", width: "20px" },
  { key: "arrendatario", label: "Arrendatario", width: "minmax(170px,1.4fr)" },
  { key: "periodo", label: "Periodo", width: "minmax(150px,1.1fr)" },
  { key: "monto", label: "Monto", width: "minmax(110px,0.8fr)" },
  { key: "metodo", label: "Método", width: "minmax(120px,0.9fr)" },
  { key: "estado", label: "Estado", width: "112px" },
  { key: "acciones", label: "Acciones", width: "188px" },
]

const estadoAccent = (estado, theme) => {
  switch (estado) {
    case "pagado":
      return theme.palette.success.main
    case "en_mora":
      return theme.palette.error.main
    default:
      return theme.palette.warning.main
  }
}

const metodoIcon = (metodo) => {
  switch (metodo) {
    case "transferencia":
      return <AccountBalanceIcon sx={{ fontSize: 16 }} />
    case "cheque":
      return <DescriptionIcon sx={{ fontSize: 16 }} />
    case "efectivo":
      return <PaymentsIcon sx={{ fontSize: 16 }} />
    default:
      return <HelpIcon sx={{ fontSize: 16 }} />
  }
}

const PaymentStatusBadge = ({ status }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === "dark"
  const config = {
    pagado: { label: "Pagado", color: theme.palette.success.main, icon: <CheckCircleIcon sx={{ fontSize: 13 }} /> },
    en_mora: { label: "En mora", color: theme.palette.error.main, icon: <WarningAmberIcon sx={{ fontSize: 13 }} /> },
    pendiente: { label: "Pendiente", color: theme.palette.warning.main, icon: <ScheduleIcon sx={{ fontSize: 13 }} /> },
  }[status] ?? { label: status, color: theme.palette.text.disabled, icon: null }

  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 0.6,
        width: "100%",
        maxWidth: 112,
        minHeight: 28,
        px: 1,
        borderRadius: "6px",
        bgcolor: isDark ? alpha("#0a1210", 0.85) : alpha(config.color, 0.06),
        border: `1px solid ${alpha(config.color, isDark ? 0.55 : 0.45)}`,
        boxShadow: isDark ? `0 0 10px ${alpha(config.color, 0.18)}` : "none",
        color: config.color,
      }}
    >
      {config.icon}
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          letterSpacing: "0.03em",
          textTransform: "uppercase",
          fontSize: "0.65rem",
          lineHeight: 1,
          whiteSpace: "nowrap",
        }}
      >
        {config.label}
      </Typography>
    </Box>
  )
}

const MobileLabel = ({ children }) => (
  <Typography
    variant="caption"
    sx={{
      display: { xs: "block", lg: "none" },
      fontWeight: 700,
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      color: "text.secondary",
      fontSize: "0.65rem",
      mb: 0.5,
    }}
  >
    {children}
  </Typography>
)

const PaymentListRow = ({
  pago,
  periodLabel,
  formatCurrency,
  formatDate,
  formatMetodoLabel,
  onEdit,
  onConfirm,
  onDelete,
  onPdf,
  pdfLoading,
  isLast = false,
}) => {
  const theme = useTheme()
  const accent = estadoAccent(pago.estado, theme)
  const isPagado = pago.estado === "pagado"
  const isPending = pago.estado === "pendiente" || pago.estado === "en_mora"
  const initials =
    pago.arrendatario_nombre
      ?.trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "P"

  const actionBtnSx = {
    ...ghostButtonSx(theme),
    width: 108,
    minWidth: 108,
    maxWidth: 108,
    height: 32,
    py: 0,
    px: 1,
    fontSize: "0.75rem",
    fontWeight: 600,
    "& .MuiButton-startIcon": { mr: 0.5, ml: 0 },
  }

  const iconBtnSx = { width: 32, height: 32, flexShrink: 0 }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: PAYMENT_GRID },
        gap: { xs: 1.5, lg: 2 },
        alignItems: "center",
        p: { xs: 1.75, lg: 1.75 },
        mb: 1.25,
        borderRadius: "12px",
        bgcolor: alpha(theme.palette.background.default, theme.palette.mode === "dark" ? 0.42 : 0.55),
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        transition: "all 0.2s ease",
        "@media (hover: hover)": {
          "&:hover": {
            ...neonBorder(theme, "primary", true),
            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.05 : 0.03),
          },
        },
      }}
    >
      {/* Timeline */}
      <Box
        sx={{
          display: { xs: "none", lg: "flex" },
          flexDirection: "column",
          alignItems: "center",
          alignSelf: "stretch",
          justifyContent: "flex-start",
          pt: 1.5,
          position: "relative",
        }}
      >
        <Box
          sx={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            bgcolor: accent,
            boxShadow: `0 0 10px ${alpha(accent, 0.75)}`,
            zIndex: 1,
          }}
        />
        {!isLast && (
          <Box
            sx={{
              position: "absolute",
              top: 28,
              bottom: -28,
              width: 2,
              bgcolor: alpha(accent, 0.25),
              borderRadius: 1,
            }}
          />
        )}
      </Box>

      {/* Arrendatario */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            fontWeight: 700,
            fontSize: "0.8rem",
            flexShrink: 0,
            bgcolor: alpha(accent, 0.14),
            color: accent,
            border: `2px solid ${alpha(accent, 0.45)}`,
          }}
        >
          {initials}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} noWrap>
            {pago.arrendatario_nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {pago.apartamento_nombre}
          </Typography>
        </Box>
      </Box>

      {/* Periodo */}
      <Box>
        <MobileLabel>Periodo</MobileLabel>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            px: 1.25,
            py: 0.85,
            minHeight: 40,
            borderRadius: "8px",
            bgcolor: alpha(accent, 0.06),
            border: `1px solid ${alpha(accent, 0.35)}`,
          }}
        >
          <CalendarMonthIcon sx={{ fontSize: 16, color: accent, flexShrink: 0 }} />
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "text.primary", lineHeight: 1.3, whiteSpace: { lg: "nowrap" } }}
          >
            {periodLabel}
          </Typography>
        </Box>
      </Box>

      {/* Monto */}
      <Box>
        <MobileLabel>Monto</MobileLabel>
        <Typography
          fontWeight={800}
          sx={{ color: "warning.main", lineHeight: 1.2, fontSize: "1.05rem", whiteSpace: "nowrap" }}
        >
          {formatCurrency(pago.valor)}
        </Typography>
        {isPagado && pago.fecha_pago && (
          <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.25 }}>
            {formatDate(pago.fecha_pago)}
          </Typography>
        )}
      </Box>

      {/* Método */}
      <Box>
        <MobileLabel>Método</MobileLabel>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, minWidth: 0, minHeight: 40 }}>
          <Box sx={{ color: "text.secondary", display: "flex", flexShrink: 0 }}>{metodoIcon(pago.metodo_pago)}</Box>
          <Typography variant="caption" fontWeight={600} color="text.primary" noWrap>
            {formatMetodoLabel(pago.metodo_pago)}
          </Typography>
        </Box>
      </Box>

      {/* Estado */}
      <Box sx={{ width: { lg: 112 }, minWidth: 0 }}>
        <MobileLabel>Estado</MobileLabel>
        <PaymentStatusBadge status={pago.estado} />
      </Box>

      {/* Acciones: 3 slots fijos → Confirmar/PDF | Editar | Eliminar */}
      <Box sx={{ width: { lg: 188 }, minWidth: 0 }}>
        <MobileLabel>Acciones</MobileLabel>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "108px 32px 32px",
            gap: 0.75,
            alignItems: "center",
            justifyContent: { xs: "start", lg: "end" },
            minHeight: 40,
            width: { lg: 188 },
          }}
        >
          {isPending ? (
            <Button size="small" startIcon={<CheckCircleIcon />} onClick={() => onConfirm(pago)} sx={actionBtnSx}>
              Confirmar
            </Button>
          ) : (
            <Button
              size="small"
              startIcon={<PictureAsPdfIcon />}
              onClick={() => onPdf(pago.id)}
              disabled={pdfLoading === pago.id}
              sx={actionBtnSx}
            >
              {pdfLoading === pago.id ? "..." : "PDF"}
            </Button>
          )}

          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => onEdit(pago)} sx={{ ...iconBtnSx, color: "primary.main" }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          {isPending ? (
            <Tooltip title="Eliminar">
              <IconButton size="small" onClick={() => onDelete(pago.id)} sx={{ ...iconBtnSx, color: "error.main" }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Box sx={{ width: 32, height: 32 }} aria-hidden />
          )}
        </Box>
      </Box>
    </Box>
  )
}

export default PaymentListRow
