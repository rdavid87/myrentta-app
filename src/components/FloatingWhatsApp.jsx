import { Box } from "@mui/material"
import WhatsAppIcon from "@mui/icons-material/WhatsApp"
import { whatsappUrl } from "../utils/support"

export default function FloatingWhatsApp() {
  if (!whatsappUrl) return null

  return (
    <Box
      component="a"
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contáctanos por WhatsApp"
      className="floating-whatsapp"
      sx={{
        position: "fixed",
        right: { xs: 2, sm: 3 },
        bottom: { xs: 2, sm: 3 },
        zIndex: 1500,
        width: { xs: 54, sm: 60 },
        height: { xs: 54, sm: 60 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: "#25D366",
        color: "#fff",
        boxShadow: "0 10px 25px rgba(37,211,102,.45)",
        transition: "transform .25s ease",
        "&:hover": {
          transform: "scale(1.08)",
        },
      }}
    >
      <WhatsAppIcon sx={{ fontSize: { xs: 28, sm: 34 } }} />
    </Box>
  )
}
