import { useState, useEffect } from "react"
import { Link, useNavigate, useSearchParams } from "react-router-dom"
import api from "../services/api"

const ValidateOTP = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const userLogin = searchParams.get("user_login")

  const [form, setForm] = useState({
    otp: "",
  })
  const [error, setError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [isValidUser, setIsValidUser] = useState(null)

  // Check if user_login is provided
  useEffect(() => {
    if (!userLogin) {
      setIsValidUser(false)
    } else {
      setIsValidUser(true)
    }
  }, [userLogin])

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setForm((prev) => ({ ...prev, otp: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (form.otp.length !== 6) {
      setError("El código OTP debe tener 6 dígitos")
      return
    }

    setLoading(true)
    try {
      const response = await api.post("/auth/validate-otp", {
        otp: form.otp,
        user_login: userLogin,
      })
      console.log("API response:", response.data) // Debug log

      // Only redirect on explicit success
      if (response.data?.status === "success") {
        navigate("/login", { 
          state: { 
            message: "Cuenta verificada exitosamente. Por favor, inicia sesión." 
          } 
        })
      } else if (response.data?.message) {
        // If API returns a message but not explicit success, treat as error
        setError(response.data.message)
      }else{
        setError("Código OTP inválido")
      }
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || "Código OTP inválido")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setError("")
    setLoading(true)
    try {
      await api.post("/auth/resend-otp", {
        user_login: userLogin,
      })
      setSuccessMessage("Se ha enviado un nuevo código OTP a tu teléfono")
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (err) {
      setError(err.response?.data?.error || "Error al reenviar el código OTP")
    } finally {
      setLoading(false)
    }
  }

  // Show error screen if no user_login
  if (isValidUser === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
        <div className="relative w-full max-w-md text-center">
          <div className="relative bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-rose-500/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Error de validación</h2>
            <p className="text-gray-400 mb-6">
              No se proporcionó el usuario para validar el código OTP.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-cyan-500/30 hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14" />
              </svg>
              Ir a registro
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show loading while checking user_login
  if (isValidUser === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
        <div className="relative w-full max-w-md text-center">
          <div className="relative bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <svg className="animate-spin w-10 h-10 text-cyan-500 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-gray-400 mt-4">Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur-xl opacity-20"></div>

        <div className="relative bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30 mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Verificar código OTP
            </h1>
            <p className="text-gray-400 mt-2 text-sm">
              Ingresa el código de 6 dígitos enviado a tu teléfono
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Success message */}
            {successMessage && (
              <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{successMessage}</span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* OTP Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Código OTP <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                name="otp"
                value={form.otp}
                onChange={handleChange}
                maxLength={6}
                required
                className="w-full px-4 py-4 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white text-center text-2xl tracking-[0.5em] font-mono placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all"
                placeholder="------"
                autoComplete="one-time-code"
              />
              <p className="text-gray-500 text-xs text-center">
                Ingresa los 6 dígitos del código enviado a tu número de teléfono
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || form.otp.length !== 6}
              className="group relative w-full py-3 sm:py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl
                       font-semibold shadow-lg hover:shadow-cyan-500/40 transition-all duration-300
                       hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verificando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    Verificar código
                  </>
                )}
              </span>
            </button>

            {/* Resend OTP */}
            <div className="text-center pt-2">
              <p className="text-gray-400 text-sm">
                ¿No recibiste el código?{" "}
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={loading}
                  className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors disabled:opacity-50"
                >
                  Reenviar código
                </button>
              </p>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700/50 text-center">
            <p className="text-gray-400 text-sm">
              ¿Algo salió mal?{" "}
              <Link to="/register" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Volver a registrar
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ValidateOTP
