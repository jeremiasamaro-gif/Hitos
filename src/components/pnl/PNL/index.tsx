import { useState, useMemo, useCallback } from 'react'
import { useProjectContext } from '@/contexts/ProjectContext'
import { useBudgetStore } from '@/store/budgetStore'
import { useExpenseStore } from '@/store/expenseStore'
import {
  getMonthColumns,
  groupItemsWithTotals,
  groupMonthsIntoQuarters,
  groupMonthsIntoYears,
} from './pnlUtils'
import { buildColumns, type PeriodMode } from './PNLHeader'
import { PNLTable } from './PNLTable'

export function ProjectPNL() {
  const { currencyMode, convert } = useProjectContext()
  const items = useBudgetStore((s) => s.items)
  const expenses = useExpenseStore((s) => s.expenses)

  const [period, setPeriod] = useState<PeriodMode>('monthly')
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set())

  const months = useMemo(() => getMonthColumns(expenses), [expenses])

  const columns = useMemo(
    () => buildColumns(months, period, groupMonthsIntoQuarters, groupMonthsIntoYears),
    [months, period]
  )

  const rows = useMemo(
    () => groupItemsWithTotals(items, expenses, months),
    [items, expenses, months]
  )

  const handleToggle = useCallback((id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const periodTabs: { value: PeriodMode; label: string }[] = [
    { value: 'monthly', label: 'Mensual' },
    { value: 'quarterly', label: 'Trimestral' },
    { value: 'yearly', label: 'Anual' },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-heading font-bold">Estado de Resultados</h1>

        {/* Period selector */}
        <div className="flex items-center bg-card border border-border rounded-lg overflow-hidden">
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
      </div>

      {/* Table */}
      <PNLTable
        rows={rows}
        columns={columns}
        collapsed={collapsed}
        onToggle={handleToggle}
        currencyMode={currencyMode}
        convert={convert}
      />
    </div>
  )
}
