import { useMemo, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { Card } from '@/components/ui/Card'
import { mockProjects, mockExpenses, mockComments, mockBudgetItems, mockProjectMembers } from '@/store/mockData'
import { parseISO, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

// SVG icons inline
function ExpenseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
      <rect x="2" y="5" width="20" height="14" rx="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  )
}

function CommentIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function ImportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  )
}

interface ActividadRecienteSectionProps {
  compact?: boolean
}

export function ActividadRecienteSection({ compact = false }: ActividadRecienteSectionProps) {
  const user = useAuthStore((s) => s.user)!
  const [showAll, setShowAll] = useState(false)

  const activities = useMemo(() => {
    type Activity = { id: string; icon: 'expense' | 'comment' | 'import'; text: string; projectName: string; date: string }
    const result: Activity[] = []

    // Get architect's project IDs
    const archProjectIds = mockProjectMembers
      .filter((m) => m.user_id === user.id)
      .map((m) => m.project_id)

    for (const exp of mockExpenses.filter((e) => archProjectIds.includes(e.project_id))) {
      const project = mockProjects.find((p) => p.id === exp.project_id)
      const item = mockBudgetItems.find((i) => i.id === exp.budget_item_id)
      result.push({
        id: `exp-${exp.id}`,
        icon: 'expense',
        text: `Gasto en ${item?.description || 'General'}`,
        projectName: project?.name || '',
        date: exp.created_at,
      })
    }

    for (const c of mockComments.filter((c) => archProjectIds.includes(c.project_id))) {
      const project = mockProjects.find((p) => p.id === c.project_id)
      const item = mockBudgetItems.find((i) => i.id === c.budget_item_id)
      result.push({
        id: `com-${c.id}`,
        icon: 'comment',
        text: `Comentario en ${item?.description || 'General'}`,
        projectName: project?.name || '',
        date: c.created_at,
      })
    }

    result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return result.slice(0, 20)
  }, [user.id])

  const iconMap = {
    expense: <ExpenseIcon />,
    comment: <CommentIcon />,
    import: <ImportIcon />,
  }

  const visibleLimit = compact && !showAll ? 10 : activities.length
  const visibleActivities = activities.slice(0, visibleLimit)

  return (
    <Card className={compact ? 'p-4' : 'p-6'}>
      <h3 className={`${compact ? 'text-sm' : 'text-base'} font-heading font-semibold mb-${compact ? '3' : '4'}`}>Actividad reciente</h3>
      <div className={compact ? 'space-y-1' : 'space-y-3'}>
        {visibleActivities.map((act) => (
          <div key={act.id} className={`flex items-start gap-2 ${compact ? 'py-1' : ''}`}>
            <div className="mt-0.5 shrink-0">{iconMap[act.icon]}</div>
            <div className="flex-1 min-w-0">
              <p className={`${compact ? 'text-[13px]' : 'text-sm'} truncate`}>
                {act.text} <span className="text-secondary">· {act.projectName}</span>
              </p>
              <p className="text-xs text-secondary">
                {formatDistanceToNow(parseISO(act.date), { addSuffix: true, locale: es })}
              </p>
            </div>
          </div>
        ))}
        {activities.length === 0 && (
          <p className="text-sm text-secondary">Sin actividad reciente</p>
        )}
        {compact && activities.length > 10 && !showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="text-xs text-accent hover:underline mt-2"
          >
            Ver más ({activities.length - 10} restantes)
          </button>
        )}
      </div>
    </Card>
  )
}
