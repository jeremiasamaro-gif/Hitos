import { Select } from '@/components/ui/Select'
import type { ColumnMapping } from '@/lib/budgetUtils'

interface ColumnMapperProps {
  headers: string[]
  mapping: ColumnMapping
  onChange: (mapping: ColumnMapping) => void
}

const FIELDS: { key: keyof ColumnMapping; label: string; required: boolean }[] = [
  { key: 'codigo', label: 'Codigo', required: true },
  { key: 'descripcion', label: 'Descripcion', required: true },
  { key: 'unidad', label: 'Unidad', required: false },
  { key: 'cantidad', label: 'Cantidad', required: false },
  { key: 'rubro', label: 'Rubro', required: false },
  { key: 'precioUnitario', label: 'Precio unitario', required: false },
  { key: 'total', label: 'Total (opcional)', required: false },
]

export function ColumnMapper({ headers, mapping, onChange }: ColumnMapperProps) {
  const options = [{ value: '', label: '— No mapear —' }, ...headers.map((h) => ({ value: h, label: h }))]

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-secondary">Mapeo de columnas</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {FIELDS.map((field) => (
          <Select
            key={field.key}
            label={`${field.label}${field.required ? ' *' : ''}`}
            options={options}
            value={mapping[field.key]}
            onChange={(e) => onChange({ ...mapping, [field.key]: e.target.value })}
          />
        ))}
      </div>
    </div>
  )
}
