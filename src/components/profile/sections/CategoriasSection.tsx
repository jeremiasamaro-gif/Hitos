import { useState } from 'react'
import { Layers } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { CategoryEditor } from '@/components/project/CategoryEditor'
import { mockProjects, mockProjectMembers } from '@/store/mockData'

interface CategoriasSectionProps {
  projectId?: string | null
}

export function CategoriasSection({ projectId: initialProjectId }: CategoriasSectionProps) {
  const user = useAuthStore((s) => s.user)!
  const [selectedProjectId, setSelectedProjectId] = useState(initialProjectId || '')

  // Get architect's projects
  const archProjectIds = mockProjectMembers
    .filter((m) => m.user_id === user.id && m.role === 'arquitecto')
    .map((m) => m.project_id)
  const archProjects = mockProjects.filter((p) => archProjectIds.includes(p.id))

  const projectId = selectedProjectId || ''

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Layers size={20} className="text-accent" />
        <h3 className="text-base font-heading font-semibold">Categorías del presupuesto</h3>
      </div>

      {!projectId ? (
        <div>
          <p className="text-sm text-secondary mb-3">
            Seleccioná un proyecto para editar sus categorías
          </p>
          <select
            className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            <option value="">Seleccionar proyecto...</option>
            {archProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      ) : (
        <div>
          {!initialProjectId && (
            <div className="mb-4">
              <select
                className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                {archProjects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
          <CategoryEditor projectId={projectId} />
        </div>
      )}
    </Card>
  )
}
