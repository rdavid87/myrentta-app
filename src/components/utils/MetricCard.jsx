import React from "react"
import { Card, CardContent, Typography, Box, Chip } from "@mui/material"
import { alpha, useTheme } from "@mui/material/styles"
import TrendingUpIcon from "@mui/icons-material/TrendingUp"

const MetricCard = ({
  value,
  title,
  color = "primary",
  badges = [],
  icon = <TrendingUpIcon />,
}) => {
  const theme = useTheme()
  const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(color)
  const mainColor = isHex ? color : theme.palette[color]?.main || theme.palette.primary.main

  return (
    <Card
      elevation={0}
      variant="outlined"
      sx={{
        height: "100%",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        borderRadius: 2.5,
        borderColor: "divider",
        borderLeft: 4,
        borderLeftColor: mainColor,
        bgcolor: "background.default",
        backgroundImage: (t) =>
          `linear-gradient(135deg, ${alpha(mainColor, t.palette.mode === "dark" ? 0.12 : 0.08)} 0%, transparent 60%)`,
        boxShadow: "none",
        overflow: "hidden",
        transition: "transform 0.15s ease, border-color 0.15s ease, background-color 0.15s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          borderColor: alpha(mainColor, 0.55),
        },
      }}
    >
      <CardContent
        sx={{
          height: "100%",
          p: { xs: 1.75, sm: 2 },
          "&:last-child": { pb: { xs: 1.75, sm: 2 } },
          minWidth: 0,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 1.5,
            minWidth: 0,
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
            <Typography
              variant="caption"
              sx={{
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                fontWeight: 700,
                color: "text.secondary",
                display: "block",
                mb: 0.75,
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: mainColor,
                fontWeight: 800,
                lineHeight: 1.15,
                fontSize: { xs: "1.35rem", sm: "1.5rem" },
                wordBreak: "break-word",
              }}
            >
              {value}
            </Typography>
          </Box>

          {icon && (
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: mainColor,
                bgcolor: alpha(mainColor, theme.palette.mode === "dark" ? 0.2 : 0.12),
                border: 1,
                borderColor: alpha(mainColor, 0.35),
                boxShadow: `0 0 0 3px ${alpha(mainColor, 0.08)}`,
              }}
            >
              {React.cloneElement(icon, {
                sx: { color: mainColor, fontSize: 24 },
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
              pt: 1.5,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            {badges.map((badge, index) => (
              <Chip
                key={index}
                label={badge}
                size="small"
                sx={{
                  height: 24,
                  maxWidth: "100%",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  bgcolor: alpha(mainColor, 0.1),
                  color: mainColor,
                  border: "1px solid",
                  borderColor: alpha(mainColor, 0.28),
                  "& .MuiChip-label": {
                    px: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
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
