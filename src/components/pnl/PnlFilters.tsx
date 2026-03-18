import { Select } from '@/components/ui/Select'

interface Props {
  categories: string[]
  selectedCategory: string
  onCategoryChange: (cat: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
}

export function PnlFilters({ categories, selectedCategory, onCategoryChange, selectedStatus, onStatusChange }: Props) {
  const categoryOptions = [
    { value: '', label: 'Todas las categorías' },
    ...categories.map((cat) => ({ value: cat, label: cat })),
  ]

  const statusOptions = [
    { value: '', label: 'Todos los estados' },
    { value: 'ok', label: 'OK' },
    { value: 'at_risk', label: 'En riesgo' },
    { value: 'exceeded', label: 'Excedido' },
  ]

  return (
    <div className="flex flex-wrap gap-3 mb-4">
      <Select
        label="Categoría"
        options={categoryOptions}
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
      />
      <Select
        label="Estado"
        options={statusOptions}
        value={selectedStatus}
        onChange={(e) => onStatusChange(e.target.value)}
      />
    </div>
  )
}
