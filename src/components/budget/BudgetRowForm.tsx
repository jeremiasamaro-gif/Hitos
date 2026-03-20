import { useState, useMemo } from 'react'
import { Plus, RotateCcw } from 'lucide-react'
import type { BudgetItem } from '@/lib/supabase'
import { suggestNextCode } from '@/lib/budgetUtils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

type Level = 'category' | 'subcategory' | 'item'

interface BudgetRowFormProps {
  allItems: BudgetItem[]
  projectId: string
  onAdd: (data: Omit<BudgetItem, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
}

const INITIAL = {
  level: 'item' as Level,
  parentId: '',
  description: '',
  unit: '',
  quantity: '',
  rubro: '',
  unitPrice: '',
}

export function BudgetRowForm({ allItems, projectId, onAdd }: BudgetRowFormProps) {
  const [form, setForm] = useState(INITIAL)
  const [saving, setSaving] = useState(false)

  const categories = useMemo(
    () => allItems.filter((i) => !i.parent_id),
    [allItems]
  )

  const subcategories = useMemo(
    () => allItems.filter((i) => i.parent_id && categories.some((c) => c.id === i.parent_id)),
    [allItems, categories]
  )

  // For subcategory level, parent is a category; for item level, parent is a subcategory
  const parentOptions = useMemo(() => {
    if (form.level === 'subcategory') {
      return categories.map((c) => ({ value: c.id, label: `${c.item_code} - ${c.description}` }))
    }
    if (form.level === 'item') {
      // Show subcategories grouped by category
      return subcategories.length > 0
        ? subcategories.map((s) => ({ value: s.id, label: `${s.item_code} - ${s.description}` }))
        : categories.map((c) => ({ value: c.id, label: `${c.item_code} - ${c.description}` }))
    }
    return []
  }, [form.level, categories, subcategories])

  const suggestedCode = useMemo(() => {
    if (form.level === 'category') {
      return suggestNextCode(null, allItems)
    }
    if (!form.parentId) return ''
    const parent = allItems.find((i) => i.id === form.parentId)
    return parent ? suggestNextCode(parent.item_code, allItems) : ''
  }, [form.level, form.parentId, allItems])

  const total = useMemo(() => {
    const q = parseFloat(form.quantity) || 0
    const p = parseFloat(form.unitPrice) || 0
    return q * p
  }, [form.quantity, form.unitPrice])

  const handleSubmit = async () => {
    if (!form.description.trim()) return
    setSaving(true)
    try {
      const qty = parseFloat(form.quantity) || form.level !== 'item' ? 1 : 0
      const price = parseFloat(form.unitPrice) || 0
      await onAdd({
        project_id: projectId,
        parent_id: form.level === 'category' ? null : form.parentId || null,
        item_code: suggestedCode,
        description: form.description.trim(),
        unit: form.level === 'item' ? (form.unit || null) : 'gl',
        quantity: form.level === 'item' ? (parseFloat(form.quantity) || 0) : 1,
        rubro: form.rubro || null,
        unit_price: price,
        total_price: form.level === 'item' ? total : price,
        category: form.level === 'category' ? form.description.trim() : (allItems.find((i) => i.id === form.parentId)?.category || null),
        week_number: null,
      })
      setForm(INITIAL)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold">Carga manual</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Select
          label="Nivel"
          options={[
            { value: 'category', label: 'Categoria' },
            { value: 'subcategory', label: 'Subcategoria' },
            { value: 'item', label: 'Item' },
          ]}
          value={form.level}
          onChange={(e) => setForm({ ...form, level: e.target.value as Level, parentId: '' })}
        />

        {form.level !== 'category' && (
          <Select
            label={form.level === 'subcategory' ? 'Categoria padre' : 'Subcategoria padre'}
            options={[{ value: '', label: 'Seleccionar...' }, ...parentOptions]}
            value={form.parentId}
            onChange={(e) => setForm({ ...form, parentId: e.target.value })}
          />
        )}

        <Input label="Codigo (sugerido)" value={suggestedCode} readOnly className="opacity-70" />

        <Input
          label="Descripcion"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Ej: Excavacion para fundaciones"
        />

        {form.level === 'item' && (
          <>
            <Input
              label="Unidad"
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value })}
              placeholder="m2, ml, gl, un"
            />
            <Input
              label="Cantidad"
              type="number"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            />
          </>
        )}

        <Input
          label="Rubro"
          value={form.rubro}
          onChange={(e) => setForm({ ...form, rubro: e.target.value })}
          placeholder="Ej: Excavaciones"
        />

        <Input
          label="Precio unitario"
          type="number"
          value={form.unitPrice}
          onChange={(e) => setForm({ ...form, unitPrice: e.target.value })}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm text-secondary">Total</label>
          <div className="rounded-lg bg-app border border-border px-3 py-2 text-sm font-mono opacity-70">
            {total.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSubmit} disabled={saving || !form.description.trim()} size="sm">
          <Plus size={14} />
          {saving ? 'Agregando...' : 'Agregar item'}
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setForm(INITIAL)}>
          <RotateCcw size={14} />
          Limpiar
        </Button>
      </div>
    </div>
  )
}
