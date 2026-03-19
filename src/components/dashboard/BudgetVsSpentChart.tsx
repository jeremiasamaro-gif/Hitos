import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useCurrencyStore } from '@/store/currencyStore'
import { Card } from '@/components/ui/Card'

const COLOR_BUDGET = '#6366f1'
const COLOR_SPENT = '#06B6D4'
const COLOR_EXCEEDED = '#EF4444'

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null

  const presupuestado = payload.find((p: any) => p.dataKey === 'Presupuestado')?.value ?? 0
  const gastado = payload.find((p: any) => p.dataKey === 'Gastado')?.value ?? 0
  const exceeded = gastado > presupuestado
  const exceedAmount = gastado - presupuestado
  const exceedPct = presupuestado > 0 ? ((exceedAmount / presupuestado) * 100).toFixed(1) : '0'

  const fmt = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : `$${Math.round(n).toLocaleString('es-AR')}`

  return (
    <div
      style={{
        background: '#1A1A18',
        borderRadius: 8,
        padding: '10px 14px',
        fontSize: 12,
        color: '#e4e4e7',
        minWidth: 180,
      }}
    >
      <p style={{ fontWeight: 600, marginBottom: 6 }}>{label}</p>
      <p>
        <span style={{ color: COLOR_BUDGET }}>Presupuestado:</span> {fmt(presupuestado)}
      </p>
      <p>
        <span style={{ color: exceeded ? COLOR_EXCEEDED : COLOR_SPENT }}>Gastado:</span> {fmt(gastado)}
      </p>
      {exceeded && (
        <p style={{ color: COLOR_EXCEEDED, marginTop: 4 }}>
          Excedido en {fmt(exceedAmount)} (+{exceedPct}%)
        </p>
      )}
    </div>
  )
}

export function BudgetVsSpentChart() {
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)
  const { convert } = useCurrencyStore()

  const parents = items.filter((i) => !i.parent_id)

  // Build spent-by-parent map
  const spentByParent = new Map<string, number>()
  for (const exp of expenses) {
    if (exp.budget_item_id) {
      const item = items.find((i) => i.id === exp.budget_item_id)
      const parentId = item?.parent_id || item?.id || ''
      spentByParent.set(parentId, (spentByParent.get(parentId) || 0) + exp.amount_ars)
    }
  }

  const data = parents.map((p) => {
    const presupuestado = Math.round(convert(p.total_price))
    const gastado = Math.round(convert(spentByParent.get(p.id) || 0))
    return {
      name: p.description.length > 15 ? p.description.slice(0, 12) + '...' : p.description,
      fullName: p.description,
      Presupuestado: presupuestado,
      Gastado: gastado,
      exceeded: gastado > presupuestado,
    }
  })

  const hasExceeded = data.some((d) => d.exceeded)

  return (
    <Card className="p-4">
      <h3 className="text-sm font-heading font-semibold mb-4">Presupuestado vs Gastado</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} barGap={4}>
          <XAxis
            dataKey="name"
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={{ stroke: '#1e2028' }}
            tickLine={false}
            angle={-30}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
          <Legend
            wrapperStyle={{ fontSize: '12px' }}
            payload={[
              { value: 'Presupuestado', type: 'square', color: COLOR_BUDGET },
              { value: 'Gastado', type: 'square', color: COLOR_SPENT },
              ...(hasExceeded ? [{ value: 'Excedido', type: 'square' as const, color: COLOR_EXCEEDED }] : []),
            ]}
          />
          <Bar dataKey="Presupuestado" fill={COLOR_BUDGET} radius={[4, 4, 0, 0]} />
          <Bar dataKey="Gastado" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.exceeded ? COLOR_EXCEEDED : COLOR_SPENT} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
