import { forwardRef } from "react"
import { IconButton, Tooltip } from "@mui/material"
import { Link } from "react-router-dom"
import { alpha, useTheme } from "@mui/material/styles"
import { neonBorder } from "./glassStyles"

const NavIconButton = forwardRef(function NavIconButton(
  { to, label, icon, active = false, onClick, component },
  ref
) {
  const theme = useTheme()
  const isLink = Boolean(to)
  const Comp = component ?? (isLink ? Link : "button")

  const button = (
    <IconButton
      ref={ref}
      component={Comp}
      to={to}
      onClick={onClick}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      sx={{
        width: 44,
        height: 44,
        borderRadius: "12px",
        color: active ? "primary.main" : "text.secondary",
        bgcolor: active
          ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.2 : 0.12)
          : "transparent",
        ...(active ? neonBorder(theme, "primary", true) : {}),
        transition: "all 0.22s ease",
        "& .MuiSvgIcon-root": { fontSize: 22 },
        "@media (hover: hover)": {
          "&:hover": {
            color: "primary.main",
            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.14 : 0.08),
            ...neonBorder(theme, "primary", true),
          },
        },
      }}
    >
      {icon}
    </IconButton>
  )

  return label ? (
    <Tooltip title={label} placement="right" arrow>
      {button}
    </Tooltip>
  ) : (
    button
  )
})

export default NavIconButton
