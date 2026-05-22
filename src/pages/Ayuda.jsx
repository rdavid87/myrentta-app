const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL?.trim() || "soporte@myrentta.com"

const SUPPORT_PHONE_DISPLAY =
  import.meta.env.VITE_SUPPORT_PHONE_DISPLAY?.trim() || "+57 300 123 4567"

const whatsappDigits = (
  import.meta.env.VITE_SUPPORT_WHATSAPP?.trim() || "573001234567"
).replace(/\D/g, "")

const whatsappUrl = whatsappDigits
  ? `https://wa.me/${whatsappDigits}?text=${encodeURIComponent(
      "Hola, necesito ayuda con MyRentta."
    )}`
  : null

const Ayuda = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 sm:mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl blur-xl opacity-20" />
          <div className="relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-4 sm:p-6 shadow-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <svg
                className="w-8 h-8 sm:w-9 sm:h-9 text-violet-400 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Ayuda y soporte
            </h1>
            <p className="text-sm sm:text-base text-gray-400">
              Estamos disponibles para resolver tus dudas sobre la plataforma.
            </p>
          </div>
        </div>

        <div className="group relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 rounded-3xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-500" />
          <article className="relative bg-gray-800/60 backdrop-blur-md border border-gray-700/60 rounded-3xl shadow-2xl overflow-hidden">
            <div className="h-1.5 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400" />

            <div className="p-6 sm:p-10 text-center">
              <div className="mx-auto mb-6 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center">
                <span className="text-4xl sm:text-5xl" aria-hidden>
                  💬
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">
                ¿Necesitas asistencia?
              </h2>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed max-w-md mx-auto mb-2">
                Si tienes preguntas, reportas un inconveniente o requieres orientación sobre
                contratos, pagos o el uso de MyRentta, nuestro equipo de soporte te atenderá con
                gusto.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed max-w-md mx-auto mb-8">
                Cada solicitud se registra y se le da el trámite correspondiente hasta resolver tu
                inquietud. Te responderemos lo antes posible.
              </p>

              <div className="space-y-4 max-w-sm mx-auto">
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
                    "Soporte MyRentta"
                  )}&body=${encodeURIComponent(
                    "Hola,\n\nNecesito ayuda con:\n\n[Describe tu consulta]\n\nGracias."
                  )}`}
                  className="flex items-center gap-4 w-full p-4 rounded-2xl bg-gray-700/40 border border-gray-600/50
                           hover:border-violet-500/50 hover:bg-violet-500/10 transition-all duration-300 group/btn text-left"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-500/20 text-violet-300 group-hover/btn:scale-105 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs text-gray-400 uppercase tracking-wider mb-0.5">
                      Correo electrónico
                    </span>
                    <span className="block text-white font-medium truncate">{SUPPORT_EMAIL}</span>
                    <span className="block text-violet-300/80 text-xs mt-0.5">
                      Envíanos tu consulta por email
                    </span>
                  </span>
                </a>

                {whatsappUrl ? (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-4 w-full p-4 rounded-2xl bg-gray-700/40 border border-gray-600/50
                             hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all duration-300 group/btn text-left"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300 group-hover/btn:scale-105 transition-transform">
                      <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs text-gray-400 uppercase tracking-wider mb-0.5">
                        WhatsApp
                      </span>
                      <span className="block text-white font-medium">{SUPPORT_PHONE_DISPLAY}</span>
                      <span className="block text-emerald-300/80 text-xs mt-0.5">
                        Escríbenos y te atenderemos por chat
                      </span>
                    </span>
                  </a>
                ) : null}
              </div>

              <p className="mt-8 pt-6 border-t border-gray-700/50 text-xs text-gray-500 leading-relaxed">
                Horario de atención sujeto a disponibilidad del equipo. Incluye en tu mensaje el
                mayor detalle posible para agilizar la solución.
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  )
}

export default Ayuda
