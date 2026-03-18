import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useCurrencyStore } from '@/store/currencyStore'
import { useProjectContext } from '@/contexts/ProjectContext'
import { getExceededItems, getSavingItems, getInactiveItems } from '@/lib/analysis'
import { formatCurrency } from '@/utils/currency'
import { Card } from '@/components/ui/Card'
import { AlertTriangle, CheckCircle, Info } from 'lucide-react'

export function AlertCards() {
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)
  const { mode, convert } = useCurrencyStore()
  const { globalProgress } = useProjectContext()

  const exceeded = getExceededItems(items, expenses)
  const savings = getSavingItems(items, expenses, globalProgress)
  const inactive = getInactiveItems(items, expenses)

  if (exceeded.length === 0 && savings.length === 0 && inactive.length === 0) return null

  return (
    <div className="mt-6 space-y-4">
      {/* Exceeded */}
      {exceeded.length > 0 && (
        <div>
          <h3 className="text-sm font-heading font-semibold text-status-exceeded mb-3">
            Desfasajes ({exceeded.length})
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {exceeded.map((a) => (
              <Card key={a.item.id} className="p-4 border-status-exceeded/30 bg-status-exceeded/5">
                <div className="flex items-start gap-2">
                  <AlertTriangle size={16} className="text-status-exceeded shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{a.item.description}</p>
                    <p className="text-xs text-secondary mt-1">
                      Superó el presupuesto en{' '}
                      <span className="font-mono text-status-exceeded">
                        {formatCurrency(convert(a.overage), mode)}
                      </span>
                    </p>
                    <p className="text-xs text-secondary mt-0.5">
                      Posible causa: aumento de precios o cambio de scope.
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Savings */}
      {savings.length > 0 && (
        <div>
          <h3 className="text-sm font-heading font-semibold text-status-ok mb-3">
            Oportunidades de Ahorro ({savings.length})
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {savings.map((a) => (
              <Card key={a.item.id} className="p-4 border-status-ok/30 bg-status-ok/5">
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="text-status-ok shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{a.item.description}</p>
                    <p className="text-xs text-secondary mt-1">
                      Disponible:{' '}
                      <span className="font-mono text-status-ok">
                        {formatCurrency(convert(a.overage), mode)}
                      </span>
                      {' '}({(100 - a.percentage).toFixed(1)}% del presupuesto)
                    </p>
                    <p className="text-xs text-secondary mt-0.5">
                      Podés reasignar o mantener como colchón.
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Inactive */}
      {inactive.length > 0 && (
        <div>
          <h3 className="text-sm font-heading font-semibold text-accent mb-3">
            Sin movimiento ({inactive.length})
          </h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {inactive.map((item) => (
              <Card key={item.id} className="p-4 border-accent/30 bg-accent/5">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">{item.description}</p>
                    <p className="text-xs text-secondary mt-1">
                      Presupuesto:{' '}
                      <span className="font-mono text-accent">
                        {formatCurrency(convert(item.total_price), mode)}
                      </span>
                    </p>
                    <p className="text-xs text-secondary mt-0.5">
                      Sin movimiento. ¿Ya está contratado?
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
