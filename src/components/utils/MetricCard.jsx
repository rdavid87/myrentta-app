import React from "react"

const MetricCard = ({
  title,
  value,
  icon,
  iconColor = "emerald",
  trend,
  trendText,
  progressWidth,
  badges,
}) => {
  const colorClasses = {
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
    amber: "bg-amber-500/10 border-amber-500/20 text-amber-400",
    cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400",
    rose: "bg-rose-500/10 border-rose-500/20 text-rose-400",
    fuchsia: "bg-fuchsia-500/10 border-fuchsia-500/20 text-fuchsia-400",
    indigo: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
  }
  const color = colorClasses[iconColor] || colorClasses.emerald

  return (
    <div className="w-full max-w-sm bg-gray-800/50 backdrop-blur-sm border border-gray-800/40 rounded-2xl p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
      {/* Bloque Superior: Texto e Icono */}
      <div className="flex justify-between items-start mb-4">
        <div>
          {/* Título de la Métrica */}
          <span className="text-xs font-medium text-gray-400 tracking-wide block mb-1">
            {title}
          </span>
          {/* Valor Principal */}
          <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
          {/* Badges opcionales */}
          {badges && badges.length > 0 && (
            <div className="mt-2 flex gap-2 text-xs flex-wrap">
              {badges.map((badge, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 rounded-lg ${
                    idx === 0
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-amber-500/20 text-amber-300"
                  }`}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Contenedor del Icono */}
        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>

      {/* Bloque Central: Tendencia y Comparativa */}
      {trend && trendText && (
        <div className="flex items-center gap-1.5 text-xs mb-5">
          {/* Icono de tendencia (Flecha hacia arriba) */}
          <span className="text-emerald-400 text-sm font-bold">↗</span>
          {/* Porcentaje */}
          <span className="font-semibold text-emerald-400">{trend}</span>
          {/* Texto secundario */}
          <span className="text-gray-500">{trendText}</span>
        </div>
      )}

      {/* Bloque Inferior: Barra de Progreso Acoplada */}
      {progressWidth !== undefined && (
        <div className="w-full h-1.5 bg-gray-800/50 rounded-full overflow-hidden">
          {/* Relleno de la barra (Ancho variable según el valor) */}
          <div
            className="h-full bg-emerald-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all duration-500"
            style={{ width: `${progressWidth}%` }}
          ></div>
        </div>
      )}
    </div>
  )
}

export default MetricCard
