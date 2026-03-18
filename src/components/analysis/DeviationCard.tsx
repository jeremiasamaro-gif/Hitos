import { Card } from '@/components/ui/Card'
import { AlertTriangle, AlertCircle } from 'lucide-react'
import { useCurrencyStore } from '@/store/currencyStore'
import { formatCurrency } from '@/utils/currency'
import { formatPercent } from '@/utils/formatters'
import type { PnlRow } from '@/utils/pnlCalculations'

export function DeviationCard({ row }: { row: PnlRow }) {
  const mode = useCurrencyStore((s) => s.mode)
  const isExceeded = row.status === 'exceeded'
  const overAmount = Math.abs(row.difference)

  const Icon = isExceeded ? AlertTriangle : AlertCircle
  const borderColor = isExceeded ? 'border-l-status-exceeded' : 'border-l-status-warning'
  const iconColor = isExceeded ? 'text-status-exceeded' : 'text-status-warning'

  const cause = isExceeded
    ? `Superó el presupuesto en ${formatCurrency(overAmount, mode)}`
    : `Alcanzó ${formatPercent(row.percentage)} del presupuesto asignado`

  return (
    <Card className={`border-l-4 ${borderColor} p-4`}>
      <div className="flex items-start gap-3">
        <Icon size={20} className={iconColor} />
        <div>
          <h4 className="text-sm font-heading font-semibold">{row.item.description}</h4>
          <p className="text-xs text-secondary mt-1">{row.item.item_code}</p>
          <p className={`text-sm mt-2 ${isExceeded ? 'text-status-exceeded' : 'text-status-warning'}`}>
            {isExceeded ? 'Excedido' : 'En riesgo'}: {formatPercent(row.percentage)} ejecutado
          </p>
          <p className="text-xs text-secondary mt-1">{cause}</p>
        </div>
      </div>
    </Card>
  )
}
