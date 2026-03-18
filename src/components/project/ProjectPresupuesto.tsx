import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { Eye, PenLine, Plus, FileUp, ChevronDown } from 'lucide-react'
import { useProjectContext } from '@/contexts/ProjectContext'
import { useBudgetStore } from '@/store/budgetStore'
import { buildTree } from '@/lib/budgetUtils'
import { BudgetTable } from '@/components/budget/BudgetTable'
import { BudgetRowForm } from '@/components/budget/BudgetRowForm'
import { BudgetImporter } from '@/components/budget/BudgetImporter'
import { CargarDropdown } from '@/components/budget/CargarDropdown'
import { Button } from '@/components/ui/Button'
import type { BudgetItem } from '@/lib/supabase'

type ViewMode = 'table' | 'load'
type LoadMode = 'manual' | 'import-xlsx' | 'import-csv' | null

export function ProjectPresupuesto() {
  const { project, currencyMode, convert } = useProjectContext()
  const { items, updateItem, deleteItem, createItem } = useBudgetStore()
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

  const isImportMode = loadMode === 'import-xlsx' || loadMode === 'import-csv'

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-heading font-bold">Presupuesto</h1>
        <div className="flex items-center gap-2">
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

      {/* Table view */}
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

      {/* Manual load view */}
      {viewMode === 'load' && loadMode === 'manual' && (
        <div className="bg-card rounded-xl border border-border p-6">
          <BudgetRowForm allItems={items} projectId={project.id} onAdd={handleAdd} />
          {/* Show table below for reference */}
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

      {/* Import view */}
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
    </div>
  )
}
