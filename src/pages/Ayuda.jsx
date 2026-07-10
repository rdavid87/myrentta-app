import { Container, Typography, Paper, Box, Button } from "@mui/material"
import EmailIcon from "@mui/icons-material/Email"
import WhatsAppIcon from "@mui/icons-material/WhatsApp"
import SupportAgentIcon from "@mui/icons-material/SupportAgent"

const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL?.trim() || "soporte@myrentta.com"

const SUPPORT_PHONE_DISPLAY =
  import.meta.env.VITE_SUPPORT_PHONE_DISPLAY?.trim() || "+57 300 123 4567"

const whatsappDigits = (
  import.meta.env.VITE_SUPPORT_WHATSAPP?.trim() || "573001234567"
).replace(/\D/g, "")

const whatsappUrl = whatsappDigits
  ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
      "Hola, necesito ayuda con MyRentta."
    )}`
  : null

const Ayuda = () => {
  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h3" component="h1" sx={{ mb: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <SupportAgentIcon sx={{ fontSize: 40 }} />
            Ayuda y soporte
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Estamos disponibles para resolver tus dudas sobre la plataforma.
          </Typography>
        </Paper>

        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Typography variant="h2" sx={{ fontSize: "3rem", mb: 2 }}>
              💬
            </Typography>
            <Typography variant="h4" component="h2" sx={{ mb: 2 }}>
              ¿Necesitas asistencia?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
              Si tienes preguntas, reportas un inconveniente o requieres orientación sobre
              contratos, pagos o el uso de MyRentta, nuestro equipo de soporte te atenderá con
              gusto.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Cada solicitud se registra y se le da el trámite correspondiente hasta resolver tu
              inquietud. Te responderemos lo antes posible.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, maxWidth: 500, mx: "auto" }}>
            <Button
              variant="outlined"
              size="large"
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                "Soporte MyRentta"
              )}&body=${encodeURIComponent(
                "Hola,\n\nNecesito ayuda con:\n\n[Describe tu consulta]\n\nGracias."
              )}`}
              startIcon={<EmailIcon />}
              sx={{ py: 2, justifyContent: "flex-start" }}
            >
              <Box sx={{ textAlign: "left", ml: 1 }}>
                <Typography variant="caption" color="text.secondary" display="block">
                  Correo electrónico
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {SUPPORT_EMAIL}
                </Typography>
                <Typography variant="body2" color="primary">
                  Envíanos tu consulta por email
                </Typography>
              </Box>
            </Button>

            {whatsappUrl && (
              <Button
                variant="outlined"
                size="large"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<WhatsAppIcon />}
                sx={{ py: 2, justifyContent: "flex-start" }}
              >
                <Box sx={{ textAlign: "left", ml: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    WhatsApp
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {SUPPORT_PHONE_DISPLAY}
                  </Typography>
                  <Typography variant="body2" color="success.main">
                    Escríbenos y te atenderemos por chat
                  </Typography>
                </Box>
              </Button>
            )}
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: "divider" }}>
            Horario de atención sujeto a disponibilidad del equipo. Incluye en tu mensaje el
            mayor detalle posible para agilizar la solución.
          </Typography>
        </Paper>
      </Box>
    </Container>
  )
}

export default Ayuda