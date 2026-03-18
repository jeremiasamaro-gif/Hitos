import type { BudgetItem, Expense } from './supabase'
import { startOfMonth, endOfMonth, subMonths, subQuarters, subYears, isWithinInterval, startOfQuarter, endOfQuarter, startOfYear, endOfYear, parseISO, format } from 'date-fns'
import { es } from 'date-fns/locale'

// ============================================
// TYPES
// ============================================

export type PnlPeriod = 'monthly' | 'quarterly' | 'yearly'
export type PnlSectionType = 'budget' | 'spent' | 'result'
export type VariationKind = 'positive' | 'negative' | 'zero' | 'new' | 'gone'

export interface PnlVariation {
  value: number // percentage
  kind: VariationKind
}

export interface PnlLineItem {
  id: string
  code: string
  description: string
  level: number // 0=category, 1=sub, 2=item
  currentAmount: number
  previousAmount: number
  variation: PnlVariation
  parentId: string | null
  children: PnlLineItem[]
  budgetItemId: string // ref to original budget item
}

export interface PnlSection {
  type: PnlSectionType
  label: string
  color: string // tailwind border color
  total: PnlLineItem
  items: PnlLineItem[]
}

// ============================================
// PERIOD HELPERS
// ============================================

export function getPeriodLabel(period: PnlPeriod, refDate: Date): { current: string; previous: string } {
  switch (period) {
    case 'monthly':
      return {
        current: format(refDate, 'MMM yyyy', { locale: es }).toUpperCase(),
        previous: format(subMonths(refDate, 1), 'MMM yyyy', { locale: es }).toUpperCase(),
      }
    case 'quarterly':
      return {
        current: `T${Math.ceil((refDate.getMonth() + 1) / 3)} ${refDate.getFullYear()}`,
        previous: `T${Math.ceil((subQuarters(refDate, 1).getMonth() + 1) / 3)} ${subQuarters(refDate, 1).getFullYear()}`,
      }
    case 'yearly':
      return {
        current: String(refDate.getFullYear()),
        previous: String(refDate.getFullYear() - 1),
      }
  }
}

export function getPeriodRange(period: PnlPeriod, refDate: Date): { start: Date; end: Date } {
  switch (period) {
    case 'monthly':
      return { start: startOfMonth(refDate), end: endOfMonth(refDate) }
    case 'quarterly':
      return { start: startOfQuarter(refDate), end: endOfQuarter(refDate) }
    case 'yearly':
      return { start: startOfYear(refDate), end: endOfYear(refDate) }
  }
}

function getPreviousRefDate(period: PnlPeriod, refDate: Date): Date {
  switch (period) {
    case 'monthly':
      return subMonths(refDate, 1)
    case 'quarterly':
      return subQuarters(refDate, 1)
    case 'yearly':
      return subYears(refDate, 1)
  }
}

// ============================================
// FILTER EXPENSES BY PERIOD
// ============================================

export function getPeriodExpenses(expenses: Expense[], period: PnlPeriod, refDate: Date): Expense[] {
  const { start, end } = getPeriodRange(period, refDate)
  return expenses.filter((e) => {
    const d = parseISO(e.date)
    return isWithinInterval(d, { start, end })
  })
}

// ============================================
// CALC VARIATION
// ============================================

export function calcVariation(current: number, previous: number): PnlVariation {
  if (previous === 0 && current === 0) return { value: 0, kind: 'zero' }
  if (previous === 0 && current > 0) return { value: 100, kind: 'new' }
  if (current === 0 && previous > 0) return { value: -100, kind: 'gone' }
  const pct = ((current - previous) / previous) * 100
  return {
    value: pct,
    kind: pct > 0 ? 'positive' : pct < 0 ? 'negative' : 'zero',
  }
}

// ============================================
// GROUP BY CATEGORY → PnlLineItems
// ============================================

function sumExpensesByItem(expenses: Expense[]): Map<string, number> {
  const map = new Map<string, number>()
  for (const e of expenses) {
    if (e.budget_item_id) {
      map.set(e.budget_item_id, (map.get(e.budget_item_id) || 0) + e.amount_ars)
    }
  }
  return map
}

function buildLineItems(
  items: BudgetItem[],
  amountMap: Map<string, number>,
  prevAmountMap: Map<string, number>,
  convert: (ars: number) => number,
  isBudgetSection: boolean
): PnlLineItem[] {
  const parents = items.filter((i) => !i.parent_id)
  const childrenMap = new Map<string, BudgetItem[]>()
  for (const item of items) {
    if (item.parent_id) {
      const arr = childrenMap.get(item.parent_id) || []
      arr.push(item)
      childrenMap.set(item.parent_id, arr)
    }
  }

  return parents.map((parent) => {
    const children = childrenMap.get(parent.id) || []

    const childLines: PnlLineItem[] = children.map((child) => {
      const cur = convert(isBudgetSection ? child.total_price : (amountMap.get(child.id) || 0))
      const prev = convert(isBudgetSection ? child.total_price : (prevAmountMap.get(child.id) || 0))
      return {
        id: child.id,
        code: child.item_code || '',
        description: child.description,
        level: 1,
        currentAmount: cur,
        previousAmount: prev,
        variation: isBudgetSection ? { value: 0, kind: 'zero' as VariationKind } : calcVariation(cur, prev),
        parentId: parent.id,
        children: [],
        budgetItemId: child.id,
      }
    })

    const parentCur = isBudgetSection
      ? convert(parent.total_price)
      : childLines.reduce((s, c) => s + c.currentAmount, 0) + convert(amountMap.get(parent.id) || 0)
    const parentPrev = isBudgetSection
      ? convert(parent.total_price)
      : childLines.reduce((s, c) => s + c.previousAmount, 0) + convert(prevAmountMap.get(parent.id) || 0)

    return {
      id: parent.id,
      code: parent.item_code || '',
      description: parent.description,
      level: 0,
      currentAmount: parentCur,
      previousAmount: parentPrev,
      variation: isBudgetSection ? { value: 0, kind: 'zero' as VariationKind } : calcVariation(parentCur, parentPrev),
      parentId: null,
      children: childLines,
      budgetItemId: parent.id,
    }
  })
}

// ============================================
// MAIN: BUILD PNL SECTIONS
// ============================================

export function buildPnlSections(
  items: BudgetItem[],
  expenses: Expense[],
  period: PnlPeriod,
  refDate: Date,
  convert: (ars: number) => number
): PnlSection[] {
  const currentExpenses = getPeriodExpenses(expenses, period, refDate)
  const prevDate = getPreviousRefDate(period, refDate)
  const prevExpenses = getPeriodExpenses(expenses, period, prevDate)

  const curMap = sumExpensesByItem(currentExpenses)
  const prevMap = sumExpensesByItem(prevExpenses)

  // Budget section: shows budgeted amounts (same for both periods)
  const budgetLines = buildLineItems(items, curMap, prevMap, convert, true)
  const totalBudgetCur = budgetLines.reduce((s, l) => s + l.currentAmount, 0)
  const totalBudgetPrev = budgetLines.reduce((s, l) => s + l.previousAmount, 0)

  // Spent section: shows what was actually spent in each period
  const spentLines = buildLineItems(items, curMap, prevMap, convert, false)
  const totalSpentCur = spentLines.reduce((s, l) => s + l.currentAmount, 0)
  const totalSpentPrev = spentLines.reduce((s, l) => s + l.previousAmount, 0)

  // Result
  const balanceCur = totalBudgetCur - totalSpentCur
  const balancePrev = totalBudgetPrev - totalSpentPrev

  return [
    {
      type: 'budget',
      label: 'PRESUPUESTO ORIGINAL',
      color: 'border-green-500',
      items: budgetLines,
      total: {
        id: '__budget_total',
        code: '',
        description: 'Total presupuestado',
        level: -1,
        currentAmount: totalBudgetCur,
        previousAmount: totalBudgetPrev,
        variation: calcVariation(totalBudgetCur, totalBudgetPrev),
        parentId: null,
        children: [],
        budgetItemId: '',
      },
    },
    {
      type: 'spent',
      label: 'GASTOS EJECUTADOS',
      color: 'border-red-500',
      items: spentLines,
      total: {
        id: '__spent_total',
        code: '',
        description: 'Total ejecutado',
        level: -1,
        currentAmount: totalSpentCur,
        previousAmount: totalSpentPrev,
        variation: calcVariation(totalSpentCur, totalSpentPrev),
        parentId: null,
        children: [],
        budgetItemId: '',
      },
    },
    {
      type: 'result',
      label: 'RESULTADO',
      color: 'border-white',
      items: [],
      total: {
        id: '__result',
        code: '',
        description: 'Balance',
        level: -1,
        currentAmount: balanceCur,
        previousAmount: balancePrev,
        variation: calcVariation(balanceCur, balancePrev),
        parentId: null,
        children: [],
        budgetItemId: '',
      },
    },
  ]
}

// ============================================
// STATUS for spent items (semáforo)
// ============================================

export type SpentStatus = 'ok' | 'at_risk' | 'exceeded'

export function getSpentStatus(spent: number, budgeted: number): SpentStatus {
  if (budgeted <= 0) return spent > 0 ? 'exceeded' : 'ok'
  const ratio = spent / budgeted
  if (ratio > 1) return 'exceeded'
  if (ratio >= 0.8) return 'at_risk'
  return 'ok'
}
