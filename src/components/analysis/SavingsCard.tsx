import { Card } from '@/components/ui/Card'
import { TrendingDown } from 'lucide-react'
import { useCurrencyStore } from '@/store/currencyStore'
import { formatCurrency } from '@/utils/currency'
import { formatPercent } from '@/utils/formatters'
import type { PnlRow } from '@/utils/pnlCalculations'

export function SavingsCard({ row }: { row: PnlRow }) {
  const mode = useCurrencyStore((s) => s.mode)
  const available = row.difference
  const availablePct = 100 - row.percentage

  return (
    <Card className="border-l-4 border-l-status-ok p-4">
      <div className="flex items-start gap-3">
        <TrendingDown size={20} className="text-status-ok" />
        <div>
          <h4 className="text-sm font-heading font-semibold">{row.item.description}</h4>
          <p className="text-xs text-secondary mt-1">{row.item.item_code}</p>
          <p className="text-sm text-status-ok mt-2">
            Disponible: {formatPercent(availablePct)} del presupuesto
          </p>
          <p className="text-sm font-mono mt-1">{formatCurrency(available, mode)}</p>
        </div>
      </div>
    </Card>
  )
}
