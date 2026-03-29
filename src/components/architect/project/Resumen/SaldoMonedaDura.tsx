import { Card } from '@/components/ui/Card'
import { useCurrencyStore } from '@/store/currencyStore'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useAuthStore } from '@/store/authStore'
import { useProjectContext } from '@/contexts/ProjectContext'
import { mockExchangeRates } from '@/store/mockData'
import { formatCurrency } from '@/utils/currency'

function formatUsd(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? '-' : ''
  if (abs >= 1_000_000) {
    const val = abs / 1_000_000
    return `${sign}U$S ${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}M`
  }
  if (abs >= 1_000) {
    return `${sign}U$S ${Math.round(abs).toLocaleString('es-AR')}`
  }
  return `${sign}U$S ${abs.toFixed(0)}`
}

function formatTcDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00')
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
}

export function SaldoMonedaDura() {
  const user = useAuthStore((s) => s.user)

  if (user?.role !== 'arquitecto') return null

  const { project } = useProjectContext()
  const { latestRate } = useCurrencyStore()
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)

  const parents = items.filter((i) => !i.parent_id)
  const totalBudget = parents.reduce((sum, i) => sum + i.total_price, 0)
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount_ars, 0)

  const saldoARS = totalBudget - totalSpent
  const tcBlue = latestRate?.rate_blue ?? 1450
  const saldoUSD = tcBlue > 0 ? saldoARS / tcBlue : 0

  const scenarios = [
    { label: '+10%', factor: 1.10 },
    { label: '+20%', factor: 1.20 },
    { label: '+30%', factor: 1.30 },
  ]

  const historial = mockExchangeRates
    .filter((r) => r.project_id === project.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <Card className="p-5">
      {/* Header */}
      <div className="mb-5">
        <h3 className="text-base font-semibold text-primary">¿Cuánto queda pagar?</h3>
        <p className="text-xs text-secondary mt-0.5">Saldo restante en pesos y en dólares</p>
      </div>

      {/* Main: two columns */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div>
          <p className="text-[11px] font-medium text-secondary uppercase tracking-wide mb-1">Saldo en ARS</p>
          <p className="text-2xl font-mono font-bold text-primary">
            {formatCurrency(saldoARS, 'ARS')}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-medium text-secondary uppercase tracking-wide mb-1">Saldo en USD Blue</p>
          <p className="text-2xl font-mono font-bold text-primary">
            {formatUsd(saldoUSD)}
          </p>
          <p className="text-[11px] text-secondary mt-0.5">TC Blue: ${tcBlue.toLocaleString('es-AR')}</p>
        </div>
      </div>

      {/* Projection */}
      <div className="mb-6">
        <p className="text-sm font-medium text-primary mb-3">Proyección si el blue sube</p>
        <div className="grid grid-cols-3 gap-3">
          {scenarios.map((s) => {
            const nuevoTC = tcBlue * s.factor
            const saldoProyectado = nuevoTC > 0 ? saldoARS / nuevoTC : 0
            const diff = saldoUSD - saldoProyectado
            return (
              <div
                key={s.label}
                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-app)] p-3 text-center"
              >
                <p className="text-xs font-medium text-secondary mb-1">{s.label}</p>
                <p className="text-sm font-mono font-semibold text-primary">{formatUsd(saldoProyectado)}</p>
                <p className="text-[11px] font-mono text-status-exceeded mt-0.5">
                  −{formatUsd(diff)}
                </p>
                <p className="text-[10px] text-secondary mt-0.5">TC ${Math.round(nuevoTC).toLocaleString('es-AR')}</p>
              </div>
            )
          })}
        </div>
        <p className="text-xs text-secondary mt-2">
          Si el dólar blue sube, el mismo saldo en pesos equivale a menos dólares.
        </p>
      </div>

      {/* Exchange rate history */}
      <div>
        <p className="text-sm font-medium text-primary mb-3">Evolución del tipo de cambio</p>
        {historial.length === 0 ? (
          <p className="text-xs text-secondary">Aún no hay cambios de TC registrados.</p>
        ) : (
          <div className="space-y-2">
            {historial.map((entry, idx) => {
              const prevEntry = historial[idx + 1]
              let variationEl: React.ReactNode = null

              if (!prevEntry) {
                variationEl = (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-border)] text-secondary">
                    inicial
                  </span>
                )
              } else {
                const pct = ((entry.rate_blue - prevEntry.rate_blue) / prevEntry.rate_blue) * 100
                if (pct > 0) {
                  variationEl = (
                    <span className="text-[11px] font-mono text-status-exceeded">+{pct.toFixed(1)}%</span>
                  )
                } else if (pct < 0) {
                  variationEl = (
                    <span className="text-[11px] font-mono text-status-ok">{pct.toFixed(1)}%</span>
                  )
                } else {
                  variationEl = (
                    <span className="text-[11px] font-mono text-secondary">0%</span>
                  )
                }
              }

              return (
                <div key={entry.id} className="flex items-center justify-between text-xs">
                  <span className="text-secondary">{formatTcDate(entry.date)}</span>
                  <span className="font-mono font-medium text-primary">
                    ${entry.rate_blue.toLocaleString('es-AR')}
                  </span>
                  {variationEl}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </Card>
  )
}
