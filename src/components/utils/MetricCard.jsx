import React from "react"
import { Card, CardContent, Typography, Box, Chip } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"

const MetricCard = ({
  value,
  title,
  color = "primary",
  badges = [],
  icon = TrendingUpIcon,
}) => {
  const theme = useTheme()
  const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(color)
  const mainColor = isHex ? color : theme.palette[color]?.main || color

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 1,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        transition: "box-shadow 0.2s ease, transform 0.2s ease",
        "&:hover": {
          boxShadow: theme.palette.mode === "dark"
            ? "0 8px 24px rgba(0,0,0,0.35)"
            : "0 6px 20px rgba(0,0,0,0.08)",
          transform: "translateY(-1px)",
        },
      }}
    >
      <CardContent sx={{ height: '100%', '&:last-child': { pb: 2 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h5"
              sx={{
                color: mainColor,
                fontWeight: 700,
                lineHeight: 1.2,
              }}
            >
              {value}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={600}
              mt={0.75}
            >
              {title}
            </Typography>
          </Box>

          {icon && (
            <Box sx={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
              {React.cloneElement(icon, {
                sx: { color: mainColor, fontSize: 42, fontWeight: 700 },
              })}
            </Box>
          )}
        </Box>

        {badges.length > 0 && (
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 0.75,
              mt: 2,
            }}
          >
            {badges.map((badge, index) => (
              <Chip
                key={index}
                label={badge}
                size="small"
                sx={{
                  height: 24,
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  bgcolor: alpha(mainColor, 0.1),
                  color: mainColor,
                  border: "1px solid",
                  borderColor: alpha(mainColor, 0.25),
                  "& .MuiChip-label": {
                    px: 1,
                  },
                }}
              />
            ))}
          </Box>
        )}
      </CardContent>
    </Card>
  )
}

export default MetricCard
