import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { X } from 'lucide-react'
import { useParams } from 'react-router-dom'

export function ExpenseFilters() {
  const { id: projectId } = useParams<{ id: string }>()
  const items = useBudgetStore((s) => s.items)
  const { filters, setFilters, fetchExpenses } = useExpenseStore()

  const parents = items.filter((i) => !i.parent_id)
  const categoryOptions = [
    { value: '', label: 'Todos los rubros' },
    ...parents.map((p) => ({ value: p.id, label: p.description })),
  ]

  const weekOptions = [
    { value: '', label: 'Todas las semanas' },
    ...Array.from({ length: 20 }, (_, i) => ({
      value: String(i + 1),
      label: `Semana ${i + 1}`,
    })),
  ]

  const handleChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value || undefined }
    if (key === 'weekNumber') {
      newFilters.weekNumber = value ? parseInt(value) : undefined
    }
    setFilters(newFilters)
    if (projectId) fetchExpenses(projectId)
  }

  const hasFilters = filters.budgetItemId || filters.weekNumber || filters.provider

  return (
    <div className="flex flex-wrap gap-3 items-end">
      <Select
        label="Rubro"
        options={categoryOptions}
        value={filters.budgetItemId || ''}
        onChange={(e) => handleChange('budgetItemId', e.target.value)}
        className="w-44"
      />
      <Select
        label="Semana"
        options={weekOptions}
        value={filters.weekNumber ? String(filters.weekNumber) : ''}
        onChange={(e) => handleChange('weekNumber', e.target.value)}
        className="w-36"
      />
      <Input
        label="Proveedor"
        placeholder="Buscar..."
        value={filters.provider || ''}
        onChange={(e) => handleChange('provider', e.target.value)}
        className="w-40"
      />
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFilters({})
            if (projectId) fetchExpenses(projectId)
          }}
        >
          <X size={14} /> Limpiar
        </Button>
      )}
    </div>
  )
}
