import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getProjectsWithStats, type ProjectWithStats } from '@/lib/api/projects'

export function MisProyectosSection() {
  const user = useAuthStore((s) => s.user)!
  const navigate = useNavigate()
  const [projects, setProjects] = useState<ProjectWithStats[]>([])

  useEffect(() => {
    getProjectsWithStats(user.id).then(setProjects)
  }, [user.id])

  const fmt = (n: number) => `$${(n / 1_000_000).toFixed(1)}M`

  return (
    <Card className="p-6">
      <h3 className="text-base font-heading font-semibold mb-4">Mis Proyectos</h3>

      {projects.length === 0 ? (
        <p className="text-sm text-secondary">Sin proyectos asignados</p>
      ) : (
        <div className="space-y-4">
          {projects.map((p) => (
            <div
              key={p.id}
              className="p-3 rounded-lg border border-border hover:border-accent/40 cursor-pointer transition-colors"
              onClick={() => navigate(`/proyecto/${p.id}/resumen`)}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="font-medium text-sm">{p.name}</p>
                  {p.address && <p className="text-xs text-secondary">{p.address}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {p.badges.map((b) => (
                    <Badge
                      key={b}
                      variant={
                        b === 'Con alertas' ? 'danger'
                          : b === 'Finalizado' ? 'success'
                          : 'accent'
                      }
                    >
                      {b}
                    </Badge>
                  ))}
                  <ExternalLink size={14} className="text-accent" />
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-border rounded-full h-1.5 mb-2">
                <div
                  className={`h-1.5 rounded-full transition-all ${
                    p.pctEjecutado > 100 ? 'bg-status-exceeded' : p.pctEjecutado > 80 ? 'bg-yellow-500' : 'bg-accent'
                  }`}
                  style={{ width: `${Math.min(p.pctEjecutado, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-secondary">
                <span>Presupuestado: {fmt(p.totalPresupuestado)}</span>
                <span>Gastado: {fmt(p.totalGastado)} ({p.pctEjecutado.toFixed(1)}%)</span>
              </div>

              {p.rubrosExcedidosDetalle.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.rubrosExcedidosDetalle.map((r) => (
                    <span key={r.nombre} className="text-[11px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400">
                      {r.nombre} +{r.pctExcedente.toFixed(0)}%
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
