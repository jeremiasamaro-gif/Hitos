import { useState } from 'react'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Settings2 } from 'lucide-react'
import { useProjectContext } from '@/contexts/ProjectContext'
import { useWidgetLayout } from '@/hooks/useWidgetLayout'
import { WidgetContainer } from './WidgetContainer'
import { WidgetCustomizer } from './WidgetCustomizer'
import { KpiCards } from './KpiCards'
import { ProgressBar } from './ProgressBar'
import { BudgetVsSpentChart } from './BudgetVsSpentChart'
import { ExpenseDistributionChart } from './ExpenseDistributionChart'
import { MonthlySpendingChart } from './MonthlySpendingChart'
import { AlertCards } from './AlertCards'
import { ExportPDFButton } from '@/components/ui/ExportPDFButton'
import { TimelineSection } from '@/components/project/TimelineSection'

const WIDGET_COMPONENTS: Record<string, () => JSX.Element> = {
  kpi: () => <KpiCards />,
  progress: () => <ProgressBar />,
  timeline: () => <TimelineSection />,
  budgetVsSpent: () => <BudgetVsSpentChart />,
  monthlySpending: () => <MonthlySpendingChart />,
  expenseDistribution: () => <ExpenseDistributionChart />,
  alerts: () => <AlertCards />,
}

export function DashboardPage() {
  const { project } = useProjectContext()
  const { order, reorder, toggleWidget, resetLayout } = useWidgetLayout(project.id)
  const [customizerOpen, setCustomizerOpen] = useState(false)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorder(String(active.id), String(over.id))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-heading font-bold">Resumen</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCustomizerOpen(true)}
            className="flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-hover"
          >
            <Settings2 size={14} />
            Personalizar
          </button>
          <ExportPDFButton variant="completo" />
        </div>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <div className="space-y-4">
            {order.map((widgetId) => {
              const Component = WIDGET_COMPONENTS[widgetId]
              if (!Component) return null
              return (
                <WidgetContainer key={widgetId} id={widgetId}>
                  <Component />
                </WidgetContainer>
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      <WidgetCustomizer
        open={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        activeWidgets={order}
        onToggle={toggleWidget}
        onReset={resetLayout}
      />
    </div>
  )
}
