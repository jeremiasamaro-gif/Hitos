import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useCurrencyStore } from '@/store/currencyStore'
import { Card } from '@/components/ui/Card'

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

  const data = parents.map((p) => ({
    name: p.description.length > 15 ? p.description.slice(0, 12) + '...' : p.description,
    Presupuestado: Math.round(convert(p.total_price)),
    Gastado: Math.round(convert(spentByParent.get(p.id) || 0)),
  }))

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
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f1117',
              border: '1px solid #1e2028',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            labelStyle={{ color: '#e4e4e7' }}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="Presupuestado" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Gastado" fill="#818cf8" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}
