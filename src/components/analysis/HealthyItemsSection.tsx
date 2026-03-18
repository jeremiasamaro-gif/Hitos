import { Card } from '@/components/ui/Card'
import { CheckCircle } from 'lucide-react'
import { useCurrencyStore } from '@/store/currencyStore'
import { formatCurrency } from '@/utils/currency'
import { formatPercent } from '@/utils/formatters'
import type { AnalysisItem } from '@/lib/analysis'

interface Props {
  savingItems: AnalysisItem[]
}

export function HealthyItemsSection({ savingItems }: Props) {
  const mode = useCurrencyStore((s) => s.mode)

  if (savingItems.length === 0) {
    return (
      <p className="text-sm text-secondary">No hay rubros con ahorro significativo aún.</p>
    )
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {savingItems.map((ai) => {
        const available = ai.budgeted - ai.spent
        const availablePct = 100 - ai.percentage

        return (
          <Card key={ai.item.id} className="border-l-4 border-l-status-ok p-4">
            <div className="flex items-start gap-3">
              <CheckCircle size={18} className="text-status-ok mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-heading font-semibold truncate">{ai.item.description}</h4>
                <p className="text-xs text-secondary mt-1">{ai.item.item_code}</p>

                <div className="mt-2 w-full bg-border rounded-full h-1.5">
                  <div
                    className="bg-status-ok rounded-full h-1.5 transition-all"
                    style={{ width: `${Math.min(ai.percentage, 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-status-ok">
                    {formatPercent(availablePct)} disponible
                  </span>
                  <span className="text-xs font-mono text-secondary">
                    {formatCurrency(available, mode)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
