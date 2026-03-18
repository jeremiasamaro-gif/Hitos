import { formatMonthLabel } from './pnlUtils'

export type PeriodMode = 'monthly' | 'quarterly' | 'yearly'

export interface ColumnDef {
  key: string // "YYYY-MM" for monthly, "Q1 2026" for quarterly, "2026" for yearly
  label: string
  months: string[] // actual months included
  isCurrentMonth?: boolean
}

interface PNLHeaderProps {
  columns: ColumnDef[]
}

export function PNLHeader({ columns }: PNLHeaderProps) {
  const now = new Date()
  const currentYM = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  return (
    <thead>
      <tr className="border-b border-border text-secondary text-left text-xs uppercase tracking-wider">
        {/* Sticky columns */}
        <th className="px-3 py-2.5 sticky left-0 z-20 bg-card min-w-[200px]">
          Concepto
        </th>
        <th className="px-3 py-2.5 text-right sticky left-[200px] z-20 bg-card min-w-[120px]">
          Presupuesto
        </th>

        {/* Dynamic period columns */}
        {columns.map((col) => {
          const isCurrent = col.months.includes(currentYM)
          return (
            <th
              key={col.key}
              className={`px-3 py-2.5 text-right min-w-[110px] ${isCurrent ? 'bg-[#EEF2FF]' : ''}`}
            >
              {col.label}
            </th>
          )
        })}

        {/* Fixed trailing columns */}
        <th className="px-3 py-2.5 text-right min-w-[120px]">Total Ejec.</th>
        <th className="px-3 py-2.5 text-right min-w-[60px]">%</th>
        <th className="px-3 py-2.5 text-center min-w-[90px]">Estado</th>
      </tr>
    </thead>
  )
}

// ============================================
// Build columns from months + period mode
// ============================================

export function buildColumns(
  months: string[],
  mode: PeriodMode,
  groupQuarters: (m: string[]) => { label: string; months: string[] }[],
  groupYears: (m: string[]) => { label: string; months: string[] }[]
): ColumnDef[] {
  if (mode === 'monthly') {
    return months.map((m) => ({
      key: m,
      label: formatMonthLabel(m),
      months: [m],
    }))
  }
  if (mode === 'quarterly') {
    return groupQuarters(months).map((g) => ({
      key: g.label,
      label: g.label,
      months: g.months,
    }))
  }
  // yearly
  return groupYears(months).map((g) => ({
    key: g.label,
    label: g.label,
    months: g.months,
  }))
}
