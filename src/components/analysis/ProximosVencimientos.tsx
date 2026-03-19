import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useProjectContext } from '@/contexts/ProjectContext'
import { getSpentByParent } from '@/lib/analysis'
import { getWeekNumber, formatCompact } from '@/lib/formatUtils'
import { Card } from '@/components/ui/Card'

interface WeekData {
  name: string
  total: number
}

export function ProximosVencimientos() {
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)
  const { project } = useProjectContext()

  const currentWeek = project.start_date ? getWeekNumber(project.start_date) : 1

  const spentMap = useMemo(() => getSpentByParent(items, expenses), [items, expenses])

  const weekData = useMemo<WeekData[]>(() => {
    const parents = items.filter((i) => !i.parent_id)
    const data: WeekData[] = []

    for (let w = currentWeek + 1; w <= currentWeek + 4; w++) {
      let weekTotal = 0
      for (const p of parents) {
        if (p.week_number === w) {
          // Check if item has < 100% execution
          const spent = spentMap.get(p.id) || 0
          const executionPct = p.total_price > 0 ? (spent / p.total_price) * 100 : 0
          if (executionPct < 100) {
            weekTotal += p.total_price
          }
        }
      }
      // Also check child items with matching week_number
      const children = items.filter((i) => i.parent_id && i.week_number === w)
      for (const child of children) {
        const parentSpent = spentMap.get(child.parent_id!) || 0
        const parent = parents.find((p) => p.id === child.parent_id)
        if (parent) {
          const executionPct = parent.total_price > 0 ? (parentSpent / parent.total_price) * 100 : 0
          if (executionPct < 100) {
            weekTotal += child.total_price
          }
        }
      }
      data.push({ name: `Semana ${w}`, total: weekTotal })
    }

    return data
  }, [items, currentWeek, spentMap])

  const totalNext4 = weekData.reduce((sum, w) => sum + w.total, 0)

  const formatYAxis = (value: number) => formatCompact(value)

  return (
    <div>
      <h2 className="text-sm font-heading font-semibold text-secondary uppercase tracking-wider mb-4">
        Próximos vencimientos
      </h2>

      <Card className="p-4">
        {totalNext4 === 0 ? (
          <p className="text-sm text-secondary">
            No hay rubros programados para las próximas 4 semanas.
          </p>
        ) : (
          <>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} width={70} />
                  <Tooltip
                    formatter={(value: number) => [formatCompact(value), 'Planificado']}
                    contentStyle={{ fontSize: 12 }}
                  />
                  <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-secondary mt-3">
              Total necesario próximas 4 semanas:{' '}
              <span className="font-semibold text-primary">{formatCompact(totalNext4)}</span>
            </p>
          </>
        )}
      </Card>
    </div>
  )
}
