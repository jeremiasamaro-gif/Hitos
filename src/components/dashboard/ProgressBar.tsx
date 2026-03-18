import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { formatPercent } from '@/utils/formatters'

export function ProgressBar() {
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)

  const totalBudget = items.filter((i) => !i.parent_id).reduce((s, i) => s + i.total_price, 0)
  const totalSpent = expenses.reduce((s, e) => s + e.amount_ars, 0)
  const pct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  const clampedPct = Math.min(pct, 100)

  const barColor =
    pct > 100 ? 'bg-status-exceeded' : pct > 80 ? 'bg-status-warning' : 'bg-accent'

  const houseColor =
    pct >= 100 ? 'var(--color-status-ok)' : pct >= 80 ? 'var(--color-status-warning)' : 'var(--color-accent)'

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-secondary">Progreso general</span>
        <span className={`text-sm font-mono font-medium ${pct > 100 ? 'text-status-exceeded' : 'text-primary'}`}>
          {formatPercent(pct)}
        </span>
      </div>
      <div className="relative">
        {/* House icon */}
        <div
          className="absolute z-10"
          style={{
            left: `calc(${clampedPct}% - 12px)`,
            bottom: 'calc(100% + 4px)',
            transition: 'left 0.6s ease',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill={houseColor} xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12L12 3L21 12V21H15V15H9V21H3V12Z" />
          </svg>
        </div>
        {/* Bar */}
        <div className="w-full h-3 bg-border rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${barColor}`}
            style={{ width: `${clampedPct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
