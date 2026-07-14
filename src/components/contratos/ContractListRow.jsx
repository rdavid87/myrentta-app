import { Link } from "react-router-dom"
import { Box, Typography, Avatar, IconButton, Tooltip } from "@mui/material"
import HomeIcon from "@mui/icons-material/Home"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import EditIcon from "@mui/icons-material/Edit"
import PaymentsIcon from "@mui/icons-material/Payments"
import MoreHorizIcon from "@mui/icons-material/MoreHoriz"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"
import { alpha, useTheme } from "@mui/material/styles"
import StatusBadge from "../ui/StatusBadge"
import { neonBorder } from "../ui/glassStyles"

const LIST_COLUMNS = "minmax(180px,1.4fr) minmax(160px,1.2fr) minmax(130px,1fr) minmax(110px,0.8fr) minmax(100px,0.7fr) auto"

const ContractListRow = ({
  contrato,
  formatDate,
  formatCurrency,
  onEdit,
  onMore,
  onRenew,
  showRenew,
  paymentsHref,
  isMenuOpen,
}) => {
  const theme = useTheme()
  const isActivo = contrato.estado === "activo"
  const initial = contrato.arrendatario_nombre?.trim()?.charAt(0)?.toUpperCase() || "C"
  const modoCobro = (contrato.modo_cobro || "anticipado") === "fin_mes" ? "Fin de mes" : "Anticipado"

  return (
    <Box
      sx={{
        display: { xs: "block", lg: "grid" },
        gridTemplateColumns: LIST_COLUMNS,
        gap: { xs: 0, lg: 2 },
        alignItems: "center",
        p: { xs: 2, lg: 2 },
        mb: 1.5,
        borderRadius: "14px",
        bgcolor: alpha(theme.palette.background.default, theme.palette.mode === "dark" ? 0.35 : 0.5),
        border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        transition: "all 0.22s ease",
        "@media (hover: hover)": {
          "&:hover": {
            ...neonBorder(theme, "primary", true),
            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.06 : 0.04),
          },
        },
      }}
    >
      {/* Arrendatario */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: { xs: 1.5, lg: 0 } }}>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: isActivo ? "success.main" : "text.disabled",
            color: isActivo ? "success.contrastText" : "text.primary",
            fontWeight: 700,
            boxShadow: isActivo ? `0 0 12px ${alpha(theme.palette.success.main, 0.4)}` : "none",
          }}
        >
          {initial}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} noWrap>
            {contrato.arrendatario_nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {modoCobro}
            {Number(contrato.dia_pago) > 0 ? ` · +${contrato.dia_pago} días` : ""}
          </Typography>
        </Box>
      </Box>

      {/* Apartamento */}
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: { xs: 1.5, lg: 0 } }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: "primary.main",
            border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
          }}
        >
          <HomeIcon sx={{ fontSize: 18 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={600} noWrap>
            {contrato.apartamento_nombre}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            {contrato.apartamento_direccion}
          </Typography>
        </Box>
      </Box>

      {/* Periodo */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: { xs: 1.5, lg: 0 }, minWidth: 0 }}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            bgcolor: alpha(theme.palette.info.main, 0.1),
            color: "info.main",
            border: `1px solid ${alpha(theme.palette.info.main, 0.25)}`,
          }}
        >
          <CalendarMonthIcon sx={{ fontSize: 16 }} />
        </Box>
        <Box sx={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 0.35 }}>
          <Typography
            variant="caption"
            sx={{ color: "text.primary", fontWeight: 600, lineHeight: 1.3, whiteSpace: "nowrap" }}
          >
            {formatDate(contrato.fecha_inicio)}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: "text.secondary",
              lineHeight: 1.3,
              whiteSpace: "nowrap",
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Box component="span" sx={{ color: "primary.main", fontWeight: 700, opacity: 0.8 }}>
              →
            </Box>
            {formatDate(contrato.fecha_fin)}
          </Typography>
        </Box>
      </Box>

      {/* Canon */}
      <Typography
        variant="body2"
        fontWeight={700}
        sx={{ color: "warning.main", mb: { xs: 1.5, lg: 0 } }}
      >
        {formatCurrency(contrato.canon_mensual)}
      </Typography>

      {/* Estado */}
      <Box sx={{ mb: { xs: 1.5, lg: 0 } }}>
        <StatusBadge status={contrato.estado} />
      </Box>

      {/* Acciones */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: { lg: "flex-end" } }}>
        {isActivo && onEdit && (
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => onEdit(contrato)} sx={{ color: "primary.main" }}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        {!isActivo && showRenew && onRenew && (
          <Tooltip title="Renovar">
            <IconButton size="small" onClick={() => onRenew(contrato)} sx={{ color: "success.main" }}>
              <TrendingUpIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Tooltip title="Ver pagos">
          <IconButton
            size="small"
            component={Link}
            to={paymentsHref}
            sx={{ color: "warning.main" }}
          >
            <PaymentsIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Más acciones">
          <IconButton
            size="small"
            onClick={(e) => onMore(e, contrato)}
            aria-expanded={isMenuOpen}
            aria-haspopup="menu"
            sx={{ color: "text.secondary" }}
          >
            <MoreHorizIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  )
}

export { LIST_COLUMNS }
export default ContractListRow
