import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ValidateOTP from "./pages/ValidateOTP"
import Dashboard from "./pages/Dashboard"
import Apartamentos from "./pages/Apartamentos"
import Arrendatarios from "./pages/Arrendatarios"
import Contratos from "./pages/Contratos"
import Pagos from "./pages/Pagos"
import Configuraciones from "./pages/Configuraciones"
import PrivateRoute from "./components/PrivateRoute"
import Layout from "./components/Layout"

function App() {
  return (
    <AuthProvider>
      <Router basename="/myrentta-app">
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/validate-otp" element={<ValidateOTP />} />

          {/* Protected routes */}
          <Route
            element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/apartamentos" element={<Apartamentos />} />
            <Route path="/arrendatarios" element={<Arrendatarios />} />
            <Route path="/contratos" element={<Contratos />} />
            <Route path="/pagos" element={<Pagos />} />
            <Route path="/configuraciones" element={<Configuraciones />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
