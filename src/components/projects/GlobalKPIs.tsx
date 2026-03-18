import type { ProjectWithStats } from '@/lib/api/projects'
import type { User } from '@/lib/supabase'
import { formatCompact } from '@/lib/formatUtils'
import { HonorariosKPI } from './HonorariosKPI'

interface GlobalKPIsProps {
  projects: ProjectWithStats[]
  user?: User | null
}

export function GlobalKPIs({ projects, user }: GlobalKPIsProps) {
  const active = projects.filter((p) => p.estado === 'en-curso' || p.estado === 'con-alertas')
  const withAlerts = projects.filter((p) => p.rubrosExcedidos > 0)
  const totalBudget = active.reduce((s, p) => s + p.totalPresupuestado, 0)

  return (
    <div className={`grid grid-cols-1 gap-4 mb-8 ${user ? 'sm:grid-cols-4' : 'sm:grid-cols-3'}`}>
      {/* Card 1 — Proyectos activos */}
      <div className="bg-card border border-border rounded-xl shadow-card hover:shadow-card-hover hover:border-border-strong transition-all p-5">
        <p className="text-[28px] font-mono font-bold text-primary leading-tight">
          {active.length}
        </p>
        <p className="text-[13px] text-secondary mt-1">
          de {projects.length} totales
        </p>
        <p className="text-xs text-muted mt-0.5">Proyectos activos</p>
      </div>

      {/* Card 2 — Total en obra */}
      <div className="bg-card border border-border rounded-xl shadow-card hover:shadow-card-hover hover:border-border-strong transition-all p-5">
        <p className="text-[28px] font-mono font-bold text-primary leading-tight">
          {formatCompact(totalBudget)}
        </p>
        <p className="text-[13px] text-secondary mt-1">
          presupuesto combinado
        </p>
        <p className="text-xs text-muted mt-0.5">Total en obra</p>
      </div>

      {/* Card 3 — Con alertas */}
      <div className="bg-card border border-border rounded-xl shadow-card hover:shadow-card-hover hover:border-border-strong transition-all p-5">
        <p className={`text-[28px] font-mono font-bold leading-tight ${withAlerts.length > 0 ? 'text-status-exceeded' : 'text-status-ok'}`}>
          {withAlerts.length}
        </p>
        <p className="text-[13px] text-secondary mt-1">
          {withAlerts.length > 0 ? 'requieren atención' : 'todo en orden'}
        </p>
        <p className="text-xs text-muted mt-0.5">Proyectos con alertas</p>
      </div>

      {/* Card 4 — Honorarios (optional) */}
      {user && <HonorariosKPI projects={projects} user={user} />}
    </div>
  )
}
