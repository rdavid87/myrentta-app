/** Icono SVG futurista para arrendatarios (ficha / identidad digital) */
const ArrendatarioIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M9 9.375a2.625 2.625 0 115.25 0 2.625 2.625 0 01-5.25 0z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 15.75h6" />
    <path strokeLinecap="round" strokeWidth="1.25" d="M12 2.5v1.5M20 12h1.5M12 20.5v1.5M2.5 12H4" opacity="0.55" />
  </svg>
)

export default ArrendatarioIcon
