import { useMemo } from 'react'
import type { User, PipelineEstado } from '@/lib/supabase'
import { PipelineCard } from './PipelineCard'
import { mockUsers } from '@/store/mockData'

interface PipelineKanbanProps {
  onUserClick: (user: User) => void
  onMove: (userId: string, newEstado: PipelineEstado) => void
}

const COLUMNS: { key: PipelineEstado; label: string; color: string }[] = [
  { key: 'registrado', label: 'Registrado', color: '#9CA3AF' },
  { key: 'activo', label: 'Activo', color: '#3B82F6' },
  { key: 'con_proyecto', label: 'Con proyecto', color: '#8B5CF6' },
  { key: 'pago', label: 'Pago', color: '#10B981' },
  { key: 'churned', label: 'Churned', color: '#EF4444' },
]

export function PipelineKanban({ onUserClick, onMove }: PipelineKanbanProps) {
  const usersByColumn = useMemo(() => {
    const map: Record<PipelineEstado, User[]> = {
      registrado: [],
      activo: [],
      con_proyecto: [],
      pago: [],
      churned: [],
    }
    for (const u of mockUsers) {
      if (u.role === 'admin') continue
      const col = u.pipeline_estado
      if (map[col]) map[col].push(u)
    }
    return map
  }, [])

  const handleDragStart = (e: React.DragEvent, userId: string) => {
    e.dataTransfer.setData('userId', userId)
  }

  const handleDrop = (e: React.DragEvent, column: PipelineEstado) => {
    e.preventDefault()
    const userId = e.dataTransfer.getData('userId')
    if (userId) onMove(userId, column)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="flex gap-3 overflow-x-auto pb-4" style={{ minHeight: 400 }}>
      {COLUMNS.map((col) => (
        <div
          key={col.key}
          className="w-60 shrink-0 bg-app border border-border rounded-lg overflow-hidden"
          onDrop={(e) => handleDrop(e, col.key)}
          onDragOver={handleDragOver}
        >
          {/* Column header */}
          <div className="px-3 py-2.5 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ background: col.color }} />
              <span className="text-sm font-medium">{col.label}</span>
            </div>
            <span className="text-xs text-secondary bg-border rounded-full w-5 h-5 flex items-center justify-center">
              {usersByColumn[col.key].length}
            </span>
          </div>
          {/* Cards */}
          <div className="p-2 space-y-2">
            {usersByColumn[col.key].map((user) => (
              <div
                key={user.id}
                draggable
                onDragStart={(e) => handleDragStart(e, user.id)}
              >
                <PipelineCard user={user} onClick={onUserClick} />
              </div>
            ))}
            {usersByColumn[col.key].length === 0 && (
              <p className="text-xs text-muted text-center py-4">Vacío</p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
