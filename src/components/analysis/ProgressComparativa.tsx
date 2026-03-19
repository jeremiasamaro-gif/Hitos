import { useState } from 'react'
import { useProjectContext } from '@/contexts/ProjectContext'
import { mockProjects } from '@/store/mockData'

export function ProgressComparativa() {
  const { project, totalBudget, totalSpent } = useProjectContext()

  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState('')

  const physicalProgress = project.avance_fisico ?? 0
  const financialProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  const handleStartEdit = () => {
    setEditValue(String(physicalProgress))
    setEditing(true)
  }

  const handleSave = () => {
    const val = Math.min(100, Math.max(0, Number(editValue) || 0))
    const idx = mockProjects.findIndex((p) => p.id === project.id)
    if (idx >= 0) {
      mockProjects[idx] = { ...mockProjects[idx], avance_fisico: val }
    }
    setEditing(false)
  }

  const showAlert = financialProgress > physicalProgress + 10

  return (
    <div>
      {/* Physical progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-primary">Avance físico (obra)</span>
          {editing ? (
            <input
              type="number"
              min={0}
              max={100}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
              autoFocus
              className="w-16 text-right text-sm border border-border rounded px-1 py-0.5 bg-card text-primary"
            />
          ) : (
            <button
              onClick={handleStartEdit}
              className="text-sm font-semibold text-accent cursor-pointer hover:underline"
            >
              {physicalProgress.toFixed(0)}%
            </button>
          )}
        </div>
        <div className="w-full h-6 rounded bg-border overflow-hidden">
          <div
            className="h-full rounded bg-accent transition-all"
            style={{ width: `${Math.min(100, physicalProgress)}%` }}
          />
        </div>
      </div>

      {/* Financial progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-medium text-primary">Avance financiero (dinero gastado)</span>
          <span className="text-sm font-semibold" style={{ color: '#06B6D4' }}>
            {financialProgress.toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-6 rounded bg-border overflow-hidden">
          <div
            className="h-full rounded transition-all"
            style={{ width: `${Math.min(100, financialProgress)}%`, backgroundColor: '#06B6D4' }}
          />
        </div>
      </div>

      {/* Alert */}
      {showAlert && (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            color: '#DC2626',
          }}
          className="rounded-lg p-3 text-sm"
        >
          El gasto financiero está por delante del avance físico de la obra.
          Revisar posibles desfasajes en rubros o anticipos excesivos.
        </div>
      )}
    </div>
  )
}
