import { PnlEditableCell } from './PnlEditableCell'
import { PnlCommentIcon } from './PnlCommentIcon'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useCurrencyStore } from '@/store/currencyStore'
import { formatCurrency } from '@/utils/currency'
import { formatPercent } from '@/utils/formatters'
import { Trash2 } from 'lucide-react'
import type { PnlRow as PnlRowType } from '@/utils/pnlCalculations'

interface Props {
  row: PnlRowType
  editable: boolean
  onSave: (itemId: string, field: string, value: number | string) => void
  onDelete?: (itemId: string) => void
  onCommentClick: (budgetItemId: string, title: string) => void
}

export function PnlRow({ row, editable, onSave, onDelete, onCommentClick }: Props) {
  const mode = useCurrencyStore((s) => s.mode)
  const fmt = (v: number) => formatCurrency(v, mode)

  return (
    <tr className="border-b border-border/50 hover:bg-hover/50 transition-colors">
      <td className="py-2 px-3 text-xs text-secondary font-mono">{row.item.item_code}</td>
      <td className="py-2 px-3 text-sm">
        <div className="flex items-center gap-1">
          <PnlEditableCell
            value={row.item.description}
            itemId={row.item.id}
            field="description"
            editable={editable}
            type="text"
            onSave={onSave}
          />
          {editable && onDelete && (
            <button
              onClick={() => onDelete(row.item.id)}
              className="p-0.5 text-secondary hover:text-status-exceeded transition-colors opacity-0 group-hover:opacity-100"
              title="Eliminar"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </td>
      <td className="py-2 px-3 text-right">
        <PnlEditableCell
          value={row.item.total_price}
          itemId={row.item.id}
          field="total_price"
          editable={editable}
          formatter={fmt}
          onSave={onSave}
        />
      </td>
      <td className="py-2 px-3 text-right font-mono text-sm">{fmt(row.spent)}</td>
      <td className={`py-2 px-3 text-right font-mono text-sm ${row.difference < 0 ? 'text-status-exceeded' : 'text-status-ok'}`}>
        {fmt(row.difference)}
      </td>
      <td className="py-2 px-3 text-right font-mono text-sm">{formatPercent(row.percentage)}</td>
      <td className="py-2 px-3"><StatusBadge status={row.status} /></td>
      <td className="py-2 px-3 text-center">
        <PnlCommentIcon
          budgetItemId={row.item.id}
          onClick={() => onCommentClick(row.item.id, row.item.description)}
        />
      </td>
    </tr>
  )
}
