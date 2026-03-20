import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useProjectContext } from '@/contexts/ProjectContext'
import { getSpentByParent } from '@/lib/analysis'
import { getWeekNumber, formatCompact } from '@/lib/formatUtils'
import { Card } from '@/components/ui/Card'

interface WeekItemDetail {
  name: string
  amount: number
}

interface WeekData {
  name: string
  total: number
  items: WeekItemDetail[]
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null

  const data = payload[0]?.payload as WeekData | undefined
  if (!data) return null

  return (
    <div
      style={{
        background: '#1A1A18',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 12,
        color: '#e4e4e7',
        minWidth: 200,
        maxWidth: 280,
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: 6 }}>{data.name}</p>
      {data.items.length > 0 ? (
        data.items.map((item, i) => (
          <p key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 2 }}>
            <span style={{ color: '#a1a1aa' }}>{item.name}</span>
            <span style={{ fontFamily: 'monospace' }}>{formatCompact(item.amount)}</span>
          </p>
        ))
      ) : (
        <p style={{ color: '#71717a' }}>Sin rubros programados</p>
      )}
      <div style={{ borderTop: '1px solid #27272a', marginTop: 6, paddingTop: 6, display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontWeight: 600 }}>Total</span>
        <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{formatCompact(data.total)}</span>
      </div>
    </div>
  )
}

export function ProximosVencimientos() {
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)
  const { project, convert } = useProjectContext()

  const currentWeek = project.start_date ? getWeekNumber(project.start_date) : 1

  const spentMap = useMemo(() => getSpentByParent(items, expenses), [items, expenses])

  const weekData = useMemo<WeekData[]>(() => {
    const parents = items.filter((i) => !i.parent_id)
    const data: WeekData[] = []

    for (let w = currentWeek + 1; w <= currentWeek + 4; w++) {
      let weekTotal = 0
      const weekItems: WeekItemDetail[] = []

      for (const p of parents) {
        if (p.week_number === w) {
          const spent = spentMap.get(p.id) || 0
          const executionPct = p.total_price > 0 ? (spent / p.total_price) * 100 : 0
          if (executionPct < 100) {
            const amount = convert(p.total_price)
            weekTotal += amount
            weekItems.push({ name: p.description, amount })
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
            const amount = convert(child.total_price)
            weekTotal += amount
            weekItems.push({ name: child.description, amount })
          }
        }
      }
      data.push({ name: `Semana ${w}`, total: weekTotal, items: weekItems })
    }

    return data
  }, [items, currentWeek, spentMap, convert])

  const totalNext4 = weekData.reduce((sum, w) => sum + w.total, 0)

  const formatYAxis = (value: number) => formatCompact(value)

  return (
    <div>
      <h2 className="text-sm font-heading font-semibold text-secondary uppercase tracking-wider mb-4">
        Proximos vencimientos
      </h2>

      <Card className="p-4">
        {totalNext4 === 0 ? (
          <p className="text-sm text-secondary">
            No hay rubros programados para las proximas 4 semanas.
          </p>
        ) : (
          <>
            <div style={{ width: '100%', height: 240 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} width={70} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="total" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-sm text-secondary mt-3">
              Total necesario proximas 4 semanas:{' '}
              <span className="font-semibold text-primary">{formatCompact(totalNext4)}</span>
            </p>
          </>
        )}
      </Card>
    </div>
  )
}
