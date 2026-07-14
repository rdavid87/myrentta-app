import { Box, Typography, IconButton } from "@mui/material"
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft"
import ChevronRightIcon from "@mui/icons-material/ChevronRight"
import { alpha, useTheme } from "@mui/material/styles"
import { neonBorder } from "./glassStyles"

const ListFooter = ({ from, to, total, page = 1, totalPages = 1, onPageChange }) => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: "center",
        gap: 1.5,
        pt: 2,
        mt: 1,
        borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
      }}
    >
      <Typography variant="caption" color="text.secondary">
        Mostrando {from} a {to} de {total} {total === 1 ? "registro" : "registros"}
      </Typography>
      {totalPages > 1 && onPageChange && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton
            size="small"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Página anterior"
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Box
            sx={{
              minWidth: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "8px",
              fontWeight: 700,
              fontSize: "0.875rem",
              color: "primary.main",
              ...neonBorder(theme, "primary", true),
            }}
          >
            {page}
          </Box>
          <IconButton
            size="small"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Página siguiente"
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  )
}

export default ListFooter
