import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { useExpenseStore } from '@/store/expenseStore'
import { useBudgetStore } from '@/store/budgetStore'
import { useCurrencyStore } from '@/store/currencyStore'
import { useAuthStore } from '@/store/authStore'
import { useParams } from 'react-router-dom'
import type { Expense } from '@/lib/supabase'
import { ImpersonationWriteError } from '@/lib/api/impersonationGuard'

interface Props {
  open: boolean
  onClose: () => void
  expense?: Expense | null
  duplicateMode?: boolean
}

export function ExpenseFormModal({ open, onClose, expense, duplicateMode }: Props) {
  const { id: projectId } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const items = useBudgetStore((s) => s.items)
  const { createExpense, updateExpense } = useExpenseStore()
  const latestRate = useCurrencyStore((s) => s.latestRate)

  const parents = items.filter((i) => !i.parent_id)
  const isEdit = !!expense && !duplicateMode

  const [date, setDate] = useState(expense?.date || new Date().toISOString().split('T')[0])
  const [budgetItemId, setBudgetItemId] = useState(expense?.budget_item_id || '')
  const [provider, setProvider] = useState(expense?.provider || '')
  const [detail, setDetail] = useState(expense?.detail || '')
  const [amountArs, setAmountArs] = useState(expense?.amount_ars?.toString() || '')
  const [amountUsd, setAmountUsd] = useState(expense?.amount_usd?.toString() || '')
  const [exchangeRate, setExchangeRate] = useState(expense?.exchange_rate?.toString() || latestRate?.rate_blue?.toString() || '1420')
  const [paymentMethod, setPaymentMethod] = useState(expense?.payment_method || 'transferencia')
  const [weekNumber, setWeekNumber] = useState(expense?.week_number?.toString() || '')
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS')
  const [loading, setLoading] = useState(false)
  const [amountError, setAmountError] = useState<string | null>(null)
  const [impersonationError, setImpersonationError] = useState<string | null>(null)

  const handleCurrencyChange = (cur: 'ARS' | 'USD') => {
    setCurrency(cur)
    const rate = parseFloat(exchangeRate) || 1
    if (cur === 'USD' && amountArs) {
      setAmountUsd(String(Math.round((parseFloat(amountArs) / rate) * 100) / 100))
    } else if (cur === 'ARS' && amountUsd) {
      setAmountArs(String(Math.round(parseFloat(amountUsd) * rate)))
    }
  }

  const handleAmountChange = (value: string) => {
    const rate = parseFloat(exchangeRate) || 1
    if (currency === 'ARS') {
      setAmountArs(value)
      setAmountUsd(value ? String(Math.round((parseFloat(value) / rate) * 100) / 100) : '')
    } else {
      setAmountUsd(value)
      setAmountArs(value ? String(Math.round(parseFloat(value) * rate)) : '')
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!projectId || !user) return

    // MAJ-001: Validate non-negative amounts
    const parsedArs = parseFloat(amountArs) || 0
    const parsedUsd = parseFloat(amountUsd) || 0
    if (parsedArs < 0 || parsedUsd < 0) {
      setAmountError('El monto no puede ser negativo')
      return
    }
    setAmountError(null)

    setLoading(true)
    setImpersonationError(null)
    try {
      const data = {
        project_id: projectId,
        date,
        budget_item_id: budgetItemId || null,
        provider,
        detail,
        amount_ars: parsedArs,
        amount_usd: parsedUsd,
        exchange_rate: parseFloat(exchangeRate) || null,
        payment_method: paymentMethod,
        week_number: weekNumber ? parseInt(weekNumber) : null,
        adjunto_url: expense?.adjunto_url ?? null,
        tipo_gasto: expense?.tipo_gasto ?? 'materiales',
        created_by: user.id,
      }

      if (isEdit && expense) {
        await updateExpense(expense.id, data)
      } else {
        await createExpense(data)
      }
      onClose()
    } catch (err) {
      // CRT-102: Mostrar advertencia si la acción está bloqueada por impersonación
      if (err instanceof ImpersonationWriteError) {
        setImpersonationError(
          'No podés realizar cambios mientras impersonás una cuenta. Salí de la impersonación primero.'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const budgetOptions = [
    { value: '', label: 'Sin rubro asignado' },
    ...parents.map((p) => ({ value: p.id, label: p.description })),
  ]

  const paymentOptions = [
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'otro', label: 'Otro' },
  ]

  return (
    <Modal open={open} onClose={onClose} title={duplicateMode ? 'Duplicar gasto' : isEdit ? 'Editar Gasto' : 'Nuevo Gasto'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Fecha" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <Select label="Rubro" options={budgetOptions} value={budgetItemId} onChange={(e) => setBudgetItemId(e.target.value)} />
        </div>

        <Input label="Proveedor" value={provider} onChange={(e) => setProvider(e.target.value)} />
        <Input label="Detalle" value={detail} onChange={(e) => setDetail(e.target.value)} />

        <div>
          <label className="text-sm text-secondary mb-1 block">Moneda de ingreso</label>
          <div className="flex gap-2 mb-3">
            {(['ARS', 'USD'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => handleCurrencyChange(c)}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  currency === c ? 'bg-accent text-white' : 'bg-border text-secondary'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label={currency === 'ARS' ? 'Monto ARS' : 'Monto USD'}
              type="number"
              value={currency === 'ARS' ? amountArs : amountUsd}
              onChange={(e) => handleAmountChange(e.target.value)}
              required
            />
            <Input
              label="Tipo de cambio"
              type="number"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
            />
          </div>
          {amountError && (
            <p className="text-xs text-status-exceeded mt-1">{amountError}</p>
          )}
          {!amountError && currency === 'ARS' && amountUsd && (
            <p className="text-xs text-secondary mt-1">Equivale a US$ {amountUsd}</p>
          )}
          {!amountError && currency === 'USD' && amountArs && (
            <p className="text-xs text-secondary mt-1">Equivale a $ {Number(amountArs).toLocaleString('es-AR')}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select label="Método de pago" options={paymentOptions} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} />
          <Input label="Semana N°" type="number" value={weekNumber} onChange={(e) => setWeekNumber(e.target.value)} />
        </div>

        {/* CRT-102: Advertencia cuando la acción está bloqueada por impersonación */}
        {impersonationError && (
          <div className="rounded-md border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-xs text-yellow-400">
            {impersonationError}
          </div>
        )}

        <Button type="submit" disabled={loading}>
          {loading ? 'Guardando...' : duplicateMode ? 'Guardar copia' : isEdit ? 'Actualizar' : 'Registrar Gasto'}
        </Button>
      </form>
    </Modal>
  )
}
