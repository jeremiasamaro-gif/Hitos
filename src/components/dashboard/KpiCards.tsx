import { Card } from '@/components/ui/Card'
import { useCurrencyStore } from '@/store/currencyStore'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { formatCurrency } from '@/utils/currency'
import { formatPercent } from '@/utils/formatters'
import { DollarSign, TrendingDown, Wallet, BarChart3 } from 'lucide-react'

export function KpiCards() {
  const { mode, convert } = useCurrencyStore()
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)

  const parents = items.filter((i) => !i.parent_id)
  const totalBudget = parents.reduce((sum, i) => sum + i.total_price, 0)
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount_ars, 0)
  const balance = totalBudget - totalSpent
  const pctExecuted = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  // Count exceeded categories
  const spentByParent = new Map<string, number>()
  for (const exp of expenses) {
    if (exp.budget_item_id) {
      // Find the parent of this budget item
      const item = items.find((i) => i.id === exp.budget_item_id)
      const parentId = item?.parent_id || item?.id || ''
      spentByParent.set(parentId, (spentByParent.get(parentId) || 0) + exp.amount_ars)
    }
  }
  const exceededCount = parents.filter((p) => (spentByParent.get(p.id) || 0) > p.total_price).length

  const kpis = [
    {
      label: 'Presupuesto Total',
      value: formatCurrency(convert(totalBudget), mode),
      icon: DollarSign,
      color: 'text-accent',
    },
    {
      label: 'Total Gastado',
      value: formatCurrency(convert(totalSpent), mode),
      icon: TrendingDown,
      color: pctExecuted > 100 ? 'text-status-exceeded' : 'text-status-ok',
    },
    {
      label: 'Saldo Disponible',
      value: formatCurrency(convert(balance), mode),
      icon: Wallet,
      color: balance < 0 ? 'text-status-exceeded' : 'text-status-ok',
    },
    {
      label: '% Ejecutado',
      value: formatPercent(pctExecuted),
      icon: BarChart3,
      subtitle: exceededCount > 0 ? `${exceededCount} rubro${exceededCount > 1 ? 's' : ''} excedido${exceededCount > 1 ? 's' : ''}` : undefined,
      color: pctExecuted > 100 ? 'text-status-exceeded' : pctExecuted > 80 ? 'text-status-warning' : 'text-accent',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <kpi.icon size={16} className={kpi.color} />
            <span className="text-xs text-secondary">{kpi.label}</span>
          </div>
          <p className={`text-xl font-mono font-medium ${kpi.color}`}>{kpi.value}</p>
          {kpi.subtitle && (
            <p className="text-xs text-status-exceeded mt-1">{kpi.subtitle}</p>
          )}
        </Card>
      ))}
    </div>
  )
}
