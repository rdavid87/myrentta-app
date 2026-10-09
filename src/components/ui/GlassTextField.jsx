import { Box, TextField, Typography } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import { glassInputSx } from "./glassStyles"

const isDateLike = (type) =>
  type === "date" || type === "datetime-local" || type === "time" || type === "month" || type === "week"

// Highlighted native calendar button so the date picker trigger is easy to spot.
// colorScheme already renders a light icon in dark mode, so no invert filter is needed.
const calendarIndicatorSx = (theme) => ({
  cursor: "pointer",
  opacity: 1,
  padding: "6px",
  marginLeft: "8px",
  borderRadius: "8px",
  backgroundColor: alpha(theme.palette.primary.main, 0.18),
  border: `1px solid ${alpha(theme.palette.primary.main, 0.5)}`,
  transition: "background-color 0.2s ease, border-color 0.2s ease",
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.35),
    borderColor: theme.palette.primary.main,
  },
})

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
            "& input::-webkit-calendar-picker-indicator": calendarIndicatorSx(theme),
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
