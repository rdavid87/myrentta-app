import { Box, Typography, Avatar } from "@mui/material"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { alpha, useTheme } from "@mui/material/styles"
import StatusBadge from "../ui/StatusBadge"
import { neonBorder } from "../ui/glassStyles"

const TenantListItem = ({ tenant, selected, status, onSelect, getInitials }) => {
  const theme = useTheme()

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onSelect(tenant)}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        width: "100%",
        p: 1.5,
        mb: 1,
        textAlign: "left",
        cursor: "pointer",
        appearance: "none",
        WebkitAppearance: "none",
        border: "none",
        outline: "none",
        fontFamily: "inherit",
        fontSize: "inherit",
        color: theme.palette.text.primary,
        borderRadius: "12px",
        bgcolor: selected
          ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.1 : 0.06)
          : alpha(theme.palette.background.default, theme.palette.mode === "dark" ? 0.35 : 0.5),
        ...(selected ? neonBorder(theme, "primary", true) : {
          border: `1px solid ${alpha(theme.palette.divider, 0.45)}`,
        }),
        transition: "all 0.2s ease",
        "@media (hover: hover)": {
          "&:hover": {
            ...neonBorder(theme, "primary", selected),
            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.08 : 0.05),
          },
        },
      }}
    >
      <Avatar
        sx={{
          width: 40,
          height: 40,
          flexShrink: 0,
          bgcolor: status === "activo" ? "success.main" : status === "en_mora" ? "error.main" : "text.disabled",
          color: status === "sin_contrato" ? "text.primary" : "common.white",
          fontWeight: 700,
          fontSize: "0.85rem",
        }}
      >
        {getInitials(tenant.nombre_completo)}
      </Avatar>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          fontWeight={700}
          noWrap
          sx={{ color: "text.primary" }}
        >
          {tenant.nombre_completo}
        </Typography>
        <Typography
          variant="caption"
          noWrap
          display="block"
          sx={{ mt: 0.25, color: "text.secondary" }}
        >
          CC {tenant.documento_identidad}
        </Typography>
        <Box sx={{ mt: 0.75 }}>
          <StatusBadge status={status} />
        </Box>
      </Box>

      <ChevronRightIcon
        sx={{
          fontSize: 20,
          color: selected ? "primary.main" : "text.disabled",
          flexShrink: 0,
        }}
      />
    </Box>
  )
}

export default TenantListItem
