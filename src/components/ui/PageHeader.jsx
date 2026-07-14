import { Box, Typography, TextField, InputAdornment, IconButton } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import ClearIcon from "@mui/icons-material/Clear"
import { alpha, useTheme } from "@mui/material/styles"
import { neonBorder } from "./glassStyles"

const SearchField = ({ value, onChange, placeholder = "Buscar…", fullWidth = true }) => {
  const theme = useTheme()

  return (
    <TextField
      fullWidth={fullWidth}
      size="small"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: alpha(theme.palette.primary.main, 0.7), fontSize: 20 }} />
            </InputAdornment>
          ),
          endAdornment: value ? (
            <InputAdornment position="end">
              <IconButton onClick={() => onChange("")} size="small" aria-label="Limpiar búsqueda">
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : undefined,
          sx: {
            borderRadius: "12px",
            bgcolor: alpha(theme.palette.background.default, theme.palette.mode === "dark" ? 0.4 : 0.6),
            ...neonBorder(theme, "primary", false),
            "& fieldset": { border: "none" },
            "&:hover": neonBorder(theme, "primary", false),
            "&.Mui-focused": neonBorder(theme, "primary", true),
          },
        },
      }}
    />
  )
}

const PageHeader = ({ title, subtitle, action, children }) => (
  <Box sx={{ mb: 3 }}>
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "stretch", sm: "flex-start" },
        gap: 2,
        mb: children ? 2.5 : 0,
      }}
    >
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontFamily: '"Plus Jakarta Sans", sans-serif',
            letterSpacing: "-0.02em",
            color: "text.primary",
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Box>
    {children}
  </Box>
)

export { SearchField, PageHeader }
export default PageHeader
