import { useState, useMemo, useCallback } from 'react'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Settings2 } from 'lucide-react'
import { useProjectContext } from '@/contexts/ProjectContext'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useWidgetLayout } from '@/hooks/useWidgetLayout'
import { WidgetContainer } from '@/components/dashboard/WidgetContainer'
import { WidgetCustomizer } from '@/components/dashboard/WidgetCustomizer'
import {
  getMonthColumns,
  groupItemsWithTotals,
  groupMonthsIntoQuarters,
  groupMonthsIntoYears,
} from './pnlUtils'
import { buildColumns, type PeriodMode } from './PNLHeader'
import { PNLTable } from './PNLTable'

export function ProjectPNL() {
  const { project, currencyMode, convert } = useProjectContext()
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)

  const { order, reorder, toggleWidget, resetLayout } = useWidgetLayout(project.id, 'pnl')
  const [customizerOpen, setCustomizerOpen] = useState(false)

  const [period, setPeriod] = useState<PeriodMode>('monthly')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const months = useMemo(() => getMonthColumns(expenses), [expenses])

  const columns = useMemo(
    () => buildColumns(months, period, groupMonthsIntoQuarters, groupMonthsIntoYears),
    [months, period]
  )

  const rows = useMemo(
    () => groupItemsWithTotals(items, expenses, months),
    [items, expenses, months]
  )

  const handleToggle = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorder(String(active.id), String(over.id))
    }
  }

  const periodTabs: { value: PeriodMode; label: string }[] = [
    { value: 'monthly', label: 'Mensual' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' },
  ]

  const WIDGET_COMPONENTS: Record<string, () => JSX.Element> = {
    pnl_period_selector: () => (
      <div className="flex items-center bg-card border border-border rounded-lg overflow-hidden w-fit">
        {periodTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setPeriod(tab.value)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              period === tab.value
                ? 'bg-accent text-white'
                : 'text-secondary hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    ),
    pnl_table: () => (
      <PNLTable
        rows={rows}
        columns={columns}
        collapsed={collapsed}
        onToggle={handleToggle}
        currencyMode={currencyMode}
        convert={convert}
      />
    ),
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-heading font-bold">Estado de Resultados</h1>
        <button
          onClick={() => setCustomizerOpen(true)}
          className="flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-hover"
        >
          <Settings2 size={14} />
          Personalizar
        </button>
      </div>

      {order.length === 0 ? (
        <div className="text-center py-12 text-secondary text-sm">
          <p>Todos los widgets están ocultos.</p>
          <button onClick={resetLayout} className="text-accent hover:underline mt-1">Restaurar por defecto</button>
        </div>
      ) : (
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
      )}

      <WidgetCustomizer
        open={customizerOpen}
        onClose={() => setCustomizerOpen(false)}
        activeWidgets={order}
        onToggle={toggleWidget}
        onReset={resetLayout}
        section="pnl"
      />
    </div>
  )
}
