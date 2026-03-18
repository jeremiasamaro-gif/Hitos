import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useCurrencyStore } from '@/store/currencyStore'
import { Card } from '@/components/ui/Card'

const COLORS = ['#6366f1', '#818cf8', '#a5b4fc', '#22c55e', '#eab308', '#ef4444', '#f97316', '#06b6d4']

export function ExpenseDistributionChart() {
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)
  const { convert } = useCurrencyStore()

  const parents = items.filter((i) => !i.parent_id)

  const spentByParent = new Map<string, number>()
  for (const exp of expenses) {
    if (exp.budget_item_id) {
      const item = items.find((i) => i.id === exp.budget_item_id)
      const parentId = item?.parent_id || item?.id || ''
      spentByParent.set(parentId, (spentByParent.get(parentId) || 0) + exp.amount_ars)
    }
  }

  const data = parents
    .map((p) => ({
      name: p.description,
      value: Math.round(convert(spentByParent.get(p.id) || 0)),
    }))
    .filter((d) => d.value > 0)

  return (
    <Card className="p-4">
      <h3 className="text-sm font-heading font-semibold mb-4">Distribución del Gasto</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={100}
            dataKey="value"
            stroke="#080a10"
            strokeWidth={2}
            label={({ name, percent }) =>
              `${name.slice(0, 10)}${name.length > 10 ? '..' : ''} ${(percent * 100).toFixed(0)}%`
            }
            labelLine={false}
          >
            {data.map((_entry, idx) => (
              <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f1117',
              border: '1px solid #1e2028',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '11px' }} />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  )
}
