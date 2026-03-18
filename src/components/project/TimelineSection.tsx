import { useMemo } from 'react'
import { useProjectContext } from '@/contexts/ProjectContext'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import {
  getCurrentPhase,
  getProjectedEndDateWithBudget,
  getDaysRemaining,
  buildCategoryTimeline,
  formatDateEs,
  type CategoryTimeline,
} from '@/lib/timelineUtils'
import { format } from 'date-fns'

const statusDotColor: Record<string, string> = {
  done: 'bg-status-ok',
  active: 'bg-accent',
  pending: 'bg-border',
  exceeded: 'bg-status-exceeded',
}

const statusBadgeVariant: Record<string, 'success' | 'warning' | 'danger' | 'accent' | 'default'> = {
  done: 'success',
  active: 'accent',
  pending: 'default',
  exceeded: 'danger',
}

function DaysRemainingLabel({ days }: { days: number }) {
  if (days > 0) {
    return <span className="text-accent font-medium">Faltan {days} dias</span>
  }
  if (days === 0) {
    return <span className="text-status-warning font-medium">Finaliza hoy</span>
  }
  return <span className="text-status-exceeded font-medium">Atrasado {Math.abs(days)} dias</span>
}

function ProjectionLabel({
  projected,
  estimated,
}: {
  projected: Date | null
  estimated: Date
}) {
  if (!projected) return null

  const diff = getDaysRemaining(estimated) - getDaysRemaining(projected)

  if (diff < 0) {
    const delayDays = Math.abs(diff)
    return (
      <p className="text-xs text-status-warning mt-1">
        Proyeccion: {formatDateEs(projected)} (+{delayDays} dias de retraso)
      </p>
    )
  }

  return (
    <p className="text-xs text-status-ok mt-1">
      En fecha
    </p>
  )
}

function MiniTimeline({ categories }: { categories: CategoryTimeline[] }) {
  if (categories.length === 0) return null

  return (
    <div className="overflow-x-auto mt-4 pb-2">
      <div className="flex items-start gap-4 min-w-max px-1">
        {categories.map((cat) => {
          const dotColor =
            cat.pctEjecutado >= 80
              ? 'bg-status-ok'
              : cat.isActive
                ? 'bg-accent'
                : cat.status === 'exceeded'
                  ? 'bg-status-exceeded'
                  : 'bg-border'

          return (
            <div key={cat.id} className="flex flex-col items-center gap-1 relative">
              <div className={`w-3 h-3 rounded-full ${dotColor} shrink-0`} />
              {cat.isActive && (
                <span className="text-[10px] text-accent font-medium absolute -top-4">
                  Aqui
                </span>
              )}
              <span className="text-[12px] text-secondary leading-tight text-center max-w-[72px] truncate">
                {cat.name}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function TimelineSection() {
  const { project, totalBudget, totalSpent } = useProjectContext()
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)

  const endDateEstimated = project.end_date_estimated
    ? new Date(project.end_date_estimated)
    : null

  const daysRemaining = endDateEstimated ? getDaysRemaining(endDateEstimated) : null

  const projectedEnd = useMemo(
    () => getProjectedEndDateWithBudget(project, totalBudget, totalSpent),
    [project, totalBudget, totalSpent]
  )

  const currentPhase = useMemo(
    () => getCurrentPhase(items, expenses),
    [items, expenses]
  )

  const timeline = useMemo(
    () => buildCategoryTimeline(items, expenses),
    [items, expenses]
  )

  const activeCategory = timeline.find((c) => c.isActive)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Card 1 - Fecha estimada */}
      <Card className="p-4">
        <h3 className="text-xs text-secondary font-medium mb-2">Fecha estimada</h3>
        {endDateEstimated ? (
          <>
            <p className="text-base font-medium">{formatDateEs(endDateEstimated)}</p>
            {daysRemaining !== null && (
              <p className="text-sm mt-1">
                <DaysRemainingLabel days={daysRemaining} />
              </p>
            )}
            <ProjectionLabel projected={projectedEnd} estimated={endDateEstimated} />
          </>
        ) : (
          <p className="text-sm text-secondary">Sin fecha estimada</p>
        )}
      </Card>

      {/* Card 2 - Fase actual */}
      <Card className="p-4">
        <h3 className="text-xs text-secondary font-medium mb-2">Fase actual</h3>
        <p className="text-base font-medium">
          Fase actual: {currentPhase}
        </p>
        {activeCategory && (
          <div className="mt-1">
            <Badge variant={statusBadgeVariant[activeCategory.status] ?? 'default'}>
              {activeCategory.status === 'done'
                ? 'Completado'
                : activeCategory.status === 'active'
                  ? 'En progreso'
                  : activeCategory.status === 'exceeded'
                    ? 'Excedido'
                    : 'Pendiente'}
            </Badge>
          </div>
        )}
        <MiniTimeline categories={timeline} />
      </Card>
    </div>
  )
}
