import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { X, Search } from 'lucide-react'
import { useParams } from 'react-router-dom'

interface ExpenseFiltersProps {
  searchQuery: string
  onSearchChange: (value: string) => void
}

export function ExpenseFilters({ searchQuery, onSearchChange }: ExpenseFiltersProps) {
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

  const hasFilters = filters.budgetItemId || filters.weekNumber || searchQuery

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
      <div className="flex-1 min-w-[200px]">
        <label className="text-sm text-secondary block mb-1">Buscar</label>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            placeholder="Buscar en todos los campos..."
            className="w-full bg-app border border-border rounded-lg pl-8 pr-3 py-2 text-sm"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setFilters({})
            onSearchChange('')
            if (projectId) fetchExpenses(projectId)
          }}
        >
          <X size={14} /> Limpiar
        </Button>
      )}
    </div>
  )
}
