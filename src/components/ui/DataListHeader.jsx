import { Box, Typography } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"

const DataListHeader = ({ columns }) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: { xs: "none", lg: "grid" },
        gridTemplateColumns: columns.map((c) => c.width ?? "1fr").join(" "),
        gap: 2,
        px: 1.75,
        py: 1.25,
        mb: 0.5,
        alignItems: "center",
      }}
    >
      {columns.map((col) => (
        <Typography
          key={col.key}
          variant="caption"
          sx={{
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: alpha(theme.palette.text.secondary, 0.9),
            fontSize: "0.7rem",
            textAlign: col.key === "acciones" ? "right" : "left",
          }}
        >
          {col.label}
        </Typography>
      ))}
    </Box>
  )
}

export default DataListHeader
