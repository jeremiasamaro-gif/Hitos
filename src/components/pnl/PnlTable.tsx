import { PnlCategoryAccordion } from './PnlCategoryAccordion'
import type { PnlRow } from '@/utils/pnlCalculations'

interface Props {
  rows: PnlRow[]
  editable: boolean
  onSave: (itemId: string, field: string, value: number | string) => void
  onDelete?: (itemId: string) => void
  onCommentClick: (budgetItemId: string, title: string) => void
}

export function PnlTable({ rows, editable, onSave, onDelete, onCommentClick }: Props) {
  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-border bg-card">
            <th className="py-3 px-3 text-left text-xs text-secondary font-medium w-16">Ítem</th>
            <th className="py-3 px-3 text-left text-xs text-secondary font-medium">Descripción</th>
            <th className="py-3 px-3 text-right text-xs text-secondary font-medium">Presupuestado</th>
            <th className="py-3 px-3 text-right text-xs text-secondary font-medium">Gastado</th>
            <th className="py-3 px-3 text-right text-xs text-secondary font-medium">Diferencia</th>
            <th className="py-3 px-3 text-right text-xs text-secondary font-medium w-16">%</th>
            <th className="py-3 px-3 text-left text-xs text-secondary font-medium w-24">Estado</th>
            <th className="py-3 px-3 w-12"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <PnlCategoryAccordion
              key={row.item.id}
              row={row}
              editable={editable}
              onSave={onSave}
              onDelete={onDelete}
              onCommentClick={onCommentClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
