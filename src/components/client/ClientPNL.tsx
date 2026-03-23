import { useState, useMemo, useCallback } from 'react'
import { MessageSquare } from 'lucide-react'
import { useProjectContext } from '@/contexts/ProjectContext'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useCommentStore } from '@/store/commentStore'
import {
  getMonthColumns,
  groupItemsWithTotals,
  groupMonthsIntoQuarters,
  groupMonthsIntoYears,
  getPNLStatus,
} from '@/components/pnl/PNL/pnlUtils'
import { buildColumns, type PeriodMode, type ColumnDef } from '@/components/pnl/PNL/PNLHeader'

import { formatCurrency } from '@/utils/currency'
import { ClientComentarioDrawer } from './ClientComentarioDrawer'
import type { PNLRowData } from '@/components/pnl/PNL/pnlUtils'

export function ClientPNL() {
  const { project, currencyMode, convert } = useProjectContext()
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)
  const comments = useCommentStore((s) => s.comments)

  const [period, setPeriod] = useState<PeriodMode>('monthly')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())
  const [drawerItem, setDrawerItem] = useState<{ id: string; name: string } | null>(null)

  const months = useMemo(() => getMonthColumns(expenses), [expenses])
  const columns = useMemo(
    () => buildColumns(months, period, groupMonthsIntoQuarters, groupMonthsIntoYears),
    [months, period]
  )
  const rows = useMemo(
    () => groupItemsWithTotals(items, expenses, months),
    [items, expenses, months]
  )

  const commentCountByItem = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of comments) {
      if (c.budget_item_id) {
        map.set(c.budget_item_id, (map.get(c.budget_item_id) || 0) + 1)
      }
    }
    return map
  }, [comments])

  const handleToggle = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const fmt = (n: number) => formatCurrency(convert(n), currencyMode)

  const periodTabs: { value: PeriodMode; label: string }[] = [
    { value: 'monthly', label: 'Mensual' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' },
  ]

  // Totals
  const totalBudget = rows.reduce((s, r) => s + r.budget, 0)
  const totalSpent = rows.reduce((s, r) => s + r.totalSpent, 0)
  const totalPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
  const totalStatus = getPNLStatus(totalPct)

  const getColumnTotal = (col: ColumnDef) =>
    rows.reduce((sum, r) => sum + col.months.reduce((ms, m) => ms + (r.monthlySpent[m] || 0), 0), 0)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-heading font-bold">Estado de Resultados</h1>
      </div>

      {/* Period selector */}
      <div className="flex items-center bg-card border border-border rounded-lg overflow-hidden w-fit">
        {periodTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setPeriod(tab.value)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              period === tab.value
                ? 'bg-accent text-white'
                : 'text-secondary hover:text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* PNL Table — read-only with comment bubbles */}
      <div className="overflow-x-auto border border-border rounded-xl">
        <table className="w-full text-sm">
          <ClientPNLHeader columns={columns} />
          <tbody>
            {rows.map((row) => (
              <ClientPNLRow
                key={row.item.id}
                row={row}
                columns={columns}
                collapsed={collapsed}
                onToggle={handleToggle}
                fmt={fmt}
                commentCountByItem={commentCountByItem}
                onComment={setDrawerItem}
              />
            ))}

            {/* TOTALS ROW */}
            <tr className="border-t-2 border-border bg-card font-bold">
              <td className="px-3 py-3 sticky left-0 z-10 bg-card text-primary">TOTAL OBRA</td>
              <td className="px-3 py-3 text-right font-mono sticky left-[200px] z-10 bg-card">{fmt(totalBudget)}</td>
              {columns.map((col) => {
                const amount = getColumnTotal(col)
                return (
                  <td key={col.key} className="px-3 py-3 text-right font-mono">
                    {amount > 0 ? fmt(amount) : '—'}
                  </td>
                )
              })}
              <td className="px-3 py-3 text-right font-mono">{fmt(totalSpent)}</td>
              <td className="px-3 py-3 text-right font-mono" style={{ color: totalPct > 100 ? '#EF4444' : 'inherit' }}>
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
              <td className="px-3 py-3" />
            </tr>
          </tbody>
        </table>
      </div>

      {drawerItem && (
        <ClientComentarioDrawer
          open={!!drawerItem}
          onClose={() => setDrawerItem(null)}
          projectId={project.id}
          budgetItemId={drawerItem.id}
          budgetItemName={drawerItem.name}
        />
      )}
    </div>
  )
}

// ── Client PNL Row (read-only + comment bubble) ──

interface ClientPNLRowProps {
  row: PNLRowData
  columns: ColumnDef[]
  collapsed: Set<string>
  onToggle: (id: string) => void
  fmt: (n: number) => string
  commentCountByItem: Map<string, number>
  onComment: (item: { id: string; name: string }) => void
}

function ClientPNLRow({ row, columns, collapsed, onToggle, fmt, commentCountByItem, onComment }: ClientPNLRowProps) {
  const isParent = row.children.length > 0
  const isCollapsed = collapsed.has(row.item.id)

  const pct = row.budget > 0 ? (row.totalSpent / row.budget) * 100 : 0
  const status = getPNLStatus(pct)
  const commentCount = commentCountByItem.get(row.item.id) || 0

  const now = new Date()
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  return (
    <>
      <tr
        className={`border-b border-border/50 ${isParent ? 'bg-card cursor-pointer font-medium' : 'hover:bg-hover/50'}`}
        onClick={isParent ? () => onToggle(row.item.id) : undefined}
      >
        <td className="px-3 py-2 whitespace-nowrap sticky left-0 z-10 bg-inherit">
          <span className="flex items-center gap-1">
            {isParent && (
              <span className="text-[10px] text-secondary">{isCollapsed ? '▶' : '▼'}</span>
            )}
            {row.item.description}
          </span>
        </td>
        <td className="px-3 py-2 text-right font-mono sticky left-[200px] z-10 bg-inherit">
          {fmt(row.budget)}
        </td>
        {columns.map((col) => {
          const amount = col.months.reduce((s, m) => s + (row.monthlySpent[m] || 0), 0)
          const isCurrent = col.months.includes(currentYM)
          return (
            <td key={col.key} className={`px-3 py-2 text-right font-mono ${isCurrent ? 'bg-[#EEF2FF]/50' : ''}`}>
              {amount > 0 ? fmt(amount) : '—'}
            </td>
          )
        })}
        <td className="px-3 py-2 text-right font-mono font-medium">
          {row.totalSpent > 0 ? fmt(row.totalSpent) : '—'}
        </td>
        <td className="px-3 py-2 text-right font-mono" style={{ color: status.color }}>
          {pct > 0 ? `${pct.toFixed(1)}%` : '—'}
        </td>
        <td className="px-3 py-2 text-center">
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
            style={{ backgroundColor: status.bgColor, color: status.color }}
          >
            {status.label}
          </span>
        </td>
        <td className="px-3 py-2 text-center">
          <button
            onClick={(e) => { e.stopPropagation(); onComment({ id: row.item.id, name: row.item.description }) }}
            className="relative p-1 text-secondary hover:text-accent transition-colors"
            title="Comentarios"
          >
            <MessageSquare size={14} />
            {commentCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[9px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5">
                {commentCount > 9 ? '9+' : commentCount}
              </span>
            )}
          </button>
        </td>
      </tr>

      {/* Children */}
      {!isCollapsed && row.children.map((child) => (
        <ClientPNLRow
          key={child.item.id}
          row={child}
          columns={columns}
          collapsed={collapsed}
          onToggle={onToggle}
          fmt={fmt}
          commentCountByItem={commentCountByItem}
          onComment={onComment}
        />
      ))}
    </>
  )
}

// ── Client PNL Header (includes comment column) ──

function ClientPNLHeader({ columns }: { columns: ColumnDef[] }) {
  const now = new Date()
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  return (
    <thead>
      <tr className="border-b border-border text-secondary text-left text-xs uppercase tracking-wider">
        <th className="px-3 py-2.5 sticky left-0 z-20 bg-card min-w-[200px]">Concepto</th>
        <th className="px-3 py-2.5 text-right sticky left-[200px] z-20 bg-card min-w-[120px]">Presupuesto</th>
        {columns.map((col) => {
          const isCurrent = col.months.includes(currentYM)
          return (
            <th key={col.key} className={`px-3 py-2.5 text-right min-w-[110px] ${isCurrent ? 'bg-[#EEF2FF]' : ''}`}>
              {col.label}
            </th>
          )
        })}
        <th className="px-3 py-2.5 text-right min-w-[120px]">Total Ejec.</th>
        <th className="px-3 py-2.5 text-right min-w-[60px]">%</th>
        <th className="px-3 py-2.5 text-center min-w-[90px]">Estado</th>
        <th className="px-3 py-2.5 text-center min-w-[40px]"></th>
      </tr>
    </thead>
  )
}
