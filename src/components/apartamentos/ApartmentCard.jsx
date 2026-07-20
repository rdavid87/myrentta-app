import { Box, Typography, Button } from "@mui/material"
import LocationOnIcon from "@mui/icons-material/LocationOn"
import ApartmentIcon from "@mui/icons-material/Apartment"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import { alpha, useTheme } from "@mui/material/styles"
import StatusBadge from "../ui/StatusBadge"
import { ghostButtonSx, neonBorder } from "../ui/glassStyles"

const ApartmentCard = ({ apartamento, formatCurrency, onEdit, onDelete }) => {
  const theme = useTheme()
  const isDisponible = apartamento.estado === "disponible"
  const accent = isDisponible ? theme.palette.success.main : theme.palette.warning.main
  const statusKey = isDisponible ? "disponible" : "arrendado"

  const editBtnSx = {
    ...ghostButtonSx(theme),
    flex: 1,
    py: 1,
    color: "primary.main",
    borderColor: alpha(theme.palette.primary.main, 0.35),
    "&:hover": {
      borderColor: "primary.main",
      bgcolor: alpha(theme.palette.primary.main, 0.08),
    },
  }

  const deleteBtnSx = {
    ...ghostButtonSx(theme),
    flex: 1,
    py: 1,
    color: "error.main",
    borderColor: alpha(theme.palette.error.main, 0.35),
    "&:hover": {
      borderColor: "error.main",
      bgcolor: alpha(theme.palette.error.main, 0.08),
    },
  }

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: "14px",
        overflow: "hidden",
        border: `1px solid ${alpha(theme.palette.divider, 0.55)}`,
        borderLeft: `4px solid ${accent}`,
        bgcolor: alpha(theme.palette.background.default, theme.palette.mode === "dark" ? 0.45 : 0.6),
        backgroundImage: (t) =>
          `linear-gradient(135deg, ${alpha(accent, t.palette.mode === "dark" ? 0.08 : 0.05)} 0%, transparent 55%),
           radial-gradient(ellipse 80% 60% at 100% 0%, ${alpha(t.palette.primary.main, 0.06)} 0%, transparent 60%)`,
        transition: "all 0.22s ease",
        display: "flex",
        flexDirection: "column",
        minHeight: 220,
        "@media (hover: hover)": {
          "&:hover": {
            ...neonBorder(theme, "primary", true),
            transform: "translateY(-2px)",
          },
        },
      }}
    >
      <Box sx={{ p: 2, pb: 1.5, flex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 1 }}>
          <StatusBadge status={statusKey} />
        </Box>

        <Typography variant="h6" fontWeight={800} sx={{ mb: 1.25, lineHeight: 1.25, pr: 1 }}>
          {apartamento.nombre}
        </Typography>

        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.75, mb: 0.75 }}>
          <LocationOnIcon sx={{ fontSize: 16, color: "text.secondary", mt: 0.15, flexShrink: 0 }} />
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
            {apartamento.direccion}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: apartamento.description ? 0.75 : 1.5 }}>
          <ApartmentIcon sx={{ fontSize: 16, color: "primary.main", flexShrink: 0 }} />
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            {apartamento.ciudad}
          </Typography>
        </Box>

        {apartamento.description ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              mb: 1.5,
              lineHeight: 1.4,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {apartamento.description}
          </Typography>
        ) : null}

        <Typography variant="h5" fontWeight={800} sx={{ color: "warning.main", lineHeight: 1.2 }}>
          {formatCurrency(apartamento.valor_arriendo)}
          <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5, fontWeight: 500 }}>
            /mes
          </Typography>
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 1,
          px: 2,
          py: 1.5,
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
        }}
      >
        <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit(apartamento)} sx={editBtnSx}>
          Editar
        </Button>
        <Button size="small" startIcon={<DeleteIcon />} onClick={() => onDelete(apartamento.id)} sx={deleteBtnSx}>
          Eliminar
        </Button>
      </Box>
    </Box>
  )
}

export default ApartmentCard
