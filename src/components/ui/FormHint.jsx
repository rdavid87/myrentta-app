import { Box, Typography } from "@mui/material"
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined"
import { alpha, useTheme } from "@mui/material/styles"

const FormHint = ({ children, tone = "info" }) => {
  const theme = useTheme()
  const isNeutral = tone === "neutral"
  const color = isNeutral
    ? theme.palette.text.secondary
    : theme.palette[tone]?.main ?? theme.palette.info.main

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.25,
        p: 1.5,
        borderRadius: "10px",
        bgcolor: alpha(color, theme.palette.mode === "dark" ? 0.08 : 0.06),
        border: `1px solid ${alpha(color, 0.25)}`,
      }}
    >
      <InfoOutlinedIcon sx={{ fontSize: 18, color, mt: 0.15, flexShrink: 0 }} />
      <Box sx={{ minWidth: 0 }}>{children}</Box>
    </Box>
  )
}

const FormHintText = ({ children }) => (
  <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.55 }}>
    {children}
  </Typography>
)

const FormSection = ({ title, children }) => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
    {title && (
      <Typography
        variant="caption"
        sx={{
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: "primary.main",
        }}
      >
        {title}
      </Typography>
    )}
    {children}
  </Box>
)

export { FormHint, FormHintText, FormSection }
