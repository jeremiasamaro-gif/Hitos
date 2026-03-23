import { useProjectContext } from '@/contexts/ProjectContext'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useMemo } from 'react'
import { TrendingUp, TrendingDown, DollarSign, BarChart3, Clock, AlertTriangle } from 'lucide-react'
import { formatCompact } from '@/lib/formatUtils'

export function ClientResumen() {
  const { project, globalProgress, totalBudget, totalSpent, currencyMode, convert } = useProjectContext()
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)

  const stats = useMemo(() => {
    const parents = items.filter((i) => !i.parent_id)
    const childrenMap = new Map<string, typeof items>()
    for (const item of items) {
      if (item.parent_id) {
        const arr = childrenMap.get(item.parent_id) || []
        arr.push(item)
        childrenMap.set(item.parent_id, arr)
      }
    }

    const spentByItem = new Map<string, number>()
    for (const e of expenses) {
      if (e.budget_item_id) {
        spentByItem.set(e.budget_item_id, (spentByItem.get(e.budget_item_id) || 0) + e.amount_ars)
      }
    }

    let rubrosExcedidos = 0
    const categorySummary: { name: string; budget: number; spent: number }[] = []

    for (const parent of parents) {
      const children = childrenMap.get(parent.id) || []
      let parentSpent = spentByItem.get(parent.id) || 0
      for (const c of children) parentSpent += spentByItem.get(c.id) || 0
      if (parentSpent > parent.total_price) rubrosExcedidos++
      categorySummary.push({ name: parent.description, budget: parent.total_price, spent: parentSpent })
    }

    const remaining = totalBudget - totalSpent
    return { rubrosExcedidos, remaining, categorySummary }
  }, [items, expenses, totalBudget, totalSpent])

  const fmt = (v: number) => formatCompact(currencyMode === 'ARS' ? v : convert(v))
  const prefix = currencyMode === 'ARS' ? '$' : 'US$'

  const kpis = [
    { label: 'Presupuesto total', value: `${prefix} ${fmt(totalBudget)}`, icon: <DollarSign size={18} />, color: 'var(--color-accent)' },
    { label: 'Gastado', value: `${prefix} ${fmt(totalSpent)}`, icon: <TrendingDown size={18} />, color: 'var(--color-status-warning)' },
    { label: 'Restante', value: `${prefix} ${fmt(stats.remaining)}`, icon: <TrendingUp size={18} />, color: stats.remaining >= 0 ? 'var(--color-status-ok)' : 'var(--color-status-exceeded)' },
    { label: 'Avance', value: `${globalProgress.toFixed(1)}%`, icon: <BarChart3 size={18} />, color: 'var(--color-accent)' },
    { label: 'Avance físico', value: `${project.avance_fisico ?? 0}%`, icon: <Clock size={18} />, color: 'var(--color-text-secondary)' },
    { label: 'Rubros excedidos', value: `${stats.rubrosExcedidos}`, icon: <AlertTriangle size={18} />, color: stats.rubrosExcedidos > 0 ? 'var(--color-status-exceeded)' : 'var(--color-status-ok)' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-heading font-bold">Resumen del proyecto</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span style={{ color: kpi.color }}>{kpi.icon}</span>
              <span className="text-xs text-secondary">{kpi.label}</span>
            </div>
            <p className="text-lg font-bold font-mono">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-card border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Ejecución presupuestaria</span>
          <span className="text-sm font-mono font-medium" style={{ color: globalProgress > 100 ? 'var(--color-status-exceeded)' : 'var(--color-accent)' }}>
            {globalProgress.toFixed(1)}%
          </span>
        </div>
        <div className="h-2.5 bg-border rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(globalProgress, 100)}%`,
              background: globalProgress > 100 ? 'var(--color-status-exceeded)' : 'var(--color-accent)',
            }}
          />
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h2 className="text-sm font-medium">Desglose por rubro</h2>
        </div>
        <div className="divide-y divide-border">
          {stats.categorySummary.map((cat) => {
            const pct = cat.budget > 0 ? (cat.spent / cat.budget) * 100 : 0
            const exceeded = pct > 100
            return (
              <div key={cat.name} className="px-5 py-3 flex items-center gap-4">
                <span className="text-sm flex-1 min-w-0 truncate">{cat.name}</span>
                <div className="w-32 h-1.5 bg-border rounded-full overflow-hidden shrink-0">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(pct, 100)}%`,
                      background: exceeded ? 'var(--color-status-exceeded)' : 'var(--color-accent)',
                    }}
                  />
                </div>
                <span className={`text-xs font-mono w-14 text-right shrink-0 ${exceeded ? 'text-status-exceeded font-medium' : 'text-secondary'}`}>
                  {pct.toFixed(0)}%
                </span>
                <span className="text-xs text-secondary font-mono w-24 text-right shrink-0">
                  {prefix} {fmt(cat.spent)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
