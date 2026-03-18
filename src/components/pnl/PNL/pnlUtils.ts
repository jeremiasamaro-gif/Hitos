import type { BudgetItem, Expense } from '@/lib/supabase'

// ============================================
// parseExpenseDate — safe date parsing helper
// ============================================

export function parseExpenseDate(date: string | Date): Date {
  if (date instanceof Date) return date
  // Handle YYYY-MM-DD safely (avoid timezone offset issues with new Date())
  const [y, m, d] = date.split('-').map(Number)
  return new Date(y, m - 1, d)
}

// ============================================
// TYPES
// ============================================

export interface PNLRowData {
  item: BudgetItem
  level: number // 0 = category, 1 = subcategory, 2+ = item
  budget: number // presupuestado
  monthlySpent: Record<string, number> // "YYYY-MM" → amount_ars
  totalSpent: number
  pct: number
  children: PNLRowData[]
}

export interface PNLStatus {
  label: string
  color: string
  bgColor: string
}

// ============================================
// getMonthColumns — unique sorted months from expenses
// ============================================

export function getMonthColumns(expenses: Expense[]): string[] {
  const months = new Set<string>()

  for (const e of expenses) {
    if (!e.date) {
      console.warn(`[PNL] Expense ${e.id} sin fecha, se omite de columnas`)
      continue
    }
    const d = parseExpenseDate(e.date)
    if (isNaN(d.getTime())) {
      console.warn(`[PNL] Expense ${e.id} fecha inválida: "${e.date}"`)
      continue
    }
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    months.add(ym)
  }

  // Always include current month
  const now = new Date()
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  months.add(currentMonth)

  return Array.from(months).sort()
}

// ============================================
// getExpensesByItemAndMonth
// ============================================

export function getExpensesByItemAndMonth(
  expenses: Expense[],
  itemId: string,
  month: string // "YYYY-MM"
): number {
  return expenses
    .filter((e) => {
      if (e.budget_item_id !== itemId) return false
      if (!e.date) {
        console.warn(`[PNL] Expense ${e.id} sin fecha, se omite`)
        return false
      }
      const d = parseExpenseDate(e.date)
      if (isNaN(d.getTime())) {
        console.warn(`[PNL] Expense ${e.id} fecha inválida: "${e.date}"`)
        return false
      }
      const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      return ym === month
    })
    .reduce((sum, e) => sum + e.amount_ars, 0)
}

// ============================================
// getPNLStatus — status badge config based on %
// ============================================

export function getPNLStatus(pct: number): PNLStatus {
  if (pct > 100) {
    return { label: 'Excedido', color: '#DC2626', bgColor: '#FEF2F2' }
  }
  if (pct === 100) {
    return { label: 'Cumplido', color: '#16A34A', bgColor: '#F0FDF4' }
  }
  if (pct >= 80) {
    return { label: 'En riesgo', color: '#D97706', bgColor: '#FFFBEB' }
  }
  if (pct >= 50) {
    return { label: 'Avanzando', color: '#1D4ED8', bgColor: '#DBEAFE' }
  }
  if (pct === 0) {
    return { label: 'Sin inicio', color: '#6B6A63', bgColor: '#F7F6F1' }
  }
  return { label: 'En curso', color: '#4F46E5', bgColor: '#EEF2FF' }
}

// ============================================
// groupItemsWithTotals — build the PNL tree
// ============================================

export function groupItemsWithTotals(
  items: BudgetItem[],
  expenses: Expense[],
  months: string[]
): PNLRowData[] {
  // Build parent → children map
  const childrenMap = new Map<string, BudgetItem[]>()
  const roots: BudgetItem[] = []

  for (const item of items) {
    if (item.parent_id) {
      const arr = childrenMap.get(item.parent_id) || []
      arr.push(item)
      childrenMap.set(item.parent_id, arr)
    } else {
      roots.push(item)
    }
  }

  // Sort by item_code
  const sortByCode = (a: BudgetItem, b: BudgetItem) =>
    (a.item_code || '').localeCompare(b.item_code || '', undefined, { numeric: true })

  roots.sort(sortByCode)

  function buildNode(item: BudgetItem, level: number): PNLRowData {
    const children = (childrenMap.get(item.id) || []).sort(sortByCode)
    const childNodes = children.map((c) => buildNode(c, level + 1))

    if (childNodes.length > 0) {
      // Parent: aggregate from children
      const monthlySpent: Record<string, number> = {}
      for (const m of months) {
        monthlySpent[m] = childNodes.reduce((sum, c) => sum + (c.monthlySpent[m] || 0), 0)
      }
      const totalSpent = childNodes.reduce((sum, c) => sum + c.totalSpent, 0)
      const budget = childNodes.reduce((sum, c) => sum + c.budget, 0)
      const pct = budget > 0 ? (totalSpent / budget) * 100 : 0

      return { item, level, budget, monthlySpent, totalSpent, pct, children: childNodes }
    } else {
      // Leaf: calculate from expenses
      const monthlySpent: Record<string, number> = {}
      for (const m of months) {
        monthlySpent[m] = getExpensesByItemAndMonth(expenses, item.id, m)
      }
      const totalSpent = Object.values(monthlySpent).reduce((s, v) => s + v, 0)
      const budget = item.total_price
      const pct = budget > 0 ? (totalSpent / budget) * 100 : 0

      return { item, level, budget, monthlySpent, totalSpent, pct, children: [] }
    }
  }

  return roots.map((r) => buildNode(r, 0))
}

// ============================================
// Format month label
// ============================================

const MONTH_NAMES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC']

export function formatMonthLabel(ym: string): string {
  const [year, month] = ym.split('-')
  const idx = parseInt(month, 10) - 1
  return `${MONTH_NAMES[idx]} ${year}`
}

// ============================================
// Group months into quarters
// ============================================

export function groupMonthsIntoQuarters(months: string[]): { label: string; months: string[] }[] {
  const quarterMap = new Map<string, string[]>()

  for (const m of months) {
    const [year, month] = m.split('-')
    const q = Math.ceil(parseInt(month, 10) / 3)
    const key = `Q${q} ${year}`
    const arr = quarterMap.get(key) || []
    arr.push(m)
    quarterMap.set(key, arr)
  }

  return Array.from(quarterMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, months]) => ({ label, months }))
}

// ============================================
// Group months into years
// ============================================

export function groupMonthsIntoYears(months: string[]): { label: string; months: string[] }[] {
  const yearMap = new Map<string, string[]>()

  for (const m of months) {
    const year = m.split('-')[0]
    const arr = yearMap.get(year) || []
    arr.push(m)
    yearMap.set(year, arr)
  }

  return Array.from(yearMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, months]) => ({ label, months }))
}
