import type { PNLRowData } from './pnlUtils'
import { getPNLStatus } from './pnlUtils'
import { PNLHeader, type ColumnDef } from './PNLHeader'
import { PNLRow } from './PNLRow'
import { formatCurrency, type CurrencyMode } from '@/utils/currency'

interface PNLTableProps {
  rows: PNLRowData[]
  columns: ColumnDef[]
  collapsed: Set<string>
  onToggle: (id: string) => void
  currencyMode: CurrencyMode
  convert: (ars: number) => number
}

export function PNLTable({ rows, columns, collapsed, onToggle, currencyMode, convert }: PNLTableProps) {
  const fmt = (n: number) => formatCurrency(convert(n), currencyMode)

  // Totals row
  const totalBudget = rows.reduce((s, r) => s + r.budget, 0)
  const totalSpent = rows.reduce((s, r) => s + r.totalSpent, 0)
  const totalPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  const totalStatus = getPNLStatus(totalPct)

  const getColumnTotal = (col: ColumnDef) =>
    rows.reduce((sum, r) => {
      return sum + col.months.reduce((ms, m) => ms + (r.monthlySpent[m] || 0), 0)
    }, 0)

  const pctColor =
    totalPct > 100 ? '#EF4444' :
    totalPct === 100 ? '#22C55E' :
    totalPct >= 80 ? '#EAB308' :
    'inherit'

  return (
    <div className="overflow-x-auto border border-border rounded-xl">
      <table className="w-full text-sm">
        <PNLHeader columns={columns} />
        <tbody>
          {rows.map((row) => (
            <PNLRow
              key={row.item.id}
              row={row}
              columns={columns}
              collapsed={collapsed}
              onToggle={onToggle}
              currencyMode={currencyMode}
              convert={convert}
            />
          ))}

          {/* TOTALS ROW */}
          <tr className="border-t-2 border-border bg-card font-bold">
            <td className="px-3 py-3 sticky left-0 z-10 bg-card text-primary">
              TOTAL OBRA
            </td>
            <td className="px-3 py-3 text-right font-mono sticky left-[200px] z-10 bg-card">
              {fmt(totalBudget)}
            </td>
            {columns.map((col) => {
              const amount = getColumnTotal(col)
              const now = new Date()
              const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
              const isCurrent = col.months.includes(currentYM)
              return (
                <td key={col.key} className={`px-3 py-3 text-right font-mono ${isCurrent ? 'bg-[#EEF2FF]/50' : ''}`}>
                  {amount > 0 ? fmt(amount) : '—'}
                </td>
              )
            })}
            <td className="px-3 py-3 text-right font-mono">{fmt(totalSpent)}</td>
            <td className="px-3 py-3 text-right font-mono" style={{ color: pctColor }}>
              {totalPct.toFixed(1)}%
            </td>
            <td className="px-3 py-3 text-center">
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
                style={{ backgroundColor: totalStatus.bgColor, color: totalStatus.color }}
              >
                {totalStatus.label}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
