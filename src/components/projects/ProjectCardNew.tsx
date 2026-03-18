import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { MapPin, Calendar } from 'lucide-react'
import type { ProjectWithStats, RubroExcedidoDetalle } from '@/lib/api/projects'
import { formatCompact } from '@/lib/formatUtils'
import { formatDate } from '@/utils/formatters'

// ── Badge styles ──
const BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'En curso':    { bg: 'bg-[#EEF2FF]', text: 'text-[#4F46E5]', border: 'border-[#C7D2FE]' },
  'Con alertas': { bg: 'bg-[#FFFBEB]', text: 'text-[#D97706]', border: 'border-[#FDE68A]' },
  'Finalizado':  { bg: 'bg-[#F0FDF4]', text: 'text-[#16A34A]', border: 'border-[#BBF7D0]' },
}

function BadgeList({ badges }: { badges: string[] }) {
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      {badges.map((label) => {
        const s = BADGE_STYLES[label] || BADGE_STYLES['En curso']
        return (
          <span key={label} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${s.bg} ${s.text} ${s.border}`}>
            {label}
          </span>
        )
      })}
    </div>
  )
}

// ── Progress bar color ──
function getBarColor(pct: number): string {
  if (pct >= 100) return 'bg-status-ok'
  if (pct >= 80) return 'bg-status-warning'
  return 'bg-accent'
}

// ── Exceeded rubros tooltip ──
function ExceededTooltip({ detalle }: { detalle: RubroExcedidoDetalle[] }) {
  const [show, setShow] = useState(false)

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      <span className="flex items-center gap-1 text-xs text-status-exceeded cursor-default">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-status-exceeded" />
        {detalle.length} rubro{detalle.length > 1 ? 's' : ''} excedido{detalle.length > 1 ? 's' : ''}
      </span>

      {/* Tooltip */}
      <span
        className="absolute z-50 pointer-events-none"
        style={{
          bottom: 'calc(100% + 10px)',
          left: '50%',
          transform: `translateX(-50%) translateY(${show ? '0' : '4px'})`,
          opacity: show ? 1 : 0,
          transition: 'opacity 0.15s ease, transform 0.15s ease',
        }}
      >
        <span
          className="block relative"
          style={{
            background: '#1A1A18',
            color: '#fff',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            minWidth: '220px',
          }}
        >
          <span
            className="block uppercase tracking-wider mb-1.5"
            style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em' }}
          >
            Rubros excedidos
          </span>
          {detalle.map((r, i) => (
            <span key={i} className="flex items-center justify-between gap-3 py-0.5">
              <span style={{ fontSize: '13px', color: '#fff' }} className="truncate">{r.nombre}</span>
              <span style={{ fontSize: '13px', color: '#FCA5A5', fontWeight: 500 }} className="shrink-0">
                +{Math.round(r.pctExcedente)}%
              </span>
            </span>
          ))}
          {/* Triangle pointing down */}
          <span
            style={{
              position: 'absolute',
              bottom: '-6px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #1A1A18',
            }}
          />
        </span>
      </span>
    </span>
  )
}

interface ProjectCardNewProps {
  project: ProjectWithStats
}

export function ProjectCardNew({ project }: ProjectCardNewProps) {
  const navigate = useNavigate()
  const [animatedPct, setAnimatedPct] = useState(0)

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setAnimatedPct(Math.min(project.pctEjecutado, 100))
    })
    return () => cancelAnimationFrame(timer)
  }, [project.pctEjecutado])

  return (
    <div
      onClick={() => navigate(`/proyecto/${project.id}/resumen`)}
      className="bg-card border border-border rounded-xl shadow-card hover:shadow-card-hover hover:border-border-strong cursor-pointer transition-all duration-150 ease-in-out p-5 min-h-[180px] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-bold text-primary leading-snug line-clamp-2">
          {project.name}
        </h3>
        <BadgeList badges={project.badges} />
      </div>

      {/* Address */}
      {project.address && (
        <p className="flex items-center gap-1.5 text-[13px] text-secondary mt-2">
          <MapPin size={14} className="shrink-0" />
          <span className="truncate">{project.address}</span>
        </p>
      )}

      {/* Metadata row */}
      <p className="flex items-center gap-1 text-xs text-muted mt-1.5">
        <Calendar size={12} className="shrink-0" />
        <span>{formatDate(project.created_at)}</span>
        <span className="mx-1">·</span>
        <span>Semana {project.semanaDeObra} de obra</span>
      </p>

      {/* Separator */}
      <div className="border-t border-border my-3" />

      {/* Progress */}
      <div className="flex-1 flex flex-col justify-end">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-secondary">Avance</span>
          <span className={`text-xs font-mono font-medium ${project.pctEjecutado >= 100 ? 'text-status-ok' : 'text-accent'}`}>
            {project.pctEjecutado.toFixed(1)}%
          </span>
        </div>

        {/* Bar */}
        <div className="h-1.5 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${getBarColor(project.pctEjecutado)} transition-all duration-[600ms] ease-out`}
            style={{ width: `${animatedPct}%` }}
          />
        </div>

        {/* Exceeded warning with tooltip */}
        {project.rubrosExcedidos > 0 && project.rubrosExcedidosDetalle.length > 0 && (
          <div className="mt-1.5">
            <ExceededTooltip detalle={project.rubrosExcedidosDetalle} />
          </div>
        )}

        {/* Amounts */}
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-sm font-bold text-primary font-mono">
            {formatCompact(project.totalGastado)}
          </span>
          <span className="text-sm text-secondary font-mono">
            / {formatCompact(project.totalPresupuestado)}
          </span>
        </div>

        {/* Footer — Exchange rates */}
        <p className="text-[11px] text-muted font-mono mt-2">
          TC Blue: {project.usd_rate_blue}
        </p>
      </div>
    </div>
  )
}
