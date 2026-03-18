import { useNavigate } from 'react-router-dom'
import { Card } from '@/components/ui/Card'
import { MapPin, Calendar } from 'lucide-react'
import { formatDate } from '@/utils/formatters'
import type { Project } from '@/lib/supabase'

export function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate()

  return (
    <Card
      className="cursor-pointer hover:border-accent/40 transition-colors"
    >
      <div onClick={() => navigate(`/proyecto/${project.id}/resumen`)}>
        <h3 className="font-heading font-semibold text-lg">{project.name}</h3>
        {project.address && (
          <p className="flex items-center gap-1.5 text-sm text-secondary mt-1">
            <MapPin size={14} /> {project.address}
          </p>
        )}
        <p className="flex items-center gap-1.5 text-xs text-secondary mt-2">
          <Calendar size={12} /> {formatDate(project.created_at)}
        </p>
        <div className="flex gap-4 mt-3 text-xs text-secondary">
          <span>TC Blue: <span className="font-mono text-primary">{project.usd_rate_blue}</span></span>
        </div>
      </div>
    </Card>
  )
}
