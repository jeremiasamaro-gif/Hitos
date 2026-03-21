import { useState } from 'react'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Settings2 } from 'lucide-react'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useCurrencyStore } from '@/store/currencyStore'
import { useProjectContext } from '@/contexts/ProjectContext'
import { useWidgetLayout } from '@/hooks/useWidgetLayout'
import { getExceededItems, getSavingItems, getProjectProjection } from '@/lib/analysis'
import { WidgetContainer } from '@/components/dashboard/WidgetContainer'
import { WidgetCustomizer } from '@/components/dashboard/WidgetCustomizer'
import { DeviationsByCategory } from './DeviationsByCategory'
import { HealthyItemsSection } from './HealthyItemsSection'
import { ProjectionCard } from './ProjectionCard'
import { ProgressComparativa } from './ProgressComparativa'
import { DesfasajesSection } from './DesfasajesSection'
import { SimuladorEscenarios } from './SimuladorEscenarios'
import { ProximosVencimientos } from './ProximosVencimientos'

export function AnalysisPage() {
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)
  const { project, globalProgress, totalBudget, totalSpent } = useProjectContext()
  const { mode, setMode } = useCurrencyStore()

  const { order, reorder, toggleWidget, resetLayout } = useWidgetLayout(project.id, 'analisis')
  const [customizerOpen, setCustomizerOpen] = useState(false)

  const exceededItems = getExceededItems(items, expenses)
  const savingItems = getSavingItems(items, expenses, globalProgress)
  const projection = getProjectProjection(expenses, totalBudget, totalSpent)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorder(String(active.id), String(over.id))
    }
  }

  const WIDGET_COMPONENTS: Record<string, () => JSX.Element> = {
    progress_comparativa: () => <ProgressComparativa />,
    desfasajes: () => <DesfasajesSection />,
    desfasajes_categoria: () => (
      <div>
        <h2 className="text-sm font-heading font-semibold text-secondary uppercase tracking-wider mb-4">
          Desfasajes por Categoria ({exceededItems.length})
        </h2>
        <DeviationsByCategory exceededItems={exceededItems} />
      </div>
    ),
    rubros_saludables: () => (
      <div>
        <h2 className="text-sm font-heading font-semibold text-secondary uppercase tracking-wider mb-4">
          Rubros Saludables ({savingItems.length})
        </h2>
        <HealthyItemsSection savingItems={savingItems} />
      </div>
    ),
    simulador: () => <SimuladorEscenarios />,
    proximos_vencimientos: () => <ProximosVencimientos />,
    proyeccion: () => <ProjectionCard projection={projection} totalBudget={totalBudget} />,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-heading font-bold">Analisis de Proyecto</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCustomizerOpen(true)}
            className="flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-hover"
          >
            <Settings2 size={14} />
            Personalizar
          </button>
          <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-0.5">
            <button
              onClick={() => setMode('ARS')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                mode === 'ARS' ? 'bg-accent text-white' : 'text-secondary hover:text-primary'
              }`}
            >
              ARS
            </button>
            <button
              onClick={() => setMode('USD_BLUE')}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                mode === 'USD_BLUE' ? 'bg-accent text-white' : 'text-secondary hover:text-primary'
              }`}
            >
              USD Blue
            </button>
          </div>
        </div>
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
        section="analisis"
      />
    </div>
  )
}
