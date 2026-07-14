import { Box, Typography } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import { neonBorder } from "./glassStyles"

const FilterPills = ({ options, value, onChange }) => {
  const theme = useTheme()

  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {options.map((opt) => {
        const active = value === opt.value
        return (
          <Box
            key={opt.value}
            component="button"
            type="button"
            onClick={() => onChange(opt.value)}
            sx={{
              cursor: "pointer",
              border: "none",
              fontFamily: "inherit",
              px: 2,
              py: 0.85,
              borderRadius: "20px",
              fontSize: "0.8125rem",
              fontWeight: active ? 700 : 500,
              color: active ? "primary.main" : "text.secondary",
              bgcolor: active
                ? alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.16 : 0.1)
                : alpha(theme.palette.text.primary, theme.palette.mode === "dark" ? 0.04 : 0.03),
              ...neonBorder(theme, "primary", active),
              transition: "all 0.2s ease",
              "&:hover": {
                color: "primary.main",
                ...neonBorder(theme, "primary", true),
              },
            }}
          >
            {opt.label}
          </Box>
        )
      })}
    </Box>
  )
}

export default FilterPills
