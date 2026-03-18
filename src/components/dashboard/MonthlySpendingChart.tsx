import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useCurrencyStore } from '@/store/currencyStore'
import { getMonthlySpending } from '@/lib/analysis'
import { Card } from '@/components/ui/Card'

const MONTH_NAMES: Record<string, string> = {
  '01': 'Ene', '02': 'Feb', '03': 'Mar', '04': 'Abr',
  '05': 'May', '06': 'Jun', '07': 'Jul', '08': 'Ago',
  '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dic',
}

export function MonthlySpendingChart() {
  const expenses = useExpenseStore((s) => s.expenses)
  const { convert } = useCurrencyStore()

  const monthly = getMonthlySpending(expenses)
  const data = monthly.map((m) => ({
    name: MONTH_NAMES[m.month.slice(5)] || m.month,
    Acumulado: Math.round(convert(m.cumulative)),
    Mensual: Math.round(convert(m.total)),
  }))

  if (data.length === 0) return null

  return (
    <Card className="p-4">
      <h3 className="text-sm font-heading font-semibold mb-4">Gasto Acumulado por Mes</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis
            dataKey="name"
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={{ stroke: '#1e2028' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#71717a', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) =>
              v >= 1_000_000 ? `${(v / 1_000_000).toFixed(1)}M` : `${(v / 1_000).toFixed(0)}k`
            }
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
          <Line
            type="monotone"
            dataKey="Acumulado"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ fill: '#6366f1', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
