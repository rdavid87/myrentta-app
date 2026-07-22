import { Container, Typography, Paper, Box, Button, Avatar, Chip } from "@mui/material"
import EmailIcon from "@mui/icons-material/Email"
import WhatsAppIcon from "@mui/icons-material/WhatsApp"
import SupportAgentIcon from "@mui/icons-material/SupportAgent"
import ScheduleIcon from "@mui/icons-material/Schedule"
import HelpOutlineIcon from "@mui/icons-material/HelpOutlined"
import { SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, mailtoHref, whatsappUrl } from "../utils/support"

const Ayuda = () => {
  const cardSx = (accent) => ({
    width: "100%",
    maxWidth: "100%",
    boxSizing: "border-box",
    borderRadius: 2.5,
    borderColor: "divider",
    borderLeft: 4,
    borderLeftColor: accent,
    bgcolor: "background.default",
    backgroundImage: (theme) =>
      `linear-gradient(135deg, ${theme.palette.mode === "dark" ? "rgba(82,139,158,0.08)" : "rgba(8,145,178,0.06)"} 0%, transparent 55%)`,
    boxShadow: "none",
    overflow: "hidden",
  })

  const contactBtnSx = (tone) => ({
    width: "100%",
    maxWidth: "100%",
    minWidth: 0,
    boxSizing: "border-box",
    overflow: "hidden",
    justifyContent: "flex-start",
    alignItems: "center",
    textAlign: "left",
    whiteSpace: "normal",
    py: 1.5,
    px: { xs: 1.25, sm: 2 },
    minHeight: { xs: 76, sm: 88 },
    borderRadius: 2,
    textTransform: "none",
    border: 1,
    borderColor: (theme) =>
      theme.palette.mode === "dark"
        ? tone === "success"
          ? "rgba(110,231,183,0.4)"
          : "rgba(82,139,158,0.45)"
        : tone === "success"
          ? "rgba(16,185,129,0.35)"
          : "rgba(8,145,178,0.35)",
    backgroundImage: (theme) =>
      `linear-gradient(135deg, ${
        theme.palette.mode === "dark"
          ? tone === "success"
            ? "rgba(110,231,183,0.14)"
            : "rgba(82,139,158,0.14)"
          : tone === "success"
            ? "rgba(16,185,129,0.1)"
            : "rgba(8,145,178,0.1)"
      } 0%, transparent 65%)`,
    bgcolor: (theme) =>
      theme.palette.mode === "dark"
        ? tone === "success"
          ? "rgba(110,231,183,0.06)"
          : "rgba(82,139,158,0.06)"
        : tone === "success"
          ? "rgba(16,185,129,0.04)"
          : "rgba(8,145,178,0.04)",
    boxShadow: "none",
    "&:hover": {
      borderColor: tone === "success" ? "success.main" : "primary.main",
      bgcolor: (theme) =>
        theme.palette.mode === "dark"
          ? tone === "success"
            ? "rgba(110,231,183,0.14)"
            : "rgba(82,139,158,0.18)"
          : tone === "success"
            ? "rgba(16,185,129,0.1)"
            : "rgba(8,145,178,0.12)",
      boxShadow: "none",
    },
  })

  const iconBadgeSx = (tone) => ({
    width: 40,
    height: 40,
    borderRadius: 1.5,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: tone === "success" ? "success.main" : "primary.main",
    bgcolor: (theme) =>
      theme.palette.mode === "dark"
        ? tone === "success"
          ? "rgba(110,231,183,0.22)"
          : "rgba(82,139,158,0.28)"
        : tone === "success"
          ? "rgba(16,185,129,0.14)"
          : "rgba(8,145,178,0.14)",
    border: 1,
    borderColor: (theme) =>
      theme.palette.mode === "dark"
        ? tone === "success"
          ? "rgba(110,231,183,0.45)"
          : "rgba(82,139,158,0.5)"
        : tone === "success"
          ? "rgba(16,185,129,0.35)"
          : "rgba(8,145,178,0.35)",
  })

  return (
    <Container
      maxWidth="md"
      disableGutters
      sx={{
        width: "100%",
        maxWidth: { xs: "100%", md: 900 },
        mx: "auto",
        py: { xs: 1, sm: 3 },
        px: { xs: 0, sm: 2 },
        overflowX: "hidden",
        boxSizing: "border-box",
      }}
    >
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          ...cardSx("primary.main"),
          p: { xs: 1.5, sm: 3 },
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: { xs: 1.5, sm: 2 }, minWidth: 0, width: "100%" }}>
          <Avatar
            sx={{
              width: { xs: 44, sm: 56 },
              height: { xs: 44, sm: 56 },
              flexShrink: 0,
              bgcolor: "primary.main",
              color: "primary.contrastText",
              boxShadow: (theme) =>
                `0 0 0 3px ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)"}`,
            }}
          >
            <SupportAgentIcon />
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                fontSize: { xs: "1.25rem", sm: "2.125rem" },
                mb: 0.75,
                wordBreak: "break-word",
              }}
            >
              Ayuda y soporte
            </Typography>
            <Chip
              icon={<HelpOutlineIcon sx={{ fontSize: "16px !important" }} />}
              label="Soporte MyRentta"
              size="small"
              color="primary"
              variant="outlined"
              sx={{ mb: 1, fontWeight: 600, maxWidth: "100%" }}
            />
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word" }}>
              Estamos disponibles para resolver tus dudas sobre la plataforma.
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          ...cardSx("secondary.main"),
          p: { xs: 1.5, sm: 3 },
        }}
      >
        <Box sx={{ mb: 2.5, minWidth: 0, width: "100%", overflow: "hidden" }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 700 }}
          >
            Canales de contacto
          </Typography>
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: 700, mt: 0.5, mb: 1, fontSize: { xs: "1.15rem", sm: "1.5rem" }, wordBreak: "break-word" }}
          >
            ¿Necesitas asistencia?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1, wordBreak: "break-word" }}>
            Si tienes preguntas, reportas un inconveniente o requieres orientación sobre
            contratos, pagos o el uso de MyRentta, nuestro equipo te atenderá con gusto.
          </Typography>
          <Typography variant="caption" color="text.disabled" display="block" sx={{ wordBreak: "break-word" }}>
            Cada solicitud se registra y se le da el trámite correspondiente hasta resolver tu
            inquietud.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.25,
            p: { xs: 1, sm: 2 },
            mb: 2,
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            boxSizing: "border-box",
            overflow: "hidden",
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)",
          }}
        >
          <Button href={mailtoHref} sx={contactBtnSx("primary")}>
            <Box component="span" sx={iconBadgeSx("primary")}>
              <EmailIcon fontSize="small" />
            </Box>
            <Box sx={{ textAlign: "left", ml: { xs: 1, sm: 1.5 }, minWidth: 0, flex: 1, overflow: "hidden" }}>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}
              >
                Correo electrónico
              </Typography>
              <Typography
                variant="body2"
                fontWeight="bold"
                color="primary.main"
                sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {SUPPORT_EMAIL}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-word" }}>
                Envíanos tu consulta por email
              </Typography>
            </Box>
          </Button>

          {whatsappUrl && (
            <Button
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              sx={contactBtnSx("success")}
            >
              <Box component="span" sx={iconBadgeSx("success")}>
                <WhatsAppIcon fontSize="small" />
              </Box>
              <Box sx={{ textAlign: "left", ml: { xs: 1, sm: 1.5 }, minWidth: 0, flex: 1, overflow: "hidden" }}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  sx={{ letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}
                >
                  WhatsApp
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight="bold"
                  color="success.main"
                  sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {SUPPORT_PHONE_DISPLAY}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-word" }}>
                  Escríbenos y te atenderemos por chat
                </Typography>
              </Box>
            </Button>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: 1.25,
            pt: 2,
            borderTop: 1,
            borderColor: "divider",
            minWidth: 0,
            width: "100%",
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              flexShrink: 0,
              bgcolor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(245,158,11,0.2)" : "rgba(245,158,11,0.12)",
              color: "warning.main",
              border: 1,
              borderColor: (theme) =>
                theme.palette.mode === "dark" ? "rgba(245,158,11,0.4)" : "rgba(245,158,11,0.3)",
            }}
          >
            <ScheduleIcon fontSize="small" />
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
            <Typography
              variant="caption"
              color="warning.main"
              sx={{ letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 700 }}
            >
              Horario
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-word" }}>
              Atención sujeta a disponibilidad del equipo. Incluye el mayor detalle posible en
              tu mensaje para agilizar la solución.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  )
}

export default Ayuda
