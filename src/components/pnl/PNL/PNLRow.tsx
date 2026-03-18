import { ChevronRight } from 'lucide-react'
import type { PNLRowData } from './pnlUtils'
import { getPNLStatus } from './pnlUtils'
import type { ColumnDef } from './PNLHeader'
import { formatCurrency, type CurrencyMode } from '@/utils/currency'

interface PNLRowProps {
  row: PNLRowData
  columns: ColumnDef[]
  collapsed: Set<string>
  onToggle: (id: string) => void
  currencyMode: CurrencyMode
  convert: (ars: number) => number
}

export function PNLRow({ row, columns, collapsed, onToggle, currencyMode, convert }: PNLRowProps) {
  const isCategory = row.level === 0
  const isSub = row.level === 1
  const isCollapsed = collapsed.has(row.item.id)
  const hasChildren = row.children.length > 0
  const status = getPNLStatus(row.pct)

  const fmt = (n: number) => formatCurrency(convert(n), currencyMode)

  const pctColor =
    row.pct > 100 ? '#EF4444' :
    row.pct === 100 ? '#22C55E' :
    row.pct >= 80 ? '#EAB308' :
    'inherit'

  // Row styles by level
  const rowBg = isCategory ? 'bg-[#F0EFFE]' : isSub ? 'bg-[#F7F6F1]' : 'bg-white'
  const borderLeft = isCategory
    ? 'border-l-[3px] border-l-[var(--color-accent)]'
    : isSub
    ? 'border-l-[3px] border-l-[#C7D2FE]'
    : ''
  const textColor = isCategory ? 'text-[var(--color-accent)]' : isSub ? 'text-[#4338CA]' : 'text-primary'
  const fontWeight = isCategory ? 'font-bold' : isSub ? 'font-semibold' : 'font-normal'

  // Calculate column amount (sum months in that column)
  const getColumnAmount = (col: ColumnDef) =>
    col.months.reduce((sum, m) => sum + (row.monthlySpent[m] || 0), 0)

  return (
    <>
      <tr
        className={`border-b border-border/40 ${rowBg} ${borderLeft} ${hasChildren ? 'cursor-pointer' : ''} hover:brightness-[0.98] transition-all`}
        onClick={hasChildren ? () => onToggle(row.item.id) : undefined}
      >
        {/* Concepto — sticky */}
        <td
          className={`px-3 py-2 sticky left-0 z-10 ${rowBg} ${textColor} ${fontWeight}`}
          style={{ paddingLeft: `${12 + row.level * 16}px` }}
        >
          <div className="flex items-center gap-1.5">
            {hasChildren && (
              <ChevronRight
                size={14}
                className={`shrink-0 transition-transform duration-150 ${isCollapsed ? '' : 'rotate-90'}`}
              />
            )}
            <span className="font-mono text-xs opacity-60 mr-1">{row.item.item_code}</span>
            <span className="truncate">{row.item.description}</span>
          </div>
        </td>

        {/* Presupuesto — sticky */}
        <td className={`px-3 py-2 text-right font-mono text-sm sticky left-[200px] z-10 ${rowBg} ${fontWeight}`}>
          {fmt(row.budget)}
        </td>

        {/* Dynamic period columns */}
        {columns.map((col) => {
          const amount = getColumnAmount(col)
          const now = new Date()
          const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
          const isCurrent = col.months.includes(currentYM)
          return (
            <td
              key={col.key}
              className={`px-3 py-2 text-right font-mono text-sm ${isCurrent ? 'bg-[#EEF2FF]/50' : ''}`}
            >
              {amount > 0 ? fmt(amount) : <span className="text-muted">—</span>}
            </td>
          )
        })}

        {/* Total Ejecutado */}
        <td className={`px-3 py-2 text-right font-mono text-sm ${fontWeight}`}>
          {fmt(row.totalSpent)}
        </td>

        {/* % */}
        <td className="px-3 py-2 text-right font-mono text-sm font-medium" style={{ color: pctColor }}>
          {row.pct.toFixed(1)}%
        </td>

        {/* Estado badge */}
        <td className="px-3 py-2 text-center">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
            style={{ backgroundColor: status.bgColor, color: status.color }}
          >
            {status.label}
          </span>
        </td>
      </tr>

      {/* Children (if not collapsed) */}
      {!isCollapsed &&
        row.children.map((child) => (
          <PNLRow
            key={child.item.id}
            row={child}
            columns={columns}
            collapsed={collapsed}
            onToggle={onToggle}
            currencyMode={currencyMode}
            convert={convert}
          />
        ))}
    </>
  )
}
