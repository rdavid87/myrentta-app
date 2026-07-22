const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL?.trim() || "soporte@myrentta.com"

const SUPPORT_PHONE_DISPLAY =
  import.meta.env.VITE_SUPPORT_PHONE_DISPLAY?.trim() || "+57 302 605 7156"

const whatsappDigits = (
  import.meta.env.VITE_SUPPORT_WHATSAPP?.trim() || "573026057156"
).replace(/\D/g, "")

const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
  "Soporte MyRentta"
)}&body=${encodeURIComponent(
  "Hola,\n\nNecesito ayuda con:\n\n[Describe tu consulta]\n\nGracias."
)}`

const whatsappUrl = whatsappDigits
  ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
      "Hola, necesito ayuda con MyRentta."
    )}`
  : null

const SUBSCRIPTION_ERROR_MESSAGE =
  "Su suscripción no está activa. Por favor, contacte a soporte."

export { SUPPORT_EMAIL, SUPPORT_PHONE_DISPLAY, mailtoHref, whatsappUrl, SUBSCRIPTION_ERROR_MESSAGE }
