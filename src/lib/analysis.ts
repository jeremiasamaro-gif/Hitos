import type { BudgetItem, Expense } from '@/lib/supabase'

export interface AnalysisItem {
  item: BudgetItem
  budgeted: number
  spent: number
  overage: number
  percentage: number
}

// Build map of total spent per parent budget item
export function getSpentByParent(items: BudgetItem[], expenses: Expense[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const exp of expenses) {
    if (exp.budget_item_id) {
      const item = items.find((i) => i.id === exp.budget_item_id)
      const parentId = item?.parent_id || item?.id || ''
      map.set(parentId, (map.get(parentId) || 0) + exp.amount_ars)
    }
  }
  return map
}

// Items where spent > budget
export function getExceededItems(items: BudgetItem[], expenses: Expense[]): AnalysisItem[] {
  const parents = items.filter((i) => !i.parent_id)
  const spentMap = getSpentByParent(items, expenses)

  return parents
    .filter((p) => (spentMap.get(p.id) || 0) > p.total_price)
    .map((p) => {
      const spent = spentMap.get(p.id) || 0
      return {
        item: p,
        budgeted: p.total_price,
        spent,
        overage: spent - p.total_price,
        percentage: p.total_price > 0 ? (spent / p.total_price) * 100 : 0,
      }
    })
    .sort((a, b) => b.overage - a.overage)
}

// Items with >20% unspent AND global progress > 60%
export function getSavingItems(
  items: BudgetItem[],
  expenses: Expense[],
  globalProgress: number
): AnalysisItem[] {
  if (globalProgress < 60) return []

  const parents = items.filter((i) => !i.parent_id)
  const spentMap = getSpentByParent(items, expenses)

  return parents
    .filter((p) => {
      const spent = spentMap.get(p.id) || 0
      const pct = p.total_price > 0 ? (spent / p.total_price) * 100 : 0
      return pct < 80 && spent > 0
    })
    .map((p) => {
      const spent = spentMap.get(p.id) || 0
      return {
        item: p,
        budgeted: p.total_price,
        spent,
        overage: p.total_price - spent,
        percentage: p.total_price > 0 ? (spent / p.total_price) * 100 : 0,
      }
    })
    .sort((a, b) => b.overage - a.overage)
}

// Items with $0 spent
export function getInactiveItems(items: BudgetItem[], expenses: Expense[]): BudgetItem[] {
  const parents = items.filter((i) => !i.parent_id)
  const spentMap = getSpentByParent(items, expenses)

  return parents.filter((p) => (spentMap.get(p.id) || 0) === 0)
}

// Group expenses by month for line chart
export interface MonthlyData {
  month: string
  total: number
  cumulative: number
}

export function getMonthlySpending(expenses: Expense[]): MonthlyData[] {
  const byMonth = new Map<string, number>()

  for (const exp of expenses) {
    const month = exp.date.slice(0, 7) // YYYY-MM
    byMonth.set(month, (byMonth.get(month) || 0) + exp.amount_ars)
  }

  const sorted = [...byMonth.entries()].sort((a, b) => a[0].localeCompare(b[0]))

  let cumulative = 0
  return sorted.map(([month, total]) => {
    cumulative += total
    return { month, total, cumulative }
  })
}

// Projection: estimated weeks remaining and total cost
export interface ProjectProjection {
  weeksElapsed: number
  avgWeeklySpend: number
  remainingBudget: number
  estimatedWeeksRemaining: number
  estimatedTotalCost: number
}

export function getProjectProjection(
  expenses: Expense[],
  totalBudget: number,
  totalSpent: number
): ProjectProjection {
  if (expenses.length === 0) {
    return { weeksElapsed: 0, avgWeeklySpend: 0, remainingBudget: totalBudget, estimatedWeeksRemaining: 0, estimatedTotalCost: 0 }
  }

  const weeks = new Set(expenses.map((e) => e.week_number).filter(Boolean))
  const weeksElapsed = weeks.size || 1
  const avgWeeklySpend = totalSpent / weeksElapsed
  const remainingBudget = totalBudget - totalSpent

  const estimatedWeeksRemaining = avgWeeklySpend > 0 ? Math.ceil(remainingBudget / avgWeeklySpend) : 0
  const estimatedTotalCost = avgWeeklySpend > 0
    ? totalSpent + (avgWeeklySpend * estimatedWeeksRemaining)
    : totalSpent

  return { weeksElapsed, avgWeeklySpend, remainingBudget, estimatedWeeksRemaining, estimatedTotalCost }
}
