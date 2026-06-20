import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import Login from "./pages/Login"
import Register from "./pages/Register"
import ValidateOTP from "./pages/ValidateOTP"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import Dashboard from "./pages/Dashboard"
import Apartamentos from "./pages/Apartamentos"
import Arrendatarios from "./pages/Arrendatarios"
import Contratos from "./pages/Contratos"
import Pagos from "./pages/Pagos"
import Ayuda from "./pages/Ayuda"
import ShareTarget from "./pages/ShareTarget"
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/share" element={<ShareTarget />} />

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
            <Route path="/ayuda" element={<Ayuda />} />
            <Route path="/configuraciones" element={<Navigate to="/ayuda" replace />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
