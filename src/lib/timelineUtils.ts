import type { Project, BudgetItem, Expense } from './supabase'
import { format, differenceInDays, addDays, differenceInWeeks } from 'date-fns'
import { es } from 'date-fns/locale'

export type HitoStatus = 'pending' | 'active' | 'done' | 'exceeded'

export interface CategoryTimeline {
  id: string
  name: string
  weekNumber: number | null
  pctEjecutado: number
  status: HitoStatus
  isActive: boolean
}

/**
 * Get the current construction phase based on most recent spending
 */
export function getCurrentPhase(
  items: BudgetItem[],
  expenses: Expense[]
): string {
  const twoWeeksAgo = addDays(new Date(), -14)
  const recentExpenses = expenses.filter((e) => new Date(e.date) >= twoWeeksAgo)

  if (recentExpenses.length === 0) return 'Sin actividad reciente'

  // Count spending per budget item
  const spendByItem = new Map<string, number>()
  for (const e of recentExpenses) {
    if (e.budget_item_id) {
      spendByItem.set(e.budget_item_id, (spendByItem.get(e.budget_item_id) || 0) + e.amount_ars)
    }
  }

  // Find the parent category with most recent spending
  let maxSpent = 0
  let maxItemId = ''
  for (const [id, spent] of spendByItem) {
    if (spent > maxSpent) {
      maxSpent = spent
      maxItemId = id
    }
  }

  // Find parent category
  const item = items.find((i) => i.id === maxItemId)
  if (!item) return 'Sin actividad reciente'

  if (item.parent_id) {
    const parent = items.find((i) => i.id === item.parent_id)
    return parent?.description || item.description
  }

  return item.description
}

/**
 * Get projected end date based on current spending rate
 */
export function getProjectedEndDate(
  project: Project,
  expenses: Expense[]
): Date | null {
  if (!project.start_date) return null

  const projectExpenses = expenses.filter((e) => e.project_id === project.id)
  const totalSpent = projectExpenses.reduce((s, e) => s + e.amount_ars, 0)

  const startDate = new Date(project.start_date)
  const now = new Date()
  const weeksElapsed = Math.max(1, differenceInWeeks(now, startDate))

  // Calculate total budget from items (we don't have items here, so use simple projection)
  const weeklyRate = totalSpent / weeksElapsed
  if (weeklyRate <= 0) return null

  // We need the total budget - approximate from project data
  // This is a simplified version; the component should pass budget total
  return null
}

/**
 * Get projected end date with explicit budget total
 */
export function getProjectedEndDateWithBudget(
  project: Project,
  totalBudget: number,
  totalSpent: number
): Date | null {
  if (!project.start_date || totalSpent <= 0) return null

  const startDate = new Date(project.start_date)
  const now = new Date()
  const weeksElapsed = Math.max(1, differenceInWeeks(now, startDate))

  const weeklyRate = totalSpent / weeksElapsed
  if (weeklyRate <= 0) return null

  const remainingBudget = totalBudget - totalSpent
  const weeksRemaining = remainingBudget / weeklyRate
  return addDays(now, Math.ceil(weeksRemaining * 7))
}

/**
 * Get days remaining until estimated end date
 */
export function getDaysRemaining(endDate: string | Date): number {
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate
  return differenceInDays(end, new Date())
}

/**
 * Get hito (milestone) status for a budget item
 */
export function getHitoStatus(
  item: BudgetItem,
  childItems: BudgetItem[],
  expenses: Expense[]
): HitoStatus {
  // Calculate total spent for this item and its children
  const itemIds = [item.id, ...childItems.map((c) => c.id)]
  const spent = expenses
    .filter((e) => e.budget_item_id && itemIds.includes(e.budget_item_id))
    .reduce((s, e) => s + e.amount_ars, 0)

  const budget = item.total_price
  if (budget <= 0) return 'pending'

  const pct = (spent / budget) * 100

  if (pct > 100) return 'exceeded'
  if (pct >= 95) return 'done'
  if (pct > 0) return 'active'
  return 'pending'
}

/**
 * Get planned spending by month for the planned line in charts
 */
export function getPlannedByMonth(
  items: BudgetItem[],
  project: Project
): { month: string; cumulative: number }[] {
  if (!project.start_date) return []

  const startDate = new Date(project.start_date)
  const children = items.filter((i) => i.parent_id && i.week_number)

  // Map each item to its planned month
  const monthlyPlanned = new Map<string, number>()
  for (const item of children) {
    if (!item.week_number) continue
    const itemDate = addDays(startDate, (item.week_number - 1) * 7)
    const monthKey = format(itemDate, 'yyyy-MM')
    monthlyPlanned.set(monthKey, (monthlyPlanned.get(monthKey) || 0) + item.total_price)
  }

  // Also add parent items that have no children with week_number
  const parents = items.filter((i) => !i.parent_id)
  for (const parent of parents) {
    const childrenOfParent = children.filter((c) => c.parent_id === parent.id)
    if (childrenOfParent.length === 0 && parent.week_number) {
      const itemDate = addDays(startDate, (parent.week_number - 1) * 7)
      const monthKey = format(itemDate, 'yyyy-MM')
      monthlyPlanned.set(monthKey, (monthlyPlanned.get(monthKey) || 0) + parent.total_price)
    }
  }

  // Sort by month and compute cumulative
  const sorted = [...monthlyPlanned.entries()].sort(([a], [b]) => a.localeCompare(b))
  let cumulative = 0
  return sorted.map(([month, amount]) => {
    cumulative += amount
    return { month, cumulative }
  })
}

/**
 * Build timeline data for each parent category
 */
export function buildCategoryTimeline(
  items: BudgetItem[],
  expenses: Expense[]
): CategoryTimeline[] {
  const parents = items.filter((i) => !i.parent_id)

  const twoWeeksAgo = addDays(new Date(), -14)
  const recentExpenses = expenses.filter((e) => new Date(e.date) >= twoWeeksAgo)

  // Determine which parent has most recent activity
  const recentByParent = new Map<string, number>()
  for (const e of recentExpenses) {
    if (!e.budget_item_id) continue
    const child = items.find((i) => i.id === e.budget_item_id)
    const parentId = child?.parent_id || e.budget_item_id
    recentByParent.set(parentId, (recentByParent.get(parentId) || 0) + e.amount_ars)
  }

  let maxRecentParent = ''
  let maxRecentAmount = 0
  for (const [id, amount] of recentByParent) {
    if (amount > maxRecentAmount) {
      maxRecentAmount = amount
      maxRecentParent = id
    }
  }

  return parents
    .map((parent) => {
      const children = items.filter((i) => i.parent_id === parent.id)
      const status = getHitoStatus(parent, children, expenses)

      // Calculate pct
      const itemIds = [parent.id, ...children.map((c) => c.id)]
      const spent = expenses
        .filter((e) => e.budget_item_id && itemIds.includes(e.budget_item_id))
        .reduce((s, e) => s + e.amount_ars, 0)
      const pct = parent.total_price > 0 ? (spent / parent.total_price) * 100 : 0

      // Get earliest week_number from children
      const childWeeks = children.filter((c) => c.week_number != null).map((c) => c.week_number!)
      const weekNumber = childWeeks.length > 0 ? Math.min(...childWeeks) : parent.week_number

      return {
        id: parent.id,
        name: parent.description,
        weekNumber,
        pctEjecutado: pct,
        status,
        isActive: parent.id === maxRecentParent,
      }
    })
    .sort((a, b) => (a.weekNumber ?? 999) - (b.weekNumber ?? 999))
}

/**
 * Format a date nicely in Spanish
 */
export function formatDateEs(date: Date): string {
  return format(date, "d 'de' MMMM yyyy", { locale: es })
}
