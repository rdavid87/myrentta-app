import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import api from "../services/api"

const Register = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: "",
    user_id: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    setLoading(true)
    try {
      await api.post("/auth/register", {
        full_name: form.full_name,
        user_id: form.user_id,
        email: form.email || undefined,
        phone: form.phone,
        password: form.password,
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || "Error al registrarse")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
        <div className="relative w-full max-w-md text-center">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-20"></div>
          <div className="relative bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-8 shadow-2xl">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">¡Registro exitoso!</h2>
            <p className="text-gray-400 mb-6">
              Tu cuenta está pendiente de activación. El administrador revisará tu solicitud y te notificará cuando esté lista.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold hover:shadow-cyan-500/30 hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14" />
              </svg>
              Volver al login
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="relative w-full max-w-md">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur-xl opacity-20"></div>

        <div className="relative bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-lg shadow-emerald-500/30 mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Crear cuenta
            </h1>
            <p className="text-gray-400 mt-2 text-sm">Regístrate para empezar a usar MyRentta</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-3 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-sm">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            {/* Full name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Nombres completos <span className="text-rose-400">*</span></label>
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                placeholder="Juan Pérez García"
              />
            </div>

            {/* ID number */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Número de cédula <span className="text-rose-400">*</span></label>
              <input
                name="user_id"
                value={form.user_id}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                placeholder="1234567890"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Número de teléfono <span className="text-rose-400">*</span></label>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                placeholder="3001234567"
              />
            </div>

            {/* Email (optional) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">
                Correo electrónico <span className="text-gray-500 text-xs">(opcional)</span>
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                placeholder="correo@ejemplo.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Contraseña <span className="text-rose-400">*</span></label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-4 pr-12 py-3 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-300">Confirmar contraseña <span className="text-rose-400">*</span></label>
              <input
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={form.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
                placeholder="Repite tu contraseña"
              />
            </div>

            <div className="pt-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <p className="text-amber-400/80 text-xs flex items-start gap-2">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Tu cuenta quedará pendiente de activación. El administrador la habilitará luego de confirmar tu pago.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl
                       font-semibold shadow-lg hover:shadow-emerald-500/40 transition-all duration-300
                       hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <span className="flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Registrando...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Crear cuenta
                  </>
                )}
              </span>
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-700/50 text-center">
            <p className="text-gray-400 text-sm">
              ¿Ya tienes cuenta?{" "}
              <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
