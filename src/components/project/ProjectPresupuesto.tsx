import { useState, useMemo, useCallback } from 'react'
import { Eye, Settings2 } from 'lucide-react'
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useProjectContext } from '@/contexts/ProjectContext'
import { useBudgetStore } from '@/store/budgetStore'
import { useWidgetLayout } from '@/hooks/useWidgetLayout'
import { buildTree } from '@/lib/budgetUtils'
import { BudgetTable } from '@/components/budget/BudgetTable'
import { BudgetRowForm } from '@/components/budget/BudgetRowForm'
import { BudgetImporter } from '@/components/budget/BudgetImporter'
import { CargarDropdown } from '@/components/budget/CargarDropdown'
import { WidgetContainer } from '@/components/dashboard/WidgetContainer'
import { WidgetCustomizer } from '@/components/dashboard/WidgetCustomizer'
import { Button } from '@/components/ui/Button'
import type { BudgetItem } from '@/lib/supabase'

type ViewMode = 'table' | 'load'
type LoadMode = 'manual' | 'import-xlsx' | 'import-csv' | null

export function ProjectPresupuesto() {
  const { project, currencyMode, convert } = useProjectContext()
  const { items, updateItem, deleteItem, createItem } = useBudgetStore()
  const { order, reorder, toggleWidget, resetLayout } = useWidgetLayout(project.id, 'presupuesto')
  const [customizerOpen, setCustomizerOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [loadMode, setLoadMode] = useState<LoadMode>(null)

  const tree = useMemo(() => buildTree(items), [items])

  const handleAdd = useCallback(
    async (data: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>) => {
      await createItem(data)
    },
    [createItem]
  )

  const handleBatchImport = useCallback(
    async (batch: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>[]) => {
      for (const item of batch) {
        await createItem(item)
      }
    },
    [createItem]
  )

  const handleAddChild = useCallback(
    (_parentId: string) => {
      setViewMode('load')
      setLoadMode('manual')
    },
    []
  )

  const handleCargarSelect = useCallback((mode: 'manual' | 'xlsx' | 'csv') => {
    setViewMode('load')
    if (mode === 'manual') setLoadMode('manual')
    else if (mode === 'xlsx') setLoadMode('import-xlsx')
    else setLoadMode('import-csv')
  }, [])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorder(String(active.id), String(over.id))
    }
  }

  const isImportMode = loadMode === 'import-xlsx' || loadMode === 'import-csv'

  const WIDGET_COMPONENTS: Record<string, () => JSX.Element> = {
    presupuesto_table: () => (
      <>
        {viewMode === 'table' && (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <BudgetTable
              tree={tree}
              allItems={items}
              currencyMode={currencyMode}
              convert={convert}
              onUpdate={updateItem}
              onDelete={deleteItem}
              onAddChild={handleAddChild}
              onInlineAdd={handleAdd}
              projectId={project.id}
            />
          </div>
        )}

        {viewMode === 'load' && loadMode === 'manual' && (
          <div className="bg-card rounded-xl border border-border p-6">
            <BudgetRowForm allItems={items} projectId={project.id} onAdd={handleAdd} />
            <div className="mt-6 pt-6 border-t border-border">
              <h4 className="text-sm font-semibold text-secondary mb-3">Items actuales</h4>
              <BudgetTable
                tree={tree}
                allItems={items}
                currencyMode={currencyMode}
                convert={convert}
                onUpdate={updateItem}
                onDelete={deleteItem}
                onAddChild={handleAddChild}
              />
            </div>
          </div>
        )}

        {viewMode === 'load' && isImportMode && (
          <div className="bg-card rounded-xl border border-border p-6">
            <BudgetImporter
              existingItems={items}
              projectId={project.id}
              onImport={handleBatchImport}
              onCancel={() => { setViewMode('table'); setLoadMode(null) }}
            />
          </div>
        )}
      </>
    ),
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCustomizerOpen(true)}
            className="flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors px-2 py-1 rounded-lg hover:bg-hover"
          >
            <Settings2 size={14} />
            Personalizar
          </button>
          {viewMode === 'table' ? (
            <CargarDropdown onSelect={handleCargarSelect} />
          ) : (
            <Button variant="secondary" size="sm" onClick={() => { setViewMode('table'); setLoadMode(null) }}>
              <Eye size={14} />
              Ver tabla
            </Button>
          )}
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
        section="presupuesto"
      />
    </div>
  )
}
