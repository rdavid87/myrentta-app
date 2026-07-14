import { Box, Typography } from "@mui/material"
import ApartmentIcon from "@mui/icons-material/Apartment"
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth"
import { alpha, useTheme } from "@mui/material/styles"
import { glassSurface } from "../ui/glassStyles"

const TenantContractCard = ({ contract, apartmentLabel, formatCurrency, formatDate }) => {
  const theme = useTheme()
  const isActivo = contract.estado === "activo"

  return (
    <Box
      sx={{
        flex: "0 0 auto",
        width: { xs: 240, sm: 260 },
        p: 2,
        borderRadius: "12px",
        ...glassSurface(theme, { intensity: 0.75, glow: false }),
        border: `1px solid ${alpha(isActivo ? theme.palette.success.main : theme.palette.divider, isActivo ? 0.35 : 0.4)}`,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.25, mb: 1.5 }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: alpha(theme.palette.primary.main, 0.12),
            color: "primary.main",
            flexShrink: 0,
          }}
        >
          <ApartmentIcon sx={{ fontSize: 20 }} />
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={700} noWrap>
            {apartmentLabel}
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap display="block">
            Canon mensual
          </Typography>
        </Box>
      </Box>

      <Typography variant="h6" fontWeight={800} sx={{ color: "warning.main", mb: 1.25, lineHeight: 1.2 }}>
        {formatCurrency(contract.canon_mensual)}
        <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
          /mes
        </Typography>
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
        <CalendarMonthIcon sx={{ fontSize: 15, color: "text.secondary" }} />
        <Typography variant="caption" color="text.secondary">
          {formatDate(contract.fecha_inicio)} — {formatDate(contract.fecha_fin)}
        </Typography>
      </Box>

      {isActivo && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1.25 }}>
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              bgcolor: "success.main",
              boxShadow: `0 0 8px ${theme.palette.success.main}`,
            }}
          />
          <Typography variant="caption" fontWeight={600} sx={{ color: "success.main" }}>
            Activo
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export default TenantContractCard
