"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import Box from "@mui/material/Box"
import Typography from "@mui/material/Typography"
import CircularProgress from "@mui/material/CircularProgress"

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography>Cargando...</Typography>
        </Box>
      </Box>
    )
  }

  return user ? children : <Navigate to="/login" replace />
}

export default PrivateRoute