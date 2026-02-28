import { useState, useEffect } from "react"
import api from "../services/api"

const Configuraciones = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [formData, setFormData] = useState({
    arrendador_nombre: "",
    arrendador_documento: "",
    arrendador_direccion: "",
    arrendador_ciudad: "",
    arrendador_telefono: "",
    arrendador_email: "",
    email_modo: "plataforma",
    resend_api_key: "",
    smtp_host: "smtp.gmail.com",
    smtp_port: "465",
    smtp_user: "",
    smtp_password: "",
    smtp_from_name: "",
    enviar_email_auto: "false",
  })

  useEffect(() => {
    fetchConfiguraciones()
  }, [])

  const fetchConfiguraciones = async () => {
    try {
      const { data } = await api.get("/configuraciones")
      // Convertir array de configuraciones a objeto
      const configObj = {}
      data?.forEach(cfg => {
        configObj[cfg.clave] = cfg.valor
      })
      setFormData(prev => ({ ...prev, ...configObj }))
    } catch (error) {
      console.error("Error fetching configuraciones:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.put("/configuraciones", {
        configuraciones: formData
      })
      alert("✅ Configuraciones guardadas exitosamente")
    } catch (error) {
      console.error("Error saving configuraciones:", error)
      alert("Error al guardar: " + (error.response?.data?.error || error.message))
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-slate-500"></div>
      </div>
    )
  }

  const isSmtpMode = formData.email_modo === "smtp_propio"

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800/50 to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-500 to-zinc-500 rounded-2xl blur-xl opacity-20"></div>
          <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sm:p-6 shadow-2xl">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-300 to-zinc-300 bg-clip-text text-transparent mb-2">
              ⚙️ Configuraciones
            </h1>
            <p className="text-sm sm:text-base text-gray-400">
              Configura los datos del arrendador y opciones de notificación
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos del Arrendador */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-slate-500/20 to-zinc-500/20 border-b border-gray-700/50 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">👤</span>
                Datos del Arrendador
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Estos datos aparecerán en los recibos de arriendo
              </p>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    Nombre Completo *
                  </label>
                  <input
                    type="text"
                    value={formData.arrendador_nombre || ""}
                    onChange={(e) => handleChange("arrendador_nombre", e.target.value)}
                    placeholder="Juan Pérez García"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500/50 
                             transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    C.C. / NIT *
                  </label>
                  <input
                    type="text"
                    value={formData.arrendador_documento || ""}
                    onChange={(e) => handleChange("arrendador_documento", e.target.value)}
                    placeholder="1234567890"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500/50 
                             transition-all duration-300"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  value={formData.arrendador_direccion || ""}
                  onChange={(e) => handleChange("arrendador_direccion", e.target.value)}
                  placeholder="Calle 123 # 45-67, Barrio Centro"
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                           placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500/50 
                           transition-all duration-300"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={formData.arrendador_ciudad || ""}
                    onChange={(e) => handleChange("arrendador_ciudad", e.target.value)}
                    placeholder="Bogotá"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500/50 
                             transition-all duration-300"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.arrendador_telefono || ""}
                    onChange={(e) => handleChange("arrendador_telefono", e.target.value)}
                    placeholder="3001234567"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500/50 
                             transition-all duration-300"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.arrendador_email || ""}
                    onChange={(e) => handleChange("arrendador_email", e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500/50 
                             transition-all duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Modo de Envío de Email */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-zinc-500/20 to-slate-500/20 border-b border-gray-700/50 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">📬</span>
                Modo de Envío de Recibos
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                Elige cómo quieres enviar los recibos por email
              </p>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Selector de Modo */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opción Plataforma */}
                <div 
                  onClick={() => handleChange("email_modo", "plataforma")}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300
                    ${formData.email_modo === "plataforma" 
                      ? "border-slate-400 bg-slate-500/10" 
                      : "border-gray-600/50 hover:border-gray-500"}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${formData.email_modo === "plataforma" ? "border-slate-400" : "border-gray-500"}`}>
                      {formData.email_modo === "plataforma" && (
                        <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                      )}
                    </div>
                    <span className="text-white font-semibold">🌐 Email de Plataforma</span>
                  </div>
                  <p className="text-gray-400 text-sm ml-8">
                    Los emails se envían desde la plataforma (Resend). Simple y rápido.
                  </p>
                  <p className="text-slate-300 text-xs ml-8 mt-2">
                    Remitente: notificaciones@plataforma.com
                  </p>
                </div>

                {/* Opción SMTP Propio */}
                <div 
                  onClick={() => handleChange("email_modo", "smtp_propio")}
                  className={`cursor-pointer p-4 rounded-xl border-2 transition-all duration-300
                    ${formData.email_modo === "smtp_propio" 
                      ? "border-slate-400 bg-slate-500/10" 
                      : "border-gray-600/50 hover:border-gray-500"}`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                      ${formData.email_modo === "smtp_propio" ? "border-slate-400" : "border-gray-500"}`}>
                      {formData.email_modo === "smtp_propio" && (
                        <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                      )}
                    </div>
                    <span className="text-white font-semibold">📧 Mi Email Personal (SMTP)</span>
                  </div>
                  <p className="text-gray-400 text-sm ml-8">
                    Los emails se envían desde tu correo personal (Gmail, Outlook, etc.)
                  </p>
                  <p className="text-slate-300 text-xs ml-8 mt-2">
                    Remitente: tu_correo@gmail.com
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Configuración según modo seleccionado */}
          {!isSmtpMode ? (
            /* Configuración Resend (Plataforma) */
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-b border-gray-700/50 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  Configuración Resend (Plataforma)
                </h2>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    API Key de Resend
                  </label>
                  <input
                    type="password"
                    value={formData.resend_api_key || ""}
                    onChange={(e) => handleChange("resend_api_key", e.target.value)}
                    placeholder="re_xxxxxxxxxx"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 
                             transition-all duration-300"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Obtén tu API Key en{" "}
                    <a href="https://resend.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">
                      resend.com
                    </a>
                    {" "}(gratis hasta 3,000 emails/mes)
                  </p>
                </div>

                {!formData.resend_api_key && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <p className="text-amber-300 text-sm flex items-center gap-2">
                      <span>⚠️</span>
                      Sin API Key, los recibos solo podrán descargarse manualmente
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Configuración SMTP */
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
              <div className="bg-gradient-to-r from-slate-500/20 to-zinc-500/20 border-b border-gray-700/50 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">🔧</span>
                  Configuración SMTP (Tu Email)
                </h2>
                <p className="text-sm text-gray-400 mt-1">
                  Configura tu servidor de correo personal
                </p>
              </div>

              <div className="p-4 sm:p-6 space-y-4">
                {/* Servidor y Puerto */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                      Servidor SMTP *
                    </label>
                    <select
                      value={formData.smtp_host || "smtp.gmail.com"}
                      onChange={(e) => {
                        const host = e.target.value
                        handleChange("smtp_host", host)
                        // Auto-configurar puerto
                        if (host === "smtp.gmail.com") handleChange("smtp_port", "465")
                        else if (host === "smtp.office365.com") handleChange("smtp_port", "587")
                        else if (host === "smtp-mail.outlook.com") handleChange("smtp_port", "587")
                      }}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                               focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-400/50 
                               transition-all duration-300"
                    >
                      <option value="smtp.gmail.com" className="bg-gray-800">Gmail (smtp.gmail.com)</option>
                      <option value="smtp.office365.com" className="bg-gray-800">Office 365 (smtp.office365.com)</option>
                      <option value="smtp-mail.outlook.com" className="bg-gray-800">Outlook (smtp-mail.outlook.com)</option>
                      <option value="smtp.yahoo.com" className="bg-gray-800">Yahoo (smtp.yahoo.com)</option>
                      <option value="otro" className="bg-gray-800">Otro servidor...</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                      Puerto *
                    </label>
                    <input
                      type="number"
                      value={formData.smtp_port || "465"}
                      onChange={(e) => handleChange("smtp_port", e.target.value)}
                      placeholder="465"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                               placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-400/50 
                               transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Email y Contraseña */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                      Tu Email *
                    </label>
                    <input
                      type="email"
                      value={formData.smtp_user || ""}
                      onChange={(e) => handleChange("smtp_user", e.target.value)}
                      placeholder="tucorreo@gmail.com"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                               placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-400/50 
                               transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                      Contraseña de Aplicación *
                    </label>
                    <input
                      type="password"
                      value={formData.smtp_password || ""}
                      onChange={(e) => handleChange("smtp_password", e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                               placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-400/50 
                               transition-all duration-300"
                    />
                  </div>
                </div>

                {/* Nombre del remitente */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                    Nombre del Remitente (opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.smtp_from_name || ""}
                    onChange={(e) => handleChange("smtp_from_name", e.target.value)}
                    placeholder="Juan Pérez Arriendos"
                    className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-800/50 border border-gray-600/50 rounded-xl text-white text-sm
                             placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-400/50 
                             transition-all duration-300"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Este nombre aparecerá como remitente en los emails
                  </p>
                </div>

                {/* Instrucciones para contraseña de aplicación */}
                <div className="p-4 bg-slate-400/10 border border-slate-400/30 rounded-xl">
                  <h4 className="text-slate-300 font-semibold text-sm mb-2">📝 ¿Cómo obtener contraseña de aplicación en Gmail?</h4>
                  <ol className="text-gray-400 text-xs space-y-1 list-decimal list-inside">
                    <li>Ve a <a href="https://myaccount.google.com/security" target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:underline">myaccount.google.com/security</a></li>
                    <li>Activa la verificación en 2 pasos si no la tienes</li>
                    <li>Busca "Contraseñas de aplicaciones"</li>
                    <li>Crea una nueva contraseña para "Correo"</li>
                    <li>Copia la contraseña de 16 caracteres y pégala arriba</li>
                  </ol>
                </div>

                {/* Validación */}
                {(!formData.smtp_user || !formData.smtp_password) && (
                  <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                    <p className="text-amber-300 text-sm flex items-center gap-2">
                      <span>⚠️</span>
                      Completa email y contraseña para poder enviar desde tu correo
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Opciones adicionales */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-gray-600/20 to-gray-700/20 border-b border-gray-700/50 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🎛️</span>
                Opciones Adicionales
              </h2>
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 p-4 bg-gray-700/30 rounded-xl">
                <input
                  type="checkbox"
                  id="enviar_email_auto"
                  checked={formData.enviar_email_auto === "true"}
                  onChange={(e) => handleChange("enviar_email_auto", e.target.checked ? "true" : "false")}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-emerald-500 focus:ring-emerald-500"
                />
                <label htmlFor="enviar_email_auto" className="text-gray-300 text-sm">
                  Enviar recibo automáticamente por email al confirmar un pago
                </label>
              </div>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-slate-500 to-zinc-500 text-white rounded-xl
                       font-semibold shadow-lg hover:shadow-slate-500/50 transition-all duration-300
                       hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                       disabled:hover:scale-100 text-sm sm:text-base"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Guardar Configuraciones
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Configuraciones
