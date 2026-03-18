import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { PnlRow } from './PnlRow'
import { PnlCommentIcon } from './PnlCommentIcon'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useCurrencyStore } from '@/store/currencyStore'
import { formatCurrency } from '@/utils/currency'
import { formatPercent } from '@/utils/formatters'
import type { PnlRow as PnlRowType } from '@/utils/pnlCalculations'

interface Props {
  row: PnlRowType
  editable: boolean
  onSave: (itemId: string, field: string, value: number | string) => void
  onDelete?: (itemId: string) => void
  onCommentClick: (budgetItemId: string, title: string) => void
}

export function PnlCategoryAccordion({ row, editable, onSave, onDelete, onCommentClick }: Props) {
  const [expanded, setExpanded] = useState(false)
  const mode = useCurrencyStore((s) => s.mode)
  const fmt = (v: number) => formatCurrency(v, mode)

  return (
    <>
      <tr
        className="border-b border-border bg-card/50 cursor-pointer hover:bg-hover transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="py-3 px-3 text-sm font-mono text-secondary">{row.item.item_code}</td>
        <td className="py-3 px-3">
          <div className="flex items-center gap-2">
            <ChevronDown
              size={16}
              className={`text-secondary transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
            <span className="font-heading font-semibold text-sm">{row.item.description}</span>
          </div>
        </td>
        <td className="py-3 px-3 text-right font-mono text-sm font-medium">{fmt(row.budgeted)}</td>
        <td className="py-3 px-3 text-right font-mono text-sm font-medium">{fmt(row.spent)}</td>
        <td className={`py-3 px-3 text-right font-mono text-sm font-medium ${row.difference < 0 ? 'text-status-exceeded' : 'text-status-ok'}`}>
          {fmt(row.difference)}
        </td>
        <td className="py-3 px-3 text-right font-mono text-sm font-medium">{formatPercent(row.percentage)}</td>
        <td className="py-3 px-3"><StatusBadge status={row.status} /></td>
        <td className="py-3 px-3 text-center">
          <PnlCommentIcon
            budgetItemId={row.item.id}
            onClick={() => onCommentClick(row.item.id, row.item.description)}
          />
        </td>
      </tr>
      {expanded && row.children?.map((child) => (
        <PnlRow
          key={child.item.id}
          row={child}
          editable={editable}
          onSave={onSave}
          onDelete={onDelete}
          onCommentClick={onCommentClick}
        />
      ))}
    </>
  )
}
