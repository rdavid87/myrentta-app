import { useState, useEffect } from "react"
import api from "../services/api"

const Configuraciones = () => {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingEmail, setTestingEmail] = useState(false)
  const [formData, setFormData] = useState({
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
        if (String(cfg.clave).startsWith("arrendador_")) return
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
      const configuraciones = Object.fromEntries(
        Object.entries(formData).filter(([k]) => !k.startsWith("arrendador_"))
      )
      await api.put("/configuraciones", { configuraciones })
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
              Opciones de notificación y preferencias. Más abajo, ayuda sobre contratos, pagos y mora. Los recibos usan el nombre y datos de tu perfil de usuario.
            </p>
          </div>
        </div>

        <div className="mb-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500/15 to-violet-500/15 border-b border-gray-700/50 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl" aria-hidden>❓</span>
              Ayuda
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Contratos, pagos automáticos y verificación de mora
            </p>
          </div>
          <div className="p-4 sm:p-6 space-y-6 text-sm text-gray-300 leading-relaxed">
            <section>
              <h3 className="text-white font-semibold mb-2">Pagos y cuotas automáticas</h3>
              <p>
                La <strong className="text-gray-200 font-medium">creación de la cuota</strong> al guardar un contrato activo la resuelve el{" "}
                <strong className="text-gray-200 font-medium">servidor (API)</strong>: esta aplicación solo muestra lo que devuelve{" "}
                <strong className="text-gray-200 font-medium">Gestión de pagos</strong>. Al entrar en esa pantalla se cargan los pagos; si el API
                generó la fila, ya la verás en la tabla (sin lógica extra en el navegador).
              </p>
              <p className="mt-2">
                Esa cuota suele crearse según el <strong className="text-gray-200 font-medium">modo de cobro</strong> del contrato:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-400">
                <li>
                  <strong className="text-gray-200 font-medium">Cobro anticipado (mes adelantado):</strong> cuota del{" "}
                  <strong className="text-gray-200 font-medium">mes calendario siguiente</strong> a la fecha del contrato, si las fechas cubren al
                  menos un día de ese mes.
                </li>
                <li>
                  <strong className="text-gray-200 font-medium">Cobro a mes vencido (fin de mes):</strong> cuota del{" "}
                  <strong className="text-gray-200 font-medium">mes calendario actual</strong>, si el contrato cubre ese mes.
                </li>
              </ul>
              <p className="mt-2">
                El método de pago que asigne el API para esas filas automáticas debe ser{" "}
                <strong className="text-gray-200 font-medium">por definir</strong> (<code className="text-gray-400">por_definir</code>) hasta que
                registres el cobro con <strong className="text-gray-200 font-medium">Confirmar</strong> y elijas efectivo, transferencia o cheque.
              </p>
              <p className="mt-2">
                Si no aparece ningún pago, revisa en el backend las reglas de fechas o registra el pago manualmente con{" "}
                <strong className="text-gray-200 font-medium">Registrar pago</strong>.
              </p>
              <p className="mt-2">
                La columna <strong className="text-gray-200 font-medium">fecha de pago</strong> solo se llena al confirmar el cobro; mientras tanto verás
                guion. Los estados <strong className="text-gray-200 font-medium">pendiente</strong> y <strong className="text-gray-200 font-medium">en mora</strong>{" "}
                los define el API según la fecha límite del contrato (por ejemplo, el mismo día de creación de la fila puede no contarse como mora).
              </p>
            </section>
            <section>
              <h3 className="text-white font-semibold mb-2">Lista y contratos finalizados</h3>
              <p>
                Si el mismo arrendatario tiene un contrato <strong className="text-emerald-400/90 font-medium">activo</strong> en un apartamento,
                los contratos <strong className="text-gray-400 font-medium">finalizados</strong> anteriores en esa misma unidad no se listan en la tabla,
                para no duplicar filas. Si el finalizado era de <strong className="text-gray-200 font-medium">otro</strong> inquilino, ese historial sí sigue visible.
              </p>
            </section>
            <section>
              <h3 className="text-white font-semibold mb-2">Verificar mora</h3>
              <p>
                El botón <strong className="text-gray-200 font-medium">Verificar Mora</strong> está en la pantalla de{" "}
                <strong className="text-gray-200 font-medium">Pagos</strong>. Esa acción solo incluye contratos en estado{" "}
                <strong className="text-emerald-400/90 font-medium">activo</strong> (día de pago y pagos registrados).
                Los <strong className="text-gray-400 font-medium">finalizados</strong> no entran en el informe, aunque hubiera deudas pasadas.
                Puede haber <strong className="text-gray-200 font-medium">varias filas</strong> por el mismo contrato (una por cuota vencida no pagada).
                Los días de mora y el texto <strong className="text-gray-200 font-medium">periodo no pagado</strong> los calcula el API según la fecha límite
                de cada pago. Cuando el resultado indica cero mora, no hay canon vencido entre los activos según esa verificación.
              </p>
            </section>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Modo de Envío de Email - oculto, se maneja desde otro proyecto */}
          {false && <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden">
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
          </div>}

          {/* Configuración Resend/SMTP - oculta, se maneja desde otro proyecto */}

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
