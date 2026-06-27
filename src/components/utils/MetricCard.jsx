import React from "react"
import { Card, CardContent, Typography, Box, Chip } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"

const MetricCard = ({
  value,
  title,
  color = "#0891b2",
  badges = [],
  icon = TrendingUpIcon,
  iconColor = "#0891b2",
}) => {


  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 1,
        border: `1px solid ${alpha(color, 0.2)}`,
        overflow: "hidden",
        boxShadow: "0 4px 18px rgba(0,0,0,.08)",
      }}
    >
      <CardContent sx={{ height: '100%' }}>
        <Box
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}
        >
          <Box>
            <Typography
              variant="h5"
              fontWeight={700}
              sx={{ color }}
            >
              {value}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
              mt={1}
            >
              {title}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: "50%",
              border: `2px solid ${color}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {React.cloneElement(icon, {
              sx: { color: iconColor, fontSize: 24 },
            })}
          </Box>
        </Box>
      </CardContent>

      <Box
        sx={{
          bgcolor: color,
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 3,
          py: 1.25,
        }}
      >
        <Typography component="div" variant="body2" sx={{ display: "flex", gap: 0.5, alignItems: "center", flexWrap: "wrap" }}>
          {badges.map((badge, index) => (
            <Chip
              key={index}
              label={badge}
              size="small"
              sx={{ bgcolor: alpha(color, 0.2), color: "text.primary", mr: 0.5 }}
            />
          ))}
        </Typography>

      </Box>
    </Card>
  );
}

export default MetricCard