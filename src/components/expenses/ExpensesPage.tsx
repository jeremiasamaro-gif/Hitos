import { useState } from 'react'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Settings2, Plus } from 'lucide-react'
import { useProjectContext } from '@/contexts/ProjectContext'
import { useWidgetLayout } from '@/hooks/useWidgetLayout'
import { WidgetContainer } from '@/components/dashboard/WidgetContainer'
import { WidgetCustomizer } from '@/components/dashboard/WidgetCustomizer'
import { ExpenseFilters } from './ExpenseFilters'
import { ExpenseTable } from './ExpenseTable'
import { ExpenseFormModal } from './ExpenseFormModal'
import { Button } from '@/components/ui/Button'

export function ExpensesPage() {
  const { project } = useProjectContext()
  const { order, reorder, toggleWidget, resetLayout } = useWidgetLayout(project.id, 'gastos')
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const [showCreate, setShowCreate] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorder(String(active.id), String(over.id))
    }
  }

  const WIDGET_COMPONENTS: Record<string, () => JSX.Element> = {
    gastos_filters: () => <ExpenseFilters searchQuery={searchQuery} onSearchChange={setSearchQuery} />,
    gastos_table: () => <ExpenseTable searchQuery={searchQuery} />,
    gastos_footer: () => <></>,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-heading font-bold">Gastos</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCustomizerOpen(true)}
            className="flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-hover"
          >
            <Settings2 size={14} />
            Personalizar
          </button>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus size={16} /> Nuevo Gasto
          </Button>
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
        section="gastos"
      />

      <ExpenseFormModal open={showCreate} onClose={() => setShowCreate(false)} />
    </div>
  )
}
