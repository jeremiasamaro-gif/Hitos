import { useState } from 'react'
import { useExpenseStore } from '@/store/expenseStore'
import { useBudgetStore } from '@/store/budgetStore'
import { useAuthStore } from '@/store/authStore'
import { useCurrencyStore } from '@/store/currencyStore'
import { formatCurrency } from '@/utils/currency'
import { formatDate, formatWeek } from '@/utils/formatters'
import { getPaymentMethodStyle } from '@/lib/formatUtils'
import { ExpenseFormModal } from './ExpenseFormModal'
import { Pencil, Trash2, Copy, Paperclip } from 'lucide-react'
import type { Expense, TipoGasto } from '@/lib/supabase'

const TIPO_GASTO_CONFIG: Record<TipoGasto, { label: string; color: string }> = {
  materiales: { label: 'Materiales', color: '#3B82F6' },
  mano_obra: { label: 'Mano de obra', color: '#16A34A' },
  honorarios: { label: 'Honorarios', color: '#6366f1' },
  varios: { label: 'Varios', color: '#D97706' },
}

interface ExpenseTableProps {
  searchQuery?: string
}

export function ExpenseTable({ searchQuery = '' }: ExpenseTableProps) {
  const { expenses, deleteExpense, filters } = useExpenseStore()
  const items = useBudgetStore((s) => s.items)
  const user = useAuthStore((s) => s.user)
  const { mode, convert } = useCurrencyStore()
  const [editExpense, setEditExpense] = useState<Expense | null>(null)
  const [duplicateExpense, setDuplicateExpense] = useState<Expense | null>(null)

  const isArchitect = user?.role === 'arquitecto'

  // Start with all expenses
  let filtered = [...expenses]

  // Global search
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase()
    filtered = filtered.filter((e) => {
      const itemName = getItemName(e.budget_item_id).toLowerCase()
      return (
        (e.date && e.date.includes(q)) ||
        itemName.includes(q) ||
        (e.provider && e.provider.toLowerCase().includes(q)) ||
        (e.detail && e.detail.toLowerCase().includes(q)) ||
        String(e.amount_ars).includes(q) ||
        (e.week_number && `semana ${e.week_number}`.includes(q))
      )
    })
  }

  function getItemName(id: string | null): string {
    if (!id) return '-'
    const item = items.find((i) => i.id === id)
    return item?.description || '-'
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este gasto?')) {
      await deleteExpense(id)
    }
  }

  const handleDuplicate = (exp: Expense) => {
    setDuplicateExpense(exp)
  }

  // Footer totals
  const totalCount = filtered.length
  const totalAmount = filtered.reduce((s, e) => s + e.amount_ars, 0)
  const byMethod = filtered.reduce<Record<string, number>>((acc, e) => {
    const method = e.payment_method || 'otro'
    acc[method] = (acc[method] || 0) + e.amount_ars
    return acc
  }, {})

  const fmtMoney = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border mt-4 relative">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr className="border-b border-border bg-card sticky top-0 z-10" style={{ boxShadow: '0 1px 0 var(--color-border)' }}>
              <th className="py-3 px-3 text-left text-xs text-secondary">Fecha</th>
              <th className="py-3 px-3 text-left text-xs text-secondary">Rubro</th>
              <th className="py-3 px-3 text-left text-xs text-secondary">Tipo</th>
              <th className="py-3 px-3 text-left text-xs text-secondary">Proveedor</th>
              <th className="py-3 px-3 text-left text-xs text-secondary">Detalle</th>
              <th className="py-3 px-3 text-center text-xs text-secondary w-10">
                <Paperclip size={12} className="inline" />
              </th>
              <th className="py-3 px-3 text-right text-xs text-secondary">Monto</th>
              <th className="py-3 px-3 text-center text-xs text-secondary">Pago</th>
              <th className="py-3 px-3 text-center text-xs text-secondary">Semana</th>
              <th className="py-3 px-3 text-right text-xs text-secondary w-24">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-secondary text-sm">
                  No hay gastos registrados
                </td>
              </tr>
            ) : (
              filtered.map((exp) => {
                const tipo = TIPO_GASTO_CONFIG[exp.tipo_gasto || 'materiales']
                return (
                  <tr key={exp.id} className="border-b border-border/50 hover:bg-hover/50 transition-colors">
                    <td className="py-2 px-3 text-sm">{formatDate(exp.date)}</td>
                    <td className="py-2 px-3 text-sm text-secondary">{getItemName(exp.budget_item_id)}</td>
                    <td className="py-2 px-3 text-sm">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ background: tipo.color }} />
                        <span className="text-xs text-secondary">{tipo.label}</span>
                      </span>
                    </td>
                    <td className="py-2 px-3 text-sm">{exp.provider || '-'}</td>
                    <td className="py-2 px-3 text-sm text-secondary max-w-[200px] truncate">{exp.detail || '-'}</td>
                    <td className="py-2 px-3 text-center">
                      {exp.adjunto_url ? (
                        <a href={exp.adjunto_url} target="_blank" rel="noopener noreferrer">
                          <Paperclip size={14} className="text-accent inline" />
                        </a>
                      ) : (
                        <span title="Agregar adjunto"><Paperclip size={14} className="text-border inline cursor-pointer hover:text-secondary transition-colors" /></span>
                      )}
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-sm">
                      {formatCurrency(convert(exp.amount_ars), mode)}
                    </td>
                    <td className="py-2 px-3 text-center">
                      {exp.payment_method ? (() => {
                        const pStyle = getPaymentMethodStyle(exp.payment_method)
                        return (
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${pStyle.bg} ${pStyle.text}`}>
                            {exp.payment_method}
                          </span>
                        )
                      })() : <span className="text-secondary">-</span>}
                    </td>
                    <td className="py-2 px-3 text-center text-xs text-secondary">
                      {exp.week_number ? formatWeek(exp.week_number) : '-'}
                    </td>
                    <td className="py-2 px-3 text-right">
                      {(isArchitect || exp.created_by === user?.id) && (
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditExpense(exp)}
                            className="p-1 text-secondary hover:text-accent transition-colors"
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDuplicate(exp)}
                            className="p-1 text-secondary hover:text-accent transition-colors"
                            title="Duplicar"
                          >
                            <Copy size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="p-1 text-secondary hover:text-status-exceeded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer totals */}
      {filtered.length > 0 && (
        <div
          className="flex items-center justify-between px-4 py-3 text-sm border border-t-0 border-border rounded-b-xl -mt-[1px]"
          style={{ background: 'var(--color-bg-sidebar, var(--color-bg-card))' }}
        >
          <span>
            <span className="font-medium">{totalCount} gastos</span>
            <span className="text-secondary"> · Total: </span>
            <span className="font-mono font-medium">{fmtMoney(totalAmount)}</span>
          </span>
          <span className="text-secondary text-xs">
            {Object.entries(byMethod)
              .filter(([, v]) => v > 0)
              .map(([k, v]) => `${k.charAt(0).toUpperCase() + k.slice(1)}: ${fmtMoney(v)}`)
              .join(' | ')}
          </span>
        </div>
      )}

      {/* Edit modal */}
      <ExpenseFormModal
        open={!!editExpense}
        onClose={() => setEditExpense(null)}
        expense={editExpense}
      />

      {/* Duplicate modal */}
      <ExpenseFormModal
        open={!!duplicateExpense}
        onClose={() => setDuplicateExpense(null)}
        expense={duplicateExpense ? { ...duplicateExpense, id: '', date: '' } : null}
        duplicateMode
      />
    </>
  )
}
