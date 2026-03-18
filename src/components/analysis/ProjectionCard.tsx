import { Card } from '@/components/ui/Card'
import { TrendingUp, Clock, DollarSign, CalendarDays } from 'lucide-react'
import { useCurrencyStore } from '@/store/currencyStore'
import { formatCurrency } from '@/utils/currency'
import type { ProjectProjection } from '@/lib/analysis'

interface Props {
  projection: ProjectProjection
  totalBudget: number
}

export function ProjectionCard({ projection, totalBudget }: Props) {
  const mode = useCurrencyStore((s) => s.mode)
  const { weeksElapsed, avgWeeklySpend, estimatedWeeksRemaining, estimatedTotalCost } = projection

  const overBudget = estimatedTotalCost > totalBudget
  const costColor = overBudget ? 'text-status-exceeded' : 'text-status-ok'

  if (weeksElapsed === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={20} className="text-accent" />
          <h3 className="text-sm font-heading font-semibold">Proyección</h3>
        </div>
        <p className="text-sm text-secondary">
          No hay suficientes datos para generar una proyección.
        </p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={20} className="text-accent" />
        <h3 className="text-sm font-heading font-semibold">Proyección del Proyecto</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-start gap-3">
          <CalendarDays size={16} className="text-secondary mt-0.5" />
          <div>
            <p className="text-xs text-secondary">Semanas transcurridas</p>
            <p className="text-lg font-mono font-bold">{weeksElapsed}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock size={16} className="text-secondary mt-0.5" />
          <div>
            <p className="text-xs text-secondary">Semanas restantes (est.)</p>
            <p className="text-lg font-mono font-bold">
              {estimatedWeeksRemaining > 0 ? estimatedWeeksRemaining : '—'}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <DollarSign size={16} className="text-secondary mt-0.5" />
          <div>
            <p className="text-xs text-secondary">Gasto semanal promedio</p>
            <p className="text-sm font-mono">{formatCurrency(avgWeeklySpend, mode)}</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <DollarSign size={16} className={`mt-0.5 ${costColor}`} />
          <div>
            <p className="text-xs text-secondary">Costo total estimado</p>
            <p className={`text-sm font-mono font-bold ${costColor}`}>
              {formatCurrency(estimatedTotalCost, mode)}
            </p>
          </div>
        </div>
      </div>

      {overBudget && (
        <div className="mt-4 p-3 bg-status-exceeded/10 rounded-lg border border-status-exceeded/20">
          <p className="text-xs text-status-exceeded">
            Al ritmo actual, el proyecto superaría el presupuesto en{' '}
            <span className="font-mono font-bold">
              {formatCurrency(estimatedTotalCost - totalBudget, mode)}
            </span>
          </p>
        </div>
      )}
    </Card>
  )
}
