import { useState, useMemo } from 'react'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useProjectContext } from '@/contexts/ProjectContext'
import { useCurrencyStore } from '@/store/currencyStore'
import { getSpentByParent } from '@/lib/analysis'
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
    <div
      style={{
        background: '#F0EFFE',
        border: '1px solid #C7D2FE',
        borderRadius: 'var(--radius-lg)',
        padding: '20px 24px',
      }}
    >
      {/* Título */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--color-accent)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginBottom: 16,
        }}
      >
        Simulador de ajuste
      </div>

      {adjustableItems.length === 0 ? (
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
          No hay rubros con menos del 50% ejecutado para ajustar.
        </p>
      ) : (
        <>
          {/* Lista de sliders */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
            {adjustableItems.map((item) => {
              const val = getSliderValue(item.id)
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <span
                    style={{
                      minWidth: 160,
                      fontSize: 14,
                      color: 'var(--color-text-primary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.description}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={val}
                    onChange={(e) => handleSliderChange(item.id, Number(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--color-accent)' }}
                  />
                  <span
                    style={{
                      minWidth: 40,
                      textAlign: 'right',
                      fontSize: 13,
                      color: 'var(--color-text-secondary)',
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {val}%
                  </span>
                </div>
              )
            })}
          </div>

          {/* Separador interno */}
          <div style={{ borderTop: '1px solid #C7D2FE', marginBottom: 16 }} />

          {/* Panel de resultado — mismo fondo, sin card separada */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>
                Con estos ajustes, el costo total sería:
              </span>
              <span style={{ fontWeight: 700, color: 'var(--color-text-primary)' }}>
                {formatCompact(convert(newTotal), mode)}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
              <span style={{ color: 'var(--color-text-secondary)' }}>Diferencia:</span>
              <span
                style={{
                  fontWeight: 600,
                  color: isOverBudget ? 'var(--color-danger, #ef4444)' : 'var(--color-success, #22c55e)',
                }}
              >
                {isOverBudget ? '+' : '-'}{formatCompact(convert(Math.abs(difference)), mode)}
              </span>
            </div>
            {projectedEndDate && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  Fecha estimada de finalización:
                </span>
                <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {projectedEndDate}
                </span>
              </div>
            )}
          </div>

          {/* Botón resetear */}
          <button
            onClick={handleReset}
            style={{
              marginTop: 16,
              background: 'transparent',
              border: '1px solid #C7D2FE',
              borderRadius: 'var(--radius-md)',
              padding: '6px 14px',
              fontSize: 13,
              color: 'var(--color-accent)',
              cursor: 'pointer',
            }}
          >
            Resetear
          </button>
        </>
      )}
    </div>
  )
}
