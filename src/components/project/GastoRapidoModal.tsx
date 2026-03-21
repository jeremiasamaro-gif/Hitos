import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useProjectContext } from '@/contexts/ProjectContext'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useAuthStore } from '@/store/authStore'
import type { TipoGasto } from '@/lib/supabase'

interface GastoRapidoModalProps {
  open: boolean
  onClose: () => void
}

const PAYMENT_METHODS = ['Transferencia', 'Efectivo', 'Cheque', 'Tarjeta']
const TIPO_GASTO_OPTIONS: { value: TipoGasto; label: string }[] = [
  { value: 'materiales', label: 'Materiales' },
  { value: 'mano_obra', label: 'Mano de obra' },
  { value: 'honorarios', label: 'Honorarios' },
  { value: 'varios', label: 'Varios' },
]

export function GastoRapidoModal({ open, onClose }: GastoRapidoModalProps) {
  const { project } = useProjectContext()
  const items = useBudgetStore((s) => s.items)
  const { createExpense } = useExpenseStore()
  const { user } = useAuthStore()

  const today = new Date().toISOString().split('T')[0]

  const [date, setDate] = useState(today)
  const [categoryId, setCategoryId] = useState('')
  const [subCategoryId, setSubCategoryId] = useState('')
  const [provider, setProvider] = useState('')
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Transferencia')
  const [tipoGasto, setTipoGasto] = useState<TipoGasto>('materiales')
  const [weekNumber, setWeekNumber] = useState('')
  const [saving, setSaving] = useState(false)

  const categories = useMemo(() => items.filter((i) => !i.parent_id), [items])
  const subcategories = useMemo(
    () => (categoryId ? items.filter((i) => i.parent_id === categoryId) : []),
    [items, categoryId]
  )

  if (!open) return null

  const handleSave = async () => {
    if (!amount || saving) return
    setSaving(true)
    try {
      await createExpense({
        project_id: project.id,
        budget_item_id: subCategoryId || categoryId || null,
        date,
        provider: provider || null,
        detail: null,
        amount_ars: parseFloat(amount),
        amount_usd: parseFloat(amount) / (project.usd_rate_blue || 1),
        exchange_rate: project.usd_rate_blue || null,
        payment_method: paymentMethod,
        week_number: weekNumber ? parseInt(weekNumber) : null,
        adjunto_url: null,
        tipo_gasto: tipoGasto,
        created_by: user?.id || '',
      })
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return createPortal(
    <>
      <div className="fixed inset-0 bg-black/40 z-[9998]" onClick={onClose} />
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl shadow-xl w-full max-w-lg">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-sm font-heading font-semibold">Registrar gasto rápido</h3>
            <button onClick={onClose} className="p-1 rounded hover:bg-hover text-secondary hover:text-primary">
              <X size={16} />
            </button>
          </div>

          <div className="p-4 grid grid-cols-2 gap-3">
            {/* Fecha */}
            <div>
              <label className="text-xs text-secondary mb-1 block">Fecha</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Categoría */}
            <div>
              <label className="text-xs text-secondary mb-1 block">Categoría</label>
              <select
                value={categoryId}
                onChange={(e) => { setCategoryId(e.target.value); setSubCategoryId('') }}
                className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm"
              >
                <option value="">Seleccionar...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.description}</option>
                ))}
              </select>
            </div>

            {/* Subcategoría */}
            <div>
              <label className="text-xs text-secondary mb-1 block">Subcategoría</label>
              <select
                value={subCategoryId}
                onChange={(e) => setSubCategoryId(e.target.value)}
                className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm"
                disabled={!categoryId}
              >
                <option value="">Seleccionar...</option>
                {subcategories.map((s) => (
                  <option key={s.id} value={s.id}>{s.description}</option>
                ))}
              </select>
            </div>

            {/* Proveedor */}
            <div>
              <label className="text-xs text-secondary mb-1 block">Proveedor</label>
              <input
                type="text"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                placeholder="Nombre del proveedor"
                className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Monto ARS */}
            <div>
              <label className="text-xs text-secondary mb-1 block">Monto ARS</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            {/* Método de pago */}
            <div>
              <label className="text-xs text-secondary mb-1 block">Método de pago</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Tipo de gasto */}
            <div>
              <label className="text-xs text-secondary mb-1 block">Tipo de gasto</label>
              <select
                value={tipoGasto}
                onChange={(e) => setTipoGasto(e.target.value as TipoGasto)}
                className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm"
              >
                {TIPO_GASTO_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            {/* Semana */}
            <div>
              <label className="text-xs text-secondary mb-1 block">Semana</label>
              <input
                type="number"
                min="1"
                value={weekNumber}
                onChange={(e) => setWeekNumber(e.target.value)}
                placeholder="Nro. semana"
                className="w-full bg-app border border-border rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 p-4 border-t border-border">
            <Button variant="ghost" size="sm" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving || !amount}>
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        </div>
      </div>
    </>,
    document.body
  )
}
