import { Box, Typography, Avatar, Button, IconButton, Tooltip } from "@mui/material"
import EditIcon from "@mui/icons-material/Edit"
import DeleteIcon from "@mui/icons-material/Delete"
import PhoneIcon from "@mui/icons-material/Phone"
import EmailIcon from "@mui/icons-material/Email"
import ContentCopyIcon from "@mui/icons-material/ContentCopy"
import WhatsAppIcon from "@mui/icons-material/WhatsApp"
import { alpha, useTheme } from "@mui/material/styles"
import StatusBadge from "../ui/StatusBadge"
import GlassPanel from "../ui/GlassPanel"
import TenantContractCard from "./TenantContractCard"
import { ghostButtonSx } from "../ui/glassStyles"

const ContactRow = ({ icon, label, value, href, trailing }) => {
  const theme = useTheme()
  const content = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        p: 1.75,
        borderRadius: "12px",
        bgcolor: alpha(theme.palette.background.default, theme.palette.mode === "dark" ? 0.4 : 0.55),
        border: `1px solid ${alpha(theme.palette.divider, 0.45)}`,
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "10px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: "primary.main",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography
          variant="body2"
          fontWeight={600}
          sx={{ overflowWrap: "anywhere", wordBreak: "break-word" }}
        >
          {value}
        </Typography>
      </Box>
      {trailing}
    </Box>
  )

  if (href) {
    return (
      <Box component="a" href={href} sx={{ textDecoration: "none", color: "inherit", display: "block" }}>
        {content}
      </Box>
    )
  }

  return content
}

const TenantDetailPanel = ({
  tenant,
  status,
  activeContracts,
  getApartmentLabel,
  formatCurrency,
  formatDate,
  getInitials,
  onEdit,
  onDelete,
}) => {
  const theme = useTheme()

  if (!tenant) {
    return (
      <GlassPanel
        sx={{
          flex: 1,
          minHeight: 360,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 4,
        }}
      >
        <Typography color="text.secondary" textAlign="center">
          Selecciona un arrendatario para ver su perfil
        </Typography>
      </GlassPanel>
    )
  }

  const phoneDigits = tenant.telefono?.replace(/\D/g, "") ?? ""
  const waHref = phoneDigits
    ? `https://wa.me/${phoneDigits.startsWith("57") ? phoneDigits : `57${phoneDigits}`}`
    : null

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(tenant.email)
    } catch {
      /* ignore */
    }
  }

  const editBtnSx = {
    ...ghostButtonSx(theme),
    py: 0.85,
    px: 1.5,
    color: "primary.main",
    borderColor: alpha(theme.palette.primary.main, 0.35),
    minWidth: 0,
  }

  const deleteBtnSx = {
    ...ghostButtonSx(theme),
    py: 0.85,
    px: 1.5,
    color: "error.main",
    borderColor: alpha(theme.palette.error.main, 0.35),
    minWidth: 0,
    "&:hover": {
      borderColor: "error.main",
      bgcolor: alpha(theme.palette.error.main, 0.08),
      color: "error.main",
    },
  }

  return (
    <GlassPanel sx={{ flex: 1, p: { xs: 2, md: 3 }, minHeight: { xs: "auto", md: 360 }, minWidth: 0 }}>
      {/* Header: avatar + info, then actions below on mobile */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: { xs: 1.5, sm: 2 }, mb: 1.75 }}>
          <Box
            sx={{
              p: 0.5,
              borderRadius: "50%",
              border: `3px solid ${alpha(theme.palette.primary.main, 0.65)}`,
              boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.35)}`,
              flexShrink: 0,
            }}
          >
            <Avatar
              sx={{
                width: { xs: 56, sm: 64, md: 80 },
                height: { xs: 56, sm: 64, md: 80 },
                bgcolor:
                  status === "activo"
                    ? "success.main"
                    : status === "en_mora"
                      ? "error.main"
                      : "text.disabled",
                color: status === "sin_contrato" ? "text.primary" : "common.white",
                fontWeight: 800,
                fontSize: { xs: "1.1rem", md: "1.5rem" },
              }}
            >
              {getInitials(tenant.nombre_completo)}
            </Avatar>
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="h5"
              fontWeight={800}
              sx={{
                lineHeight: 1.25,
                mb: 0.75,
                fontSize: { xs: "1.15rem", sm: "1.35rem", md: "1.5rem" },
                overflowWrap: "anywhere",
                wordBreak: "break-word",
              }}
            >
              {tenant.nombre_completo}
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, alignItems: "center" }}>
              <Typography
                variant="caption"
                sx={{
                  px: 1.25,
                  py: 0.35,
                  borderRadius: "6px",
                  bgcolor: alpha(theme.palette.text.primary, 0.06),
                  border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                  fontWeight: 600,
                }}
              >
                CC {tenant.documento_identidad}
              </Typography>
              <StatusBadge status={status} />
            </Box>
          </Box>

          {/* Desktop actions — same row */}
          <Box sx={{ display: { xs: "none", sm: "flex" }, gap: 1, flexShrink: 0 }}>
            <Button size="small" startIcon={<EditIcon />} onClick={() => onEdit(tenant)} sx={editBtnSx}>
              Editar
            </Button>
            <Button size="small" startIcon={<DeleteIcon />} onClick={() => onDelete(tenant.id)} sx={deleteBtnSx}>
              Eliminar
            </Button>
          </Box>
        </Box>

        {/* Mobile actions — full width below profile */}
        <Box sx={{ display: { xs: "flex", sm: "none" }, gap: 1 }}>
          <Button
            size="small"
            fullWidth
            startIcon={<EditIcon />}
            onClick={() => onEdit(tenant)}
            sx={editBtnSx}
          >
            Editar
          </Button>
          <Button
            size="small"
            fullWidth
            startIcon={<DeleteIcon />}
            onClick={() => onDelete(tenant.id)}
            sx={deleteBtnSx}
          >
            Eliminar
          </Button>
        </Box>
      </Box>

      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
        Contratos activos
      </Typography>
      {activeContracts.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Sin contratos activos
        </Typography>
      ) : (
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            overflowX: "auto",
            pb: 1,
            mb: 3,
            mx: -0.5,
            px: 0.5,
            WebkitOverflowScrolling: "touch",
          }}
        >
          {activeContracts.map((contract) => (
            <TenantContractCard
              key={contract.id}
              contract={contract}
              apartmentLabel={getApartmentLabel(contract)}
              formatCurrency={formatCurrency}
              formatDate={formatDate}
            />
          ))}
        </Box>
      )}

      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
        Información de contacto
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
        <ContactRow
          icon={<PhoneIcon sx={{ fontSize: 20 }} />}
          label="Teléfono móvil"
          value={tenant.telefono}
          href={tenant.telefono ? `tel:${tenant.telefono}` : undefined}
          trailing={
            waHref ? (
              <Tooltip title="WhatsApp">
                <IconButton
                  component="a"
                  href={waHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  size="small"
                  sx={{ color: "success.main" }}
                >
                  <WhatsAppIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null
          }
        />
        <ContactRow
          icon={<EmailIcon sx={{ fontSize: 20 }} />}
          label="Email"
          value={tenant.email}
          href={tenant.email ? `mailto:${tenant.email}` : undefined}
          trailing={
            tenant.email ? (
              <Tooltip title="Copiar email">
                <IconButton size="small" onClick={copyEmail} sx={{ color: "primary.main" }}>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null
          }
        />
      </Box>
    </GlassPanel>
  )
}

export default TenantDetailPanel
