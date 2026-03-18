import { useState } from 'react'
import type { ProjectWithStats } from '@/lib/api/projects'
import { ProjectCardNew } from './ProjectCardNew'
import { EmptyState } from './EmptyState'

type FilterOption = 'todos' | 'En curso' | 'Con alertas' | 'Finalizado'

const FILTERS: { value: FilterOption; label: string }[] = [
  { value: 'todos', label: 'Todos' },
  { value: 'En curso', label: 'En curso' },
  { value: 'Con alertas', label: 'Con alertas' },
  { value: 'Finalizado', label: 'Finalizados' },
]

interface ProjectGridProps {
  projects: ProjectWithStats[]
  onCreateProject: () => void
}

export function ProjectGrid({ projects, onCreateProject }: ProjectGridProps) {
  const [filter, setFilter] = useState<FilterOption>('todos')

  if (projects.length === 0) {
    return <EmptyState onCreateProject={onCreateProject} />
  }

  const filtered = filter === 'todos'
    ? projects
    : projects.filter((p) => p.badges.includes(filter))

  return (
    <div>
      {/* Filter chips */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f.value
                ? 'bg-accent text-white'
                : 'bg-card border border-border text-secondary hover:text-primary hover:border-border-strong'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <p className="text-center py-12 text-secondary">
          No hay proyectos con el filtro seleccionado
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProjectCardNew key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  )
}
