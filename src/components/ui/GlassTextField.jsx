import { Box, TextField, Typography } from "@mui/material"
import { useTheme } from "@mui/material/styles"
import { glassInputSx } from "./glassStyles"

const isDateLike = (type) =>
  type === "date" || type === "datetime-local" || type === "time" || type === "month" || type === "week"

/**
 * TextField glass. En type="date" el label va arriba (no flotante)
 * para no chocar con el placeholder nativo dd/mm/aaaa.
 */
const GlassTextField = ({ type, label, required, sx = {}, slotProps, ...props }) => {
  const theme = useTheme()
  const dateLike = isDateLike(type)

  if (dateLike) {
    return (
      <Box sx={{ width: "100%", ...sx }}>
        {label && (
          <Typography
            component="label"
            variant="caption"
            sx={{
              display: "block",
              mb: 0.75,
              fontWeight: 600,
              color: "text.secondary",
              letterSpacing: "0.02em",
            }}
          >
            {label}
            {required ? " *" : ""}
          </Typography>
        )}
        <TextField
          fullWidth
          size="small"
          type={type}
          required={required}
          slotProps={{
            ...slotProps,
            inputLabel: { shrink: true, ...slotProps?.inputLabel },
            htmlInput: { ...slotProps?.htmlInput },
          }}
          sx={{
            ...glassInputSx(theme),
            "& .MuiOutlinedInput-input": {
              py: 1.35,
              color: "text.primary",
              colorScheme: theme.palette.mode,
            },
            // Calendario nativo legible en dark
            "& input::-webkit-calendar-picker-indicator": {
              cursor: "pointer",
              opacity: 0.75,
              filter: theme.palette.mode === "dark" ? "invert(0.85)" : "none",
            },
          }}
          {...props}
        />
      </Box>
    )
  }

  return (
    <TextField
      fullWidth
      size="small"
      type={type}
      label={label}
      required={required}
      slotProps={slotProps}
      sx={{ ...glassInputSx(theme), ...sx }}
      {...props}
    />
  )
}

export default GlassTextField
