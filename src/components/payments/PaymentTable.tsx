import type { ClientPayment } from '@/lib/supabase'
import { useCurrencyStore } from '@/store/currencyStore'
import { formatCurrency } from '@/utils/currency'
import { formatDate } from '@/utils/formatters'
import { useBudgetStore } from '@/store/budgetStore'

interface Props {
  payments: ClientPayment[]
}

export function PaymentTable({ payments }: Props) {
  const { mode, convert } = useCurrencyStore()
  const items = useBudgetStore((s) => s.items)

  const getRubroName = (id: string | null) => {
    if (!id) return '-'
    const item = items.find((i) => i.id === id)
    return item?.description || '-'
  }

  const totalArs = payments.reduce((sum, p) => sum + p.amount_ars, 0)

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-border bg-card">
            <th className="py-3 px-3 text-left text-xs text-secondary font-medium">Fecha</th>
            <th className="py-3 px-3 text-left text-xs text-secondary font-medium">Descripción</th>
            <th className="py-3 px-3 text-left text-xs text-secondary font-medium">Rubro</th>
            <th className="py-3 px-3 text-right text-xs text-secondary font-medium">Monto original</th>
            <th className="py-3 px-3 text-right text-xs text-secondary font-medium">Monto ARS</th>
            <th className="py-3 px-3 text-left text-xs text-secondary font-medium">Método</th>
          </tr>
        </thead>
        <tbody>
          {payments.length === 0 ? (
            <tr>
              <td colSpan={6} className="py-8 text-center text-secondary text-sm">
                No hay pagos registrados
              </td>
            </tr>
          ) : (
            payments.map((p) => (
              <tr key={p.id} className="border-b border-border/50 hover:bg-hover/50 transition-colors">
                <td className="py-2 px-3 text-sm">{formatDate(p.date)}</td>
                <td className="py-2 px-3 text-sm">{p.description || '-'}</td>
                <td className="py-2 px-3 text-sm text-secondary">{getRubroName(p.budget_item_id)}</td>
                <td className="py-2 px-3 text-right font-mono text-sm">
                  {p.currency !== 'ARS' ? `${p.currency} ` : '$ '}
                  {p.amount.toLocaleString('es-AR')}
                </td>
                <td className="py-2 px-3 text-right font-mono text-sm">
                  {formatCurrency(convert(p.amount_ars), mode)}
                </td>
                <td className="py-2 px-3 text-sm text-secondary">{p.payment_method}</td>
              </tr>
            ))
          )}
        </tbody>
        {payments.length > 0 && (
          <tfoot>
            <tr className="border-t border-border bg-card/50">
              <td colSpan={4} className="py-3 px-3 text-right text-sm font-heading font-semibold">
                Total
              </td>
              <td className="py-3 px-3 text-right font-mono text-sm font-bold text-accent">
                {formatCurrency(convert(totalArs), mode)}
              </td>
              <td />
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
