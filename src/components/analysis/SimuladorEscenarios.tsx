import { useState, useMemo } from 'react'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useProjectContext } from '@/contexts/ProjectContext'
import { useCurrencyStore } from '@/store/currencyStore'
import { getSpentByParent } from '@/lib/analysis'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCompact } from '@/utils/currency'

interface AdjustableItem {
  id: string
  description: string
  totalPrice: number
  spent: number
  spentPct: number
}

export function SimuladorEscenarios() {
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)
  const { totalBudget, totalSpent, project, convert } = useProjectContext()
  const { mode } = useCurrencyStore()

  const adjustableItems = useMemo<AdjustableItem[]>(() => {
    const parents = items.filter((i) => !i.parent_id)
    const spentMap = getSpentByParent(items, expenses)

    return parents
      .map((p) => {
        const spent = spentMap.get(p.id) || 0
        const spentPct = p.total_price > 0 ? (spent / p.total_price) * 100 : 0
        return { id: p.id, description: p.description, totalPrice: p.total_price, spent, spentPct }
      })
      .filter((p) => p.spentPct < 50)
      .sort((a, b) => a.spentPct - b.spentPct)
  }, [items, expenses])

  const [sliders, setSliders] = useState<Record<string, number>>({})

  const getSliderValue = (id: string) => sliders[id] ?? 100

  const handleSliderChange = (id: string, value: number) => {
    setSliders((prev) => ({ ...prev, [id]: value }))
  }

  const handleReset = () => setSliders({})

  const newTotal = useMemo(() => {
    let adjustedRemaining = 0
    for (const item of adjustableItems) {
      const pct = getSliderValue(item.id)
      adjustedRemaining += item.totalPrice * (pct / 100)
    }
    // For items NOT adjustable (spent >= 50%), add their full total_price
    const parents = items.filter((i) => !i.parent_id)
    const spentMap = getSpentByParent(items, expenses)
    let nonAdjustableTotal = 0
    for (const p of parents) {
      const spent = spentMap.get(p.id) || 0
      const spentPct = p.total_price > 0 ? (spent / p.total_price) * 100 : 0
      if (spentPct >= 50) {
        nonAdjustableTotal += Math.max(p.total_price, spent)
      }
    }
    return adjustedRemaining + nonAdjustableTotal
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliders, adjustableItems, items, expenses])

  const difference = newTotal - totalBudget
  const isOverBudget = difference > 0

  // Projected end date calculation
  const weeksWithExpenses = new Set(expenses.map((e) => e.week_number).filter(Boolean))
  const weeksElapsed = weeksWithExpenses.size || 1
  const weeklyRate = totalSpent / weeksElapsed
  const remaining = Math.max(0, newTotal - totalSpent)
  const weeksRemaining = weeklyRate > 0 ? Math.ceil(remaining / weeklyRate) : 0

  const projectedEndDate = useMemo(() => {
    if (!project.start_date || weeksRemaining === 0) return null
    const start = new Date(project.start_date)
    const totalWeeks = weeksElapsed + weeksRemaining
    const end = new Date(start.getTime() + totalWeeks * 7 * 24 * 60 * 60 * 1000)
    return end.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })
  }, [project.start_date, weeksElapsed, weeksRemaining])

  // Show always for demo, or conditionally: totalSpent > totalBudget * 0.7
  const shouldShow = true // totalSpent > totalBudget * 0.7

  if (!shouldShow) return null

  return (
    <div>
      <h2 className="text-sm font-heading font-semibold text-secondary uppercase tracking-wider mb-4">
        Simulador de ajuste
      </h2>

      {adjustableItems.length === 0 ? (
        <p className="text-sm text-secondary">No hay rubros con menos del 50% ejecutado para ajustar.</p>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {adjustableItems.map((item) => {
              const val = getSliderValue(item.id)
              return (
                <div key={item.id} className="flex items-center gap-4">
                  <span className="text-sm text-primary w-48 truncate">{item.description}</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={val}
                    onChange={(e) => handleSliderChange(item.id, Number(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-medium text-primary w-12 text-right">{val}%</span>
                </div>
              )
            })}
          </div>

          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-secondary">Con estos ajustes, el costo total sería:</span>
              <span className="text-lg font-bold text-primary">{formatCompact(convert(newTotal), mode)}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-secondary">Diferencia:</span>
              <div className="flex items-center gap-2">
                <Badge variant={isOverBudget ? 'danger' : 'success'}>
                  {isOverBudget ? '+' : ''}{formatCompact(convert(difference), mode)}
                </Badge>
              </div>
            </div>
            {projectedEndDate && (
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-secondary">Fecha estimada de finalización:</span>
                <span className="text-sm font-medium text-primary">{projectedEndDate}</span>
              </div>
            )}
          </Card>

          <div className="mt-4">
            <Button variant="secondary" size="sm" onClick={handleReset}>
              Resetear
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
