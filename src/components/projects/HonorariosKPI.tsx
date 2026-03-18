import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type { ProjectWithStats } from '@/lib/api/projects'
import { formatCompact } from '@/lib/formatUtils'
import type { User } from '@/lib/supabase'

interface HonorariosKPIProps {
  projects: ProjectWithStats[]
  user: User
}

function calcHonorarios(projects: ProjectWithStats[], dirPct: number, proyPct: number): number {
  return projects.reduce((sum, p) => {
    const honDir = p.totalPresupuestado * (dirPct / 100)
    const honProy = p.totalPresupuestado * (proyPct / 100)
    return sum + honDir + honProy
  }, 0)
}

export function HonorariosKPI({ projects, user }: HonorariosKPIProps) {
  const [visible, setVisible] = useState(() => {
    const stored = localStorage.getItem('hitos_show_honorarios')
    return stored === null ? true : stored === 'true'
  })

  const toggle = () => {
    const next = !visible
    setVisible(next)
    localStorage.setItem('hitos_show_honorarios', String(next))
  }

  if (!visible) {
    return (
      <div className="bg-card border border-border rounded-xl shadow-card hover:shadow-card-hover hover:border-border-strong transition-all p-5 relative">
        <button
          onClick={toggle}
          className="absolute top-3 right-3 p-1 text-muted hover:text-secondary transition-colors"
          title="Mostrar honorarios"
        >
          <EyeOff size={14} />
        </button>
        <p className="text-[13px] text-muted">Honorarios ocultos</p>
        <p className="text-xs text-muted mt-0.5">Click en el ojo para mostrar</p>
      </div>
    )
  }

  const active = projects.filter((p) => p.estado !== 'finalizado')
  const total = calcHonorarios(active, user.honorario_direccion, user.honorario_proyecto)

  return (
    <div className="bg-card border border-border rounded-xl shadow-card hover:shadow-card-hover hover:border-border-strong transition-all p-5 relative">
      <button
        onClick={toggle}
        className="absolute top-3 right-3 p-1 text-muted hover:text-secondary transition-colors"
        title="Ocultar honorarios"
      >
        <Eye size={14} />
      </button>
      <p className="text-[28px] font-mono font-bold text-primary leading-tight">
        {formatCompact(total)}
      </p>
      <p className="text-[13px] text-secondary mt-1">
        honorarios proyectados
      </p>
      <p className="text-xs text-muted mt-0.5">
        {user.honorario_direccion}% dir. + {user.honorario_proyecto}% proy.
      </p>
    </div>
  )
}
