import { periodoRangoDesdeMesAnio } from "../utils/periodoCuota"

/** Misma regla que la tabla de Pagos; prioriza mes/año numéricos del API sobre el texto `mes_pago`. */
function etiquetaPeriodoContratoMora(contrato) {
  const m = contrato.mes ?? contrato.mes_cuota
  const a = contrato.anio ?? contrato.anio_cuota
  if (m != null && a != null) {
    const desdeNumeros = periodoRangoDesdeMesAnio(Number(m), Number(a))
    if (desdeNumeros) return desdeNumeros
  }
  if (contrato.mes_pago && String(contrato.mes_pago).trim()) return String(contrato.mes_pago).trim()
  return null
}

/**
 * Modal de resultado de GET /notificaciones/verificar-mora y envío POST /notificaciones/enviar-mora.
 * Pensado para usarse desde la pantalla de Pagos (contexto de cuotas).
 */
export default function VerificarMoraResultModal({
  open,
  resultadoMora,
  onClose,
  onEnviarNotificaciones,
  enviandoNotificaciones,
}) {
  if (!open || !resultadoMora) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[200] overflow-y-auto">
      <div
        className="relative bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 rounded-3xl shadow-2xl 
                        max-w-lg w-full border border-purple-500/30 overflow-hidden my-4 max-h-[90vh] flex flex-col"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />

        <div className="relative p-6 sm:p-8 text-center flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-600/10 to-transparent" />
          <div className="relative inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-3">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full opacity-20 animate-pulse" />
            <div className="absolute inset-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full opacity-30" />
            <div className="relative text-3xl sm:text-4xl">
              {resultadoMora.enviado ? "✅" : resultadoMora.contratos_en_mora > 0 ? "⚠️" : "✅"}
            </div>
          </div>
          <h2 className="relative text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-1">
            {resultadoMora.enviado ? "Notificaciones Enviadas" : "Verificación de Mora"}
          </h2>
          <p className="relative text-gray-400 text-xs sm:text-sm">
            {new Date().toLocaleDateString("es-CO", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="px-6 sm:px-8 pb-4 space-y-4 overflow-y-auto flex-1">
          <div
            className={`border rounded-2xl p-4 sm:p-5 text-center ${
              resultadoMora.contratos_en_mora > 0
                ? "bg-gradient-to-br from-amber-500/20 to-orange-500/10 border-amber-500/30"
                : "bg-gradient-to-br from-emerald-500/20 to-green-500/10 border-emerald-500/30"
            }`}
          >
            <div
              className={`text-4xl sm:text-5xl font-bold mb-2 ${
                resultadoMora.contratos_en_mora > 0 ? "text-amber-400" : "text-emerald-400"
              }`}
            >
              {resultadoMora.contratos_en_mora}
            </div>
            <div
              className={`text-sm sm:text-base font-medium ${
                resultadoMora.contratos_en_mora > 0 ? "text-amber-300" : "text-emerald-300"
              }`}
            >
              {resultadoMora.contratos_en_mora === 1
                ? "Contrato en mora"
                : resultadoMora.contratos_en_mora === 0
                  ? "Sin mora detectada"
                  : "Contratos en mora"}
            </div>
          </div>

          {resultadoMora.contratos_en_mora === 0 && !resultadoMora.enviado && (
            <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center space-y-2">
              <div className="text-2xl mb-2">🎉</div>
              <p className="text-emerald-300 font-medium text-sm sm:text-base">
                No hay contratos activos con pagos vencidos
              </p>
              <p className="text-emerald-400/60 text-xs sm:text-sm mt-1">
                Entre los contratos en curso, los arrendatarios están al día según esta verificación.
              </p>
            </div>
          )}

          {resultadoMora.contratos_en_mora > 0 && !resultadoMora.enviado && resultadoMora.contratos && (
            <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-amber-300 mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Pendientes de notificación
              </h3>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {resultadoMora.contratos.map((contrato, index) => {
                  const periodoEtiqueta = etiquetaPeriodoContratoMora(contrato)
                  return (
                  <div key={contrato.contrato_id ?? index} className="bg-gray-900/50 rounded-xl p-3 border border-gray-700/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-white font-medium text-sm">{contrato.arrendatario_nombre}</p>
                        <p className="text-gray-400 text-xs">{contrato.apartamento_nombre}</p>
                        {periodoEtiqueta && (
                          <p className="text-amber-200/70 text-[11px] mt-1">Periodo: {periodoEtiqueta}</p>
                        )}
                        <p className="text-gray-500 text-xs mt-1">{contrato.arrendatario_email}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-2 py-1 bg-red-500/20 text-red-300 rounded-lg text-xs font-medium">
                          {contrato.dias_mora} {contrato.dias_mora === 1 ? "día" : "días"}
                        </span>
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            </div>
          )}

          {resultadoMora.enviado && (
            <>
              <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
                <div className="text-3xl sm:text-4xl font-bold text-emerald-400 mb-1">
                  {resultadoMora.notificaciones_enviadas || 0}
                </div>
                <div className="text-sm text-emerald-300">Notificaciones enviadas</div>
              </div>
              {resultadoMora.detalles && resultadoMora.detalles.length > 0 && (
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-4">
                  <h3 className="text-sm font-semibold text-emerald-300 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    Enviados exitosamente
                  </h3>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {resultadoMora.detalles.map((detalle, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs sm:text-sm">
                        <span className="text-emerald-400 mt-0.5">✓</span>
                        <span className="text-gray-300">{detalle}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {resultadoMora.errores && resultadoMora.errores.length > 0 && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4">
              <h3 className="text-sm font-semibold text-red-300 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Errores
              </h3>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {resultadoMora.errores.map((error, index) => (
                  <p key={index} className="text-xs sm:text-sm text-red-300/80">
                    • {error}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2 border-t border-gray-700/30 flex-shrink-0">
          {resultadoMora.contratos_en_mora === 0 || resultadoMora.enviado ? (
            <button
              type="button"
              onClick={onClose}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 
                           text-white rounded-2xl font-semibold shadow-lg shadow-purple-500/30
                           hover:shadow-purple-500/50 transition-all duration-300
                           hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
            >
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Cerrar
              </span>
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onEnviarNotificaciones}
                disabled={enviandoNotificaciones}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 
                             text-white rounded-2xl font-semibold shadow-lg shadow-emerald-500/30
                             hover:shadow-emerald-500/50 transition-all duration-300
                             hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base
                             disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="flex items-center justify-center gap-2">
                  {enviandoNotificaciones ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Enviando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Enviar Notificaciones
                    </>
                  )}
                </span>
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={enviandoNotificaciones}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl font-semibold
                             transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base
                             disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />
      </div>
    </div>
  )
}
