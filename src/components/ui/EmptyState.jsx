import { Box, Typography } from "@mui/material"

const EmptyState = ({ icon = "📋", title, description, action }) => (
  <Box sx={{ py: 8, px: 2, textAlign: "center" }}>
    <Typography variant="h3" sx={{ mb: 2, opacity: 0.7 }}>
      {icon}
    </Typography>
    <Typography color="text.secondary" fontWeight={600}>
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
        {description}
      </Typography>
    )}
    {action && <Box sx={{ mt: 3 }}>{action}</Box>}
  </Box>
)

export default EmptyState
