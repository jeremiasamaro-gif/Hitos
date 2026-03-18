import { useState } from 'react'
import { useExpenseStore } from '@/store/expenseStore'
import { useBudgetStore } from '@/store/budgetStore'
import { useAuthStore } from '@/store/authStore'
import { useCurrencyStore } from '@/store/currencyStore'
import { formatCurrency } from '@/utils/currency'
import { formatDate, formatWeek } from '@/utils/formatters'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { ExpenseFormModal } from './ExpenseFormModal'
import { Pencil, Trash2 } from 'lucide-react'
import type { Expense } from '@/lib/supabase'

export function ExpenseTable() {
  const { expenses, deleteExpense, filters } = useExpenseStore()
  const items = useBudgetStore((s) => s.items)
  const user = useAuthStore((s) => s.user)
  const { mode, convert } = useCurrencyStore()
  const [editExpense, setEditExpense] = useState<Expense | null>(null)

  const isArchitect = user?.role === 'arquitecto'

  // Client-side provider filter
  const filtered = filters.provider
    ? expenses.filter((e) => e.provider?.toLowerCase().includes(filters.provider!.toLowerCase()))
    : expenses

  const getItemName = (id: string | null) => {
    if (!id) return '-'
    const item = items.find((i) => i.id === id)
    return item?.description || '-'
  }

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Eliminar este gasto?')) {
      await deleteExpense(id)
    }
  }

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-border mt-4">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b border-border bg-card">
              <th className="py-3 px-3 text-left text-xs text-secondary">Fecha</th>
              <th className="py-3 px-3 text-left text-xs text-secondary">Rubro</th>
              <th className="py-3 px-3 text-left text-xs text-secondary">Proveedor</th>
              <th className="py-3 px-3 text-left text-xs text-secondary">Detalle</th>
              <th className="py-3 px-3 text-right text-xs text-secondary">Monto</th>
              <th className="py-3 px-3 text-center text-xs text-secondary">Pago</th>
              <th className="py-3 px-3 text-center text-xs text-secondary">Semana</th>
              <th className="py-3 px-3 text-right text-xs text-secondary w-20">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-secondary text-sm">
                  No hay gastos registrados
                </td>
              </tr>
            ) : (
              filtered.map((exp) => (
                <tr key={exp.id} className="border-b border-border/50 hover:bg-hover/50 transition-colors">
                  <td className="py-2 px-3 text-sm">{formatDate(exp.date)}</td>
                  <td className="py-2 px-3 text-sm text-secondary">{getItemName(exp.budget_item_id)}</td>
                  <td className="py-2 px-3 text-sm">{exp.provider || '-'}</td>
                  <td className="py-2 px-3 text-sm text-secondary">{exp.detail || '-'}</td>
                  <td className="py-2 px-3 text-right font-mono text-sm">
                    {formatCurrency(convert(exp.amount_ars), mode)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <Badge>{exp.payment_method || '-'}</Badge>
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
                        >
                          <Pencil size={14} />
                        </button>
                        {(isArchitect || exp.created_by === user?.id) && (
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="p-1 text-secondary hover:text-status-exceeded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ExpenseFormModal
        open={!!editExpense}
        onClose={() => setEditExpense(null)}
        expense={editExpense}
      />
    </>
  )
}
