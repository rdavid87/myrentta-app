import { alpha } from "@mui/material/styles"

/** Superficie glassmorphism reutilizable en módulos */
export const glassSurface = (theme, options = {}) => {
  const { intensity = 1, glow = true } = options
  const isDark = theme.palette.mode === "dark"
  const primary = theme.palette.primary.main

  return {
    bgcolor: alpha(theme.palette.background.paper, isDark ? 0.55 : 0.82),
    backdropFilter: "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    border: `1px solid ${alpha(primary, isDark ? 0.22 * intensity : 0.18 * intensity)}`,
    borderRadius: "16px",
    ...(glow && {
      boxShadow: isDark
        ? `0 0 24px ${alpha(primary, 0.1 * intensity)}, inset 0 1px 0 ${alpha("#fff", 0.04)}`
        : `0 4px 24px ${alpha(primary, 0.08 * intensity)}`,
    }),
  }
}

/** Borde neón para elementos activos o hover */
export const neonBorder = (theme, colorKey = "primary", active = false) => {
  const color = theme.palette[colorKey]?.main ?? theme.palette.primary.main
  return {
    border: `1px solid ${alpha(color, active ? 0.65 : 0.35)}`,
    boxShadow: active
      ? `0 0 16px ${alpha(color, 0.35)}, inset 0 0 12px ${alpha(color, 0.08)}`
      : `0 0 8px ${alpha(color, 0.12)}`,
  }
}

/** Gradiente CTA primario */
export const glowButtonSx = (theme, colorKey = "primary") => {
  const palette = theme.palette[colorKey] ?? theme.palette.primary
  const primary = palette.main
  const dark = palette.dark ?? primary
  const contrast = palette.contrastText ?? "#fff"
  const isDark = theme.palette.mode === "dark"

  return {
    background: `linear-gradient(135deg, ${primary} 0%, ${dark} 100%)`,
    color: contrast,
    fontWeight: 700,
    borderRadius: "10px",
    px: 3,
    py: 1.25,
    textTransform: "none",
    boxShadow: `0 0 20px ${alpha(primary, isDark ? 0.45 : 0.35)}`,
    border: `1px solid ${alpha(primary, 0.5)}`,
    transition: "box-shadow 0.25s ease, transform 0.2s ease",
    "&:hover": {
      background: `linear-gradient(135deg, ${palette.light ?? primary} 0%, ${primary} 100%)`,
      boxShadow: `0 0 28px ${alpha(primary, isDark ? 0.55 : 0.45)}`,
      transform: "translateY(-1px)",
    },
    "&.Mui-disabled": {
      opacity: 0.45,
      color: contrast,
      background: `linear-gradient(135deg, ${alpha(primary, 0.5)} 0%, ${alpha(dark, 0.5)} 100%)`,
    },
  }
}

/** Botón secundario / cancelar */
export const ghostButtonSx = (theme) => {
  const isDark = theme.palette.mode === "dark"
  return {
    borderRadius: "10px",
    px: 3,
    py: 1.25,
    textTransform: "none",
    fontWeight: 600,
    color: "text.secondary",
    bgcolor: alpha(theme.palette.text.primary, isDark ? 0.06 : 0.04),
    border: `1px solid ${alpha(theme.palette.divider, isDark ? 0.8 : 1)}`,
    "&:hover": {
      bgcolor: alpha(theme.palette.primary.main, isDark ? 0.1 : 0.06),
      borderColor: alpha(theme.palette.primary.main, 0.35),
      color: "primary.main",
    },
  }
}

/** Estilos glass para inputs de formulario — transparente, sin relleno azul sólido */
export const glassInputSx = (theme) => {
  const isDark = theme.palette.mode === "dark"
  const glassBg = isDark ? alpha("#ffffff", 0.04) : alpha("#0f172a", 0.03)
  const glassBgHover = isDark ? alpha("#ffffff", 0.07) : alpha("#0f172a", 0.05)
  const glassBgFocus = isDark ? alpha("#ffffff", 0.06) : alpha("#0f172a", 0.04)
  const borderIdle = alpha(theme.palette.divider, isDark ? 0.7 : 0.9)
  const borderHover = alpha(theme.palette.primary.main, 0.4)
  const primary = theme.palette.primary.main

  return {
    "& .MuiOutlinedInput-root": {
      borderRadius: "12px",
      bgcolor: glassBg,
      backdropFilter: "blur(10px)",
      WebkitBackdropFilter: "blur(10px)",
      transition: "box-shadow 0.2s ease, background-color 0.2s ease, border-color 0.2s ease",
      border: `1px solid ${borderIdle}`,
      boxShadow: "none",
      "& fieldset": { border: "none" },
      "&:hover": {
        bgcolor: glassBgHover,
        border: `1px solid ${borderHover}`,
        boxShadow: `0 0 12px ${alpha(primary, isDark ? 0.12 : 0.08)}`,
      },
      "&.Mui-focused": {
        bgcolor: glassBgFocus,
        border: `1px solid ${alpha(primary, 0.55)}`,
        boxShadow: `0 0 16px ${alpha(primary, isDark ? 0.28 : 0.18)}, inset 0 0 12px ${alpha(primary, 0.04)}`,
      },
      "&.Mui-disabled": {
        opacity: 0.55,
        bgcolor: alpha(theme.palette.background.default, 0.25),
      },
      // Autofill del navegador (Chrome/Edge suelen pintar azul sólido)
      "& input:-webkit-autofill, & input:-webkit-autofill:hover, & input:-webkit-autofill:focus": {
        WebkitTextFillColor: theme.palette.text.primary,
        caretColor: theme.palette.text.primary,
        transition: "background-color 99999s ease-in-out 0s",
        boxShadow: `0 0 0 1000px ${isDark ? "rgba(18,18,18,0.92)" : "rgba(248,249,250,0.95)"} inset`,
        borderRadius: "inherit",
      },
    },
    "& .MuiOutlinedInput-input": {
      color: "text.primary",
      py: 1.35,
    },
    "& .MuiInputLabel-root": {
      fontWeight: 500,
      fontSize: "0.875rem",
      color: "text.secondary",
      "&.Mui-focused": { color: "primary.main" },
    },
    "& .MuiSelect-icon": {
      color: alpha(primary, 0.8),
    },
  }
}

/** Paper del diálogo glass */
export const glassDialogPaperSx = (theme) => ({
  ...glassSurface(theme, { intensity: 1.2 }),
  borderRadius: "16px",
  overflow: "hidden",
  backgroundImage: (t) =>
    `radial-gradient(ellipse 80% 40% at 50% 0%, ${alpha(t.palette.primary.main, t.palette.mode === "dark" ? 0.12 : 0.06)} 0%, transparent 60%)`,
})
